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

## What's in the starter

| Area | Path | Status |
|------|------|--------|
| Landing page (hero = the 28 letters) | `app/page.tsx` | ✅ working |
| Typing game MVP (glyph recognition + SRS) | `app/learn/typing` · `components/TypingGame.tsx` | ✅ working |
| Alphabet explorer (28 letters + numerals) | `app/alphabet` | ✅ working |
| Course catalog (5 categories) | `app/courses` | 🔲 stub |
| Library | `app/library` | 🔲 stub |
| Header / Footer / Language switcher | `components/` | ✅ working |
| 5-locale i18n with RTL flip | `lib/i18n.ts` · `lib/LocaleProvider.tsx` | ✅ working |
| ADLaM data model (Unicode-derived) | `data/adlam.ts` | ✅ working |
| Spaced-repetition scheduler (SM-2-lite) | `lib/srs.ts` | ✅ working (in-memory) |

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

1. **Letter detail pages** — stroke order, audio, example words (`/alphabet/[letter]`).
2. **Auth + persistence** — save progress, streaks, SRS state (e.g. Auth.js + Postgres/Prisma, or Supabase).
3. **Review mode** — a session driven by `dueRecords()` from `lib/srs.ts`.
4. **Course player** — modules, lessons, auto-graded exams; then paid certificates with instructor grading queue.
5. **Instructor studio** — course builder, book uploads, live-session scheduling.
6. **Handwriting canvas** — trace letters on touch devices (motor encoding boosts glyph memory).
7. **PWA / offline** — cache the shell and current unit for low-bandwidth learners.
8. **Sound → glyph drills** — record native-speaker audio for each letter.

## Repository setup

The repo is initialized locally. To publish:

```bash
git remote add origin https://github.com/<your-org>/alkule.git
git push -u origin main
```

## Community resources

Tabalde · Akweeyo · Ankataa · N'Ko Learner · N'Ko Institute · Endangered Alphabets (ADLaM) — linked in the site footer as the wider ecosystem this project serves.
