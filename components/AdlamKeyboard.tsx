"use client";
import { useRef, useState } from "react";
import { ADLAM_LETTERS } from "@/data/adlam";

const PHYSICAL_KEYS = "qwertyuiopasdfghjklzxcvbnm,.".split("");

export default function AdlamKeyboard() {
  const [value, setValue] = useState("");
  const [shift, setShift] = useState(false);
  const [message, setMessage] = useState("");
  const editor = useRef<HTMLTextAreaElement>(null);

  function insert(text: string) {
    const field = editor.current;
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const next = value.slice(0, start) + text + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + text.length, start + text.length);
    });
  }

  function backspace() {
    const field = editor.current;
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    if (start !== end) {
      setValue(value.slice(0, start) + value.slice(end));
      requestAnimationFrame(() => field.setSelectionRange(start, start));
    } else if (start > 0) {
      const previous = value.charCodeAt(start - 1);
      const width = previous >= 0xdc00 && previous <= 0xdfff ? 2 : 1;
      const nextCaret = Math.max(0, start - width);
      setValue(value.slice(0, nextCaret) + value.slice(start));
      requestAnimationFrame(() => field.setSelectionRange(nextCaret, nextCaret));
    }
    field.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Tab" || event.key === "Enter" || event.key === "Backspace" || event.key.startsWith("Arrow")) return;
    const index = PHYSICAL_KEYS.indexOf(event.key.toLowerCase());
    if (index < 0) return;
    event.preventDefault();
    const letter = ADLAM_LETTERS[index];
    insert(event.shiftKey ? letter.capital : letter.small);
  }

  async function copyText() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setMessage("ADLaM text copied.");
    } catch {
      editor.current?.select();
      setMessage("Text selected. Use your system copy command.");
    }
  }

  return (
    <section className="container-page pb-14" aria-labelledby="adlam-keyboard-heading">
      <div className="card overflow-hidden">
        <div className="border-b border-border bg-indigo-deep p-6 text-white">
          <p className="eyebrow text-alkule-cyan">Full typing workspace</p>
          <h2 id="adlam-keyboard-heading" className="mt-2 text-2xl font-bold">ADLaM on-screen and physical keyboard</h2>
          <p className="mt-2 max-w-3xl text-sm text-white/70">Type with the buttons, use an installed ADLaM keyboard directly, or use the Latin key labels shown below as the Alkule practice layout.</p>
        </div>
        <div className="p-5 sm:p-8">
          <label htmlFor="adlam-editor" className="font-bold">Your ADLaM text</label>
          <textarea
            ref={editor}
            id="adlam-editor"
            value={value}
            onChange={event => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            dir="rtl"
            lang="ff-Adlm"
            rows={5}
            className="adlam mt-3 w-full resize-y rounded-xl border-2 border-border bg-paper p-5 text-3xl focus:border-alkule-teal"
            placeholder="𞤚𞤭𞤲𞤣𞤫 𞤸𞤢𞤫…"
            spellCheck={false}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={copyText} className="btn-secondary">Copy text</button>
            <button type="button" onClick={() => { setValue(""); setMessage("Editor cleared."); editor.current?.focus(); }} className="min-h-11 px-3 font-bold underline">Clear</button>
            <span className="text-sm text-muted" role="status">{message}</span>
          </div>

          <div className="mt-8 rounded-2xl bg-paper p-3 sm:p-5" aria-label="ADLaM keyboard">
            <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
              {ADLAM_LETTERS.slice(0, 10).map((letter, index) => <KeyButton key={letter.index} latin={PHYSICAL_KEYS[index]} glyph={shift ? letter.capital : letter.small} onPress={insert} />)}
            </div>
            <div className="mt-2 grid grid-cols-9 gap-1.5 px-[5%] sm:gap-2">
              {ADLAM_LETTERS.slice(10, 19).map((letter, offset) => <KeyButton key={letter.index} latin={PHYSICAL_KEYS[offset + 10]} glyph={shift ? letter.capital : letter.small} onPress={insert} />)}
            </div>
            <div className="mt-2 grid grid-cols-9 gap-1.5 px-[10%] sm:gap-2">
              {ADLAM_LETTERS.slice(19).map((letter, offset) => <KeyButton key={letter.index} latin={PHYSICAL_KEYS[offset + 19]} glyph={shift ? letter.capital : letter.small} onPress={insert} />)}
            </div>
            <div className="mt-3 grid grid-cols-[1fr_3fr_1.4fr] gap-2">
              <button type="button" onClick={() => setShift(current => !current)} aria-pressed={shift} className={`min-h-12 rounded-lg border font-bold ${shift ? "border-alkule-teal bg-cyan-100" : "border-border bg-white"}`}>⇧ Shift</button>
              <button type="button" onClick={() => insert(" ")} className="min-h-12 rounded-lg border border-border bg-white" aria-label="Space">Space</button>
              <button type="button" onClick={backspace} className="min-h-12 rounded-lg border border-border bg-white font-bold" aria-label="Backspace">⌫ Backspace</button>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">Physical practice mapping: Q–P for the first row, A–L for the second row, and Z–period for the third row. Hold your physical Shift key for capitals. System ADLaM keyboard input is accepted without conversion.</p>
        </div>
      </div>
    </section>
  );
}

function KeyButton({ latin, glyph, onPress }: { latin: string; glyph: string; onPress: (glyph: string) => void }) {
  return <button type="button" onClick={() => onPress(glyph)} className="adlam flex min-h-16 min-w-0 flex-col items-center justify-center rounded-lg border border-border bg-white text-2xl hover:border-alkule-teal hover:bg-cyan-50" aria-label={`${latin.toUpperCase()} key: ${glyph}`}><span>{glyph}</span><span className="font-body text-[10px] uppercase text-muted">{latin}</span></button>;
}
