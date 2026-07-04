// 聽見蝸牛 Snail B&B — 中／英 雙語切換
// 中文為 HTML 內建原文；英文由下方字典提供。切換時同步更新動態內容（房型、評論、聊天小幫手）。

window.I18N = (function () {
  const EN = {
    "meta.title": "Snail B&B | Whole-House Guesthouse in Shoufeng, Hualien",
    "meta.desc": "Snail B&B — a whole-house family guesthouse in Shoufeng, Hualien, Taiwan. Slow down like a snail: fireflies, starry skies and garden therapy at your healing second home.",

    "nav.about": "About",
    "nav.features": "Features",
    "nav.rooms": "Rooms",
    "nav.reviews": "Reviews",
    "nav.contact": "Contact",
    "nav.line": "Book via LINE",

    "hero.eyebrow": "SNAIL B&amp;B · HUALIEN",
    "hero.title": "Slow down, let's go travelling",
    "hero.sub": "A whole-house guesthouse in Shoufeng, Hualien — your healing second home",
    "hero.cta1": "💬 Ask about booking on LINE",
    "hero.cta2": "See our rooms",
    "hero.note": "Licensed guesthouse · Whole-house rental · Family friendly · LINE ID: @tlk8657q",

    "about.eyebrow": "ABOUT US",
    "about.title": "See the world slowly, like a snail",
    "about.p1": "Snail B&B sits among the fields of Shoufeng, Hualien — a <strong>fully licensed, whole-house-rental family guesthouse</strong>. The snail is our spirit animal: it moves slowly, yet takes in every bit of scenery along the way. We hope every traveller who comes here slows down too, looks closely at the world, and takes home memories worth keeping.",
    "about.p2": "Our host came back to his hometown to run this guesthouse, and he is also a <strong>certified horticultural therapist</strong>. He believes nature heals: spend the day touching soil and smelling herbs in the therapy garden; at night, seasonal fireflies glow along the fields under a sky full of stars.",
    "about.p3": "This isn't a hotel — it's \"a home that belongs to you and me.\" May you find your own pace again in this second home.",

    "feat.eyebrow": "FEATURES",
    "feat.title": "Four reasons to slow down",
    "feat.1.title": "Nature & ecology — fireflies and starry skies",
    "feat.1.desc": "Seasonal fireflies dance along the fields, and the night sky is full of stars.",
    "feat.2.title": "Family-friendly themed spaces",
    "feat.2.desc": "Playful themed rooms, a kids' splash pool and shelves of board games — fun for all ages.",
    "feat.3.title": "Whole-house BBQ & entertainment",
    "feat.3.desc": "American-style BBQ grill, mahjong table, projector and Switch/PS4 — the whole place is yours.",
    "feat.4.title": "The center of Hualien's attractions",
    "feat.4.desc": "15 min to Dongdamen Night Market, 5 min to NDHU food street; Liyu Lake and Ocean Park nearby.",

    "amen.bath": "🛁 Private bathroom in every room",
    "amen.mahjong": "🀄 Mahjong table",
    "amen.bbq": "🍖 American BBQ grill",
    "amen.pool": "💦 Kids' splash pool",
    "amen.games": "🎲 Board games",
    "amen.projector": "📽️ Projector",
    "amen.console": "🎮 PS4 / Switch",
    "amen.stream": "🎬 Netflix / Disney+",
    "amen.tickets": "🎫 Ocean Park tickets · paragliding · rafting",

    "rooms.eyebrow": "ROOMS",
    "rooms.title": "Six rooms, each with its own story",
    "rooms.lede": "6 rooms in total, recommended for up to 12 adults; every room has a private bathroom and its own theme.",
    "rooms.note": "🏡 <strong>Whole house NT$20,000 / night</strong>: the entire guesthouse is yours — all 6 rooms plus every shared space. Per-room prices are indicative; please ask on LINE for actual rates and availability.",

    "rev.eyebrow": "GUEST REVIEWS",
    "rev.title": "Words our travellers left behind",

    "events.eyebrow": "WHAT'S ON",
    "events.title": "BBQ plans & seasonal events",
    "events.desc": "American BBQ packages, firefly-season tours and horticultural-therapy experiences will be announced here. For details in the meantime, just message our host on LINE.",
    "events.cta": "💬 Ask about events on LINE",

    "contact.eyebrow": "CONTACT",
    "contact.title": "Take your time on the way here",
    "contact.line.t": "LINE booking (main channel)",
    "contact.line.d": "<a href=\"https://line.me/R/ti/p/@tlk8657q\" target=\"_blank\" rel=\"noopener\">@tlk8657q</a> | add us to ask about availability and whole-house rental",
    "contact.phone.t": "Phone",
    "contact.addr.t": "Address",
    "contact.addr.d": "No. 16, Aly. 165, Ln. 1411, Sec. 3, Fengping Rd., Shoufeng Township, Hualien County, Taiwan",
    "contact.time.t": "Check-in / Check-out",
    "contact.time.d": "Check-in after 15:00 | Check-out by 11:00",

    "footer.tag": "Slow down, let's go travelling. A home that belongs to you and me.",
    "footer.info": "LINE @tlk8657q | 0989-226-348 | No. 16, Aly. 165, Ln. 1411, Sec. 3, Fengping Rd., Shoufeng, Hualien",
    "footer.meta": "Snail B&B — demo website; images are AI-generated illustrations."
  };

  const ZH_META = {
    title: document.title,
    desc: (document.querySelector('meta[name="description"]') || {}).content || ""
  };

  let lang = localStorage.getItem("snail-lang") === "en" ? "en" : "zh";
  const zhCache = new Map();

  function apply() {
    document.documentElement.lang = lang === "en" ? "en" : "zh-Hant-TW";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (!zhCache.has(key)) zhCache.set(key, el.innerHTML);
      if (lang === "en" && EN[key] !== undefined) el.innerHTML = EN[key];
      else if (lang === "zh") el.innerHTML = zhCache.get(key);
    });

    document.title = lang === "en" ? EN["meta.title"] : ZH_META.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = lang === "en" ? EN["meta.desc"] : ZH_META.desc;

    const toggle = document.getElementById("lang-toggle");
    if (toggle) {
      toggle.textContent = lang === "zh" ? "EN" : "中文";
      toggle.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切換為中文");
      toggle.title = toggle.getAttribute("aria-label");
    }

    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  function setLang(next) {
    lang = next === "en" ? "en" : "zh";
    localStorage.setItem("snail-lang", lang);
    apply();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("lang-toggle");
    if (toggle) toggle.addEventListener("click", () => setLang(lang === "zh" ? "en" : "zh"));
    apply();
  });

  return {
    get lang() { return lang; },
    setLang,
    t: (zh, en) => (lang === "en" ? en : zh)
  };
})();
