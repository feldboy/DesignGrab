/**
 * Font matching utility for DesignGrab.
 * Matches detected font names against Google Fonts catalog using fuzzy matching.
 * @module fontMatcher
 */

/** Popular Google Fonts with categories and available weights */
export const POPULAR_GOOGLE_FONTS = {
  'Inter': { category: 'sans-serif', weights: [400, 500, 600, 700] },
  'Roboto': { category: 'sans-serif', weights: [300, 400, 500, 700] },
  'Open Sans': { category: 'sans-serif', weights: [300, 400, 600, 700] },
  'Lato': { category: 'sans-serif', weights: [300, 400, 700, 900] },
  'Montserrat': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Poppins': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Raleway': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Nunito': { category: 'sans-serif', weights: [300, 400, 600, 700] },
  'Playfair Display': { category: 'serif', weights: [400, 500, 600, 700] },
  'Merriweather': { category: 'serif', weights: [300, 400, 700, 900] },
  'Source Sans Pro': { category: 'sans-serif', weights: [300, 400, 600, 700] },
  'PT Sans': { category: 'sans-serif', weights: [400, 700] },
  'Noto Sans': { category: 'sans-serif', weights: [400, 500, 600, 700] },
  'Ubuntu': { category: 'sans-serif', weights: [300, 400, 500, 700] },
  'Oswald': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Rubik': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Work Sans': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Quicksand': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Barlow': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'DM Sans': { category: 'sans-serif', weights: [400, 500, 700] },
  'Plus Jakarta Sans': { category: 'sans-serif', weights: [400, 500, 600, 700] },
  'Space Grotesk': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Outfit': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Manrope': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Figtree': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Geist': { category: 'sans-serif', weights: [400, 500, 600, 700] },
  'Fira Code': { category: 'monospace', weights: [300, 400, 500, 600, 700] },
  'JetBrains Mono': { category: 'monospace', weights: [400, 500, 600, 700] },
  'Source Code Pro': { category: 'monospace', weights: [300, 400, 500, 600, 700] },
  'Libre Baskerville': { category: 'serif', weights: [400, 700] },
  'Lora': { category: 'serif', weights: [400, 500, 600, 700] },
  'Crimson Text': { category: 'serif', weights: [400, 600, 700] },
  'EB Garamond': { category: 'serif', weights: [400, 500, 600, 700] },
  'Bitter': { category: 'serif', weights: [400, 500, 600, 700] },
  'Cabin': { category: 'sans-serif', weights: [400, 500, 600, 700] },
  'Karla': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Mulish': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Josefin Sans': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  'Archivo': { category: 'sans-serif', weights: [400, 500, 600, 700] },
  'Sora': { category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
};

/** System fonts mapped to their closest Google Font equivalent */
const SYSTEM_FONT_MAP = {
  'arial': 'Inter',
  'helvetica': 'Inter',
  'helvetica neue': 'Inter',
  'georgia': 'Merriweather',
  'times new roman': 'Playfair Display',
  'times': 'Playfair Display',
  'verdana': 'Open Sans',
  'tahoma': 'Noto Sans',
  'trebuchet ms': 'Raleway',
  'courier new': 'Fira Code',
  'courier': 'Fira Code',
  'lucida console': 'Source Code Pro',
  'monaco': 'JetBrains Mono',
  'segoe ui': 'Inter',
  'san francisco': 'Inter',
  'system-ui': 'Inter',
  '-apple-system': 'Inter',
  'blinkmacsystemfont': 'Inter',
};

/**
 * Normalize a string for comparison — lowercase, strip spaces and weight suffixes.
 * @param {string} str
 * @returns {string}
 */
const normalize = (str) =>
  str.toLowerCase().replace(/\b(bold|italic|light|medium|regular|thin|semibold|extrabold|black)\b/g, '').replace(/\s+/g, '').trim();

/**
 * Simple string similarity score (0–1) using longest common subsequence ratio.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
const similarity = (a, b) => {
  if (a === b) return 1;
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length < b.length ? a : b;
  if (longer.length === 0) return 1;

  // Check if one contains the other
  if (longer.includes(shorter)) return shorter.length / longer.length;

  // Levenshtein-based similarity
  const costs = Array.from({ length: shorter.length + 1 }, (_, i) => i);
  for (let i = 1; i <= longer.length; i++) {
    let prev = i;
    for (let j = 1; j <= shorter.length; j++) {
      const val = longer[i - 1] === shorter[j - 1] ? costs[j - 1] : Math.min(costs[j - 1], prev, costs[j]) + 1;
      costs[j - 1] = prev;
      prev = val;
    }
    costs[shorter.length] = prev;
  }
  return 1 - costs[shorter.length] / longer.length;
};

/**
 * Fuzzy match an input string against a list of candidate font names.
 * @param {string} input - The font name to match.
 * @param {string[]} candidates - Array of candidate font names.
 * @returns {{ name: string, score: number }[]} Sorted by score descending.
 */
export const fuzzyMatch = (input, candidates) => {
  const norm = normalize(input);
  return candidates
    .map((name) => ({ name, score: similarity(norm, normalize(name)) }))
    .sort((a, b) => b.score - a.score);
};

/**
 * Build a Google Fonts CSS import URL.
 * @param {string} fontName - The Google Font family name.
 * @param {number[]} [weights] - Weight values to include. Defaults to the font's known weights.
 * @returns {string} The Google Fonts CSS2 URL.
 */
export const buildGoogleFontsUrl = (fontName, weights) => {
  const font = POPULAR_GOOGLE_FONTS[fontName];
  const w = weights || (font ? font.weights : [400, 500, 600, 700]);
  const family = fontName.replace(/\s+/g, '+');
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${w.join(';')}&display=swap`;
};

/**
 * Match a detected font name to the best Google Font equivalent.
 * @param {string} fontName - The font name detected on a page (e.g. "Helvetica", "Open Sans Bold").
 * @returns {{ match: string, confidence: number, alternatives: string[], googleFontsUrl: string }}
 */
export const matchFont = (fontName) => {
  try {
    if (!fontName || typeof fontName !== 'string') {
      return { match: 'Inter', confidence: 0, alternatives: [], googleFontsUrl: buildGoogleFontsUrl('Inter') };
    }

    const cleaned = fontName.replace(/["']/g, '').trim();
    const normInput = normalize(cleaned);

    // Direct system font mapping
    const systemMatch = SYSTEM_FONT_MAP[cleaned.toLowerCase()] || SYSTEM_FONT_MAP[normInput];
    if (systemMatch) {
      return {
        match: systemMatch,
        confidence: 0.95,
        alternatives: [],
        googleFontsUrl: buildGoogleFontsUrl(systemMatch),
      };
    }

    // Exact match in catalog
    const catalogNames = Object.keys(POPULAR_GOOGLE_FONTS);
    const exact = catalogNames.find((n) => normalize(n) === normInput);
    if (exact) {
      return { match: exact, confidence: 1, alternatives: [], googleFontsUrl: buildGoogleFontsUrl(exact) };
    }

    // Fuzzy match
    const results = fuzzyMatch(cleaned, catalogNames);
    const best = results[0];
    const alternatives = results.slice(1, 4).filter((r) => r.score > 0.3).map((r) => r.name);

    return {
      match: best.name,
      confidence: Math.round(best.score * 100) / 100,
      alternatives,
      googleFontsUrl: buildGoogleFontsUrl(best.name),
    };
  } catch (err) {
    console.error('[DesignGrab:fontMatcher]', err);
    return { match: 'Inter', confidence: 0, alternatives: [], googleFontsUrl: buildGoogleFontsUrl('Inter') };
  }
};
