// ── Indian Retail Product Database ───────────────────────────────────────────
// Each product has:
//   name        → standard display name
//   aliases     → common spoken/misspelled variants
//   category    → for analytics later (Phase 5)
//   defaultPrice→ suggested price (0 = varies)

export const PRODUCT_DB = [
  // ── Snacks ──────────────────────────────────────────────────────────────────
  {
    name: "Lays Classic",
    aliases: ["lays", "lay", "lace", "ladies", "ley", "leis"],
    category: "snacks",
    defaultPrice: 10,
  },
  {
    name: "Lays Magic Masala",
    aliases: ["lays masala", "masala lays", "magic masala", "lays magic"],
    category: "snacks",
    defaultPrice: 20,
  },
  {
    name: "Lays Peri Peri",
    aliases: ["peri peri", "peri", "lays peri"],
    category: "snacks",
    defaultPrice: 20,
  },
  {
    name: "Kurkure",
    aliases: ["kurkure", "kurkuri", "kukure", "turkure", "kurkurey"],
    category: "snacks",
    defaultPrice: 10,
  },
  {
    name: "Parle G",
    aliases: ["parle g", "parleg", "parle", "parlej", "freddy", "parle ji"],
    category: "biscuits",
    defaultPrice: 5,
  },
  {
    name: "Monaco",
    aliases: ["monaco", "monako"],
    category: "biscuits",
    defaultPrice: 10,
  },
  {
    name: "Hide & Seek",
    aliases: ["hide seek", "hide and seek", "hideseek"],
    category: "biscuits",
    defaultPrice: 20,
  },
  {
    name: "Oreo",
    aliases: ["oreo", "orio", "oreos"],
    category: "biscuits",
    defaultPrice: 10,
  },
  {
    name: "Good Day",
    aliases: ["good day", "goodday", "gud day"],
    category: "biscuits",
    defaultPrice: 10,
  },
  {
    name: "Britannia 50-50",
    aliases: ["50 50", "fifty fifty", "britannia 50"],
    category: "biscuits",
    defaultPrice: 10,
  },
  {
    name: "Chips",
    aliases: ["chips", "chipse", "chip"],
    category: "snacks",
    defaultPrice: 10,
  },
  {
    name: "Haldirams Bhujia",
    aliases: ["bhujia", "haldiram", "haldirams", "bhujiya"],
    category: "snacks",
    defaultPrice: 20,
  },
  {
    name: "Too Yumm",
    aliases: ["too yum", "tooyum", "tu yum", "too yummy"],
    category: "snacks",
    defaultPrice: 10,
  },

  // ── Beverages ────────────────────────────────────────────────────────────────
  {
    name: "Pepsi",
    aliases: ["pepsi", "pepcy", "pepse", "pepzi", "pepzi cola"],
    category: "beverages",
    defaultPrice: 20,
  },
  {
    name: "Coca Cola",
    aliases: ["coke", "coca cola", "cola", "cocacola", "cold drink"],
    category: "beverages",
    defaultPrice: 20,
  },
  {
    name: "Sprite",
    aliases: ["sprite", "sprit", "spryte"],
    category: "beverages",
    defaultPrice: 20,
  },
  {
    name: "Thums Up",
    aliases: ["thums up", "thumbs up", "thumps up", "thums"],
    category: "beverages",
    defaultPrice: 20,
  },
  {
    name: "Limca",
    aliases: ["limca", "limka"],
    category: "beverages",
    defaultPrice: 20,
  },
  {
    name: "Fanta",
    aliases: ["fanta", "fenta"],
    category: "beverages",
    defaultPrice: 20,
  },
  {
    name: "Maaza",
    aliases: ["maaza", "maza", "maaza mango"],
    category: "beverages",
    defaultPrice: 20,
  },
  {
    name: "Frooti",
    aliases: ["frooti", "fruity", "fruti", "frooty"],
    category: "beverages",
    defaultPrice: 10,
  },
  {
    name: "Bisleri",
    aliases: ["bisleri", "bis", "bisli", "bislri", "water bottle", "paani"],
    category: "beverages",
    defaultPrice: 20,
  },
  {
    name: "Kinley",
    aliases: ["kinley", "kinly", "kenley"],
    category: "beverages",
    defaultPrice: 20,
  },
  {
    name: "Aquafina",
    aliases: ["aquafina", "aqua", "aquafin"],
    category: "beverages",
    defaultPrice: 20,
  },
  {
    name: "Red Bull",
    aliases: ["red bull", "redbull", "red bul"],
    category: "beverages",
    defaultPrice: 110,
  },
  {
    name: "Sting",
    aliases: ["sting", "sting energy", "sting drink"],
    category: "beverages",
    defaultPrice: 20,
  },
  {
    name: "Tropicana",
    aliases: ["tropicana", "tropikana", "tropi"],
    category: "beverages",
    defaultPrice: 30,
  },
  {
    name: "Real Juice",
    aliases: ["real juice", "real", "real juic"],
    category: "beverages",
    defaultPrice: 30,
  },

  // ── Chocolates & Candy ───────────────────────────────────────────────────────
  {
    name: "Dairy Milk",
    aliases: [
      "dairy milk",
      "dairymilk",
      "dairy",
      "cadbury",
      "shockley",
      "choco",
    ],
    category: "chocolate",
    defaultPrice: 20,
  },
  {
    name: "Dairy Milk Silk",
    aliases: ["silk", "dairy milk silk", "cadbury silk"],
    category: "chocolate",
    defaultPrice: 50,
  },
  {
    name: "5 Star",
    aliases: ["5 star", "five star", "fivestar"],
    category: "chocolate",
    defaultPrice: 10,
  },
  {
    name: "KitKat",
    aliases: ["kitkat", "kit kat", "kitkат"],
    category: "chocolate",
    defaultPrice: 20,
  },
  {
    name: "Munch",
    aliases: ["munch", "manch", "munchy"],
    category: "chocolate",
    defaultPrice: 5,
  },
  {
    name: "Perk",
    aliases: ["perk", "perk chocolate"],
    category: "chocolate",
    defaultPrice: 5,
  },
  {
    name: "Eclairs",
    aliases: ["eclairs", "eclair", "coffee bite", "coffeebite"],
    category: "chocolate",
    defaultPrice: 1,
  },
  {
    name: "Gems",
    aliases: ["gems", "jems"],
    category: "chocolate",
    defaultPrice: 5,
  },
  {
    name: "Melody",
    aliases: ["melody", "melodi"],
    category: "chocolate",
    defaultPrice: 1,
  },

  // ── Instant Food ─────────────────────────────────────────────────────────────
  {
    name: "Maggi",
    aliases: ["maggi", "maggie", "magi", "noodles", "maggy"],
    category: "instant",
    defaultPrice: 14,
  },
  {
    name: "Yippee Noodles",
    aliases: ["yippee", "yippe", "sunfeast noodles"],
    category: "instant",
    defaultPrice: 14,
  },
  {
    name: "Top Ramen",
    aliases: ["top ramen", "ramen", "topramen"],
    category: "instant",
    defaultPrice: 14,
  },
  {
    name: "Knorr Soup",
    aliases: ["knorr", "soup", "knor"],
    category: "instant",
    defaultPrice: 25,
  },

  // ── Personal Care ─────────────────────────────────────────────────────────────
  {
    name: "Colgate",
    aliases: ["colgate", "toothpaste", "paste", "kolgat"],
    category: "personal",
    defaultPrice: 50,
  },
  {
    name: "Pepsodent",
    aliases: ["pepsodent", "pepsodant"],
    category: "personal",
    defaultPrice: 40,
  },
  {
    name: "Closeup",
    aliases: ["closeup", "close up"],
    category: "personal",
    defaultPrice: 50,
  },
  {
    name: "Dove Soap",
    aliases: ["dove", "dove soap", "dov"],
    category: "personal",
    defaultPrice: 45,
  },
  {
    name: "Lux Soap",
    aliases: ["lux", "lux soap"],
    category: "personal",
    defaultPrice: 30,
  },
  {
    name: "Lifebuoy",
    aliases: ["lifebuoy", "lifebouy", "lifeboy"],
    category: "personal",
    defaultPrice: 25,
  },
  {
    name: "Dettol Soap",
    aliases: ["dettol", "dettol soap"],
    category: "personal",
    defaultPrice: 35,
  },
  {
    name: "Clinic Plus",
    aliases: ["clinic plus", "clinic", "clinicplus"],
    category: "personal",
    defaultPrice: 50,
  },
  {
    name: "Head & Shoulders",
    aliases: ["head and shoulders", "head shoulders", "h&s"],
    category: "personal",
    defaultPrice: 150,
  },
  {
    name: "Sunsilk",
    aliases: ["sunsilk", "sun silk"],
    category: "personal",
    defaultPrice: 100,
  },
  {
    name: "Pantene",
    aliases: ["pantene", "panteen"],
    category: "personal",
    defaultPrice: 150,
  },
  {
    name: "Vaseline",
    aliases: ["vaseline", "vasiline", "petroleum jelly"],
    category: "personal",
    defaultPrice: 60,
  },
  {
    name: "Nivea Cream",
    aliases: ["nivea", "niveа cream", "nivea"],
    category: "personal",
    defaultPrice: 80,
  },

  // ── Household ─────────────────────────────────────────────────────────────────
  {
    name: "Surf Excel",
    aliases: ["surf", "surf excel", "surfexcel"],
    category: "household",
    defaultPrice: 50,
  },
  {
    name: "Ariel",
    aliases: ["ariel", "arial"],
    category: "household",
    defaultPrice: 50,
  },
  {
    name: "Tide",
    aliases: ["tide", "tyde"],
    category: "household",
    defaultPrice: 40,
  },
  {
    name: "Vim",
    aliases: ["vim", "vim bar", "dishwash"],
    category: "household",
    defaultPrice: 20,
  },
  {
    name: "Harpic",
    aliases: ["harpic", "harpick", "toilet cleaner"],
    category: "household",
    defaultPrice: 50,
  },
  {
    name: "Lizol",
    aliases: ["lizol", "floor cleaner", "lyzol"],
    category: "household",
    defaultPrice: 50,
  },
  {
    name: "Odonil",
    aliases: ["odonil", "air freshener", "odonil cake"],
    category: "household",
    defaultPrice: 30,
  },

  // ── Dairy ─────────────────────────────────────────────────────────────────────
  {
    name: "Amul Butter",
    aliases: ["amul butter", "butter", "amul"],
    category: "dairy",
    defaultPrice: 55,
  },
  {
    name: "Amul Milk",
    aliases: ["amul milk", "milk", "dudh"],
    category: "dairy",
    defaultPrice: 25,
  },
  {
    name: "Mother Dairy",
    aliases: ["mother dairy", "motherdairy"],
    category: "dairy",
    defaultPrice: 25,
  },
  {
    name: "Amul Cheese",
    aliases: ["amul cheese", "cheese", "chiz"],
    category: "dairy",
    defaultPrice: 110,
  },
  {
    name: "Curd",
    aliases: ["curd", "dahi", "yogurt", "yoghurt"],
    category: "dairy",
    defaultPrice: 30,
  },

  // ── Staples ───────────────────────────────────────────────────────────────────
  {
    name: "Tata Salt",
    aliases: ["salt", "namak", "tata salt", "iodized salt"],
    category: "staples",
    defaultPrice: 20,
  },
  {
    name: "Fortune Oil",
    aliases: ["oil", "tel", "fortune oil", "sunflower oil", "refined oil"],
    category: "staples",
    defaultPrice: 120,
  },
  {
    name: "Aashirvaad Atta",
    aliases: ["atta", "aashirvaad", "ashirwad", "wheat flour", "flour"],
    category: "staples",
    defaultPrice: 280,
  },
  {
    name: "India Gate Rice",
    aliases: ["rice", "chawal", "india gate", "basmati"],
    category: "staples",
    defaultPrice: 100,
  },
  {
    name: "Tata Tea",
    aliases: ["tea", "chai", "tata tea", "chай"],
    category: "staples",
    defaultPrice: 50,
  },
  {
    name: "Nescafe",
    aliases: ["nescafe", "coffee", "nescafe classic"],
    category: "staples",
    defaultPrice: 80,
  },
  {
    name: "Bru Coffee",
    aliases: ["bru", "bru coffee"],
    category: "staples",
    defaultPrice: 60,
  },
  {
    name: "Horlicks",
    aliases: ["horlicks", "horlick"],
    category: "staples",
    defaultPrice: 100,
  },
  {
    name: "Boost",
    aliases: ["boost", "boast"],
    category: "staples",
    defaultPrice: 100,
  },
  {
    name: "Complan",
    aliases: ["complan", "compalan"],
    category: "staples",
    defaultPrice: 100,
  },

  // ── Cigarettes & Tobacco ──────────────────────────────────────────────────────
  {
    name: "Gold Flake",
    aliases: ["gold flake", "goldflake", "gf"],
    category: "tobacco",
    defaultPrice: 15,
  },
  {
    name: "Classic",
    aliases: ["classic cigarette", "classic"],
    category: "tobacco",
    defaultPrice: 20,
  },
  {
    name: "Wills Navy Cut",
    aliases: ["wills", "navy cut", "wills navy"],
    category: "tobacco",
    defaultPrice: 20,
  },

  // ── Medicines (common OTC) ────────────────────────────────────────────────────
  {
    name: "Crocin",
    aliases: ["crocin", "paracetamol", "crocine"],
    category: "medicine",
    defaultPrice: 30,
  },
  {
    name: "Disprin",
    aliases: ["disprin", "aspirin", "disprин"],
    category: "medicine",
    defaultPrice: 15,
  },
  {
    name: "Eno",
    aliases: ["eno", "antacid", "eno sachet"],
    category: "medicine",
    defaultPrice: 10,
  },
  {
    name: "Vicks",
    aliases: ["vicks", "vix", "vicks vaporub"],
    category: "medicine",
    defaultPrice: 30,
  },
  {
    name: "Burnol",
    aliases: ["burnol", "burn cream"],
    category: "medicine",
    defaultPrice: 25,
  },
];

// Build a flat alias → product map for O(1) lookup
export const ALIAS_MAP = {};
for (const product of PRODUCT_DB) {
  for (const alias of product.aliases) {
    ALIAS_MAP[alias.toLowerCase()] = product;
  }
}

export const CATEGORIES = [
  "snacks",
  "biscuits",
  "beverages",
  "chocolate",
  "instant",
  "personal",
  "household",
  "dairy",
  "staples",
  "tobacco",
  "medicine",
];
