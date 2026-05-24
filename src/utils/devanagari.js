// ── Devanagari digit map ──────────────────────────────────────────────────────
const DEVANAGARI_DIGITS = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

// ── Devanagari number words → Roman ──────────────────────────────────────────
const DEVANAGARI_WORDS = {
  एक: "ek",
  दो: "do",
  तीन: "teen",
  चार: "char",
  पाँच: "paanch",
  पांच: "paanch",
  छह: "chhe",
  सात: "saat",
  आठ: "aath",
  नौ: "nau",
  दस: "das",
  ग्यारह: "gyarah",
  बारह: "barah",
  तेरह: "terah",
  चौदह: "chaudah",
  पंद्रह: "pandrah",
  सोलह: "solah",
  सत्रह: "satrah",
  अठारह: "atharah",
  उन्नीस: "unnees",
  बीस: "bees",
  तीस: "tees",
  चालीस: "chaalees",
  पचास: "pachaas",
  साठ: "saath",
  सत्तर: "sattar",
  अस्सी: "assi",
  नब्बे: "nabbe",
  सौ: "sau",
  हज़ार: "hazar",
  हजार: "hazar",
};

// ── Devanagari product/item words → Roman ─────────────────────────────────────
const DEVANAGARI_ITEMS = {
  लेज: "lays",
  लेज़: "lays",
  पेप्सी: "pepsi",
  चिप्स: "chips",
  बिस्लेरी: "bisleri",
  मैगी: "maggi",
  चाय: "chai",
  दूध: "milk",
  नमक: "salt",
  तेल: "oil",
  आटा: "atta",
  चावल: "rice",
  दही: "curd",
  मक्खन: "butter",
  बिस्कुट: "biscuit",
  चॉकलेट: "chocolate",
  कुरकुरे: "kurkure",
  नूडल्स: "noodles",
};

// ── Devanagari price/quantity indicator words ─────────────────────────────────
const DEVANAGARI_INDICATORS = {
  रुपये: "rupaye",
  रुपए: "rupaye",
  का: "ka",
  के: "ke",
  वाला: "wala",
  और: "aur",
};

const ALL_DEVANAGARI = {
  ...DEVANAGARI_WORDS,
  ...DEVANAGARI_ITEMS,
  ...DEVANAGARI_INDICATORS,
};

// ── Main exported function ────────────────────────────────────────────────────
export function convertDevanagari(text) {
  if (!text) return text;

  let result = text;

  // Step 1 — Replace Devanagari digit characters (०, १, २...)
  for (const [deva, roman] of Object.entries(DEVANAGARI_DIGITS)) {
    result = result.replaceAll(deva, roman);
  }

  // Step 2 — Replace known Devanagari words
  for (const [deva, roman] of Object.entries(ALL_DEVANAGARI)) {
    result = result.replaceAll(deva, roman);
  }

  // Step 3 — Remove any remaining Devanagari characters
  // (anything in Unicode range 0900–097F)
  result = result.replace(/[\u0900-\u097F]+/g, " ");

  // Step 4 — Clean up extra spaces
  result = result.replace(/\s+/g, " ").trim();

  return result;
}
