// server/gemini-proxy/index.js
// Robust Gemini proxy for production or local development.
// - Uses global fetch (Node 18+) or falls back gracefully.
// - Requires process.env.GEMINI_API_KEY to be set.
// - Returns { ok, result, raw, error } to help debugging.

const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY not set. Proxy will return error responses until key is provided.");
}

// small helper to call remote API with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  // Node 18+ has global fetch and AbortController
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ ok: false, error: "prompt is required and must be a string" });
    }
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ ok: false, error: "GEMINI_API_KEY not configured on server" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }, 20000);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Gemini API non-OK response:", response.status, text);
      return res.status(502).json({ ok: false, error: `Upstream API returned ${response.status}`, raw: text });
    }

    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || data?.output?.[0]?.content?.text
      || "";

    return res.json({ ok: true, result, raw: data });
  } catch (err) {
    console.error("Gemini proxy error:", err && (err.stack || err.message || err));
    if (err.name === "AbortError") {
      return res.status(504).json({ ok: false, error: "Upstream request timed out" });
    }
    return res.status(500).json({ ok: false, error: "Server error calling Gemini", details: err.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini proxy listening on http://localhost:${PORT}`);
});