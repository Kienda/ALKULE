"use client";

/**
 * Flashcard study: front shows the ADLaM glyph (or word); tap to flip and see
 * the name/roman/meaning. No scoring — this is the "first time learning" mode.
 * Two decks: letters and words. (Images can replace the glyph front later.)
 */

import { useState } from "react";
import { ADLAM_LETTERS, toAdlam } from "@/data/adlam";
import { PRACTICE_WORDS } from "@/data/words";

type Deck = "letters" | "words";

export default function Flashcards() {
  const [deck, setDeck] = useState<Deck>("letters");
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const size = deck === "letters" ? ADLAM_LETTERS.length : PRACTICE_WORDS.length;

  function go(delta: number) {
    setFlipped(false);
    setI((n) => (n + delta + size) % size);
  }
  function switchDeck(d: Deck) {
    setDeck(d);
    setI(0);
    setFlipped(false);
  }

  const front = deck === "letters" ? ADLAM_LETTERS[i].capital : toAdlam(PRACTICE_WORDS[i].roman);
  const letter = deck === "letters" ? ADLAM_LETTERS[i] : null;
  const word = deck === "words" ? PRACTICE_WORDS[i] : null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex justify-center gap-2">
        {(["letters", "words"] as Deck[]).map((d) => (
          <button
            key={d}
            onClick={() => switchDeck(d)}
            className={`rounded-full px-5 py-2 text-label-md font-semibold capitalize transition ${
              deck === d
                ? "bg-primary text-on-primary"
                : "border border-outline-variant text-on-surface-variant hover:border-primary"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[16rem] w-full flex-col items-center justify-center rounded-3xl border border-outline-variant bg-surface-container-lowest p-8 transition hover:border-primary"
      >
        {!flipped ? (
          <>
            <span className="adlam text-8xl text-primary">{front}</span>
            <span className="mt-6 text-label-md uppercase text-secondary">
              Tap to reveal
            </span>
          </>
        ) : (
          <>
            {letter && (
              <>
                <span className="font-headline-md text-headline-md text-on-surface">
                  {letter.name}
                </span>
                <span className="mt-1 text-body-lg text-on-surface-variant">
                  {letter.roman} · {letter.sound}
                </span>
              </>
            )}
            {word && (
              <>
                <span className="font-headline-md text-headline-md text-on-surface">
                  {word.roman}
                </span>
                <span className="mt-1 text-body-lg text-on-surface-variant">
                  {word.gloss}
                </span>
              </>
            )}
          </>
        )}
      </button>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          className="flex items-center gap-1 rounded-full border border-outline-variant px-5 py-2 font-medium text-on-surface-variant hover:border-primary"
        >
          <span className="material-symbols-outlined text-base">chevron_left</span>
          Prev
        </button>
        <span className="text-label-md text-on-surface-variant">
          {i + 1} / {size}
        </span>
        <button
          onClick={() => go(1)}
          className="flex items-center gap-1 rounded-full border border-outline-variant px-5 py-2 font-medium text-on-surface-variant hover:border-primary"
        >
          Next
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
