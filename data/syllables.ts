/**
 * Syllable building: a consonant joined to each of the five vowels
 * (Ca, Ce, Ci, Co, Cu). ADLaM is generated from the roman via toAdlam(), so
 * the glyphs always match. Romanized syllables are provisional teaching aids —
 * verify pronunciation with native speakers.
 */

import { ADLAM_VOWELS, type AdlamLetter } from "./adlam";

export interface Syllable {
  roman: string; // e.g. "da"
  vowel: AdlamLetter;
}

/** The five syllables for one consonant, in vowel order (a e i o u). */
export function syllablesFor(consonant: AdlamLetter): Syllable[] {
  return ADLAM_VOWELS.map((v) => ({
    roman: consonant.roman + v.roman,
    vowel: v,
  }));
}
