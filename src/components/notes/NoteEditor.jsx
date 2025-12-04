// excerpt: safe fetch + error handling to replace previous fetch in NoteEditor.jsx

const proxyUrl = process.env.REACT_APP_GEMINI_PROXY_URL || "https://studu.vercel.app/api/gemini"; // ضع هنا رابط Vercel الصحيح
try {
  const resp = await fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  // read text first (avoid json() throwing on empty body)
  const rawText = await resp.text().catch(() => null);
  if (!resp.ok) {
    console.error("AI proxy non-OK:", resp.status, rawText);
    // try parse JSON body for more details
    let parsed = null;
    try { parsed = rawText ? JSON.parse(rawText) : null; } catch(e) { parsed = null; }
    const msg = (parsed && parsed.error) ? parsed.error : `Server returned ${resp.status}`;
    alert("فشل التحليل بالذكاء الاصطناعي: " + msg);
    return;
  }

  // parse JSON from text (should succeed if server returned JSON)
  let json = null;
  try { json = rawText ? JSON.parse(rawText) : null; } catch (e) {
    console.error("Failed to parse JSON from AI proxy:", e, rawText);
    alert("فشل تحليل الرد من الخادم.");
    return;
  }

  const text = json?.result || null;
  if (!text) {
    console.error("AI proxy response missing text:", json);
    alert("فشل التحليل بالذكاء الاصطناعي: الرد غير صالح.");
    return;
  }

  await addNoteBlock("ai", text);
  showToast("تم إضافة رد الذكاء الاصطناعي ✨");
} catch (err) {
  console.error("Network/Proxy error calling AI:", err);
  alert("فشل الاتصال بخدمة الذكاء الاصطناعي: مشكلة في الاتصال بالخادم.");
} finally {
  setIsAiLoading(false);
}
