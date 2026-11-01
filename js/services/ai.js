import { HttpError } from './http.js';

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/* FIX vs legacy: on HTTP errors the OpenRouter response body (which carries the
   real reason — invalid key / 429 / no credits / model not found) is now parsed
   and surfaced instead of a generic "API connection error". Also guards against
   200 responses that contain an `error` field or a null message.content, and
   adds the recommended HTTP-Referer / X-Title attribution headers. */
export async function runAIAnalysis({ apiKey, model, prompt, signal }) {
  if (!apiKey) throw new Error('NO_API_KEY');

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
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8192,
        temperature: 0.7,
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
  const content = choice?.message?.content;
  if (!content || !content.trim()) {
    throw new Error('AI model returned an empty response. Try another model.');
  }

  if (choice.finish_reason === 'length') {
    return `${content}

---

**Note:** Analysis was truncated at the model's response length limit. Run again with a shorter request or a model with a larger output limit for the full report.`;
  }
  return content;
}
