/**
 * Per-letter example words — words that BEGIN with each letter's Fulfulde
 * (Pulaar) sound. Used on the letter detail page and for per-letter typing
 * drills. ADLaM is generated from the roman via toAdlam() at render time.
 *
 * ⚠️ PLACEHOLDER CONTENT. These are scaffolding, not vetted. Many are best-
 * guess and MUST be reviewed/replaced by native speakers before launch. Keyed
 * by the letter's roman (a, d, l, ɓ, ɗ, ƴ, ñ, ŋ …). Replace the arrays with
 * the real word lists / textbook material when available.
 */

export interface Word {
  roman: string;
  gloss: string;
}

export const LETTER_WORDS: Record<string, Word[]> = {
  a: [
    { roman: "alkule", gloss: "alphabet" },
    { roman: "anndal", gloss: "knowledge" },
  ],
  d: [
    { roman: "debbo", gloss: "woman" },
    { roman: "daande", gloss: "neck" },
  ],
  l: [
    { roman: "laana", gloss: "boat" },
    { roman: "leydi", gloss: "land" },
  ],
  m: [
    { roman: "maayo", gloss: "river" },
    { roman: "mawɗo", gloss: "elder" },
  ],
  b: [
    { roman: "baaba", gloss: "father" },
    { roman: "bingel", gloss: "small child" },
  ],
  s: [
    { roman: "suudu", gloss: "house" },
    { roman: "sukaaɓe", gloss: "youth" },
  ],
  p: [
    { roman: "puccu", gloss: "horse" },
    { roman: "paykun", gloss: "little one" },
  ],
  ɓ: [
    { roman: "ɓiɗɗo", gloss: "child" },
    { roman: "ɓernde", gloss: "heart" },
  ],
  r: [
    { roman: "rawaandu", gloss: "dog" },
    { roman: "reedu", gloss: "stomach" },
  ],
  e: [
    { roman: "enɗam", gloss: "kinship" },
    { roman: "ekkol", gloss: "school" },
  ],
  f: [
    { roman: "foondu", gloss: "bird" },
    { roman: "fowru", gloss: "hyena" },
  ],
  i: [
    { roman: "innde", gloss: "name" },
    { roman: "iiwo", gloss: "cloud" },
  ],
  o: [
    { roman: "onon", gloss: "you (plural)" },
    { roman: "ontuma", gloss: "at that time" },
  ],
  ɗ: [
    { roman: "ɗemngal", gloss: "language" },
    { roman: "ɗiɗi", gloss: "two" },
  ],
  ƴ: [
    { roman: "ƴiiƴam", gloss: "blood" },
    { roman: "ƴeewde", gloss: "to look" },
  ],
  w: [
    { roman: "wuro", gloss: "village" },
    { roman: "wolde", gloss: "war" },
  ],
  n: [
    { roman: "nagge", gloss: "cow" },
    { roman: "nofru", gloss: "ear" },
  ],
  k: [
    { roman: "kosam", gloss: "milk" },
    { roman: "kaake", gloss: "belongings" },
  ],
  y: [
    { roman: "yiite", gloss: "fire" },
    { roman: "yeeso", gloss: "face" },
  ],
  u: [
    { roman: "ujunere", gloss: "thousand" },
    { roman: "umminde", gloss: "to raise" },
  ],
  j: [
    { roman: "jaŋde", gloss: "learning" },
    { roman: "jawdi", gloss: "wealth" },
  ],
  c: [
    { roman: "cuuɗi", gloss: "houses" },
    { roman: "caltol", gloss: "branch" },
  ],
  h: [
    { roman: "hoore", gloss: "head" },
    { roman: "haala", gloss: "speech" },
  ],
  q: [
    { roman: "quraana", gloss: "Qur'an" },
    { roman: "qamiis", gloss: "shirt" },
  ],
  g: [
    { roman: "gorko", gloss: "man" },
    { roman: "gertogal", gloss: "chicken" },
  ],
  ñ: [
    { roman: "ñaamdu", gloss: "food" },
    { roman: "ñiiƴe", gloss: "teeth" },
  ],
  t: [
    { roman: "toɓo", gloss: "rain" },
    { roman: "tummbere", gloss: "calabash" },
  ],
  ŋ: [
    { roman: "ŋari", gloss: "beauty" },
    { roman: "ŋguru", gloss: "skin/hide" },
  ],
};

export function wordsForRoman(roman: string): Word[] {
  return LETTER_WORDS[roman] ?? [];
}
