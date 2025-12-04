async function handleAiPrompt(prompt) {
  const proxyUrl =
    process.env.REACT_APP_GEMINI_PROXY_URL ||
    "https://studu.vercel.app/api/gemini"; // رابط Vercel الصحيح

  try {
    const resp = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const rawText = await resp.text().catch(() => null);

    if (!resp.ok) {
      console.error("AI proxy non-OK:", resp.status, rawText);
      let parsed = null;
      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch (e) {
        parsed = null;
      }
      const msg = parsed?.error || `Server returned ${resp.status}`;
      alert("فشل التحليل بالذكاء الاصطناعي: " + msg);
      return;
    }

    let json = null;
    try {
      json = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
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
    alert(
      "فشل الاتصال بخدمة الذكاء الاصطناعي: مشكلة في الاتصال بالخادم."
    );
  } finally {
    setIsAiLoading(false);
  }
}
