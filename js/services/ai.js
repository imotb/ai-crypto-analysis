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

async function postChat({ apiKey, model, messages, signal }) {
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

  let data;
  try {
    data = await res.json();
  } catch {
    throw new HttpError(res.status, `OpenRouter returned a non-JSON response (HTTP ${res.status})`, '');
  }

  if (!res.ok || !data || typeof data !== 'object' || data.error) {
    const raw = data?.error?.message || data?.error || `HTTP ${res.status}`;
    const err = new HttpError(res.status, String(raw), JSON.stringify(data ?? {}));
    if (res.status === 401) err.code = 'INVALID_KEY';
    if (res.status === 402) err.code = 'NO_CREDITS';
    if (res.status === 429) err.code = 'RATE_LIMIT';
    throw err;
  }

  const choice = data.choices?.[0];
  return {
    content: choice?.message?.content || '',
    finishReason: choice?.finish_reason,
  };
}

/* Returns { text, truncated } — truncated is true only when the report could
   not be finished after MAX_CONTINUATIONS automatic resumes, so the caller can
   attach its own localized notice (this service has no dictionary). */
export async function runAIAnalysis({ apiKey, model, prompt, signal }) {
  if (!apiKey) throw new Error('NO_API_KEY');

  const messages = [{ role: 'user', content: prompt }];
  let text = '';
  let truncated = false;

  for (let turn = 0; turn <= MAX_CONTINUATIONS; turn++) {
    let part;
    try {
      part = await postChat({ apiKey, model, messages, signal });
    } catch (e) {
      /* A continuation request can fail on 429/timeout after useful text already
         arrived. Losing the whole report then is worse than a shorter one. */
      if (!text) throw e;
      truncated = true;
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

  return { text, truncated };
}
