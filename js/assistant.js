// 聽見蝸牛 Snail B&B — AI 助理「小蝸」（全 Gemini 驅動）
// 文字對話、連續語音對話（免按送出：靜音偵測自動送出、即時字幕、自動接續聆聽）、
// 語音回覆（Gemini TTS）。全部經由 /api/assistant 呼叫 Gemini API。
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
  // iOS/Safari 只允許在使用者手勢中啟動音訊：第一次點擊時以無聲音檔「解鎖」
  // 一個共用的 <audio> 元素，之後的 TTS 皆重用該元素即可自動播放。
  // Gemini TTS 失敗（如流量限制）時改用瀏覽器內建語音，確保每次都有聲音。

  const SILENT_WAV = "data:audio/wav;base64,UklGRjgAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YRQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
  const audioEl = new Audio();
  audioEl.preload = "auto";
  let audioUnlocked = false;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    audioEl.src = SILENT_WAV;
    audioEl.play().catch(() => {});
  }

  let ttsOn = false;

  function stopAudio() {
    audioEl.onended = null;
    audioEl.onerror = null;
    audioEl.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  const ttsPlainText = (text) => text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

  function playDataUrl(url) {
    return new Promise((resolve) => {
      stopAudio();
      audioEl.onended = () => resolve(true);
      audioEl.onerror = () => resolve(false);
      audioEl.src = url;
      audioEl.play().catch(() => resolve(false));
    });
  }

  function speakBrowser(text) {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) { resolve(); return; }
      const u = new SpeechSynthesisUtterance(ttsPlainText(text));
      u.lang = currentLang() === "en" ? "en-US" : "zh-TW";
      u.onend = resolve;
      u.onerror = resolve;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });
  }

  // 播放語音回覆並等待播完；Gemini TTS 失敗時改用瀏覽器語音
  async function speakAndWait(text) {
    try {
      const data = await callApi({ action: "tts", text: ttsPlainText(text) });
      if (data && data.audio) {
        const ok = await playDataUrl(`data:${data.mime || "audio/wav"};base64,${data.audio}`);
        if (ok) return;
      }
    } catch { /* fall through to browser voice */ }
    await speakBrowser(text);
  }

  function speak(text) { return speakAndWait(text); }

  ttsBtn.addEventListener("click", () => {
    unlockAudio();
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
      const data = await callApi({ action: "chat", message: question, history: history.slice(-12), lang: currentLang() });
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

  // ---------- 連續語音對話模式 ----------
  // 按一次麥克風進入語音模式：持續聆聽 → 說話時顯示即時字幕 →
  // 停頓（靜音偵測）自動送出 Gemini → 播放語音回覆 → 自動繼續聆聽。
  // 再按一次麥克風（或關閉視窗）結束。

  const VOICE = Object.assign({
    rate: 16000,        // 上傳取樣率
    threshold: 0.012,   // 語音能量門檻（RMS）
    silenceMs: 1300,    // 停頓多久視為說完
    minSpeechMs: 350,   // 少於此語音長度視為雜訊，不送出
    maxUtterMs: 20000   // 單句最長錄音
  }, window.__VOICE_CFG || {});

  let voiceMode = false;
  let vState = "idle"; // idle | listening | processing | speaking
  let media = null;    // { stream, ctx, source, node }
  let utter = null;    // { chunks, speechMs, heard, startAt, lastVoiceAt, captionEl }
  let recog = null;    // 即時字幕（僅顯示用；正式逐字稿以 Gemini 為準）

  const statusEl = document.createElement("div");
  statusEl.className = "voice-status";
  statusEl.hidden = true;
  form.parentNode.insertBefore(statusEl, form);

  function setStatus(textZh, textEn) {
    statusEl.innerHTML = `<span class="voice-dot" aria-hidden="true"></span>${t(textZh, textEn)} <span class="voice-hint">${t("再按麥克風結束", "tap mic to end")}</span>`;
  }

  function setVoiceUI(on) {
    micBtn.classList.toggle("recording", on);
    micBtn.innerHTML = on ? ICONS.stop : ICONS.mic;
    micBtn.title = on ? t("結束語音對話", "End voice conversation") : t("開始語音對話", "Start voice conversation");
    statusEl.hidden = !on;
    input.placeholder = on ? t("語音對話中…", "Voice conversation on…") : t("想問點什麼呢？", "Ask me anything…");
  }

  // -- 即時字幕（瀏覽器支援時） --
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function startCaptions() {
    if (!SR) return;
    try {
      recog = new SR();
      recog.lang = currentLang() === "en" ? "en-US" : "zh-TW";
      recog.continuous = true;
      recog.interimResults = true;
      recog.onresult = (e) => {
        let text = "";
        for (const r of e.results) text += r[0].transcript;
        if (text.trim() && utter && utter.captionEl) {
          utter.captionEl.innerHTML = escapeHTML(text.trim());
          messages.scrollTop = messages.scrollHeight;
        }
      };
      recog.onerror = () => {};
      recog.start();
    } catch { recog = null; }
  }

  function stopCaptions() {
    if (recog) { try { recog.stop(); } catch {} recog = null; }
  }

  // -- 聆聽迴圈 --
  function startListening() {
    if (!voiceMode) return;
    const captionEl = addMessage(`<em>${t("（聆聽中…）", "(listening…)")}</em>`, "user");
    utter = { chunks: [], speechMs: 0, heard: false, startAt: performance.now(), lastVoiceAt: 0, captionEl };
    vState = "listening";
    setStatus("聆聽中，請直接說話", "Listening — just speak");
    startCaptions();
  }

  function discardUtterance() {
    if (utter && utter.captionEl) utter.captionEl.remove();
    utter = null;
  }

  async function endUtterance() {
    if (vState !== "listening" || !utter) return;
    vState = "processing";
    stopCaptions();
    const u = utter;
    utter = null;

    if (!u.heard || u.speechMs < VOICE.minSpeechMs) {
      // 只有環境雜訊：丟棄並重新聆聽
      u.captionEl.remove();
      startListening();
      return;
    }

    setStatus("思考中…", "Thinking…");
    u.captionEl.innerHTML = `<em>${t("（辨識中…）", "(transcribing…)")}</em>`;
    const typing = addMessage(typingHTML, "bot");
    const wav = encodeWav(u.chunks, media ? media.ctx.sampleRate : VOICE.rate);

    try {
      const data = await callApi({
        action: "voice",
        audio: { data: wav, mime: "audio/wav" },
        history: history.slice(-12),
        lang: currentLang()
      });
      u.captionEl.innerHTML = escapeHTML(data.transcript || t("（語音訊息）", "(voice message)"));
      history.push({ role: "user", text: data.transcript || "(voice)" }, { role: "model", text: data.reply });
      typing.innerHTML = renderReply(data.reply);
      messages.scrollTop = messages.scrollHeight;
      await speakReplyInVoiceMode(data.reply);
    } catch (err) {
      typing.remove();
      showError(err, () => {});
    }
    if (voiceMode) startListening();
  }

  // 語音模式播放回覆（沿用共用的 speakAndWait；播放期間暫停聆聽避免收到喇叭聲）
  async function speakReplyInVoiceMode(text) {
    vState = "speaking";
    setStatus("回覆中…", "Replying…");
    await speakAndWait(text);
  }

  async function enterVoiceMode() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaStreamSource(stream);
    const node = ctx.createScriptProcessor(4096, 1, 1);

    node.onaudioprocess = (e) => {
      if (vState !== "listening" || !utter) return;
      const buf = e.inputBuffer.getChannelData(0);
      utter.chunks.push(new Float32Array(buf));

      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      const bufMs = (buf.length / ctx.sampleRate) * 1000;
      const now = performance.now();

      if (rms > VOICE.threshold) {
        utter.heard = true;
        utter.speechMs += bufMs;
        utter.lastVoiceAt = now;
      }

      // 尚未偵測到語音時，只保留最近 2 秒，避免記憶體無限成長
      if (!utter.heard && utter.chunks.length > Math.ceil((2000 / bufMs))) utter.chunks.shift();

      if (utter.heard && now - utter.lastVoiceAt > VOICE.silenceMs) endUtterance();
      else if (utter.heard && now - utter.startAt > VOICE.maxUtterMs) endUtterance();
    };

    source.connect(node);
    node.connect(ctx.destination);
    media = { stream, ctx, source, node };
    voiceMode = true;
    setVoiceUI(true);
    startListening();
  }

  function exitVoiceMode() {
    voiceMode = false;
    stopCaptions();
    stopAudio();
    if (vState === "listening") discardUtterance();
    vState = "idle";
    if (media) {
      media.node.disconnect();
      media.source.disconnect();
      media.stream.getTracks().forEach((tr) => tr.stop());
      media.ctx.close().catch(() => {});
      media = null;
    }
    setVoiceUI(false);
  }

  // -- PCM → 16kHz 單聲道 WAV（Gemini 官方支援格式） --
  function encodeWav(chunks, sourceRate) {
    let length = 0;
    for (const c of chunks) length += c.length;
    const samples = new Float32Array(length);
    let off = 0;
    for (const c of chunks) { samples.set(c, off); off += c.length; }

    const ratio = sourceRate / VOICE.rate;
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
    view.setUint32(24, VOICE.rate, true);
    view.setUint32(28, VOICE.rate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, out.length * 2, true);
    new Int16Array(buf, 44).set(out);

    const bytes = new Uint8Array(buf);
    let bin = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin);
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    micBtn.addEventListener("click", async () => {
      unlockAudio();
      if (voiceMode) { exitVoiceMode(); return; }
      try {
        await enterVoiceMode();
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
      b.addEventListener("click", () => { unlockAudio(); sendText(b.dataset.q); })
    );
  }

  function applyLang() {
    renderChips();
    root.querySelector(".chatbot-title").textContent = t("小蝸 AI 助理", "Snaily · AI Concierge");
    if (!voiceMode) input.placeholder = t("想問點什麼呢？", "Ask me anything…");
    if (voiceMode && vState === "listening") setStatus("聆聽中，請直接說話", "Listening — just speak");
    micBtn.title = voiceMode ? t("結束語音對話", "End voice conversation") : t("開始語音對話", "Start voice conversation");
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
            "您好，我是小蝸——聽見蝸牛的 AI 助理。<br>放慢腳步，想知道什麼都可以問我：訂房、房型、周邊景點、行程建議都可以。按下麥克風即可開始語音對話——說完稍作停頓就會自動送出，不用按任何鍵。",
            "Hello, I'm Snaily — the Snail B&B AI concierge.<br>Ask me anything: bookings, rooms, nearby attractions, trip ideas. Press the microphone to start a voice conversation — just pause when you finish speaking and it sends automatically."
          );
          messages.scrollTop = messages.scrollHeight;
        }, 450);
      }
    } else if (voiceMode) {
      exitVoiceMode();
    }
  }

  toggle.addEventListener("click", () => { unlockAudio(); openPanel(panel.hidden); });
  root.querySelector(".chatbot-close").addEventListener("click", () => openPanel(false));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    unlockAudio();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    sendText(q);
  });
})();
