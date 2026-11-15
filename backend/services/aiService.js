// Gọi Gemini (generateContent). API key chỉ nằm ở server, không bao giờ gửi xuống trình duyệt.
// Nếu model chính quá tải (503/429) hoặc quá chậm, tự động thử model dự phòng.
const MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.8-flash",
  ...(process.env.GEMINI_FALLBACK_MODELS ?? "gemini-3.7-flash,gemini-3.5-flash-lite")
    .split(",").map((m) => m.trim()).filter(Boolean),
].filter((m, i, a) => a.indexOf(m) === i);
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_CHARS = 8000;
const TIMEOUT_MS = 9000; // mỗi lần thử; tổng phải nhỏ hơn maxDuration (30s) trong vercel.json

const RULES = "Reply in the same language as the note. Do not add commentary, greetings or markdown fences.";
const PROMPTS = {
  summarize: `You summarize personal notes. Write a concise summary of 1-3 sentences. ${RULES}`,
  improve: `You are an editor. Improve the grammar, clarity and flow of the note while keeping its meaning, language and line breaks. Return only the improved note text. ${RULES}`,
  title: `You write note titles. Suggest one short, specific title of at most 8 words. Return only the title: no quotes, no trailing period. ${RULES}`,
};

export const AI_ACTIONS = Object.keys(PROMPTS);
export const AI_MAX_CHARS = MAX_CHARS;

function fail(status, publicMessage) {
  return Object.assign(new Error(publicMessage), { status, publicMessage });
}

// Thử một model. Trả về text, hoặc ném lỗi có cờ `retry` nếu nên chuyển sang model khác.
async function callModel(model, action, text, key) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: ctrl.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PROMPTS[action] }] },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: { temperature: action === "improve" ? 0.3 : 0.5, maxOutputTokens: 4096 },
      }),
    });
  } catch (e) {
    const timedOut = e.name === "AbortError";
    throw Object.assign(
      fail(timedOut ? 504 : 502, timedOut ? "AI took too long to respond. Please try again." : "Could not reach the AI service."),
      { retry: true }
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Gemini error", model, res.status, detail.slice(0, 300));
    if (res.status === 429) throw Object.assign(fail(429, "AI quota reached. Please wait a moment and try again."), { retry: true });
    if (res.status >= 500) throw Object.assign(fail(503, "The AI service is busy right now. Please try again in a moment."), { retry: true });
    if (res.status === 404) throw Object.assign(fail(502, `AI model "${model}" is not available.`), { retry: true });
    if (res.status === 400 || res.status === 403) throw fail(502, "AI request was rejected. Check the API key.");
    throw fail(502, `AI service returned an error (${res.status}).`);
  }

  const data = await res.json();
  const out = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
  if (!out) throw Object.assign(fail(502, "AI returned an empty result. Try again with more text."), { retry: true });
  return out;
}

export async function generate(action, text) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw fail(503, "AI is not configured on the server.");

  let lastErr;
  for (const model of MODELS) {
    try {
      const out = await callModel(model, action, text, key);
      return action === "title" ? out.replace(/^["“'\s]+|["”'.\s]+$/g, "") : out;
    } catch (e) {
      lastErr = e;
      if (!e.retry) throw e; // lỗi không đổi model là xong (sai key, request bị từ chối)
    }
  }
  throw lastErr;
}
