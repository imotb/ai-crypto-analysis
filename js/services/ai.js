import { HttpError } from './http.js';

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/* Long analytical reports overflow a single completion. 8192 is the highest
   budget every catalog model accepts — free tiers commonly cap at 4096–8192 and
   asking for 16384 makes OpenRouter answer 400 ("max_tokens is too large"),
   which would lose the report entirely. Truncation is handled by continuing
   instead of by raising this number. */
const MAX_OUTPUT_TOKENS = 8192;
const MAX_CONTINUATIONS = 2;
const CONTINUE_PROMPT = 'Continue from exactly where you left off. Do not repeat text already produced. Output only the remaining part of the report.';

/* Shared by the pre-stream (!res.ok), JSON-fallback and mid-stream paths so a
   failure maps to the same HttpError + code the panel already localizes. */
function openRouterError(status, data) {
  const raw = data?.error?.message || data?.error || `HTTP ${status}`;
  const err = new HttpError(status, String(raw), JSON.stringify(data ?? {}));
  /* A mid-stream error arrives inside HTTP 200, so the status cannot carry the
     code — fall back to the numeric code the provider put in the payload. */
  const code = status === 200 ? Number(data?.error?.code) : status;
  if (code === 401) err.code = 'INVALID_KEY';
  else if (code === 402) err.code = 'NO_CREDITS';
  else if (code === 429) err.code = 'RATE_LIMIT';
  return err;
}

/* One SSE event block (the text between two blank lines) -> what it contributes.
   Pure and exported: this is the unit-test seam, mirroring searchWeb.
   Unknown/keep-alive/malformed input never throws — a broken line must not cost
   the user a report that is already typing onto the screen. */
export function parseSSEEvent(eventText) {
  const out = { done: false, content: '', finishReason: null, error: null };
  for (const rawLine of String(eventText ?? '').replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trimEnd();
    /* ": OPENROUTER PROCESSING" and friends are SSE comments, not payloads. */
    if (!line || line.startsWith(':') || !line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (!payload) continue;
    if (payload === '[DONE]') { out.done = true; continue; }
    let json;
    try {
      json = JSON.parse(payload);
    } catch {
      continue;
    }
    if (json?.error) { out.error = json.error; continue; }
    const choice = Array.isArray(json?.choices) ? json.choices[0] : null;
    if (!choice) continue;
    /* Only delta.content: reasoning models stream their chain of thought in
       delta.reasoning, which must never reach the report. finish_reason also
       arrives on usage-only final chunks that carry no choices at all. */
    if (typeof choice.delta?.content === 'string') out.content += choice.delta.content;
    if (choice.finish_reason) out.finishReason = choice.finish_reason;
  }
  return out;
}

async function postChatStream({ apiKey, model, messages, signal, onDelta }) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': location.origin,
        'X-Title': 'Crypto Analysis Assistant',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.3,
        stream: true,
      }),
    });
  } catch (e) {
    /* Offline / DNS / CORS failure surfaces as "TypeError: Failed to fetch",
       which is meaningless to a user — map it to a network message. */
    if (e.name === 'AbortError') throw e;
    const err = new Error('NETWORK_UNAVAILABLE');
    err.cause = e;
    throw err;
  }

  if (!res.ok) {
    let data = null;
    try { data = await res.json(); } catch { /* an HTML error page is fine here */ }
    throw openRouterError(res.status, data);
  }

  const ctype = res.headers.get('content-type') || '';
  if (!ctype.includes('text/event-stream') || !res.body) {
    /* The provider answered with JSON despite stream:true (some routers do), or
       with something un-parseable as a stream. Either way fall back to the
       single-shot behavior so the report is not lost. */
    let data;
    try {
      data = await res.json();
    } catch {
      throw new HttpError(res.status, `OpenRouter returned a non-JSON response (HTTP ${res.status})`, '');
    }
    if (!data || typeof data !== 'object' || data.error) throw openRouterError(res.status, data);
    const choice = data.choices?.[0];
    const content = choice?.message?.content || '';
    onDelta?.(content);
    return { content, finishReason: choice?.finish_reason };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let content = '';
  let finishReason = null;
  let midStreamError = null;
  let doneSeen = false;
  let aborted = false;

  const consume = eventText => {
    const ev = parseSSEEvent(eventText);
    if (ev.done) doneSeen = true;
    if (ev.error) midStreamError = ev.error;
    if (ev.finishReason) finishReason = ev.finishReason;
    if (ev.content) {
      content += ev.content;
      onDelta?.(content);
    }
  };

  try {
    while (!doneSeen && !midStreamError) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop();
      /* Stop inside the batch, not just at the loop head: a single read can
         deliver [DONE] (or an error) followed by junk that must not be typed. */
      for (const eventText of events) {
        consume(eventText);
        if (doneSeen || midStreamError) break;
      }
    }
    if (!doneSeen && !midStreamError) {
      /* Flush a trailing partial code point, then the last unterminated event. */
      buffer += decoder.decode();
      if (buffer.trim()) consume(buffer);
    }
    /* One guaranteed final callback, so a turn that produced zero content
       chunks still leaves the caller in sync with what is on screen. */
    onDelta?.(content);
  } catch (e) {
    /* Nothing typed yet -> the caller decides (a zero-character abort must still
       surface as AbortError). Text already on screen is never thrown away. */
    if (!content) throw e;
    if (e?.name === 'AbortError') aborted = true;
    else midStreamError = { message: e?.message || 'stream read failed' };
    onDelta?.(content);
  } finally {
    try { reader.releaseLock(); } catch { /* already released */ }
  }

  if (midStreamError && !content) throw openRouterError(res.status, { error: midStreamError });

  return {
    content,
    finishReason,
    midStreamError: !!midStreamError,
    aborted,
  };
}

