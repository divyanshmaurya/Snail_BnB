// Snail BnB — shared rendering + page logic (vanilla JS, no build step)

(function () {
  const { LISTINGS, TESTIMONIALS } = window.SNAIL_DATA;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const CLEANING_FEE = 3;
  const SERVICE_FEE_RATE = 0.1;

  // ---------- Shared: mobile nav ----------
  const navToggle = $(".nav-toggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      $(".nav-links").classList.toggle("open");
      navToggle.setAttribute("aria-expanded", $(".nav-links").classList.contains("open"));
    });
  }

  // ---------- Shared: listing card ----------
  function listingCard(l) {
    return `
      <a class="listing-card" href="listing.html?id=${l.id}">
        <div class="card-media" style="background:${l.gradient}">
          <span aria-hidden="true">${l.emoji}</span>
          ${l.badge ? `<span class="badge">${l.badge}</span>` : ""}
        </div>
        <div class="card-body">
          <div class="card-top">
            <h3>${l.name}</h3>
            <span class="rating"><span class="star">★</span> ${l.rating.toFixed(2)}</span>
          </div>
          <p class="card-loc">${l.location} · Sleeps ${l.sleeps} snails</p>
          <div class="card-tags">${l.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
          <p class="card-price"><strong>${l.price} leaves</strong> / night <span>· ${l.reviews} reviews</span></p>
        </div>
      </a>`;
  }

  // ---------- Home page ----------
  const featuredGrid = $("#featured-grid");
  if (featuredGrid) {
    const featured = [...LISTINGS].sort((a, b) => b.rating - a.rating).slice(0, 4);
    featuredGrid.innerHTML = featured.map(listingCard).join("");
  }

  const testimonialGrid = $("#testimonial-grid");
  if (testimonialGrid) {
    testimonialGrid.innerHTML = TESTIMONIALS.map(
      (t) => `
      <article class="testimonial">
        <blockquote>“${t.quote}”</blockquote>
        <div class="testimonial-author">
          <div class="avatar" aria-hidden="true">${t.emoji}</div>
          <div><strong>${t.name}</strong><span>${t.detail}</span></div>
        </div>
      </article>`
    ).join("");
  }

  const heroSearch = $("#hero-search");
  if (heroSearch) {
    heroSearch.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = encodeURIComponent($("#hero-q").value.trim());
      const cat = encodeURIComponent($("#hero-cat").value);
      window.location.href = `listings.html?q=${q}&category=${cat}`;
    });
  }

  // ---------- Listings page ----------
  const listingsGrid = $("#listings-grid");
  if (listingsGrid) {
    const params = new URLSearchParams(window.location.search);
    const state = {
      q: params.get("q") || "",
      category: params.get("category") || "all"
    };

    const searchInput = $("#listings-search");
    if (searchInput) searchInput.value = state.q;

    function render() {
      const q = state.q.toLowerCase();
      const results = LISTINGS.filter((l) => {
        const matchesCat = state.category === "all" || l.category === state.category;
        const haystack = `${l.name} ${l.location} ${l.tags.join(" ")}`.toLowerCase();
        return matchesCat && (!q || haystack.includes(q));
      });

      $("#results-count").textContent = results.length
        ? `${results.length} stay${results.length === 1 ? "" : "s"} · all within a season's crawl`
        : "";

      listingsGrid.innerHTML = results.length
        ? results.map(listingCard).join("")
        : `<div class="empty-state" style="grid-column: 1 / -1;">
             <div class="big">🐌💨</div>
             <h3>No stays match that search</h3>
             <p>Try a different word, or clear the filters — good things come to snails who wait.</p>
           </div>`;
    }

    $$(".filter-chip").forEach((chip) => {
      if (chip.dataset.category === state.category) {
        $$(".filter-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
      }
      chip.addEventListener("click", () => {
        $$(".filter-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        state.category = chip.dataset.category;
        render();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.q = searchInput.value;
        render();
      });
    }

    render();
  }

  // ---------- Listing detail page ----------
  const detailRoot = $("#listing-detail");
  if (detailRoot) {
    const id = new URLSearchParams(window.location.search).get("id");
    const l = LISTINGS.find((x) => x.id === id) || LISTINGS[0];

    document.title = `${l.name} · Snail BnB`;

    detailRoot.innerHTML = `
      <div class="detail-hero" style="background:${l.gradient}"><span aria-hidden="true">${l.emoji}</span></div>
      <div class="detail-grid">
        <div class="detail-main">
          <div>
            <span class="eyebrow">${l.badge || "Featured stay"}</span>
            <h1>${l.name}</h1>
            <div class="detail-meta" style="margin-top:0.75rem">
              <span><span class="star" style="color:var(--gold)">★</span> <strong>${l.rating.toFixed(2)}</strong> (${l.reviews} reviews)</span>
              <span>📍 ${l.location}</span>
              <span>🐌 Sleeps ${l.sleeps} snails</span>
            </div>
          </div>
          <p class="lede">${l.description}</p>
          <div>
            <h2 style="font-size:1.4rem; margin-bottom:1rem">What this shell-ter offers</h2>
            <ul class="amenities">${l.amenities.map((a) => `<li>✨ ${a}</li>`).join("")}</ul>
          </div>
          <div class="host-card">
            <div class="avatar" aria-hidden="true">${l.host.emoji}</div>
            <div>
              <strong>Hosted by ${l.host.name}</strong>
              <p style="color:var(--ink-soft); font-size:0.9rem">${l.host.blurb} · Hosting since ${l.host.since}</p>
            </div>
          </div>
        </div>
        <aside class="booking-widget">
          <p class="price-line"><strong>${l.price} leaves</strong> / night</p>
          <form id="booking-form" novalidate>
            <div class="form-row">
              <div class="field">
                <label for="check-in">Slide in</label>
                <input type="date" id="check-in" required>
              </div>
              <div class="field">
                <label for="check-out">Slide out</label>
                <input type="date" id="check-out" required>
              </div>
            </div>
            <div class="field">
              <label for="guests">Snails</label>
              <select id="guests">
                ${Array.from({ length: l.sleeps }, (_, i) => `<option value="${i + 1}">${i + 1} snail${i ? "s" : ""}</option>`).join("")}
              </select>
            </div>
            <div class="price-breakdown" id="price-breakdown" hidden>
              <div class="row"><span id="nights-label"></span><span id="nights-cost"></span></div>
              <div class="row"><span>Slime-cleaning fee</span><span>${CLEANING_FEE} leaves</span></div>
              <div class="row"><span>Service fee</span><span id="service-fee"></span></div>
              <div class="row total"><span>Total</span><span id="total-cost"></span></div>
            </div>
            <button type="submit" class="btn btn-accent btn-block">Reserve</button>
            <p class="form-note">You won't be charged yet. Or ever — leaves are free.</p>
          </form>
          <div id="booking-success" class="form-success" hidden></div>
        </aside>
      </div>`;

    const checkIn = $("#check-in");
    const checkOut = $("#check-out");
    const today = new Date().toISOString().split("T")[0];
    checkIn.min = today;
    checkOut.min = today;

    function nightsBetween() {
      if (!checkIn.value || !checkOut.value) return 0;
      const ms = new Date(checkOut.value) - new Date(checkIn.value);
      return Math.max(0, Math.round(ms / 86400000));
    }

    function updateBreakdown() {
      const nights = nightsBetween();
      const box = $("#price-breakdown");
      if (!nights) { box.hidden = true; return; }
      const base = nights * l.price;
      const service = Math.round(base * SERVICE_FEE_RATE * 10) / 10;
      $("#nights-label").textContent = `${l.price} leaves × ${nights} night${nights === 1 ? "" : "s"}`;
      $("#nights-cost").textContent = `${base} leaves`;
      $("#service-fee").textContent = `${service} leaves`;
      $("#total-cost").textContent = `${Math.round((base + CLEANING_FEE + service) * 10) / 10} leaves`;
      box.hidden = false;
    }

    checkIn.addEventListener("change", () => {
      if (checkIn.value) checkOut.min = checkIn.value;
      updateBreakdown();
    });
    checkOut.addEventListener("change", updateBreakdown);

    $("#booking-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const nights = nightsBetween();
      if (!nights) {
        alert("Please pick a slide-in date and a later slide-out date.");
        return;
      }
      const guests = $("#guests").value;
      const success = $("#booking-success");
      success.textContent = `🎉 Reserved! ${guests} snail${guests > 1 ? "s" : ""}, ${nights} night${nights > 1 ? "s" : ""} at ${l.name}. Confirmation is on its way by snail mail (allow 6–8 weeks).`;
      success.hidden = false;
      e.target.hidden = true;
    });

    // "More stays" strip
    const moreGrid = $("#more-grid");
    if (moreGrid) {
      moreGrid.innerHTML = LISTINGS.filter((x) => x.id !== l.id).slice(0, 4).map(listingCard).join("");
    }
  }

  // ---------- Host page form ----------
  const hostForm = $("#host-form");
  if (hostForm) {
    hostForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#host-name").value.trim() || "friend";
      hostForm.hidden = true;
      const success = $("#host-success");
      success.textContent = `🌿 Thanks, ${name}! Our host team will crawl over to inspect your property within 3–5 business seasons.`;
      success.hidden = false;
    });
  }

  // ---------- Footer year ----------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
