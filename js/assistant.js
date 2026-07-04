// 聽見蝸牛 Snail B&B — AI 助理「小蝸」（全 Gemini 驅動）
// 文字對話、語音輸入（錄音送 Gemini 聽打＋回覆）、語音回覆（Gemini TTS）
// 全部經由 /api/assistant（Vercel serverless function）呼叫 Gemini API。
// API 失敗時誠實顯示錯誤與「重試」，不使用罐頭回覆。

(function () {
  const t = (zh, en) => (window.I18N ? window.I18N.t(zh, en) : zh);
  const currentLang = () => (window.I18N ? window.I18N.lang : "zh");

  // 常見問題快捷鍵（僅作為建議問題，回答一律由 Gemini 生成）
  const SUGGESTIONS = [
    { zh: "我想包棟，請問包棟價位？", en: "What's the whole-house price?" },
    { zh: "可以帶寵物嗎？", en: "Can I bring pets?" },
    { zh: "烤肉有什麼方案？", en: "What BBQ plans are there?" },
    { zh: "有幾間房間？", en: "How many rooms are there?" },
    { zh: "入住與退房時間？", en: "Check-in and check-out times?" }
  ];

  const history = []; // {role: 'user'|'model', text}

  async function callApi(payload) {
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    let data = null;
    try { data = await res.json(); } catch { /* non-JSON error body */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || `http_${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function errorText(err) {
    if (err && err.message === "missing_api_key") {
      return t(
        "AI 服務尚未設定完成（缺少 API 金鑰）。請站方於 Vercel 環境變數設定 GEMINI_API_KEY。",
        "The AI service isn't configured yet (missing API key). Please set GEMINI_API_KEY in the Vercel environment variables."
      );
    }
    return t(
      "抱歉，AI 服務暫時無法回應。請點「重試」，或加 LINE @tlk8657q 由管家親自回覆。",
      "Sorry, the AI service isn't responding right now. Please tap “Retry”, or message LINE @tlk8657q and our host will reply personally."
    );
  }

  // ---------- UI ----------

  const ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>',
    speakerOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
    speakerOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
  };

  const root = document.createElement("div");
  root.className = "chatbot";
  root.innerHTML = `
    <button class="chatbot-toggle" aria-label="開啟 AI 助理" aria-expanded="false">${ICONS.chat}</button>
    <div class="chatbot-panel" hidden>
      <div class="chatbot-head">
        <div class="chatbot-avatar" aria-hidden="true">蝸</div>
        <div>
          <strong class="chatbot-title">小蝸 AI 助理</strong>
          <span>Powered by Gemini</span>
        </div>
        <button class="chatbot-tts" aria-pressed="false" title="語音回覆">${ICONS.speakerOff}</button>
        <button class="chatbot-close" aria-label="關閉聊天視窗">${ICONS.close}</button>
      </div>
      <div class="chatbot-messages" role="log" aria-live="polite"></div>
      <div class="chatbot-chips"></div>
      <form class="chatbot-input">
        <button type="button" class="chatbot-mic" title="語音輸入">${ICONS.mic}</button>
        <input type="text" placeholder="想問點什麼呢？" aria-label="輸入訊息" autocomplete="off">
        <button type="submit" class="btn btn-primary" aria-label="送出">${ICONS.send}</button>
      </form>
    </div>`;
  document.body.appendChild(root);

  const toggle = root.querySelector(".chatbot-toggle");
  const panel = root.querySelector(".chatbot-panel");
  const messages = root.querySelector(".chatbot-messages");
  const chipsBox = root.querySelector(".chatbot-chips");
  const form = root.querySelector(".chatbot-input");
  const input = form.querySelector("input");
  const micBtn = root.querySelector(".chatbot-mic");
  const ttsBtn = root.querySelector(".chatbot-tts");

  function addMessage(html, who) {
    const el = document.createElement("div");
    el.className = `chatbot-msg ${who}`;
    el.innerHTML = html;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  const typingHTML = "<span class='chatbot-typing'><i></i><i></i><i></i></span>";
  const escapeHTML = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Gemini 回覆為純文字/Markdown；僅轉換換行與粗體，其餘跳脫以策安全
  function renderReply(text) {
    return escapeHTML(text)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  // ---------- 語音回覆（Gemini TTS） ----------

  let ttsOn = false;
  let currentAudio = null;

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
  }

  async function speak(text) {
    try {
      const data = await callApi({ action: "tts", text });
      if (!data || !data.audio) return;
      stopAudio();
      currentAudio = new Audio(`data:${data.mime || "audio/wav"};base64,${data.audio}`);
      currentAudio.play().catch(() => {});
    } catch {
      // 語音合成失敗時安靜略過，文字回覆仍在畫面上
    }
  }

  ttsBtn.addEventListener("click", () => {
    ttsOn = !ttsOn;
    ttsBtn.setAttribute("aria-pressed", ttsOn);
    ttsBtn.innerHTML = ttsOn ? ICONS.speakerOn : ICONS.speakerOff;
    if (!ttsOn) stopAudio();
  });

  // ---------- 對話流程 ----------

  let busy = false;

  function setBusy(v) {
    busy = v;
    form.querySelector("[type=submit]").disabled = v;
  }

  function showError(err, retryFn) {
    const el = addMessage("", "bot error");
    el.innerHTML = `${errorText(err)} <button type="button" class="chatbot-retry">${t("重試", "Retry")}</button>`;
    el.querySelector(".chatbot-retry").addEventListener("click", () => {
      el.remove();
      retryFn();
    });
  }

  async function sendText(question, { speakReply = ttsOn } = {}) {
    if (busy) return;
    setBusy(true);
    addMessage(escapeHTML(question), "user");
    const typing = addMessage(typingHTML, "bot");
    try {
      const data = await callApi({ action: "chat", message: question, history: history.slice(-12) });
      history.push({ role: "user", text: question }, { role: "model", text: data.reply });
      typing.innerHTML = renderReply(data.reply);
      messages.scrollTop = messages.scrollHeight;
      if (speakReply) speak(data.reply);
    } catch (err) {
      typing.remove();
      showError(err, () => sendText(question, { speakReply }));
    } finally {
      setBusy(false);
    }
  }

  async function sendVoice(wavBase64) {
    if (busy) return;
    setBusy(true);
    const userEl = addMessage(`<em>${t("（語音訊息，辨識中…）", "(voice message, transcribing…)")}</em>`, "user");
    const typing = addMessage(typingHTML, "bot");
    try {
      const data = await callApi({
        action: "voice",
        audio: { data: wavBase64, mime: "audio/wav" },
        history: history.slice(-12)
      });
      userEl.innerHTML = escapeHTML(data.transcript || t("（語音訊息）", "(voice message)"));
      history.push({ role: "user", text: data.transcript || "(voice)" }, { role: "model", text: data.reply });
      typing.innerHTML = renderReply(data.reply);
      messages.scrollTop = messages.scrollHeight;
      speak(data.reply); // 語音提問一律以語音回覆
    } catch (err) {
      userEl.innerHTML = `<em>${t("（語音訊息）", "(voice message)")}</em>`;
      typing.remove();
      showError(err, () => sendVoice(wavBase64));
    } finally {
      setBusy(false);
    }
  }

  // ---------- 語音輸入：錄音 → 16kHz 單聲道 WAV → Gemini ----------
  // 使用 Web Audio 取得 PCM 自行編成 WAV，格式為 Gemini 官方支援的 audio/wav。

  const RECORD_RATE = 16000;
  const MAX_RECORD_MS = 30000;

  let recState = null; // { stream, ctx, source, node, chunks, timer }

  function encodeWav(chunks, sourceRate) {
    let length = 0;
    for (const c of chunks) length += c.length;
    const samples = new Float32Array(length);
    let off = 0;
    for (const c of chunks) { samples.set(c, off); off += c.length; }

    // 重取樣到 16kHz（線性內插）
    const ratio = sourceRate / RECORD_RATE;
    const outLen = Math.floor(samples.length / ratio);
    const out = new Int16Array(outLen);
    for (let i = 0; i < outLen; i++) {
      const pos = i * ratio;
      const i0 = Math.floor(pos);
      const i1 = Math.min(i0 + 1, samples.length - 1);
      const v = samples[i0] + (samples[i1] - samples[i0]) * (pos - i0);
      out[i] = Math.max(-1, Math.min(1, v)) * 0x7fff;
    }

    const buf = new ArrayBuffer(44 + out.length * 2);
    const view = new DataView(buf);
    const writeStr = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + out.length * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, RECORD_RATE, true);
    view.setUint32(28, RECORD_RATE * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, out.length * 2, true);
    new Int16Array(buf, 44).set(out);

    // ArrayBuffer → base64
    const bytes = new Uint8Array(buf);
    let bin = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin);
  }

  function setRecordingUI(on) {
    micBtn.classList.toggle("recording", on);
    micBtn.innerHTML = on ? ICONS.stop : ICONS.mic;
    input.placeholder = on
      ? t("正在聆聽，再按一下送出…", "Listening — tap again to send…")
      : t("想問點什麼呢？", "Ask me anything…");
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaStreamSource(stream);
    const node = ctx.createScriptProcessor(4096, 1, 1);
    const chunks = [];
    node.onaudioprocess = (e) => chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    source.connect(node);
    node.connect(ctx.destination);
    const timer = setTimeout(stopRecording, MAX_RECORD_MS);
    recState = { stream, ctx, source, node, chunks, timer };
    setRecordingUI(true);
  }

  function stopRecording() {
    if (!recState) return;
    const { stream, ctx, source, node, chunks, timer } = recState;
    recState = null;
    clearTimeout(timer);
    node.disconnect();
    source.disconnect();
    stream.getTracks().forEach((tr) => tr.stop());
    const rate = ctx.sampleRate;
    ctx.close().catch(() => {});
    setRecordingUI(false);
    if (!chunks.length) return;
    const wav = encodeWav(chunks, rate);
    sendVoice(wav);
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    micBtn.addEventListener("click", async () => {
      if (recState) { stopRecording(); return; }
      if (busy) return;
      try {
        await startRecording();
      } catch {
        addMessage(t("無法使用麥克風，請確認瀏覽器權限。", "Couldn't access the microphone — please check browser permissions."), "bot error");
      }
    });
  } else {
    micBtn.style.display = "none";
  }

  // ---------- 建議問題、雙語、開關 ----------

  function renderChips() {
    const lang = currentLang();
    chipsBox.innerHTML = SUGGESTIONS.map((s) => `<button type="button" data-q="${s[lang]}">${s[lang]}</button>`).join("");
    chipsBox.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => sendText(b.dataset.q))
    );
  }

  function applyLang() {
    renderChips();
    root.querySelector(".chatbot-title").textContent = t("小蝸 AI 助理", "Snaily · AI Concierge");
    if (!recState) input.placeholder = t("想問點什麼呢？", "Ask me anything…");
    micBtn.title = t("語音輸入", "Voice input");
    ttsBtn.title = t("語音回覆", "Voice replies");
    toggle.setAttribute("aria-label", t("開啟 AI 助理", "Open AI assistant"));
  }

  document.addEventListener("langchange", applyLang);
  applyLang();

  let greeted = false;
  function openPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open);
    if (open) {
      input.focus();
      if (!greeted) {
        greeted = true;
        const g = addMessage(typingHTML, "bot");
        setTimeout(() => {
          g.innerHTML = t(
            "您好，我是小蝸——聽見蝸牛的 AI 助理。<br>放慢腳步，想知道什麼都可以問我：訂房、房型、周邊景點、行程建議都可以。也可以按麥克風直接用說的。",
            "Hello, I'm Snaily — the Snail B&B AI concierge.<br>Ask me anything: bookings, rooms, nearby attractions, trip ideas. You can also press the microphone and just speak."
          );
          messages.scrollTop = messages.scrollHeight;
        }, 450);
      }
    } else if (recState) {
      stopRecording();
    }
  }

  toggle.addEventListener("click", () => openPanel(panel.hidden));
  root.querySelector(".chatbot-close").addEventListener("click", () => openPanel(false));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    sendText(q);
  });
})();
