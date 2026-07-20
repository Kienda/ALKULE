# Alkule Phase 1 implementation status

## Completed frontend scope

The existing Next.js App Router application now has a consolidated Alkule design system, brand asset components, responsive two-level desktop navigation, mobile menu and bottom navigation, substantial footer, editorial homepage, deterministic free typing lab, typed sample course marketplace with filters and empty state, sample learner dashboard, authentication forms, and purpose-specific content hub shells.

All production files are independent of `.design`. Basic accounts and typing persistence are connected; commerce, publishing, scheduling, moderation, audio, and certificates remain intentionally disconnected.

## Express backend

The application uses two clearly separated processes: Next.js serves the frontend on port 3000 and Express serves the backend from `Backend/` on port 4000. Next.js proxies `/api/*` to Express, so browser requests remain same-origin. Implemented API domains include health, catalog, signup, login, logout, current session, authenticated typing progress, learner dashboard data, and newsletter subscriptions.

Passwords use Node.js `scrypt`; sessions are signed and stored in HttpOnly, SameSite cookies. Backend code is isolated under `Backend/`. Runtime records are written atomically to `Backend/storage/data.json`, which is ignored by Git. Set `SESSION_SECRET` to a strong random value in Railway. For durable production data across deployments, set `ALKULE_DATA_DIR` to a mounted Railway volume path.

Run `npm run test:api` for the backend integration suite. `npm run dev` starts both frontend and backend, while `npm start` starts both production processes after `npm run build`.

## Route map

- `/` homepage
- `/learn/typing` free session-only typing lab
- `/alphabet` alphabet reference
- `/courses` filterable sample marketplace
- `/dashboard` frontend-only learner dashboard
- `/art-culture`, `/podcast`, `/literature`, `/history`, `/library`, `/community` content hubs
- `/teach`, `/login`, `/signup`, `/profile`
- `/help`, `/accessibility`, `/legal`

## Design tokens

- Midnight `#1E1240`
- Deep `#1A0D3B`
- Teal `#1BAFCA`
- Cyan `#48CCE0`
- Off-white `#F5F5F7`
- Muted `#6E6979` (darkened from the initial reference for readable text)
- Ink `#171426`
- Surface `#FFFFFF`
- Border `#E5E3EA`
- Primary gradient `linear-gradient(135deg, #0B9DBB, #48CCE0)`

## Component organization

- `components/Header.tsx`, `Footer.tsx`, and `LanguageSwitcher.tsx`: global shell
- `components/HubPage.tsx`: consistent but purpose-specific destination shell
- `components/AuthForm.tsx`: frontend-only accessible authentication form
- `components/TypingGame.tsx`: interactive learning session
- `components/courses/`: reusable course catalog and card

## Mock data

- `data/courses.ts`: typed sample marketplace records
- `data/adlam.ts`: Unicode-derived core alphabet data; teaching romanizations remain provisional
- Dashboard content is explicitly marked as sample in the page itself

## Known limitations

- Basic authentication, saved typing progress, dashboard data, catalog delivery, and newsletter collection are connected. Purchases, subscriptions, certificates, schedules, messages, email delivery, media playback, community posting, and editorial publishing remain future domains.
- Fulfulde translations and romanizations require qualified native-speaker review.
- The project has no automated browser test suite.
- The installed `next@14.2.35` does not match the user-edited `package.json` range `^16.2.10`; dependencies were not changed during frontend consolidation.
- Locale preference is restored before paint from a cookie when available, while the current minimal dictionary remains client-provided. Locale-prefixed routes remain future work.

## Next milestone

Add automated component and browser accessibility tests, complete native-speaker content review, introduce locale-prefixed server rendering, and then connect authentication plus persisted typing/SRS progress before commerce or certificates.
