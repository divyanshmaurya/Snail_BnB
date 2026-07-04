// 聽見蝸牛 Snail B&B — AI 小幫手「小蝸」
// 主要模式：呼叫 /api/chat（Vercel serverless function → Gemini API）。
// 後備模式：API 不可用（本機開檔、未設 GEMINI_API_KEY）時，改用內建 5 組常見問答關鍵字比對。
// 另含語音輸入（Web Speech Recognition）與語音朗讀（Speech Synthesis），以及中英雙語介面。

(function () {
  const t = (zh, en) => (window.I18N ? window.I18N.t(zh, en) : zh);
  const currentLang = () => (window.I18N ? window.I18N.lang : "zh");
  const LINE_LINK = '<a href="https://line.me/R/ti/p/@tlk8657q" target="_blank" rel="noopener">LINE @tlk8657q</a>';

  // ---------- 後備問答（需求規格 Section 4 的 5 組 FAQ） ----------
  const FAQS = [
    {
      q: { zh: "我想包棟，請問包棟價位？", en: "What's the whole-house price?" },
      keywords: ["包棟", "價位", "價格", "價錢", "多少錢", "費用", "一晚多少", "price", "cost", "how much", "whole house", "rate"],
      a: {
        zh: "包棟一晚 2 萬元台幣。🏡 整棟 6 間房與所有公共空間都是你們的，歡迎加 " + LINE_LINK + " 確認日期與空房喔！",
        en: "Whole-house rental is NT$20,000 per night. 🏡 All 6 rooms and every shared space are yours — message us on " + LINE_LINK + " to check dates and availability!"
      }
    },
    {
      q: { zh: "可以帶寵物嗎？", en: "Can I bring pets?" },
      keywords: ["寵物", "帶狗", "帶貓", "毛小孩", "狗狗", "貓咪", "pet", "dog", "cat"],
      a: {
        zh: "可以帶寵物喔！🐾 但請事先告知寵物的種類、大小與數量，讓我們先把環境準備好。",
        en: "Yes, pets are welcome! 🐾 Please let us know the type, size and number of pets in advance so we can prepare."
      }
    },
    {
      q: { zh: "烤肉有什麼方案？", en: "What BBQ plans are there?" },
      keywords: ["烤肉", "bbq", "燒烤", "烤爐", "barbecue", "grill"],
      a: {
        zh: '烤肉方案請參考<a href="#events">最新活動頁面</a> 🍖，也可以加 ' + LINE_LINK + " 直接詢問管家最新內容。",
        en: 'Please see the <a href="#events">events section</a> for the latest BBQ plans 🍖, or ask our host directly on ' + LINE_LINK + "."
      }
    },
    {
      q: { zh: "有幾間房間？", en: "How many rooms are there?" },
      keywords: ["幾間", "幾房", "房間數", "房型", "住幾人", "幾個人", "人數", "容納", "how many room", "rooms", "capacity", "people", "adults"],
      a: {
        zh: "總共 6 房，最多建議入住 12 位大人。👨‍👩‍👧‍👦 每間房都有獨立衛浴，房型介紹可以看看「房型」區塊喔！",
        en: "There are 6 rooms in total, recommended for up to 12 adults. 👨‍👩‍👧‍👦 Every room has a private bathroom — see the Rooms section for details!"
      }
    },
    {
      q: { zh: "入住與退房時間？", en: "Check-in and check-out times?" },
      keywords: ["入住", "退房", "check in", "check-in", "checkin", "check out", "check-out", "checkout", "幾點", "time"],
      a: {
        zh: "入住時間為下午 3 點後，退房時間為早上 11 點。🕒 若需要調整時間，歡迎先透過 LINE 與我們聊聊。",
        en: "Check-in is after 3:00 PM and check-out is by 11:00 AM. 🕒 If you need different times, just message us on LINE first."
      }
    }
  ];

  const EXTRAS = [
    {
      keywords: ["你好", "哈囉", "嗨", "hello", "hi", "安安", "hey"],
      a: {
        zh: "哈囉，我是小蝸 🐌 很高興見到你！可以問我包棟價位、寵物、烤肉方案、房間數或入住退房時間喔。",
        en: "Hello! I'm Snaily 🐌 lovely to meet you! Ask me about the whole-house price, pets, BBQ plans, rooms, or check-in/out times."
      }
    },
    {
      keywords: ["訂房", "預訂", "預約", "空房", "聯絡", "line", "電話", "地址", "怎麼去", "位置", "book", "reserve", "contact", "phone", "address", "location"],
      a: {
        zh: "訂房與空房查詢請加 " + LINE_LINK + "（主要聯絡方式），或撥 <a href='tel:0989226348'>0989-226-348</a> 📞。地址：花蓮縣壽豐鄉豐坪路三段 1411 巷 165 弄 16 號。",
        en: "For bookings and availability please add " + LINE_LINK + " (our main channel) or call <a href='tel:0989226348'>0989-226-348</a> 📞. Address: No. 16, Aly. 165, Ln. 1411, Sec. 3, Fengping Rd., Shoufeng, Hualien."
      }
    },
    {
      keywords: ["謝謝", "感謝", "thanks", "thank you", "讚"],
      a: {
        zh: "不客氣～期待在花蓮見到你！記得像蝸牛一樣，慢慢來就好 🐌💚",
        en: "You're welcome — see you in Hualien! Remember, take it slow like a snail 🐌💚"
      }
    }
  ];

  function fallbackReply(raw) {
    const text = raw.toLowerCase();
    const lang = currentLang();
    const hit =
      FAQS.find((f) => f.keywords.some((k) => text.includes(k))) ||
      EXTRAS.find((f) => f.keywords.some((k) => text.includes(k)));
    if (hit) return hit.a[lang] || hit.a.zh;
    return lang === "en"
      ? "I'm still learning that one 🐌 You can ask me about the whole-house price, pets, BBQ plans, rooms, or check-in/out times — or message " + LINE_LINK + " and our host will reply personally!"
      : "這個問題小蝸還在慢慢學 🐌 你可以問我：包棟價位、寵物、烤肉方案、房間數、入住退房時間，或加 " + LINE_LINK + " 由管家親自回覆喔！";
  }

  // ---------- Gemini（經由 /api/chat）----------
  const history = []; // {role: 'user'|'model', text}
  let apiAvailable = true; // 第一次失敗後改用後備模式，避免每則訊息都等逾時

  async function geminiReply(message) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: history.slice(-12), lang: currentLang() })
    });
    if (!res.ok) throw new Error("api_" + res.status);
    const data = await res.json();
    if (!data || typeof data.reply !== "string" || !data.reply.trim()) throw new Error("empty_reply");
    return data.reply.trim();
  }

  async function getReply(message) {
    history.push({ role: "user", text: message });
    let reply;
    if (apiAvailable) {
      try {
        reply = await geminiReply(message);
      } catch (err) {
        apiAvailable = false; // 之後直接用後備問答
        reply = fallbackReply(message);
      }
    } else {
      reply = fallbackReply(message);
    }
    history.push({ role: "model", text: reply.replace(/<[^>]*>/g, "") });
    return reply;
  }

  // ---------- 聊天視窗 UI ----------
  const root = document.createElement("div");
  root.className = "chatbot";
  root.innerHTML = `
    <button class="chatbot-toggle" aria-label="開啟 AI 小幫手" aria-expanded="false">🐌</button>
    <div class="chatbot-panel" hidden>
      <div class="chatbot-head">
        <div class="chatbot-avatar" aria-hidden="true">🐌</div>
        <div>
          <strong class="chatbot-title">小蝸 AI 小幫手</strong>
          <span>聽見蝸牛 Snail B&amp;B</span>
        </div>
        <button class="chatbot-tts" aria-pressed="false" title="朗讀回覆">🔇</button>
        <button class="chatbot-close" aria-label="關閉聊天視窗">✕</button>
      </div>
      <div class="chatbot-messages" role="log" aria-live="polite"></div>
      <div class="chatbot-chips"></div>
      <form class="chatbot-input">
        <button type="button" class="chatbot-mic" title="語音輸入">🎤</button>
        <input type="text" placeholder="想問點什麼呢？" aria-label="輸入訊息" autocomplete="off">
        <button type="submit" class="btn btn-primary" aria-label="送出">➤</button>
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

  // ---------- 語音朗讀（TTS） ----------
  let ttsOn = false;

  function speak(html) {
    if (!ttsOn || !("speechSynthesis" in window)) return;
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || "";
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = currentLang() === "en" ? "en-US" : "zh-TW";
    window.speechSynthesis.speak(utter);
  }

  if ("speechSynthesis" in window) {
    ttsBtn.addEventListener("click", () => {
      ttsOn = !ttsOn;
      ttsBtn.setAttribute("aria-pressed", ttsOn);
      ttsBtn.textContent = ttsOn ? "🔊" : "🔇";
      if (!ttsOn) window.speechSynthesis.cancel();
    });
  } else {
    ttsBtn.style.display = "none";
  }

  function botSay(html) {
    const typing = addMessage("<span class='chatbot-typing'><i></i><i></i><i></i></span>", "bot");
    setTimeout(() => {
      typing.innerHTML = html;
      messages.scrollTop = messages.scrollHeight;
      speak(html);
    }, 550);
  }

  async function handle(question) {
    addMessage(question.replace(/</g, "&lt;"), "user");
    const typing = addMessage("<span class='chatbot-typing'><i></i><i></i><i></i></span>", "bot");
    const reply = await getReply(question);
    typing.innerHTML = reply;
    messages.scrollTop = messages.scrollHeight;
    speak(reply);
  }

  // ---------- 語音輸入（Speech Recognition） ----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    let recognizing = false;
    let recognition = null;

    micBtn.addEventListener("click", () => {
      if (recognizing && recognition) {
        recognition.stop();
        return;
      }
      recognition = new SR();
      recognition.lang = currentLang() === "en" ? "en-US" : "zh-TW";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        recognizing = true;
        micBtn.classList.add("recording");
        input.placeholder = t("正在聆聽…", "Listening…");
      };
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript.trim();
        if (transcript) handle(transcript);
      };
      recognition.onerror = () => {};
      recognition.onend = () => {
        recognizing = false;
        micBtn.classList.remove("recording");
        input.placeholder = t("想問點什麼呢？", "Ask me anything…");
      };
      recognition.start();
    });
  } else {
    micBtn.style.display = "none";
  }

  // ---------- 開關、常見問題按鈕、雙語 ----------
  function renderChips() {
    const lang = currentLang();
    chipsBox.innerHTML = FAQS.map((f) => `<button data-q="${f.q[lang]}">${f.q[lang]}</button>`).join("");
    chipsBox.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => handle(b.dataset.q))
    );
  }

  function applyLang() {
    renderChips();
    root.querySelector(".chatbot-title").textContent = t("小蝸 AI 小幫手", "Snaily · AI Assistant");
    input.placeholder = t("想問點什麼呢？", "Ask me anything…");
    micBtn.title = t("語音輸入", "Voice input");
    ttsBtn.title = t("朗讀回覆", "Read replies aloud");
    toggle.setAttribute("aria-label", t("開啟 AI 小幫手", "Open AI assistant"));
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
        botSay(
          t(
            "嗨，我是小蝸 🐌 聽見蝸牛的 AI 小幫手。<br>放慢腳步，有什麼想知道的呢？下面的常見問題可以直接點，也可以按 🎤 用說的喔！",
            "Hi, I'm Snaily 🐌 the Snail B&B AI assistant.<br>Slow down — what would you like to know? Tap a question below, or press 🎤 to speak!"
          )
        );
      }
    }
  }

  toggle.addEventListener("click", () => openPanel(panel.hidden));
  root.querySelector(".chatbot-close").addEventListener("click", () => openPanel(false));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    handle(q);
  });
})();
