// Snail BnB — listing data
// In a real app this would come from an API; for the demo it's a static catalog.

const LISTINGS = [
  {
    id: "lettuce-loft",
    name: "The Lettuce Loft",
    location: "Kitchen Garden District",
    price: 12,
    rating: 4.97,
    reviews: 214,
    emoji: "🥬",
    gradient: "linear-gradient(135deg, #d4e9c8, #8fbf7f)",
    badge: "Guest favourite",
    category: "garden",
    sleeps: 4,
    tags: ["Self-serve salad bar", "Morning dew", "Shade canopy"],
    description:
      "Wake up inside a crisp romaine penthouse with panoramic views of the vegetable patch. The Lettuce Loft is our most-loved stay: every wall is edible, the humidity is dialled to a dreamy 85%, and checkout is whenever you finish the guest room.",
    amenities: ["Edible walls", "24/7 dew misting", "Slug-free guarantee", "Compost-heated floors", "Bird-proof netting", "Late (very late) checkout"],
    host: { name: "Gary", emoji: "🐌", since: 2021, blurb: "Superhost · 3 shells refurbished" }
  },
  {
    id: "mossy-hollow",
    name: "Mossy Hollow",
    location: "Old Oak Woodland",
    price: 9,
    rating: 4.89,
    reviews: 167,
    emoji: "🍄",
    gradient: "linear-gradient(135deg, #cfd9b8, #6f8f5a)",
    badge: "Nature retreat",
    category: "forest",
    sleeps: 2,
    tags: ["Mushroom en-suite", "Deep shade", "Silent zone"],
    description:
      "A romantic hideaway tucked under a fallen oak branch, carpeted wall-to-wall in premium sphagnum moss. Perfect for couples celebrating a slow-iversary. The resident toadstool doubles as a breakfast nook and an umbrella.",
    amenities: ["Wall-to-wall moss", "Toadstool breakfast nook", "Rainwater plunge pool", "Leaf-litter blackout blinds", "Owl-watch security", "Couples' slime spa"],
    host: { name: "Sheldon", emoji: "🐌", since: 2019, blurb: "Superhost · woodland local for 6 years" }
  },
  {
    id: "terracotta-terrace",
    name: "Terracotta Terrace",
    location: "Sunny Patio Quarter",
    price: 15,
    rating: 4.72,
    reviews: 98,
    emoji: "🪴",
    gradient: "linear-gradient(135deg, #f3cdb8, #cf7a52)",
    badge: "Design pick",
    category: "urban",
    sleeps: 6,
    tags: ["Upturned-pot villa", "Basil garden", "City views"],
    description:
      "Mediterranean living for the modern gastropod. This upturned terracotta pot has been lovingly converted into a six-snail villa with a drainage-hole skylight, an attached basil garden, and sweeping views over the patio tiles.",
    amenities: ["Drainage-hole skylight", "Private basil garden", "Glazed-tile slipway", "Afternoon shade wing", "Watering-can rain shower", "Pet woodlouse friendly"],
    host: { name: "Turbo", emoji: "🐌", since: 2022, blurb: "Fastest reply time in the quarter (2 days)" }
  },
  {
    id: "damp-log-lodge",
    name: "The Damp Log Lodge",
    location: "Fern Gully",
    price: 7,
    rating: 4.95,
    reviews: 342,
    emoji: "🪵",
    gradient: "linear-gradient(135deg, #d9c9a8, #8a6f4d)",
    badge: "Best value",
    category: "forest",
    sleeps: 8,
    tags: ["Group stays", "Bark bunks", "Fungi buffet"],
    description:
      "Our largest property: a gloriously rotting birch log with eight bark-lined bunks, a communal fungi buffet, and a legendary social scene. If your cluster is planning a reunion crawl, this is the one. Book early — it fills up seasons in advance.",
    amenities: ["8 bark bunks", "All-you-can-eat fungi buffet", "Communal slime lounge", "Beetle concierge", "Moisture guarantee", "Group crawl discounts"],
    host: { name: "Brian", emoji: "🐌", since: 2018, blurb: "Superhost · hosted 1,200+ snails" }
  },
  {
    id: "cucumber-cottage",
    name: "Cucumber Cottage",
    location: "Greenhouse Row",
    price: 14,
    rating: 4.81,
    reviews: 76,
    emoji: "🥒",
    gradient: "linear-gradient(135deg, #d8ecc0, #5f9e57)",
    badge: "New",
    category: "garden",
    sleeps: 3,
    tags: ["Climate controlled", "Snack-adjacent", "Frost-free"],
    description:
      "A boutique hollowed-cucumber stay inside a heated greenhouse. Year-round 92% humidity, zero frost risk, and the structural walls are — yes — a snack. Ideal for winter escapes when the garden outside gets crunchy.",
    amenities: ["Greenhouse climate control", "Edible load-bearing walls", "Tomato-vine canopy walk", "Heated propagation mats", "Zero frost guarantee", "Seed-tray infinity pools"],
    host: { name: "Doris", emoji: "🐌", since: 2023, blurb: "Greenhouse resident & tomato influencer" }
  },
  {
    id: "pebble-beach-villa",
    name: "Pebble Beach Villa",
    location: "Garden Pond Shoreline",
    price: 18,
    rating: 4.66,
    reviews: 54,
    emoji: "🏖️",
    gradient: "linear-gradient(135deg, #cfe6e3, #6fa8a0)",
    badge: "Waterfront",
    category: "waterfront",
    sleeps: 2,
    tags: ["Pond views", "Private pebble", "Sunset side"],
    description:
      "Luxury shoreline living on the garden pond's most exclusive pebble. Watch the water boatmen race at dusk from your private algae deck. Note: this is a terrestrial property — swimming is strictly for the pond snails next door.",
    amenities: ["Private algae sun deck", "Pond-view orientation", "Evening chorus (frogs)", "Smooth-granite flooring", "Heron early-warning system", "Complimentary duckweed platter"],
    host: { name: "Michelle", emoji: "🐌", since: 2020, blurb: "Superhost · shell care specialist" }
  },
  {
    id: "fern-canopy-treehouse",
    name: "Fern Canopy Treehouse",
    location: "Bracken Heights",
    price: 11,
    rating: 4.9,
    reviews: 121,
    emoji: "🌿",
    gradient: "linear-gradient(135deg, #c9e4c5, #4a7c59)",
    badge: "Trending",
    category: "forest",
    sleeps: 4,
    tags: ["Elevated frond", "Spore-season views", "Gentle sway"],
    description:
      "Sixty whole centimetres above the forest floor, this unfurled bracken frond offers dizzying elevation for the adventurous snail. The gentle sway is rated 'soothing' by 94% of guests and 'terrifying' by the other, more honest, 6%.",
    amenities: ["Elevated frond platform", "Anti-slip mucus rails", "Spore-season viewing deck", "Wind-sway dampeners", "Ladder-free stem access", "Vertigo support hotline"],
    host: { name: "Zippy", emoji: "🐌", since: 2021, blurb: "Climbing enthusiast · 0.003 km/h PB" }
  },
  {
    id: "greenhouse-grand",
    name: "The Greenhouse Grand",
    location: "Greenhouse Row",
    price: 24,
    rating: 4.99,
    reviews: 189,
    emoji: "🏛️",
    gradient: "linear-gradient(135deg, #e9e2c8, #b9a05e)",
    badge: "Luxury",
    category: "urban",
    sleeps: 5,
    tags: ["Five-star mucus spa", "Orchid wing", "Butler beetle"],
    description:
      "The grande dame of gastropod hospitality. A palatial residence in a Victorian glasshouse featuring an orchid wing, a five-star mucus spa, and a butler beetle on call around the clock. Trailed by every snail, afforded by few. Worth it.",
    amenities: ["Five-star mucus spa", "Butler beetle service", "Orchid wing access", "Marble-chip driveway", "Turndown leaf service", "Champagne dew on arrival"],
    host: { name: "Lady Escargot", emoji: "🐌", since: 2017, blurb: "Founding host · 5 generations in hospitality" }
  }
];

const TESTIMONIALS = [
  {
    quote: "We left our shell for the first time in years and honestly? Worth it. The Lettuce Loft was crisp, cool, and I ate part of the bedroom. Ten out of ten.",
    name: "Jeremy & Pat",
    detail: "Stayed 3 months at The Lettuce Loft",
    emoji: "🐌"
  },
  {
    quote: "Booking took me four days, which is the fastest I've ever done anything. The trail from the front door to the fungi buffet is simply gorgeous.",
    name: "Brenda",
    detail: "Stayed 1 season at The Damp Log Lodge",
    emoji: "🐌"
  },
  {
    quote: "As a slug, I worried I'd feel underdressed. Never have I been made to feel so welcome. The mucus spa is world class.",
    name: "Nigel",
    detail: "Stayed 2 weeks at The Greenhouse Grand",
    emoji: "🐌"
  }
];

// Expose for the other scripts (plain <script> tags, no modules needed).
window.SNAIL_DATA = { LISTINGS, TESTIMONIALS };
