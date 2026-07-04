// 聽見蝸牛 Snail B&B — AI 小幫手「小蝸」
// 純前端關鍵字比對，預載規格書指定的 5 組常見問答（原 LINE 常見問題）。

(function () {
  const LINE_LINK = '<a href="https://line.me/R/ti/p/@tlk8657q" target="_blank" rel="noopener">LINE @tlk8657q</a>';

  // 5 組預設問答（依需求規格 Section 4）
  const FAQS = [
    {
      id: "price",
      question: "我想包棟，請問包棟價位？",
      keywords: ["包棟", "價位", "價格", "價錢", "多少錢", "費用", "一晚多少"],
      answer: "包棟一晚 2 萬元台幣。🏡 整棟 6 間房與所有公共空間都是你們的，歡迎加 " + LINE_LINK + " 確認日期與空房喔！"
    },
    {
      id: "pets",
      question: "可以帶寵物嗎？",
      keywords: ["寵物", "帶狗", "帶貓", "毛小孩", "狗狗", "貓咪"],
      answer: "可以帶寵物喔！🐾 但請事先告知寵物的種類、大小與數量，讓我們先把環境準備好。"
    },
    {
      id: "bbq",
      question: "烤肉有什麼方案？",
      keywords: ["烤肉", "bbq", "燒烤", "烤爐", "烤肉方案"],
      answer: '烤肉方案請參考<a href="#events">最新活動頁面</a> 🍖，也可以加 ' + LINE_LINK + " 直接詢問管家最新內容。"
    },
    {
      id: "rooms",
      question: "有幾間房間？",
      keywords: ["幾間", "幾房", "房間數", "房型", "住幾人", "幾個人", "人數", "容納"],
      answer: "總共 6 房，最多建議入住 12 位大人。👨‍👩‍👧‍👦 每間房都有獨立衛浴，房型介紹可以看看「房型」區塊喔！"
    },
    {
      id: "time",
      question: "入住與退房時間？",
      keywords: ["入住", "退房", "check in", "check-in", "checkin", "check out", "check-out", "checkout", "幾點"],
      answer: "入住時間為下午 3 點後，退房時間為早上 11 點。🕒 若需要調整時間，歡迎先透過 LINE 與我們聊聊。"
    }
  ];

  const EXTRAS = [
    {
      keywords: ["你好", "哈囉", "嗨", "hello", "hi", "安安"],
      answer: "哈囉，我是小蝸 🐌 很高興見到你！可以問我包棟價位、寵物、烤肉方案、房間數或入住退房時間喔。"
    },
    {
      keywords: ["訂房", "預訂", "預約", "空房", "聯絡", "line", "電話", "地址", "怎麼去", "位置"],
      answer: "訂房與空房查詢請加 " + LINE_LINK + "（主要聯絡方式），或撥 <a href='tel:0989226348'>0989-226-348</a> 📞。地址：花蓮縣壽豐鄉豐坪路三段 1411 巷 165 弄 16 號。"
    },
    {
      keywords: ["謝謝", "感謝", "thanks", "thank you", "讚"],
      answer: "不客氣～期待在花蓮見到你！記得像蝸牛一樣，慢慢來就好 🐌💚"
    }
  ];

  function reply(raw) {
    const text = raw.toLowerCase();
    const hit =
      FAQS.find((f) => f.keywords.some((k) => text.includes(k))) ||
      EXTRAS.find((f) => f.keywords.some((k) => text.includes(k)));
    if (hit) return hit.answer;
    return "這個問題小蝸還在慢慢學 🐌 你可以問我：包棟價位、寵物、烤肉方案、房間數、入住退房時間，或加 " + LINE_LINK + " 由管家親自回覆喔！";
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
          <strong>小蝸 AI 小幫手</strong>
          <span>聽見蝸牛 Snail B&amp;B</span>
        </div>
        <button class="chatbot-close" aria-label="關閉聊天視窗">✕</button>
      </div>
      <div class="chatbot-messages" role="log" aria-live="polite"></div>
      <div class="chatbot-chips">
        ${FAQS.map((f) => `<button data-q="${f.question}">${f.question}</button>`).join("")}
      </div>
      <form class="chatbot-input">
        <input type="text" placeholder="想問點什麼呢？" aria-label="輸入訊息" autocomplete="off">
        <button type="submit" class="btn btn-primary" aria-label="送出">➤</button>
      </form>
    </div>`;
  document.body.appendChild(root);

  const toggle = root.querySelector(".chatbot-toggle");
  const panel = root.querySelector(".chatbot-panel");
  const messages = root.querySelector(".chatbot-messages");
  const form = root.querySelector(".chatbot-input");
  const input = form.querySelector("input");

  function addMessage(html, who) {
    const el = document.createElement("div");
    el.className = `chatbot-msg ${who}`;
    el.innerHTML = html;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function botSay(html) {
    const typing = addMessage("<span class='chatbot-typing'><i></i><i></i><i></i></span>", "bot");
    setTimeout(() => {
      typing.innerHTML = html;
      messages.scrollTop = messages.scrollHeight;
    }, 550);
  }

  let greeted = false;
  function openPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open);
    if (open) {
      input.focus();
      if (!greeted) {
        greeted = true;
        botSay("嗨，我是小蝸 🐌 聽見蝸牛的 AI 小幫手。<br>放慢腳步，有什麼想知道的呢？下面的常見問題可以直接點喔！");
      }
    }
  }

  toggle.addEventListener("click", () => openPanel(panel.hidden));
  root.querySelector(".chatbot-close").addEventListener("click", () => openPanel(false));

  function handle(question) {
    addMessage(question.replace(/</g, "&lt;"), "user");
    botSay(reply(question));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    handle(q);
  });

  root.querySelectorAll(".chatbot-chips button").forEach((b) =>
    b.addEventListener("click", () => handle(b.dataset.q))
  );
})();
