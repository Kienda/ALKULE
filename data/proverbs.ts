/**
 * Fulɓe (Fulani) proverbs — a starter set for the Culture section.
 *
 * IMPORTANT: The romanized Fulfulde, the ADLaM (transliterated from the
 * romanization at render time), and the translations are all PROVISIONAL
 * teaching aids. Fulfulde has many varieties (Pulaar, Pular, Fulfulde) with
 * different spellings and readings. Every entry here must be reviewed and
 * corrected by native speakers before this is presented as authoritative —
 * same rule as the romanizations in data/adlam.ts.
 *
 * ADLaM glyphs are generated with toAdlam() so the script always matches the
 * romanization shown. Capitalization is dropped (small letters only) until we
 * have reviewed guidance on ADLaM sentence casing.
 */

export interface Proverb {
  /** Romanized Fulfulde. ADLaM is derived from this via toAdlam(). */
  fulfulde: string;
  /** Literal-ish English translation. */
  translation: string;
  /** What the proverb means / when it is used. */
  meaning: string;
}

export const PROVERBS: Proverb[] = [
  {
    fulfulde: "Ganyo maa ko neɗɗo, wanaa mbeewa.",
    translation: "Your enemy is a person, not a goat.",
    meaning:
      "Treat rivals as people who can reason and change — not as things to be driven off.",
  },
  {
    fulfulde: "Munyal defan haayre.",
    translation: "Patience can cook a stone.",
    meaning: "With enough patience, even the hardest task becomes possible.",
  },
  {
    fulfulde: "Nagge heewnge kosam yeewataa.",
    translation: "A cow with much milk is never sold cheaply.",
    meaning: "What is truly valuable is never given away for little.",
  },
  {
    fulfulde: "Ɓiɗɗo mo yiyaani baaba mum, wiya baaba juutaani.",
    translation:
      "A child who never saw its father says the father was not tall.",
    meaning: "We judge what we do not know by our own small measure.",
  },
  {
    fulfulde: "Ɗemngal ko lawɗo, gaañaani wuras.",
    translation: "The tongue is soft, yet it can cut.",
    meaning: "Words carry more power to wound than they seem to.",
  },
  {
    fulfulde: "Jokkere enɗam ɓuri jawdi.",
    translation: "Keeping kinship ties is worth more than wealth.",
    meaning: "Relationships outlast riches; tend them first.",
  },
];
