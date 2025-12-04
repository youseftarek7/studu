// api/gemini.js
// Vercel Serverless Function — improved diagnostics and robust responses.

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    // CORS preflight
    return res.status(204).end();
  }

  try {
    console.log("=== /api/gemini called ===");
    console.log("ENV.GEMINI_API_KEY present?", !!process.env.GEMINI_API_KEY);
    console.log("Request method:", req.method);

    // Ensure we respond with JSON on unsupported methods so client won't try to parse empty body
    if (req.method !== "POST") {
      console.warn("Method not allowed:", req.method);
      return res.status(405).json({ ok: false, error: "Method not allowed. Use POST with JSON body { prompt }" });
    }

    // Parse body robustly
    let body = req.body;
    if (!body || (typeof body === "object" && Object.keys(body).length === 0)) {
      // try to parse rawBody if available
      try {
        body = req.rawBody ? JSON.parse(req.rawBody) : body;
      } catch (e) {
        // ignore parse error
      }
    }
    console.log("Request body keys:", body ? Object.keys(body) : "no body");

    const prompt = body && body.prompt;
    if (!prompt || typeof prompt !== "string") {
      console.warn("Missing or invalid prompt:", prompt);
      return res.status(400).json({ ok: false, error: "prompt is required and must be a string" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing in ENV");
      return res.status(500).json({ ok: false, error: "GEMINI_API_KEY not configured on server" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
    console.log("Calling upstream Gemini API");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    console.log("Upstream status:", resp.status);
    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!resp.ok) {
      console.error("Upstream returned non-OK:", resp.status, data);
      return res.status(502).json({ ok: false, error: "Upstream API error", status: resp.status, raw: data });
    }

    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.output?.[0]?.content?.text || "";
    console.log("Got result length:", (result && result.length) || 0);

    return res.status(200).json({ ok: true, result, raw: data });
  } catch (err) {
    console.error("Function error:", err && (err.stack || err.message || err));
    if (err.name === "AbortError") {
      return res.status(504).json({ ok: false, error: "Upstream request timed out" });
    }
    return res.status(500).json({ ok: false, error: "Server error calling Gemini", details: err.message || String(err) });
  }
}
