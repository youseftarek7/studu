// api/gemini.js  (لـ Vercel Serverless Function)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") return res.status(200).json({ ok: true, msg: "Function exists (GET)" });
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const body = req.body || {};
  const prompt = body.prompt;
  if (!prompt) return res.status(400).json({ ok: false, error: "prompt required" });

  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(500).json({ ok: false, error: "GEMINI_API_KEY missing" });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${KEY}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = text; }

    if (!resp.ok) {
      return res.status(502).json({ ok: false, error: "Upstream error", status: resp.status, raw: data });
    }
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.output?.[0]?.content?.text || "";
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    if (err.name === "AbortError") return res.status(504).json({ ok: false, error: "Upstream timed out" });
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
