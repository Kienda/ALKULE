"use client";

/**
 * ADLaM writer using the official ADLaM Basic layout (position-based). On a
 * computer it shows the full desktop keyboard; on a phone it shows a compact
 * on-screen keyboard. Physical typing is matched on event.code, so pressing
 * the QWERTY-position key inserts the ADLaM letter regardless of OS layout.
 */

import { useEffect, useRef, useState } from "react";
import {
  DESKTOP_ROWS,
  MOBILE_ROWS,
  MOBILE_DIGITS,
  CODE_TO_LETTER,
  CODE_TO_DIGIT,
  type KeyDef,
} from "@/data/keyboardLayout";

export default function AdlamKeyboard() {
  const [text, setText] = useState("");
  const [shift, setShift] = useState(false);
  const [caps, setCaps] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [mobileNumeric, setMobileNumeric] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Capitals when caps-lock is on XOR a one-shot shift is held.
  const useCapital = caps !== shift;

  function insert(glyph: string) {
    const el = inputRef.current;
    if (!el) {
      setText((t) => t + glyph);
      return;
    }
    const { selectionStart: start, selectionEnd: end } = el;
    setText((t) => t.slice(0, start) + glyph + t.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + glyph.length;
    });
  }

  function backspace() {
    const el = inputRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const from = start === end ? Math.max(0, start - 1) : start;
    setText((t) => t.slice(0, from) + t.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = from;
    });
  }

  /** Insert the glyph for a key by its physical code. */
  function pressCode(code: string, useShift: boolean) {
    const letter = CODE_TO_LETTER.get(code);
    if (letter) {
      insert(useShift ? letter.capital : letter.small);
      return true;
    }
    const digit = CODE_TO_DIGIT.get(code);
    if (digit) {
      insert(digit);
      return true;
    }
    return false;
  }

  function flashKey(code: string) {
    setActiveCode(code);
    window.setTimeout(() => setActiveCode((a) => (a === code ? null : a)), 150);
  }

  // Physical keyboard (position-based via event.code).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === "Backspace") {
        e.preventDefault();
        backspace();
        return;
      }
      if (e.code === "Enter") {
        e.preventDefault();
        insert("\n");
        return;
      }
      if (e.code === "Tab") {
        e.preventDefault();
        insert("\t");
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        insert(" ");
        return;
      }
      if (e.code === "CapsLock") {
        setCaps((c) => !c);
        return;
      }
      if (CODE_TO_LETTER.has(e.code) || CODE_TO_DIGIT.has(e.code)) {
        e.preventDefault();
        flashKey(e.code);
        // caps XOR the physical shift key
        pressCode(e.code, caps !== e.shiftKey);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [caps]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      inputRef.current?.select();
    }
  }

  function onKeyClick(key: KeyDef) {
    if (key.kind === "space") return insert(" ");
    switch (key.label) {
      case "⌫":
        return backspace();
      case "Enter":
        return insert("\n");
      case "Tab":
        return insert("\t");
      case "Caps":
        return setCaps((c) => !c);
      case "⇧":
      case "Shift":
        return setShift((s) => !s);
      case "Ctrl":
      case "Alt":
        return; // modifiers — no-op on their own
    }
    if (key.code) {
      flashKey(key.code);
      pressCode(key.code, useCapital);
      if (shift) setShift(false); // one-shot shift
    }
  }

  function renderKey(key: KeyDef, i: number) {
    const isActive = key.code && activeCode === key.code;
    const isMod = key.kind === "mod" || key.kind === "space";
    const isToggleOn =
      (key.label === "Caps" && caps) ||
      ((key.label === "Shift" || key.label === "⇧") && shift);
    return (
      <button
        key={key.code ?? `${key.label}-${i}`}
        onClick={() => onKeyClick(key)}
        style={{ flexGrow: key.w ?? 1, flexBasis: 0 }}
        className={`flex h-11 min-w-0 flex-col items-center justify-center rounded border text-center transition ${
          isActive
            ? "scale-95 border-primary bg-primary text-on-primary"
            : isToggleOn
              ? "border-primary bg-primary text-on-primary"
              : isMod
                ? "border-outline-variant bg-surface-container-high text-on-surface-variant"
                : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-primary-container hover:text-on-primary-container"
        }`}
      >
        {key.glyph ? (
          <>
            <span className="adlam text-lg leading-none">
              {useCapital && key.code && CODE_TO_LETTER.get(key.code)
                ? CODE_TO_LETTER.get(key.code)!.capital
                : key.glyph}
            </span>
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
    <div className="mx-auto max-w-4xl">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        dir="rtl"
        rows={3}
        placeholder="𞤀𞤣𞤤𞤢𞤥 …"
        className="adlam w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-3xl leading-relaxed focus:border-primary focus:outline-none"
        aria-label="ADLaM text"
      />

      <div className="mt-3 flex items-center justify-between text-body-md">
        <p className="text-on-surface-variant">
          <span className="hidden md:inline">
            Type on your keyboard (by key position) or click below.
          </span>
          <span className="md:hidden">Tap the keys below.</span>{" "}
          Shift = capitals.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setText("")}
            className="rounded-full border border-outline-variant px-4 py-1.5 font-medium text-on-surface-variant hover:border-primary"
          >
            Clear
          </button>
          <button
            onClick={copy}
            className="rounded-full bg-primary px-4 py-1.5 font-semibold text-on-primary hover:opacity-90"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      </div>

      {/* Desktop full keyboard */}
      <div className="mt-6 hidden rounded-2xl border border-outline-variant bg-surface-container-low p-4 md:block">
        {DESKTOP_ROWS.map((row, ri) => (
          <div key={ri} className="mb-2 flex gap-1.5 last:mb-0">
            {row.map(renderKey)}
          </div>
        ))}
        <p className="mt-2 text-center text-label-md text-on-surface-variant">
          Fulah — ADLaM Basic
        </p>
      </div>

      {/* Mobile phone keyboard */}
      <div className="mt-6 rounded-2xl border border-outline-variant bg-surface-container-low p-3 md:hidden">
        {mobileNumeric ? (
          <div className="mb-2 flex gap-1.5">
            {MOBILE_DIGITS.map(renderKey)}
          </div>
        ) : (
          MOBILE_ROWS.map((row, ri) => (
            <div key={ri} className="mb-1.5 flex gap-1.5">
              {row.map(renderKey)}
            </div>
          ))
        )}
        <div className="mt-1.5 flex gap-1.5">
          <button
            onClick={() => setMobileNumeric((n) => !n)}
            className="flex h-11 flex-grow items-center justify-center rounded border border-outline-variant bg-surface-container-high text-[11px] font-medium text-on-surface-variant"
            style={{ flexBasis: 0 }}
          >
            {mobileNumeric ? "ABC" : "123"}
          </button>
          <button
            onClick={() => insert(" ")}
            className="flex h-11 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-[11px] text-on-surface-variant"
            style={{ flexGrow: 5, flexBasis: 0 }}
          >
            Space
          </button>
          <button
            onClick={backspace}
            className="flex h-11 flex-grow items-center justify-center rounded border border-outline-variant bg-surface-container-high text-on-surface-variant"
            style={{ flexBasis: 0 }}
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