/* Returns { text, truncated, interrupted } —
   truncated: the report could not be finished (length cap reached after every
   continuation, a failed continuation turn, or an interrupted stream), so the
   caller attaches its own localized notice (this service has no dictionary);
   interrupted: the user watched text being typed and the exchange then stopped
   (abort signal or mid-stream error) — a different notice than a plain length
   cut, and text is never thrown away in that case. */
export async function runAIAnalysis({ apiKey, model, prompt, signal, onDelta }) {
  if (!apiKey) throw new Error('NO_API_KEY');

  const messages = [{ role: 'user', content: prompt }];
  let text = '';
  let truncated = false;
  let interrupted = false;

  for (let turn = 0; turn <= MAX_CONTINUATIONS; turn++) {
    const before = text;
    let part;
    try {
      /* The caller sees the FULL report so far, not just this turn, so a
         continuation appends instead of replacing what is on screen. */
      part = await postChatStream({ apiKey, model, messages, signal, onDelta: turnText => onDelta?.(before + turnText) });
    } catch (e) {
      if (e?.name === 'AbortError') {
        if (!text) throw e;
        truncated = true;
        interrupted = true;
        break;
      }
      /* A continuation request can fail on 429/timeout after useful text already
         arrived. Losing the whole report then is worse than a shorter one. */
      if (!text) throw e;
      truncated = true;
      break;
    }

    if (part.midStreamError || part.aborted) {
      text += part.content;
      truncated = true;
      interrupted = true;
      break;
    }

    if (!part.content.trim()) {
      if (!text) throw new Error('AI model returned an empty response. Try another model.');
      truncated = true;
      break;
    }

    /* Joined without a separator: "length" almost always cuts mid-token, and a
       blank line there breaks the sentence, table row or heading it landed in. */
    text += part.content;
    messages.push({ role: 'assistant', content: part.content });

    if (part.finishReason !== 'length') {
      truncated = false;
      break;
    }
    truncated = true;
    if (turn === MAX_CONTINUATIONS) break;
    messages.push({ role: 'user', content: CONTINUE_PROMPT });
  }

  return { text, truncated, interrupted };
}
