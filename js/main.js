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

  const t = (zh, en) => (window.I18N ? window.I18N.t(zh, en) : zh);

  // ---------- 房型資料（中英雙語；示意房價；包棟 NT$20,000/晚 見 FAQ） ----------
  const ROOMS = [
    {
      name: { zh: "北歐風閣樓親子房", en: "Nordic Loft Family Room" },
      pax: 4,
      price: "3,800",
      desc: {
        zh: "挑高閣樓設計，樓下是小客廳、樓上是孩子的秘密基地，還有專屬陽台看星星。",
        en: "A lofted layout: a small lounge below, the kids' secret base above, and a private balcony for stargazing."
      },
      tags: [{ zh: "閣樓設計", en: "Loft layout" }, { zh: "小客廳", en: "Lounge" }, { zh: "陽台", en: "Balcony" }],
      img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      alt: { zh: "北歐風閣樓親子房", en: "Nordic loft family room" }
    },
    {
      name: { zh: "童趣漫畫親子房", en: "Playful Comic Family Room" },
      pax: 4,
      price: "3,600",
      desc: {
        zh: "大膽用色與趣味牆面塗鴉，像走進漫畫格子裡，孩子一進門就捨不得出來。",
        en: "Bold colors and playful wall art — like stepping into a comic panel. Kids never want to leave."
      },
      tags: [{ zh: "漫畫風", en: "Comic style" }, { zh: "繽紛牆面", en: "Colorful walls" }, { zh: "親子友善", en: "Family friendly" }],
      img: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1000&q=80",
      alt: { zh: "童趣漫畫親子房", en: "Playful comic family room" }
    },
    {
      name: { zh: "復古卡通雙人房", en: "Retro Cartoon Double" },
      pax: 2,
      price: "2,800",
      desc: {
        zh: "懷舊玩具與復古配色，喚起心裡那個小孩，可愛又不失溫度的雙人空間。",
        en: "Nostalgic toys and retro colors that wake up your inner child — cute, warm and cozy for two."
      },
      tags: [{ zh: "復古風", en: "Retro" }, { zh: "可愛佈置", en: "Cute decor" }, { zh: "雙人", en: "Double" }],
      img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
      alt: { zh: "復古卡通雙人房", en: "Retro cartoon double room" }
    },
    {
      name: { zh: "熊熊主題雙人房", en: "Bear-Themed Cozy Double" },
      pax: 2,
      price: "2,800",
      desc: {
        zh: "溫柔大地色系與絨毛熊熊相伴，柔軟得讓人捨不得起床的療癒房型。",
        en: "Gentle earth tones with plush bear companions — so soft you won't want to get up."
      },
      tags: [{ zh: "熊熊主題", en: "Bear theme" }, { zh: "溫暖色調", en: "Warm tones" }, { zh: "雙人", en: "Double" }],
      img: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80",
      alt: { zh: "熊熊主題雙人房", en: "Bear-themed cozy double room" }
    },
    {
      name: { zh: "3D 街頭彩繪雙人房", en: "3D Street-Art Double" },
      pax: 2,
      price: "3,000",
      desc: {
        zh: "整面歐洲街景立體彩繪牆，隨手一拍都是大片，是攝影控的最愛。",
        en: "A full 3D European street mural wall — every photo looks like a magazine spread."
      },
      tags: [{ zh: "3D 彩繪", en: "3D mural" }, { zh: "拍照打卡", en: "Photogenic" }, { zh: "雙人", en: "Double" }],
      img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
      alt: { zh: "3D 街頭彩繪雙人房", en: "3D street-art double room" }
    },
    {
      name: { zh: "花園景觀雙人房", en: "Garden View Double" },
      pax: 2,
      price: "3,200",
      desc: {
        zh: "窗外就是療癒花園，滿室綠意與自然光，最適合想安靜充電的旅人。",
        en: "The therapy garden right outside your window — greenery and natural light for travellers who need quiet recharging."
      },
      tags: [{ zh: "花園景觀", en: "Garden view" }, { zh: "自然採光", en: "Natural light" }, { zh: "雙人", en: "Double" }],
      img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
      alt: { zh: "花園景觀雙人房", en: "Garden view double room" }
    }
  ];

  const roomGrid = $("#room-grid");
  function renderRooms() {
    if (!roomGrid) return;
    roomGrid.innerHTML = ROOMS.map(
      (r) => `
      <article class="room-card">
        <div class="room-media photo">
          <span class="room-cap">${t(`${r.pax} 人房`, `Sleeps ${r.pax}`)}</span>
          <img src="${r.img}" alt="${t(r.alt.zh, r.alt.en)}" loading="lazy" onerror="this.style.display='none'">
        </div>
        <div class="room-body">
          <h3>${t(r.name.zh, r.name.en)}</h3>
          <p class="room-desc">${t(r.desc.zh, r.desc.en)}</p>
          <div class="room-tags">${r.tags.map((tag) => `<span class="tag">${t(tag.zh, tag.en)}</span>`).join("")}</div>
          <p class="room-price">${t("單房參考價", "Room reference rate")} <strong>NT$${r.price}</strong> ${t("/ 晚起", "/ night+")}</p>
        </div>
      </article>`
    ).join("");
  }

  // ---------- 住客分享（中英雙語示意文案，插畫頭像、無真實人臉） ----------
  const REVIEWS = [
    {
      name: { zh: "雅婷", en: "Ya-Ting" },
      type: { zh: "帶兩個孩子的四口之家", en: "Family of four with two kids" },
      text: {
        zh: "孩子第一次看到螢火蟲，興奮得一直捨不得睡。白天玩戲水池、晚上看星星，退房時女兒問我們下次什麼時候再來。",
        en: "Our kids saw fireflies for the first time and were too excited to sleep. Splash pool by day, stars by night — at checkout our daughter asked when we could come back."
      }
    },
    {
      name: { zh: "阿凱", en: "Kai" },
      type: { zh: "十人包棟朋友出遊", en: "Whole-house trip with ten friends" },
      text: {
        zh: "包棟真的太爽！晚上烤肉配啤酒，接著麻將、Switch 輪番上陣，完全不用顧慮吵到別人。管家超級親切，烤肉用具都幫我們準備好。",
        en: "Renting the whole house is the best! BBQ and beers at night, then mahjong and Switch till late — no worrying about disturbing anyone. The host even prepped all the grill gear for us."
      }
    },
    {
      name: { zh: "小柔", en: "Rou" },
      type: { zh: "夫妻兩人的療癒小旅行", en: "A couple's healing getaway" },
      text: {
        zh: "主人帶我們認識花園裡的香草，聊園藝治療聊了一個晚上。這裡安靜得能聽見風聲，住完真的有充飽電的感覺。",
        en: "The host walked us through the herbs in the garden and we talked horticultural therapy all evening. It's so quiet you can hear the wind — we left fully recharged."
      }
    },
    {
      name: { zh: "志明", en: "Chih-Ming" },
      type: { zh: "三代同堂家庭旅遊", en: "Three-generation family trip" },
      text: {
        zh: "地點超方便，去海洋公園、鯉魚潭都很近，晚上還能殺去東大門夜市。長輩住得舒服，孩子玩得開心，全家都滿意。",
        en: "The location is so convenient — Ocean Park and Liyu Lake are close, and we hit Dongdamen Night Market in the evening. Comfortable for the grandparents, fun for the kids."
      }
    }
  ];



  const testimonialGrid = $("#testimonial-grid");
  function renderReviews() {
    if (!testimonialGrid) return;
    testimonialGrid.innerHTML = REVIEWS.map(
      (r) => `
      <article class="testimonial">
        <div class="stars" aria-label="${t("五顆星評價", "Five-star review")}">★★★★★</div>
        <blockquote>${t(`「${r.text.zh}」`, `“${r.text.en}”`)}</blockquote>
        <div class="testimonial-author">
          <div class="avatar-initial" aria-hidden="true">${t(r.name.zh, r.name.en).charAt(0)}</div>
          <div><strong>${t(r.name.zh, r.name.en)}</strong><span>${t(r.type.zh, r.type.en)}</span></div>
        </div>
      </article>`
    ).join("");
  }

  function renderAll() {
    renderRooms();
    renderReviews();
  }

  document.addEventListener("langchange", renderAll);
  renderAll();

  // ---------- 頁尾年份 ----------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
