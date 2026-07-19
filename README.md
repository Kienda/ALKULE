# Alkule — 𞤀𞤤𞤳𞤵𞤤𞤫

**Learn to read, write, and type the ADLaM script of the Fulani people.**
Games, courses, books, and culture — in Fulfulde (ADLaM & Latin), English, French, and Arabic.

> *Alkule* is Fulfulde for "the letters of the alphabet."

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

Requires Node 18.17+ (Node 20 LTS recommended).

## What's built

| Area | Path | Status |
|------|------|--------|
| Landing page (hero = the 28 letters) | `app/page.tsx` | ✅ working |
| Alphabet explorer + per-letter detail pages | `app/alphabet` · `app/alphabet/[slug]` | ✅ working |
| Module lessons (vowels, consonants, numerals, accents-tones, writing-system) | `app/learn/lessons` · `components/LessonShell.tsx` | ✅ working |
| Typing practice (score/accuracy/WPM, physical + on-screen keyboard) | `app/learn/typing` · `components/TypingPractice.tsx` | ✅ working |
| ADLaM writer keyboard | `app/learn/keyboard` · `components/AdlamKeyboard.tsx` | ✅ working |
| Flashcards (flip study: letters + words) | `app/learn/flashcards` · `components/Flashcards.tsx` | ✅ working |
| Tiered exam (recognize / scramble / spell) + keyboard typing | `app/learn/exam` · `components/ExamSession.tsx` · `components/AdlamKeys.tsx` | ✅ working |
| SRS review session | `app/learn/review` · `components/ReviewSession.tsx` | ✅ working |
| Culture (story + proverbs) | `app/culture` | ✅ working |
| Local profile + progress dashboard | `app/login` · `app/dashboard` · `components/Dashboard.tsx` | ✅ working |
| Library | `app/library` | 🔲 stub |
| Header / Footer / Language switcher | `components/` | ✅ working |
| 5-locale i18n with RTL flip | `lib/i18n.ts` | ✅ working |
| ADLaM data model (Unicode-derived) + keyboard layout | `data/adlam.ts` · `data/keyboardLayout.ts` | ✅ working |
| Spaced-repetition scheduler (SM-2-lite) + mastery store | `lib/srs.ts` · `lib/masteryStore.ts` | ✅ working (localStorage) |

State is client-side (`localStorage`) via `lib/masteryStore.ts`, `lib/typingStore.ts`,
`lib/examStore.ts`, and `lib/profile.ts` — the seam for a future backend.

## Architecture decisions (why it's built this way)

- **RTL-first.** Switching the UI to Fulfulde (ADLaM) or Arabic flips
  `document.dir` to `rtl`, and all layout uses logical properties/flow-relative
  Tailwind utilities (`ms-`, `me-`) so the whole shell mirrors for free.
  Never use `ml-`/`mr-` in new components — use `ms-`/`me-`.
- **Fonts are a product feature.** ADLaM text renders with
  [Noto Sans Adlam](https://fonts.google.com/noto/specimen/Noto+Sans+Adlam)
  (loaded from Google Fonts in `app/layout.tsx`). The `.adlam` CSS class
  forces the font + RTL isolation for any embedded ADLaM text. **Production
  upgrade:** switch to `next/font/google` to self-host the fonts at build
  time — no runtime Google request, which matters on low-bandwidth
  connections.
- **Letters are generated from Unicode code points**, not hardcoded glyph
  strings — one source of truth in `data/adlam.ts` (U+1E900–U+1E95F).
- **SRS is a first-class primitive.** `lib/srs.ts` is deliberately tiny; when
  a backend lands, persist `MasteryRecord[]` per user and the review queue,
  streaks, and mastery rings from the wireframe all fall out of it.
- **i18n is client-side and minimal on purpose.** When SEO-per-locale
  matters, migrate to `next-intl` with `/{locale}/` routing; the dictionary
  shape in `lib/i18n.ts` ports directly.

## ⚠️ Verify with native speakers

- Romanizations in `data/adlam.ts` are approximate teaching aids.
- Fulfulde UI strings in `lib/i18n.ts` (both scripts) are provisional drafts —
  review across Pulaar / Pular / Fulfulde varieties before launch.

## Roadmap (suggested order)

Done: letter detail pages, module lessons, typing practice, writer keyboard,
flashcards, tiered exam, SRS review, culture pages, local profile + dashboard.

Next:

1. **Auth + persistence** — move mastery/typing/exam/profile server-side
   (Supabase [auth+Postgres] or Postgres + Prisma + Auth.js). Seam is
   `lib/profile.ts` + the stores.
2. **Vetted content** — replace provisional words/proverbs/romanizations with
   native-speaker-reviewed material; add real example-word assets/images.
3. **Audio + stroke order** — record native-speaker letter audio; add
   stroke-order/tracing SVGs on lesson pages.
4. **Course player** — modules, lessons, certificates, instructor grading.
5. **Handwriting canvas** — trace letters on touch devices.
6. **PWA / offline** — cache the shell + current unit for low-bandwidth learners.

## Contributing

Person-named branches keep work separate (e.g. `abubakar/...`, `Kienda/...`);
commit authorship is recorded per commit. Typecheck before pushing:

```bash
git clone https://github.com/Dialloni/ALKULE.git
git checkout -b <you>/<feature>
npx tsc --noEmit      # must pass
```

Do **not** run `npm run build` while `npm run dev` is running — it clobbers
`.next`. See `CLAUDE.md` for conventions (RTL, Noto Sans Adlam) and the full
directory map.

## Community resources

Tabalde · Akweeyo · Ankataa · N'Ko Learner · N'Ko Institute · Endangered Alphabets (ADLaM) — linked in the site footer as the wider ecosystem this project serves.
