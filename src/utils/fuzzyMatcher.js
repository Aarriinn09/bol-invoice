import { PRODUCT_DB, ALIAS_MAP } from "../data/products.js";

// ── Levenshtein distance ──────────────────────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function stringSimilarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// ── Word overlap score ────────────────────────────────────────────────────────
// "ice cream" vs "nivea cream" → 1 shared word out of 3 unique = 0.33
// "ice cream" vs "amul ice cream" → 2 shared words out of 3 = 0.67
function wordOverlap(a, b) {
  const setA = new Set(a.split(" ").filter((w) => w.length > 2));
  const setB = new Set(b.split(" ").filter((w) => w.length > 2));
  if (setA.size === 0 || setB.size === 0) return 0;
  let shared = 0;
  for (const w of setA) if (setB.has(w)) shared++;
  return shared / Math.max(setA.size, setB.size);
}

// ── Combined score ────────────────────────────────────────────────────────────
function score(query, alias) {
  const strSim = stringSimilarity(query, alias);
  const overlap = wordOverlap(query, alias);
  // Weight: 50% string similarity + 50% word overlap
  // This prevents "ice cream" matching "nivea cream"
  // because word overlap is low (only "cream" shared)
  return strSim * 0.5 + overlap * 0.5;
}

// ── Match a single item name ──────────────────────────────────────────────────
export function matchProduct(itemName, customProducts = []) {
  if (!itemName) return { matched: false, original: itemName };

  const query = itemName.toLowerCase().trim();

  // Step 1 — Exact alias lookup (O(1))
  if (ALIAS_MAP[query]) {
    return {
      matched: true,
      matchType: "exact",
      product: ALIAS_MAP[query],
      score: 1.0,
      original: itemName,
    };
  }

  // Step 2 — Exact match in custom products
  for (const cp of customProducts) {
    const allAliases = [cp.name, ...(cp.aliases || [])];
    if (allAliases.some((a) => a.toLowerCase() === query)) {
      return {
        matched: true,
        matchType: "exact",
        product: cp,
        score: 1.0,
        original: itemName,
      };
    }
  }

  // Step 3 — Fuzzy match
  let best = { score: 0, product: null };

  // Custom products checked first — vendor's own items take priority
  for (const cp of customProducts) {
    const allAliases = [cp.name, ...(cp.aliases || [])];
    for (const alias of allAliases) {
      const s = score(query, alias.toLowerCase());
      if (s > best.score) best = { score: s, product: cp };
    }
  }

  // Built-in DB
  for (const product of PRODUCT_DB) {
    for (const alias of product.aliases) {
      const s = score(query, alias.toLowerCase());
      if (s > best.score) best = { score: s, product: product };
    }
  }

  // Threshold — 0.70 is stricter than before (was 0.65)
  // Prevents false positives like "ice cream" → "Nivea Cream"
  const THRESHOLD = 0.7;

  if (best.score >= THRESHOLD && best.product) {
    return {
      matched: true,
      matchType: "fuzzy",
      product: best.product,
      score: parseFloat(best.score.toFixed(2)),
      original: itemName,
    };
  }

  return { matched: false, original: itemName };
}

// ── Match all items in invoice ────────────────────────────────────────────────
export function matchAllItems(items, customProducts = []) {
  return items.map((item) => {
    const result = matchProduct(item.name, customProducts);
    return {
      ...item,
      matchResult: result,
      suggestedName: result.matched ? result.product.name : null,
      suggestedPrice:
        result.matched && result.product.defaultPrice > 0
          ? result.product.defaultPrice
          : null,
    };
  });
}
