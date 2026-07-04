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

Floating widget bottom-right (`js/assistant.js`), opens with a brand-tone greeting. Preset with the spec's 5 Q&A pairs (包棟價位 / 寵物 / 烤肉方案 / 房間數 / 入住退房時間) via keyword matching + quick-question chips; falls back to the LINE contact.

## Images

The spec calls for AI-generated photography. This environment cannot generate raster images, so every image slot currently holds a hand-built illustrated SVG scene matching the spec's image direction (each is marked with a `待替換：AI 生成圖` comment). Swap them for generated photos before the client preview if photorealism is required.

## Tech & running

Plain HTML/CSS/vanilla JS, no build step. Open `index.html`, or:

```bash
python3 -m http.server 8000
```

## Open items (from spec Section 7)

- Bilingual vs Traditional Chinese only → built zh-TW only; bilingual can be added on confirmation.
- BBQ events page (FAQ #3 target) → placeholder `#events` section, per spec.
- AI image style lock → pending; SVG placeholders in the meantime.
