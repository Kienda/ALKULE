/**
 * ADLaM script data model.
 * Unicode block: U+1E900–U+1E95F (ADLaM), added in Unicode 9.0.
 * Capitals: U+1E900–U+1E921 · Smalls: U+1E922–U+1E943 · Digits: U+1E950–U+1E959.
 *
 * Letter names follow the Unicode character names. Romanizations are
 * approximate teaching aids — have native speakers review before shipping
 * pedagogy on top of them.
 */

export interface AdlamLetter {
  /** Position in the ADLaM alphabet, 0-indexed, Unicode order. */
  index: number;
  name: string;
  capital: string;
  small: string;
  /** Approximate Latin-script romanization (verify with native speakers). */
  roman: string;
}

const LETTER_NAMES: [name: string, roman: string][] = [
  ["Alif", "a"],
  ["Daali", "d"],
  ["Laam", "l"],
  ["Miim", "m"],
  ["Ba", "b"],
  ["Sinnyiiyhe", "s"],
  ["Pe", "p"],
  ["Bhe", "ɓ"],
  ["Ra", "r"],
  ["E", "e"],
  ["Fa", "f"],
  ["I", "i"],
  ["O", "o"],
  ["Dha", "ɗ"],
  ["Yhe", "ƴ"],
  ["Waw", "w"],
  ["Nun", "n"],
  ["Kaf", "k"],
  ["Ya", "y"],
  ["U", "u"],
  ["Jiim", "j"],
  ["Chi", "c"],
  ["Ha", "h"],
  ["Qaaf", "q"],
  ["Ga", "g"],
  ["Nya", "ñ"],
  ["Tu", "t"],
  ["Nha", "ŋ"],
];

const CAPITAL_BASE = 0x1e900;
const SMALL_BASE = 0x1e922;
const DIGIT_BASE = 0x1e950;

export const ADLAM_LETTERS: AdlamLetter[] = LETTER_NAMES.map(
  ([name, roman], i) => ({
    index: i,
    name,
    roman,
    capital: String.fromCodePoint(CAPITAL_BASE + i),
    small: String.fromCodePoint(SMALL_BASE + i),
  })
);

/** ADLaM digits 0–9 (𞥐–𞥙). Index = numeric value. */
export const ADLAM_DIGITS: string[] = Array.from({ length: 10 }, (_, i) =>
  String.fromCodePoint(DIGIT_BASE + i)
);

/** "Alkule" written in ADLaM — used in the brand mark. */
export const ALKULE_ADLAM = "𞤀𞤤𞤳𞤵𞤤𞤫";

export function letterByIndex(index: number): AdlamLetter {
  return ADLAM_LETTERS[index % ADLAM_LETTERS.length];
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
