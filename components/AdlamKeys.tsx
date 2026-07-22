"use client";

/**
 * Presentational ADLaM on-screen keyboard (QWERTY-position layout, reused from
 * data/keyboardLayout). Clicks emit letters / backspace / enter; the parent owns
 * physical-keyboard handling and passes `activeCode` to flash the pressed key.
 * Full board on desktop, compact board on mobile.
 */

import {
  DESKTOP_ROWS,
  MOBILE_ROWS,
  CODE_TO_LETTER,
  type KeyDef,
} from "@/data/keyboardLayout";

interface Props {
  onLetter: (letterIndex: number) => void;
  onBackspace?: () => void;
  onEnter?: () => void;
  /** physical key code to flash as pressed */
  activeCode?: string | null;
  disabled?: boolean;
}

export default function AdlamKeys({
  onLetter,
  onBackspace,
  onEnter,
  activeCode,
  disabled,
}: Props) {
  function handleKey(key: KeyDef) {
    if (disabled) return;
    if (key.code) {
      const letter = CODE_TO_LETTER.get(key.code);
      if (letter) onLetter(letter.index);
      return;
    }
    if (key.label === "⌫") onBackspace?.();
    else if (key.label === "Enter") onEnter?.();
  }

  function renderKey(key: KeyDef, i: number) {
    const isMod = key.kind === "mod" || key.kind === "space";
    const isActive = key.code && activeCode === key.code;
    const isAction = key.label === "⌫" || key.label === "Enter";
    return (
      <button
        key={key.code ?? `${key.label}-${i}`}
        onClick={() => handleKey(key)}
        disabled={disabled}
        style={{ flexGrow: key.w ?? 1, flexBasis: 0 }}
        className={`flex h-11 min-w-0 flex-col items-center justify-center rounded border text-center transition disabled:opacity-40 ${
          isActive
            ? "scale-95 border-primary bg-primary text-on-primary"
            : isAction
              ? "border-primary/50 bg-primary-container/40 text-on-primary-container hover:bg-primary-container"
              : isMod
                ? "border-outline-variant bg-surface-container-high text-on-surface-variant"
                : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-primary-container hover:text-on-primary-container"
        }`}
      >
        {key.glyph ? (
          <>
            <span className="adlam text-lg leading-none">{key.glyph}</span>
            {key.legend && (
              <span className="text-[9px] opacity-50">{key.legend}</span>
            )}
          </>
        ) : (
          <span className="text-[11px] font-medium">{key.label}</span>
        )}
      </button>
    );
  }

  return (
    <>
      {/* Desktop full keyboard */}
      <div className="hidden rounded-2xl border border-outline-variant bg-surface-container-low p-3 md:block">
        {DESKTOP_ROWS.map((row, ri) => (
          <div key={ri} className="mb-1.5 flex gap-1.5 last:mb-0">
            {row.map(renderKey)}
          </div>
        ))}
      </div>
      {/* Mobile compact keyboard */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-2 md:hidden">
        {MOBILE_ROWS.map((row, ri) => (
          <div key={ri} className="mb-1.5 flex gap-1.5 last:mb-0">
            {row.map(renderKey)}
          </div>
        ))}
      </div>
    </>
  );
}
