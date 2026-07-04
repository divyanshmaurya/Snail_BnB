# 🐌 Snail BnB

A demo website for the world's slowest booking platform — Airbnb, but for snails.

## Pages

| Page | Description |
|---|---|
| `index.html` | Landing page: hero with search, featured stays, how it works, testimonials, host CTA |
| `listings.html` | All stays with live text search and habitat filter chips (garden / forest / urban / waterfront) |
| `listing.html?id=<id>` | Stay detail: description, amenities, host card, and an interactive booking widget with nightly price breakdown |
| `host.html` | "Become a host" page with perks and a registration form |
| `about.html` | Company story, FAQ accordion, and contact section |

## Tech

- Plain HTML, CSS and vanilla JavaScript — no build step, no dependencies.
- Listing content lives in `js/data.js`; page logic in `js/main.js`; the design system in `css/style.css`.
- Fully responsive (mobile nav, fluid grids) and deployable as-is to GitHub Pages or any static host.

## Running locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```
