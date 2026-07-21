/**
 * ADLaM Basic keyboard layout (Microsoft `kbdadlm` / "Fulah - ADLaM Basic",
 * KLID 00140c00). Position-based: each physical QWERTY key maps to a fixed
 * ADLaM letter by its location on the board, NOT by the Latin letter it
 * prints. Physical input is matched on `event.code` so it works whatever the
 * user's OS keyboard layout is.
 *
 * The 28 ADLaM letters fill the three letter rows in alphabet order
 * (10 + 10 + 8), matching the official chart's row structure; digits sit on
 * the number row. If a specific key needs correcting against the official
 * chart, edit LETTER_CODES / DIGIT order here — everything else derives from it.
 */

import {
  ADLAM_DIGITS,
  ROMAN_TO_LETTER,
  type AdlamLetter,
} from "./adlam";

/**
 * Each physical QWERTY key holds the ADLaM letter that matches its ENGLISH
 * letter (q → Qaaf, r → Ra, e → E …). The five ADLaM letters with no English
 * equivalent — ɓ ɗ ƴ ñ ŋ — sit on the leftover keys (z x v ; ,).
 */
const KEY_TO_ROMAN: Record<string, string> = {
  // QWERTY row
  KeyQ: "q", KeyW: "w", KeyE: "e", KeyR: "r", KeyT: "t",
  KeyY: "y", KeyU: "u", KeyI: "i", KeyO: "o", KeyP: "p",
  // Home row
  KeyA: "a", KeyS: "s", KeyD: "d", KeyF: "f", KeyG: "g",
  KeyH: "h", KeyJ: "j", KeyK: "k", KeyL: "l", Semicolon: "ñ",
  // Bottom row
  KeyZ: "ɓ", KeyX: "ɗ", KeyC: "c", KeyV: "ƴ", KeyB: "b",
  KeyN: "n", KeyM: "m", Comma: "ŋ",
};

/** Physical key codes in QWERTY order across the three letter rows. */
export const LETTER_CODES: string[] = [
  "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP",
  "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon",
  "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma",
];

/** code → ADLaM letter (phonetic English-QWERTY mapping). */
export const CODE_TO_LETTER: ReadonlyMap<string, AdlamLetter> = new Map(
  LETTER_CODES.map((code) => [code, ROMAN_TO_LETTER.get(KEY_TO_ROMAN[code])!])
);

/** letter index → physical code (for "press this key" hints). */
export const LETTER_INDEX_TO_CODE: string[] = (() => {
  const arr: string[] = [];
  LETTER_CODES.forEach((code) => {
    const letter = CODE_TO_LETTER.get(code);
    if (letter) arr[letter.index] = code;
  });
  return arr;
})();

/** Number row: Digit1..Digit9, Digit0 → ADLaM digits 1..9, 0. */
export const DIGIT_CODES: { code: string; digit: number }[] = [
  ...Array.from({ length: 9 }, (_, i) => ({ code: `Digit${i + 1}`, digit: i + 1 })),
  { code: "Digit0", digit: 0 },
];

export const CODE_TO_DIGIT: ReadonlyMap<string, string> = new Map(
  DIGIT_CODES.map(({ code, digit }) => [code, ADLAM_DIGITS[digit]])
);

export interface KeyDef {
  /** physical code, if this key produces a glyph */
  code?: string;
  /** ADLaM glyph (small form) */
  glyph?: string;
  /** Latin legend shown small on the key */
  legend?: string;
  /** label for a modifier / non-glyph key */
  label?: string;
  /** relative width (1 = one unit) */
  w?: number;
  kind: "letter" | "digit" | "mod" | "space";
}

/** The QWERTY character a physical key code prints — shown as the key legend. */
export function codeLabel(code: string): string {
  if (code.startsWith("Key")) return code.slice(3).toLowerCase();
  if (code.startsWith("Digit")) return code.slice(5);
  const punct: Record<string, string> = {
    Semicolon: ";",
    Comma: ",",
    Period: ".",
    Slash: "/",
    Quote: "'",
  };
  return punct[code] ?? code;
}

function letterKey(code: string): KeyDef {
  const l = CODE_TO_LETTER.get(code)!;
  return { code, glyph: l.small, legend: codeLabel(code), kind: "letter" };
}
function digitKey(code: string, digit: number): KeyDef {
  return { code, glyph: ADLAM_DIGITS[digit], legend: codeLabel(code), kind: "digit" };
}
const mod = (label: string, w = 1): KeyDef => ({ label, w, kind: "mod" });

/** Full desktop keyboard, ANSI-ish rows. */
export const DESKTOP_ROWS: KeyDef[][] = [
  [
    ...DIGIT_CODES.map(({ code, digit }) => digitKey(code, digit)),
    mod("⌫", 1.5),
  ],
  [
    mod("Tab", 1.5),
    ...["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP"].map(letterKey),
  ],
  [
    mod("Caps", 1.75),
    ...["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon"].map(letterKey),
    mod("Enter", 1.75),
  ],
  [
    mod("Shift", 2.25),
    ...["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma"].map(letterKey),
    mod("Shift", 2),
  ],
  [
    mod("Ctrl", 1.25),
    mod("Alt", 1.25),
    { label: "Space", w: 6, kind: "space" },
    mod("Alt", 1.25),
    mod("Ctrl", 1.25),
  ],
];

/** Compact phone keyboard: 28 letters in 10/10/8, then a digits/space row. */
export const MOBILE_ROWS: KeyDef[][] = [
  LETTER_CODES.slice(0, 10).map(letterKey),
  LETTER_CODES.slice(10, 20).map(letterKey),
  [mod("⇧", 1.5), ...LETTER_CODES.slice(20, 28).map(letterKey), mod("⌫", 1.5)],
];

/** Digits row for the mobile keyboard's numeric mode. */
export const MOBILE_DIGITS: KeyDef[] = DIGIT_CODES.map(({ code, digit }) =>
  digitKey(code, digit)
);
