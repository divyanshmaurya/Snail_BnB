// 聽見蝸牛 Snail B&B — 頁面互動與內容渲染（純前端，無建置步驟）

(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);

  // ---------- 手機版選單 ----------
  const navToggle = $(".nav-toggle");
  if (navToggle) {
    const links = $(".nav-links");
    navToggle.addEventListener("click", () => {
      links.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", links.classList.contains("open"));
    });
    links.addEventListener("click", (e) => {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  // ---------- 房型資料（示意房價；包棟 NT$20,000/晚 見 FAQ） ----------
  const ROOMS = [
    {
      name: "北歐風閣樓親子房",
      pax: 4,
      price: "3,800",
      desc: "挑高閣樓設計，樓下是小客廳、樓上是孩子的秘密基地，還有專屬陽台看星星。",
      tags: ["閣樓設計", "小客廳", "陽台"],
      wall: "#eef1ea", floor: "#c9b28a", bed: "#8fa8b8", accent: "loft"
    },
    {
      name: "童趣漫畫親子房",
      pax: 4,
      price: "3,600",
      desc: "大膽用色與趣味牆面塗鴉，像走進漫畫格子裡，孩子一進門就捨不得出來。",
      tags: ["漫畫風", "繽紛牆面", "親子友善"],
      wall: "#fdf0dc", floor: "#d9a76a", bed: "#e2907e", accent: "comic"
    },
    {
      name: "復古卡通雙人房",
      pax: 2,
      price: "2,800",
      desc: "懷舊玩具與復古配色，喚起心裡那個小孩，可愛又不失溫度的雙人空間。",
      tags: ["復古風", "可愛佈置", "雙人"],
      wall: "#f6e6e0", floor: "#b98d6d", bed: "#c96f5e", accent: "retro"
    },
    {
      name: "熊熊主題雙人房",
      pax: 2,
      price: "2,800",
      desc: "溫柔大地色系與絨毛熊熊相伴，柔軟得讓人捨不得起床的療癒房型。",
      tags: ["熊熊主題", "溫暖色調", "雙人"],
      wall: "#f3ead9", floor: "#c1a684", bed: "#a8845f", accent: "bear"
    },
    {
      name: "3D 街頭彩繪雙人房",
      pax: 2,
      price: "3,000",
      desc: "整面歐洲街景立體彩繪牆，隨手一拍都是大片，是攝影控的最愛。",
      tags: ["3D 彩繪", "拍照打卡", "雙人"],
      wall: "#e8ecef", floor: "#9aa4ab", bed: "#6f8fa8", accent: "mural"
    },
    {
      name: "花園景觀雙人房",
      pax: 2,
      price: "3,200",
      desc: "窗外就是療癒花園，滿室綠意與自然光，最適合想安靜充電的旅人。",
      tags: ["花園景觀", "自然採光", "雙人"],
      wall: "#eaf0e2", floor: "#b9a884", bed: "#7f9a72", accent: "garden"
    }
  ];

  // 各房型的主題點綴（待替換：AI 生成室內照 — 暖光、木質、乾淨溫馨的台灣民宿尺度）
  const ACCENTS = {
    loft: `<rect x="270" y="30" width="8" height="105" fill="#8a6f4d"/><rect x="300" y="30" width="8" height="105" fill="#8a6f4d"/>
           <rect x="264" y="45" width="50" height="7" rx="3" fill="#8a6f4d"/><rect x="264" y="70" width="50" height="7" rx="3" fill="#8a6f4d"/>
           <rect x="264" y="95" width="50" height="7" rx="3" fill="#8a6f4d"/><rect x="240" y="22" width="130" height="10" rx="5" fill="#a58a63"/>`,
    comic: `<circle cx="290" cy="55" r="17" fill="#f0c060"/><rect x="320" y="42" width="34" height="26" rx="6" fill="#8fb6c9"/>
            <path d="M262 78 l12 -18 l12 18 Z" fill="#e2717e"/><circle cx="330" cy="88" r="9" fill="#9dbb8b"/>
            <path d="M258 40 q8 -12 20 -6" stroke="#d97f8f" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    retro: `<rect x="268" y="42" width="42" height="52" rx="6" fill="#e8d5b5"/><circle cx="289" cy="60" r="11" fill="#c96f5e"/>
            <circle cx="284" cy="57" r="2.5" fill="#3d382f"/><circle cx="294" cy="57" r="2.5" fill="#3d382f"/>
            <path d="M284 65 q5 4 10 0" stroke="#3d382f" stroke-width="2" fill="none" stroke-linecap="round"/>
            <rect x="322" y="52" width="30" height="42" rx="4" fill="#b98d6d"/><circle cx="337" cy="66" r="8" fill="#f0c060"/>`,
    bear: `<circle cx="300" cy="70" r="22" fill="#b08d62"/><circle cx="283" cy="52" r="8" fill="#b08d62"/><circle cx="317" cy="52" r="8" fill="#b08d62"/>
           <circle cx="283" cy="52" r="4" fill="#8a6a45"/><circle cx="317" cy="52" r="4" fill="#8a6a45"/>
           <circle cx="293" cy="66" r="3" fill="#3d382f"/><circle cx="307" cy="66" r="3" fill="#3d382f"/>
           <ellipse cx="300" cy="76" rx="7" ry="5" fill="#e8d5b5"/><circle cx="300" cy="74" r="2.5" fill="#3d382f"/>`,
    mural: `<rect x="255" y="32" width="110" height="72" rx="4" fill="#cfd8dd"/>
            <path d="M255 104 l30 -34 l22 20 l24 -30 l34 44 Z" fill="#8fa5b3"/>
            <rect x="285" y="66" width="16" height="38" fill="#6f8090"/><rect x="308" y="76" width="14" height="28" fill="#7d92a2"/>
            <circle cx="345" cy="46" r="9" fill="#f0dca0"/>`,
    garden: `<rect x="262" y="36" width="96" height="66" rx="6" fill="#bcd9c4"/>
             <path d="M262 102 q24 -26 48 -12 q26 -18 48 4 v 8 h -96 Z" fill="#7f9a72"/>
             <circle cx="290" cy="58" r="7" fill="#e2a1b0"/><circle cx="322" cy="50" r="6" fill="#f0c060"/>
             <rect x="334" y="108" width="20" height="16" rx="3" fill="#a4785a"/><path d="M344 108 q-6 -16 4 -24 M344 108 q8 -12 2 -22" stroke="#5f8460" stroke-width="4" fill="none" stroke-linecap="round"/>`
  };

  function roomSVG(r) {
    return `
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="400" height="200" fill="${r.wall}"/>
        <rect y="140" width="400" height="60" fill="${r.floor}"/>
        <rect y="136" width="400" height="6" fill="rgba(0,0,0,0.08)"/>
        <rect x="40" y="34" width="70" height="58" rx="5" fill="#cfe3ea"/>
        <rect x="72" y="34" width="5" height="58" fill="${r.wall}"/><rect x="40" y="60" width="70" height="5" fill="${r.wall}"/>
        <rect x="36" y="30" width="78" height="66" rx="6" fill="none" stroke="#a58a63" stroke-width="5"/>
        <g>
          <rect x="60" y="118" width="180" height="46" rx="8" fill="#f5f0e4"/>
          <rect x="60" y="104" width="180" height="26" rx="10" fill="${r.bed}"/>
          <rect x="72" y="94" width="52" height="22" rx="9" fill="#fff"/>
          <rect x="134" y="94" width="52" height="22" rx="9" fill="#fff"/>
          <rect x="52" y="86" width="12" height="78" rx="5" fill="#8a6f4d"/>
          <rect x="236" y="86" width="12" height="78" rx="5" fill="#8a6f4d"/>
        </g>
        <circle cx="200" cy="34" r="13" fill="#ffd98a"/>
        <path d="M200 12 v10" stroke="#8a6f4d" stroke-width="3"/>
        <circle cx="200" cy="34" r="18" fill="#ffd98a" opacity="0.25"/>
        ${ACCENTS[r.accent] || ""}
      </svg>`;
  }

  const roomGrid = $("#room-grid");
  if (roomGrid) {
    roomGrid.innerHTML = ROOMS.map(
      (r) => `
      <article class="room-card">
        <div class="room-media">
          ${roomSVG(r)}
          <span class="room-cap">${r.pax} 人房</span>
        </div>
        <div class="room-body">
          <h3>${r.name}</h3>
          <p class="room-desc">${r.desc}</p>
          <div class="room-tags">${r.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
          <p class="room-price">單房參考價 <strong>NT$${r.price}</strong> / 晚起</p>
        </div>
      </article>`
    ).join("");
  }

  // ---------- 住客分享（示意文案，插畫頭像、無真實人臉） ----------
  const REVIEWS = [
    {
      name: "雅婷",
      type: "帶兩個孩子的四口之家",
      text: "孩子第一次看到螢火蟲，興奮得一直捨不得睡。白天玩戲水池、晚上看星星，退房時女兒問我們下次什麼時候再來。",
      color: "#e2a1b0", face: "#f6e3d9"
    },
    {
      name: "阿凱",
      type: "十人包棟朋友出遊",
      text: "包棟真的太爽！晚上烤肉配啤酒，接著麻將、Switch 輪番上陣，完全不用顧慮吵到別人。管家超級親切，烤肉用具都幫我們準備好。",
      color: "#8fb6c9", face: "#eaf2f5"
    },
    {
      name: "小柔",
      type: "夫妻兩人的療癒小旅行",
      text: "主人帶我們認識花園裡的香草，聊園藝治療聊了一個晚上。這裡安靜得能聽見風聲，住完真的有充飽電的感覺。",
      color: "#9dbb8b", face: "#eef3e6"
    },
    {
      name: "志明",
      type: "三代同堂家庭旅遊",
      text: "地點超方便，去海洋公園、鯉魚潭都很近，晚上還能殺去東大門夜市。長輩住得舒服，孩子玩得開心，全家都滿意。",
      color: "#e8a94f", face: "#fbeed7"
    }
  ];

  function avatarSVG(r) {
    return `
      <svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="46" height="46" fill="${r.color}"/>
        <circle cx="23" cy="18" r="9" fill="${r.face}"/>
        <path d="M8 46 a15 15 0 0 1 30 0 Z" fill="${r.face}"/>
      </svg>`;
  }

  const testimonialGrid = $("#testimonial-grid");
  if (testimonialGrid) {
    testimonialGrid.innerHTML = REVIEWS.map(
      (r) => `
      <article class="testimonial">
        <div class="stars" aria-label="五顆星評價">★★★★★</div>
        <blockquote>「${r.text}」</blockquote>
        <div class="testimonial-author">
          <div class="avatar">${avatarSVG(r)}</div>
          <div><strong>${r.name}</strong><span>${r.type}</span></div>
        </div>
      </article>`
    ).join("");
  }

  // ---------- 頁尾年份 ----------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
