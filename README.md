# 🐌 聽見蝸牛 Snail B&B — Demo Site

Sales-demo website for 聽見蝸牛 Snail B&B, a whole-house-rental (包棟) family guesthouse in Shoufeng, Hualien, Taiwan. Built from the client's Website Requirements Specification: single page, Traditional Chinese, with a built-in AI assistant chat widget preset with the 5 LINE FAQs.

## Sections (per spec)

| Section | Contents |
|---|---|
| Hero | Starry-night countryside scene, headline 「放慢腳步，來去旅行吧」, LINE booking CTA + rooms anchor |
| 關於我們 (About) | Snail slow-living philosophy, host as certified horticultural therapist |
| 民宿特色 (Features) | 4 cards: fireflies & starry skies, family-friendly themed spaces, whole-house BBQ & entertainment, center of Hualien attractions — plus facilities strip |
| 房型介紹 (Rooms) | 6 IP-safe themed rooms with capacity, tags, placeholder per-room prices; whole-house NT$20,000/night note |
| 住客分享 (Testimonials) | 4 sample reviews (family/friends/couple/attractions) with illustrated avatars |
| 最新活動 (Events) | Placeholder BBQ-plans section — target of FAQ #3 |
| 聯絡我們 (Contact) | LINE @tlk8657q, phone, address, embedded Google Map, check-in 15:00 / check-out 11:00 |

## AI Assistant (小蝸)

Floating widget bottom-right (`js/assistant.js`), opens with a brand-tone greeting.

- **Gemini-powered**: messages go to `/api/chat` (`api/chat.js`, a Vercel serverless function) which calls the Gemini API with a brand system prompt containing all guesthouse facts and the 5 spec FAQs. Conversation history is passed for context.
- **Automatic fallback**: if the API is unreachable or `GEMINI_API_KEY` isn't set, the widget silently falls back to the built-in keyword-matched 5 FAQ answers, so the demo always works (including opening `index.html` locally).
- **Voice chat**: 🎤 mic button for speech input (Web Speech Recognition, zh-TW/en-US follows the site language) and a 🔊 toggle in the chat header to read replies aloud (Speech Synthesis). Buttons hide themselves on unsupported browsers.
- **Bilingual**: greeting, quick-question chips and fallback answers switch with the site language.

## Language toggle

An `EN / 中文` button in the top-right of the navbar switches the whole site between Traditional Chinese (default) and English — static copy via `data-i18n` attributes (`js/i18n.js`), dynamic content (rooms, reviews, chatbot) re-renders on the `langchange` event. Choice persists in `localStorage`.

## Deploying to Vercel

1. Import the GitHub repo at vercel.com/new (Framework Preset: **Other**; no build command or output directory needed).
2. In **Settings → Environment Variables**, add `GEMINI_API_KEY` with your Google AI Studio key (optional: `GEMINI_MODEL`, defaults to `gemini-2.5-flash`).
3. Deploy. Static files are served as-is and `api/chat.js` becomes the `/api/chat` function automatically.

Local development with the function: `npx vercel dev` (plain `python3 -m http.server` also works — the chatbot then uses the FAQ fallback).

## Images

Professional real-estate theme with photographic imagery. All photos are Unsplash placeholder stock loaded from `images.unsplash.com` (marked `待換 AI 生成圖` in the HTML) — swap the URLs for AI-generated brand photos before the client preview. Every image has an `onerror` fallback (neutral block) so a broken URL never shows a broken-image icon; the hero and events-band backgrounds have solid fallback colors underneath.

## Tech & running

Plain HTML/CSS/vanilla JS, no build step. Open `index.html`, or:

```bash
python3 -m http.server 8000
```

## Open items (from spec Section 7)

- Bilingual vs Traditional Chinese only → built zh-TW only; bilingual can be added on confirmation.
- BBQ events page (FAQ #3 target) → placeholder `#events` section, per spec.
- AI image style lock → pending; SVG placeholders in the meantime.
