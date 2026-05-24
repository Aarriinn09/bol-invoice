// ── Hindi / Hinglish number word map ─────────────────────────────────────────
const HINDI_NUMBERS = {
  ek: 1,
  do: 2,
  teen: 3,
  char: 4,
  paanch: 5,
  panch: 5,
  chhe: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  gyarah: 11,
  barah: 12,
  terah: 13,
  chaudah: 14,
  pandrah: 15,
  solah: 16,
  satrah: 17,
  atharah: 18,
  unnees: 19,
  bees: 20,
  tees: 30,
  chaalees: 40,
  pachaas: 50,
  saath: 60,
  sattar: 70,
  assi: 80,
  nabbe: 90,
  sau: 100,
  hazar: 1000,
};

const ENGLISH_NUMBERS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  thousand: 1000,
};

const ALL_NUMBERS = { ...HINDI_NUMBERS, ...ENGLISH_NUMBERS };

const PRICE_WORDS = new Set([
  "rupaye",
  "rupees",
  "rupee",
  "rs",
  "inr",
  "ka",
  "ke",
  "wala",
  "wale",
  "each",
  "per",
  "apiece",
  "mein",
  "me",
]);

const UNITS = new Set([
  "kg",
  "g",
  "gm",
  "gram",
  "grams",
  "litre",
  "liter",
  "ltr",
  "l",
  "ml",
  "piece",
  "pieces",
  "pcs",
  "pc",
  "packet",
  "packets",
  "pack",
  "dozen",
  "doz",
  "box",
  "boxes",
  "bottle",
  "bottles",
  "strip",
  "strips",
]);

// Words that always indicate start of a NEW item
const CONJUNCTIONS = new Set(["and", "aur", "or", "then", "also", "plus"]);

function isNumberWord(token) {
  const n = parseFloat(token);
  if (!isNaN(n)) return true;
  return ALL_NUMBERS[token.toLowerCase()] != null;
}

function parseNumber(token) {
  const n = parseFloat(token);
  if (!isNaN(n)) return n;
  return ALL_NUMBERS[token.toLowerCase()] ?? null;
}

function capitalize(str) {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ── Smart segment splitter ────────────────────────────────────────────────────
// Handles both:
//   "lays 10, pepsi 20"          → comma separated (typed)
//   "lays 10 pepsi 20 dairy milk 30"  → space only (voice)
function splitIntoSegments(text) {
  // Typed input — has commas → split by comma
  if (text.includes(",")) {
    return text
      .replace(/[;\n]+/g, ",")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Voice input — no commas
  // Strategy: collect tokens into a segment.
  // A segment ends when:
  //   - we have at least one name word AND one number
  //   - AND the next token is a word (not a number/unit/price word)
  // This correctly splits "lays 10 pepsi 20 dairy milk 30"
  // into ["lays 10", "pepsi 20", "dairy milk 30"]

  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const segments = [];
  let current = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenLower = token.toLowerCase();

    // Conjunction = hard boundary
    if (CONJUNCTIONS.has(tokenLower)) {
      if (current.length) {
        segments.push(current.join(" "));
        current = [];
      }
      continue;
    }

    const currentHasName = current.some(
      (t) =>
        !isNumberWord(t) &&
        !UNITS.has(t.toLowerCase()) &&
        !PRICE_WORDS.has(t.toLowerCase()),
    );
    const currentHasNumber = current.some((t) => isNumberWord(t));
    const thisIsWord =
      !isNumberWord(token) &&
      !UNITS.has(tokenLower) &&
      !PRICE_WORDS.has(tokenLower);

    // Split point: current segment has both a name AND a number,
    // and the next token is a new word (new item starting)
    if (currentHasName && currentHasNumber && thisIsWord) {
      segments.push(current.join(" "));
      current = [token];
      continue;
    }

    current.push(token);
  }

  if (current.length) segments.push(current.join(" "));
  return segments.filter(Boolean);
}

// ── Parse one segment into structured item ────────────────────────────────────
function parseSegment(segment) {
  const tokens = segment
    .replace(/₹\s*/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !PRICE_WORDS.has(t.toLowerCase()));

  const nameParts = [];
  const numbers = [];
  let unit = null;
  let explicitQty = null;

  // Check if FIRST token is a number followed by a name word
  // e.g. "2 pepsi 20" → qty=2 is explicit
  // But "lays 10" → 10 is price, not qty
  const firstIsNumber = tokens.length > 0 && isNumberWord(tokens[0]);
  const secondIsWord =
    tokens.length > 1 &&
    !isNumberWord(tokens[1]) &&
    !UNITS.has(tokens[1].toLowerCase());

  if (firstIsNumber && secondIsWord) {
    explicitQty = parseNumber(tokens[0]);
  }

  for (const token of tokens) {
    if (UNITS.has(token.toLowerCase())) {
      unit = token.toLowerCase();
      continue;
    }
    const num = parseNumber(token);
    if (num !== null) {
      numbers.push(num);
      continue;
    }
    nameParts.push(token);
  }

  // Assign numbers:
  // "lays 10"        → numbers=[10]           → price=10, qty=1
  // "2 pepsi 20"     → explicitQty=2, nums=[2,20] → price=20, qty=2
  // "lays 10 20"     → numbers=[10,20]         → price=20, qty=10 (edge case)
  let qty = 1;
  let price = null;

  if (explicitQty !== null && numbers.length >= 2) {
    // "2 pepsi 20" — first number is qty, last is price
    qty = numbers[0];
    price = numbers[numbers.length - 1];
  } else {
    // "lays 10" or "dairy milk 30" — only price, qty defaults to 1
    price = numbers[numbers.length - 1] ?? null;
    qty = 1;
  }

  const name = nameParts
    .join(" ")
    .replace(/[^a-zA-Z0-9\s\-]/g, "")
    .trim();
  if (!name || price === null || price <= 0) return null;

  return {
    name: capitalize(name),
    qty,
    unit: unit || null,
    price,
    total: parseFloat((qty * price).toFixed(2)),
  };
}

// ── Main exported function ────────────────────────────────────────────────────
export function parseInvoiceText(text) {
  if (!text?.trim()) return { items: [], subtotal: 0, errors: [] };

  const segments = splitIntoSegments(text);
  const items = [];
  const errors = [];

  for (const seg of segments) {
    const item = parseSegment(seg);
    if (item) items.push(item);
    else if (seg.length > 1) errors.push(`Could not parse: "${seg}"`);
  }

  const subtotal = parseFloat(
    items.reduce((s, i) => s + i.total, 0).toFixed(2),
  );
  return { items, subtotal, errors };
}

export const EXAMPLES = [
  "lays 10, dairy milk 20, pepsi 20",
  "2 pepsi bees rupaye, chips das, bisleri 15",
  "parle g 10, maggi 14, kurkure 20, bisleri 20",
  "colgate 80, dove soap 45, clinic plus 120",
];
