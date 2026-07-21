/**
 * ADLaM script data model.
 * Unicode block: U+1E900–U+1E95F (ADLaM), added in Unicode 9.0.
 * Capitals: U+1E900–U+1E921 · Smalls: U+1E922–U+1E943 · Digits: U+1E950–U+1E959.
 *
 * Letter names follow the Unicode character names. Romanizations, IPA values,
 * sound hints, and example words are approximate teaching aids — have native
 * speakers review before shipping pedagogy on top of them.
 */

export interface AdlamLetter {
  /** Position in the ADLaM alphabet, 0-indexed, Unicode order. */
  index: number;
  name: string;
  /** URL-safe lowercase name, used for /alphabet/[slug] routes. */
  slug: string;
  capital: string;
  small: string;
  /** Approximate Latin-script romanization (verify with native speakers). */
  roman: string;
  /** Approximate IPA value. */
  ipa: string;
  /** Plain-English pronunciation hint. */
  sound: string;
  isVowel: boolean;
  /** Example Fulfulde word starting with this letter (provisional). */
  example: { roman: string; gloss: string };
}

type LetterRow = [
  name: string,
  roman: string,
  ipa: string,
  sound: string,
  exampleRoman: string,
  exampleGloss: string,
];

const LETTER_ROWS: LetterRow[] = [
  ["Alif", "a", "a", "a as in father", "alkule", "the alphabet"],
  ["Daali", "d", "d", "d as in day", "debbo", "woman"],
  ["Laam", "l", "l", "l as in leaf", "laana", "boat"],
  ["Miim", "m", "m", "m as in moon", "maayo", "river"],
  ["Ba", "b", "b", "b as in boy", "baaba", "father"],
  ["Sinnyiiyhe", "s", "s", "s as in sun", "suudu", "house"],
  ["Pe", "p", "p", "p as in pen", "puccu", "horse"],
  ["Bhe", "ɓ", "ɓ", "implosive b — air drawn inward", "ɓiɗɗo", "child"],
  ["Ra", "r", "r", "rolled r, as in Spanish", "rawaandu", "dog"],
  ["E", "e", "e", "e as in they (without the y-glide)", "enɗam", "kinship"],
  ["Fa", "f", "f", "f as in fish", "foondu", "bird"],
  ["I", "i", "i", "ee as in see", "innde", "name"],
  ["O", "o", "o", "o as in go (without the w-glide)", "onon", "you (plural)"],
  ["Dha", "ɗ", "ɗ", "implosive d — air drawn inward", "ɗemngal", "language"],
  ["Yhe", "ƴ", "ʔʲ", "glottalized y — y with a catch in the throat", "ƴiiƴam", "blood"],
  ["Waw", "w", "w", "w as in water", "wuro", "village"],
  ["Nun", "n", "n", "n as in net", "nagge", "cow"],
  ["Kaf", "k", "k", "k as in kite", "kosam", "milk"],
  ["Ya", "y", "j", "y as in yes", "yiite", "fire"],
  ["U", "u", "u", "oo as in food", "ujunere", "thousand"],
  ["Jiim", "j", "dʒ", "j as in jam", "jaŋde", "learning"],
  ["Chi", "c", "tʃ", "ch as in chair", "cuuɗi", "houses"],
  ["Ha", "h", "h", "h as in hat", "hoore", "head"],
  ["Qaaf", "q", "q", "deep k from the back of the throat (Arabic loanwords)", "quraana", "Qur'an"],
  ["Ga", "g", "ɡ", "g as in go", "gertogal", "chicken"],
  ["Nya", "ñ", "ɲ", "ny as in canyon", "ñaamdu", "food"],
  ["Tu", "t", "t", "t as in tea", "toɓo", "rain"],
  ["Nha", "ŋ", "ŋ", "ng as in sing", "ŋari", "beauty"],
];

const CAPITAL_BASE = 0x1e900;
const SMALL_BASE = 0x1e922;
const DIGIT_BASE = 0x1e950;

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

export const ADLAM_LETTERS: AdlamLetter[] = LETTER_ROWS.map(
  ([name, roman, ipa, sound, exampleRoman, exampleGloss], i) => ({
    index: i,
    name,
    slug: name.toLowerCase(),
    roman,
    ipa,
    sound,
    isVowel: VOWELS.has(roman),
    capital: String.fromCodePoint(CAPITAL_BASE + i),
    small: String.fromCodePoint(SMALL_BASE + i),
    example: { roman: exampleRoman, gloss: exampleGloss },
  })
);

/** ADLaM digits 0–9 (𞥐–𞥙). Index = numeric value. */
export const ADLAM_DIGITS: string[] = Array.from({ length: 10 }, (_, i) =>
  String.fromCodePoint(DIGIT_BASE + i)
);

/** Fulfulde names for digits 0–9 (provisional — verify with native speakers). */
export const ADLAM_DIGIT_NAMES: string[] = [
  "Nula",
  "Go'o",
  "Ɗiɗi",
  "Tati",
  "Nay",
  "Jowi",
  "Jeego'o",
  "Jeeɗiɗi",
  "Jeetati",
  "Jeenay",
];

/** Vowel letters (a e i o u), in alphabet order. */
export const ADLAM_VOWELS: AdlamLetter[] = ADLAM_LETTERS.filter((l) => l.isVowel);

/** Consonant letters, in alphabet order. */
export const ADLAM_CONSONANTS: AdlamLetter[] = ADLAM_LETTERS.filter(
  (l) => !l.isVowel
);

/** "Alkule" written in ADLaM — used in the brand mark. */
export const ALKULE_ADLAM = "𞤀𞤤𞤳𞤵𞤤𞤫";

/** roman char → letter, for transliteration and keyboard mapping. */
export const ROMAN_TO_LETTER: ReadonlyMap<string, AdlamLetter> = new Map(
  ADLAM_LETTERS.map((l) => [l.roman, l])
);

/**
 * Transliterate a romanized Fulfulde word to ADLaM small letters,
 * char by char. Long vowels / geminates arrive as doubled letters in the
 * romanization and stay doubled. Unmapped chars pass through unchanged.
 */
export function toAdlam(roman: string): string {
  return Array.from(roman.toLowerCase())
    .map((ch) => ROMAN_TO_LETTER.get(ch)?.small ?? ch)
    .join("");
}

export function letterByIndex(index: number): AdlamLetter {
  return ADLAM_LETTERS[index % ADLAM_LETTERS.length];
}

export function letterBySlug(slug: string): AdlamLetter | undefined {
  return ADLAM_LETTERS.find((l) => l.slug === slug);
}

export function randomLetter(exclude?: number): AdlamLetter {
  let pick = Math.floor(Math.random() * ADLAM_LETTERS.length);
  if (exclude !== undefined && ADLAM_LETTERS.length > 1) {
    while (pick === exclude) {
      pick = Math.floor(Math.random() * ADLAM_LETTERS.length);
    }
  }
  return ADLAM_LETTERS[pick];
}
