// 聽見蝸牛 Snail B&B — AI 助理後端（Vercel serverless function）
// 所有功能皆由 Gemini API 驅動：
//   action: "chat"  → 文字對話
//   action: "voice" → 語音輸入（Gemini 多模態直接聽音檔：轉逐字稿 + 回覆）
//   action: "tts"   → 語音回覆（Gemini TTS 模型產生語音，回傳 WAV）
// 環境變數：GEMINI_API_KEY（必填）、GEMINI_MODEL、GEMINI_TTS_MODEL、GEMINI_TTS_VOICE（選填）

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
const TTS_VOICE = process.env.GEMINI_TTS_VOICE || "Kore";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_PROMPT = `你是「小蝸」，花蓮壽豐民宿「聽見蝸牛 Snail B&B」的 AI 助理。

【品牌與語氣】
- 蝸牛象徵慢活：希望旅人放慢腳步、仔細看世界、帶走值得收藏的回憶。「屬於你和我的家」。
- 民宿主人是返鄉青年，也是取得認證的園藝治療師，相信自然與花園生態能療癒人心。
- 語氣：溫暖、不急不徐、親切家庭感、帶一點詩意但平實。避免商業化或奢華飯店用語。
- 回覆簡短（最多 3–4 句）。

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
- 不知道的事（特定日期空房、確切單房價格、優惠細節）不要編造，請引導旅客加 LINE @tlk8657q 詢問管家。
- 不談論與民宿無關的敏感話題；離題時溫柔地把話題帶回旅宿與花蓮旅遊。

[LANGUAGE RULE — HIGHEST PRIORITY]
Reply in EXACTLY ONE language: the language of the traveller's latest message
(Traditional Chinese for Chinese, English for English). NEVER mix languages in
one reply, NEVER add a translation, NEVER repeat the same answer in another
language.`;

function langDirective(lang) {
  return lang === "en"
    ? "\n\n[This reply] The website UI is in English. If the traveller's message language is ambiguous, use English. One language only."
    : "\n\n【本次回覆】網站介面目前為繁體中文。若無法判斷旅客訊息的語言，請使用繁體中文。只能使用單一語言。";
}

// ---------- Gemini 呼叫 ----------

async function callGemini(model, payload, apiKey) {
  const r = await fetch(`${API_BASE}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const detail = await r.text();
    const err = new Error(`gemini_${r.status}`);
    err.status = r.status;
    err.detail = detail.slice(0, 600);
    throw err;
  }
  return r.json();
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || "").join("").trim();
}

function sanitizeHistory(history) {
  return (Array.isArray(history) ? history : [])
    .slice(-12)
    .filter((m) => m && typeof m.text === "string" && (m.role === "user" || m.role === "model"))
    .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, 1000) }] }));
}

// ---------- PCM → WAV（Gemini TTS 回傳 s16le PCM，包上 WAV 檔頭讓瀏覽器可直接播放） ----------

function pcmToWav(pcmBase64, sampleRate) {
  const pcm = Buffer.from(pcmBase64, "base64");
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);          // fmt chunk size
  header.writeUInt16LE(1, 20);           // PCM
  header.writeUInt16LE(1, 22);           // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate (16-bit mono)
  header.writeUInt16LE(2, 32);           // block align
  header.writeUInt16LE(16, 34);          // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]).toString("base64");
}

// ---------- 各動作 ----------

async function handleChat(body, apiKey) {
  const message = (typeof body.message === "string" ? body.message : "").trim().slice(0, 1000);
  if (!message) return { status: 400, json: { error: "empty_message" } };

  const contents = sanitizeHistory(body.history);
  contents.push({ role: "user", parts: [{ text: message }] });

  const data = await callGemini(MODEL, {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT + langDirective(body.lang) }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
  }, apiKey);

  const reply = extractText(data);
  if (!reply) return { status: 502, json: { error: "empty_reply" } };
  return { status: 200, json: { reply } };
}

async function handleVoice(body, apiKey) {
  const audio = body.audio || {};
  if (typeof audio.data !== "string" || !audio.data) {
    return { status: 400, json: { error: "empty_audio" } };
  }
  if (audio.data.length > 3_500_000) {
    return { status: 413, json: { error: "audio_too_large" } };
  }
  const mime = typeof audio.mime === "string" && audio.mime ? audio.mime : "audio/wav";

  const contents = sanitizeHistory(body.history);
  contents.push({
    role: "user",
    parts: [
      { inline_data: { mime_type: mime, data: audio.data } },
      { text: "這是旅客的語音訊息。請先將語音內容轉成逐字稿（transcript），再以民宿 AI 助理的身分回覆（reply）。reply 必須只使用旅客語音所用的單一語言，不可混用或翻譯。" }
    ]
  });

  const data = await callGemini(MODEL, {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT + langDirective(body.lang) }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 768,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          transcript: { type: "STRING", description: "旅客語音的逐字稿" },
          reply: { type: "STRING", description: "助理的回覆" }
        },
        required: ["transcript", "reply"]
      }
    }
  }, apiKey);

  let parsed;
  try {
    parsed = JSON.parse(extractText(data));
  } catch {
    return { status: 502, json: { error: "bad_voice_reply" } };
  }
  if (!parsed.reply) return { status: 502, json: { error: "empty_reply" } };
  return { status: 200, json: { transcript: parsed.transcript || "", reply: parsed.reply } };
}

async function handleTts(body, apiKey) {
  const text = (typeof body.text === "string" ? body.text : "").trim().slice(0, 800);
  if (!text) return { status: 400, json: { error: "empty_text" } };

  const data = await callGemini(TTS_MODEL, {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE } } }
    }
  }, apiKey);

  const part = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
  const inline = part && (part.inlineData || part.inline_data);
  if (!inline || !inline.data) return { status: 502, json: { error: "empty_audio_reply" } };

  const mime = inline.mimeType || inline.mime_type || "";
  const rateMatch = /rate=(\d+)/.exec(mime);
  const rate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;

  return { status: 200, json: { audio: pcmToWav(inline.data, rate), mime: "audio/wav" } };
}

// ---------- 入口 ----------

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "missing_api_key", hint: "Set GEMINI_API_KEY in Vercel environment variables." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  try {
    let result;
    if (body.action === "voice") result = await handleVoice(body, apiKey);
    else if (body.action === "tts") result = await handleTts(body, apiKey);
    else result = await handleChat(body, apiKey);
    res.status(result.status).json(result.json);
  } catch (err) {
    console.error("assistant error:", body.action || "chat", err.status || "", err.detail || err.message);
    res.status(502).json({ error: "upstream_error", status: err.status || 0 });
  }
};
