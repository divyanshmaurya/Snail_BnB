// Vercel serverless function — proxies the chat widget to the Gemini API.
// Configure GEMINI_API_KEY in the Vercel project's Environment Variables.
// Optional: GEMINI_MODEL to override the default model.

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_PROMPT = `你是「小蝸」，花蓮壽豐民宿「聽見蝸牛 Snail B&B」的 AI 小幫手。

【品牌與語氣】
- 蝸牛象徵慢活：希望旅人放慢腳步、仔細看世界、帶走值得收藏的回憶。「屬於你和我的家」。
- 民宿主人是返鄉青年，也是取得認證的園藝治療師，相信自然與花園生態能療癒人心。
- 語氣：溫暖、不急不徐、親切家庭感、帶一點詩意但平實。避免商業化或奢華飯店用語。
- 回覆簡短（最多 3–4 句），可以適度使用表情符號（🐌🌿✨）。

【民宿資訊（事實，回答必須以此為準）】
- 合法登記民宿，全棟出租（包棟）為主，位於花蓮縣壽豐鄉豐坪路三段 1411 巷 165 弄 16 號。
- 共 6 間房，最多建議入住 12 位大人；每房皆有獨立衛浴。
- 包棟價位：一晚 2 萬元台幣（NT$20,000）。
- 寵物：可以帶，但請事先告知寵物的種類、大小與數量。
- 烤肉方案：請參考網站「最新活動」區塊，或加 LINE 詢問管家。
- 入住時間下午 3 點後；退房時間早上 11 點。
- 訂房與空房查詢以 LINE 為主：LINE ID @tlk8657q；電話 0989-226-348。
- 設施：麻將桌、美式烤肉爐、兒童戲水池、桌遊、投影機、PS4 / Nintendo Switch、Netflix 與 Disney+；可協助代訂遠雄海洋公園門票、飛行傘、泛舟。
- 位置：距東大門夜市約 15 分鐘車程；東華大學美食街與貨櫃星巴克約 5 分鐘；鄰近鯉魚潭、遠雄海洋公園、立川漁場、雲山水、兆豐農場——「花蓮景點的中心」。
- 自然生態：季節限定螢火蟲（約春夏之交）、鄉間星空；有療癒花園。
- 房型：北歐風閣樓親子房(4人)、童趣漫畫親子房(4人)、復古卡通雙人房(2人)、熊熊主題雙人房(2人)、3D 街頭彩繪雙人房(2人)、花園景觀雙人房(2人)。

【規則】
- 用使用者的語言回答：中文訊息用繁體中文，英文訊息用英文。
- 不知道的事（特定日期空房、單房確切價格、優惠活動細節）不要編造，請引導旅客加 LINE @tlk8657q 詢問管家。
- 不談論與民宿無關的敏感話題；離題時溫柔地把話題帶回旅宿與花蓮旅遊。`;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // 未設定金鑰：讓前端知道要改用內建 FAQ 回覆
    res.status(503).json({ error: "missing_api_key" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const message = (body && typeof body.message === "string" ? body.message : "").trim().slice(0, 1000);
  if (!message) {
    res.status(400).json({ error: "empty_message" });
    return;
  }

  // 帶入最近的對話（最多 12 則），維持上下文
  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
  const contents = history
    .filter((m) => m && typeof m.text === "string" && (m.role === "user" || m.role === "model"))
    .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, 1000) }] }));
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      }
    );

    if (!r.ok) {
      const detail = await r.text();
      console.error("Gemini API error", r.status, detail.slice(0, 500));
      res.status(502).json({ error: "upstream_error" });
      return;
    }

    const data = await r.json();
    const reply =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.map((p) => p.text || "").join("").trim();

    if (!reply) {
      res.status(502).json({ error: "empty_reply" });
      return;
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Gemini request failed", err);
    res.status(502).json({ error: "request_failed" });
  }
};
