// Snail BnB — "Shelly" the concierge chatbot.
// Fully client-side: a keyword-matching engine over the listing catalog, no backend.

(function () {
  const { LISTINGS } = window.SNAIL_DATA;

  const cheapest = [...LISTINGS].sort((a, b) => a.price - b.price)[0];
  const priciest = [...LISTINGS].sort((a, b) => b.price - a.price)[0];
  const topRated = [...LISTINGS].sort((a, b) => b.rating - a.rating)[0];

  const listingLink = (l) => `<a href="listing.html?id=${l.id}">${l.name}</a> (${l.price} leaves/night, ★ ${l.rating.toFixed(2)})`;

  const CATEGORY_WORDS = {
    garden: ["garden", "lettuce", "vegetable", "veggie"],
    forest: ["forest", "wood", "log", "moss", "fern", "mushroom"],
    urban: ["urban", "city", "patio", "pot", "terrace", "greenhouse"],
    waterfront: ["water", "pond", "beach", "lake", "shore"]
  };

  // Ordered rules: first match wins. Each rule is [test(regex or fn), reply(fn -> html)].
  const RULES = [
    [/\b(hi|hello|hey|howdy|good (morning|afternoon|evening))\b/, () =>
      "Hello there! 🐌 I'm Shelly, the Snail BnB concierge. Ask me about our stays, prices, booking, or hosting. I answer at lightning speed — by snail standards."],
    [/\b(thank|thanks|cheers|great|awesome|perfect)\b/, () =>
      "You're most welcome! Anything else, just ask — I'll be right here. Where would I even go?"],
    [/\b(bye|goodbye|see you|later)\b/, () =>
      "Safe trails! 🐌 Remember: if your stay is more than a garden away, you should probably leave now."],
    [/\b(cheap|cheapest|budget|affordable|low(est)? price)\b/, () =>
      `Best value on the platform is ${listingLink(cheapest)} — ${cheapest.reviews} reviews and a legendary fungi buffet.`],
    [/\b(luxur|fancy|expensive|premium|five.?star|grand)\b/, () =>
      `For a splurge, nothing beats ${listingLink(priciest)}. Butler beetle, orchid wing, champagne dew on arrival. Trailed by every snail, afforded by few.`],
    [/\b(best|top|recommend|suggest|favourite|favorite|popular)\b/, () =>
      `Our highest-rated stay is ${listingLink(topRated)}. If you tell me a habitat — garden, forest, patio or waterfront — I can narrow it down.`],
    [/\b(book|reserve|reservation|check.?in|checkout|check.?out|dates?|available|availability)\b/, () =>
      "Booking is easy: open any stay, pick your slide-in and slide-out dates, choose how many snails, and hit <strong>Reserve</strong>. You'll see the full price breakdown before confirming. Tip: book at least two seasons ahead — you still have to get there."],
    [/\b(price|prices|cost|fee|fees|leaves|pay|payment|currency)\b/, () =>
      `Stays run from ${cheapest.price} to ${priciest.price} leaves per night, plus a 3-leaf slime-cleaning fee and a 10% service fee. We accept romaine, hosta, and basil at a premium exchange rate.`],
    [/\b(host|hosting|list my|rent out|earn)\b/, () =>
      'Got a damp corner going spare? Hosts earn up to 40 leaves a season with ShellCover™ protection included. Head to the <a href="host.html">Become a host</a> page and register — our team will crawl over for an inspection.'],
    [/\b(slug|slugs|shell.?less|no shell)\b/, () =>
      "Slugs are absolutely welcome! 🐌❤️ We've been slug-inclusive since day one — every property is shell-optional and our mucus spas cater to all body types."],
    [/\b(cancel|cancellation|refund)\b/, () =>
      "Very flexible: full leaf refunds up to one season before check-in. And honestly, if you cancel mid-journey and turn around, you'll be home before the host notices."],
    [/\b(rain|weather|wet|humid)\b/, () =>
      "Rain is our five-star weather tier — if it rains during your stay, that's a complimentary upgrade at no extra leaves. Every property is inspected for dampness before listing."],
    [/\b(contact|human|help|support|email)\b/, () =>
      'You can reach the (equally slow) humans at <a href="mailto:hello@snailbnb.example">hello@snailbnb.example</a>, or via the <a href="about.html#contact">contact section</a>. Allow 6–8 weeks for snail mail.'],
    [/\b(how many|sleeps|group|friends|family|big)\b/, () => {
      const biggest = [...LISTINGS].sort((a, b) => b.sleeps - a.sleeps)[0];
      return `Travelling as a cluster? ${listingLink(biggest)} sleeps ${biggest.sleeps} snails — our largest stay, with a communal slime lounge and group crawl discounts.`;
    }]
  ];

  function categoryReply(text) {
    for (const [cat, words] of Object.entries(CATEGORY_WORDS)) {
      if (words.some((w) => text.includes(w))) {
        const matches = LISTINGS.filter((l) => l.category === cat);
        if (matches.length) {
          return `Lovely choice! In that habitat we have: ${matches.map(listingLink).join(", ")}. ` +
            `Or <a href="listings.html?category=${cat}">browse them all</a>.`;
        }
      }
    }
    return null;
  }

  function nameReply(text) {
    const match = LISTINGS.find((l) => text.includes(l.name.toLowerCase().replace("the ", "")));
    if (!match) return null;
    return `${listingLink(match)} — ${match.location}, sleeps ${match.sleeps}. ${match.description} ` +
      `Hosted by ${match.host.name} (${match.host.blurb}).`;
  }

  function reply(raw) {
    const text = raw.toLowerCase();
    return (
      nameReply(text) ||
      RULES.find(([re]) => re.test(text))?.[1]() ||
      categoryReply(text) ||
      "Hmm, that one's outside my shell. 🐌 Try asking about <em>stays</em>, <em>prices</em>, <em>booking</em>, <em>hosting</em>, or a habitat like <em>garden</em> or <em>forest</em> — or use the buttons below."
    );
  }

  // ---------- Widget UI ----------

  const root = document.createElement("div");
  root.className = "chatbot";
  root.innerHTML = `
    <button class="chatbot-toggle" aria-label="Chat with Shelly" aria-expanded="false">
      <span class="chatbot-toggle-icon" aria-hidden="true">💬</span>
    </button>
    <div class="chatbot-panel" hidden>
      <div class="chatbot-head">
        <div class="chatbot-avatar" aria-hidden="true">🐌</div>
        <div>
          <strong>Shelly</strong>
          <span>Concierge · replies in seconds, unusually</span>
        </div>
        <button class="chatbot-close" aria-label="Close chat">✕</button>
      </div>
      <div class="chatbot-messages" role="log" aria-live="polite"></div>
      <div class="chatbot-chips">
        <button data-q="Recommend a stay">Recommend a stay</button>
        <button data-q="What's the cheapest stay?">Cheapest stay</button>
        <button data-q="How do I book?">How do I book?</button>
        <button data-q="Are slugs welcome?">Slugs welcome?</button>
      </div>
      <form class="chatbot-input">
        <input type="text" placeholder="Ask Shelly anything…" aria-label="Message Shelly" autocomplete="off">
        <button type="submit" class="btn btn-primary" aria-label="Send">➤</button>
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
    setTimeout(() => { typing.innerHTML = html; messages.scrollTop = messages.scrollHeight; }, 500);
  }

  let greeted = false;
  function openPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open);
    toggle.classList.toggle("open", open);
    if (open) {
      input.focus();
      if (!greeted) {
        greeted = true;
        botSay("Hi! I'm <strong>Shelly</strong> 🐌 — your Snail BnB concierge. Ask me about stays, prices, booking or hosting, or tap a suggestion below.");
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
