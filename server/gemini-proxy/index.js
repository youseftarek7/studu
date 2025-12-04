// api/gemini.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // For GET return simple OK so we can check endpoint existence
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, msg: "Function exists (GET)" });
  }

  // POST: echo body for diagnostic
  try {
    const body = req.body && Object.keys(req.body).length ? req.body : { msg: "no body" };
    console.log("Diagnostic POST body keys:", Object.keys(body || {}));
    return res.status(200).json({ ok: true, received: body });
  } catch (err) {
    console.error("Diagnostic error:", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
