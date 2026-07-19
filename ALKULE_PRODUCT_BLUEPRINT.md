# Alkule Product Blueprint and Structural Wireframe

**Document status:** Product and engineering source of truth, version 1.0  
**Working product name:** **Alkule** — 𞤀𞤤𞤳𞤵𞤤𞤫  
**Primary mission:** Help Fulani people and interested learners worldwide learn ADLaM, Fulani language, literature, history, and culture through free practice, affordable courses, books, audio, and community.

---

## 1. Product Definition

### 1.1 Launch scope

Alkule launches as an **ADLaM-first web learning platform** with five connected product pillars:

1. **Free Typing Lab** — anonymous, game-like practice; progress is session-only until the learner creates an account.
2. **Course Marketplace** — self-paced and live courses at Beginner, Intermediate, and Advanced levels.
3. **Cultural Media** — Art & Culture, Podcast, Literature, and History as first-class navigation destinations.
4. **Library** — books, graded readers, magazines, dictionaries, worksheets, and instructor-uploaded materials.
5. **Community** — learner questions, practice groups, course communities, events, and moderated discussion.

### 1.2 Future scope

- News
- Alkule TV / video channels
- Mobile applications
- Institutional or school accounts
- Publishing and print distribution

News and TV should remain behind feature flags until the learning, commerce, rights, and moderation foundations are stable.

### 1.3 Supported interface languages

- Fulani in ADLaM: `ff-Adlm` — right-to-left
- Fulani in Latin script: `ff-Latn` — left-to-right
- English: `en` — left-to-right
- French: `fr` — left-to-right
- Arabic: `ar` — right-to-left

Course content must additionally declare its **Fulani variety or regional teaching context** where relevant, such as Pular, Pulaar, or Fulfulde. Interface language and course language are separate settings.

### 1.4 Non-negotiable product rules

- Visitors can use the free typing experience without creating an account.
- Anonymous typing progress is not permanently saved.
- Creating a free account unlocks saved typing progress, bookmarks, wishlists, review reminders, and course previews.
- A free account may view course trailers and designated preview lessons; full continuation requires a course purchase or eligible subscription.
- A course purchase grants access to that course according to the purchase terms.
- A subscription grants access only to courses included in the subscription catalog.
- Live cohort courses are normally purchased separately and are not automatically included in the standard subscription.
- Auto-graded quizzes may show immediate results.
- A verified certificate requires a final submission reviewed or approved by an instructor. It may be included in a live course or sold as an assessment add-on for self-paced learners.
- External organizations and websites must be labeled as **resources or inspirations**, not “partners,” unless a formal partnership exists.

---

## 2. Product Shell

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ Utility / identity row: Brand · Search · Teach · Language · Auth/User     │
├───────────────────────────────────────────────────────────────────────────┤
│ Free Typing · Courses · Art & Culture · Podcast · Literature · History   │
│ Library · Community                                                       │
├───────────────────────────────────────────────────────────────────────────┤
│ Context sidebar                  │ Main page or learning workspace         │
│ Progress / modules / tools       │                                         │
├───────────────────────────────────────────────────────────────────────────┤
│ Global footer: learn · explore · teach · support · legal · resources      │
└───────────────────────────────────────────────────────────────────────────┘
```

### Architectural principle

The global shell is stable, while the sidebar changes by context. Learners should never have to relearn the site structure when moving between typing practice, a paid course, a book, and a live class.

---

## 3. Global Header / Menubar

Use a **two-row sticky desktop header**. This preserves all required top-level destinations without squeezing language, search, and account controls into one crowded row.

## 3.1 Row one — identity and utilities

### Left or logical start area

1. **Alkule logo / wordmark**
   - Latin wordmark: `Alkule`
   - ADLaM wordmark: `𞤀𞤤𞤳𞤵𞤤𞤫`
   - Link: `/{locale}`
   - Tooltip or accessible label: “Alkule home”

2. **Global search field**
   - Placeholder: `Search courses, books, podcasts, and history`
   - Search icon button
   - Keyboard shortcut hint on desktop
   - Search suggestions grouped by:
     - Courses
     - Books
     - Podcast episodes
     - Literature
     - History topics
     - Instructors
   - Route: `/{locale}/search?q=`

### Right or logical end area — visitor state

1. **Teach on Alkule**
   - Link: `/{locale}/teach`
   - Secondary call to action

2. **Language and script selector**
   - ADLaM Fulani
   - Latin Fulani
   - English
   - French
   - Arabic
   - Changes document direction and saves preference

3. **Log in**
   - Link: `/{locale}/login`

4. **Create free account**
   - Link: `/{locale}/signup`
   - Primary account call to action

5. **Start free typing**
   - Link: `/{locale}/learn/typing`
   - Visually prominent only on the landing page or for first-time visitors

### Right or logical end area — authenticated learner state

1. **Continue learning**
   - Deep-links to the most recently active lesson or typing review

2. **Notifications button**
   - Live-class reminders
   - Due reviews
   - Instructor feedback
   - Certificate status
   - Community replies

3. **User avatar menu**
   - Dashboard
   - My learning
   - Purchases
   - Subscription
   - Certificates
   - Saved items
   - Account and language settings
   - Help
   - Log out

### Additional instructor state

- **Instructor Studio** link with a count badge for ungraded submissions or pending tasks.

## 3.2 Row two — primary navigation

The following destinations are visible as first-class items on desktop:

| Label | Route | Purpose |
|---|---|---|
| Free Typing | `/{locale}/learn/typing` | Free acquisition and daily practice |
| Courses | `/{locale}/courses` | Paid and free course marketplace |
| Art & Culture | `/{locale}/art-culture` | Cultural articles, galleries, interviews, and related courses |
| Podcast | `/{locale}/podcast` | Audio learning, interviews, transcripts, and series |
| Literature | `/{locale}/literature` | Stories, poetry, graded readers, and literary analysis |
| History | `/{locale}/history` | Timelines, regions, people, migrations, and sourced learning |
| Library | `/{locale}/library` | Books, documents, readers, dictionaries, and worksheets |
| Community | `/{locale}/community` | Practice groups, Q&A, events, and course discussions |

### Active and access states

- Active destination has a clear underline or selected pill.
- Locked paid content is not hidden; it is labeled with a lock and access explanation.
- “New” and “Live” badges may appear, but never more than one badge per navigation item.
- News and TV must not appear in the primary navigation until they contain useful, maintained content.

## 3.3 Mobile header and navigation

### Top mobile row

- Logo
- Search button
- Language button
- User avatar or Log in
- Menu button

### Bottom mobile navigation

Keep five high-frequency items visible:

1. Home
2. Typing
3. Courses
4. Library
5. Profile

The menu drawer contains Art & Culture, Podcast, Literature, History, Community, Teach, Help, and legal links.

### UX reasoning

- Typing is one tap away because it is the daily habit and free acquisition loop.
- Courses and Library stay visible because they are the principal learning and revenue destinations.
- Cultural areas remain explicit in the drawer rather than being buried under a generic “More.”

---

## 4. Sidebar System

Use one visual sidebar component with four configurations. In right-to-left interface modes, the sidebar moves to the logical right and its controls mirror naturally.

## 4.1 Free Typing sidebar — anonymous visitor

### UI elements

- Session score
- Current streak
- Session accuracy
- Current practice mode
- Core alphabet progress for this session
- `Choose practice mode`
  - Letter recognition
  - Keyboard mapping
  - Sound to letter
  - Letter to sound
  - Word typing
  - Speed and accuracy
- `Show keyboard layout`
- `Writing direction guide`
- Sound on/off
- Reduced motion toggle
- `Start over`
- Primary prompt: **Create a free account to save progress**

### UX intent

- The visitor gets immediate value without registration friction.
- Session-only progress creates an honest reason to register without artificially limiting practice.
- Practice modes vary recognition, recall, audio, and production rather than repeating only multiple-choice questions.

### Architectural rule

Do not write anonymous mastery data to a permanent account record. Temporary game state may live in component memory or short-lived session storage and must be clearly presented as unsaved.

## 4.2 Learner dashboard sidebar

### Links and indicators

1. Overview
2. Continue learning
3. My courses
4. Typing progress
5. Reviews due — count badge
6. Live schedule
7. Assignments
8. Certificates
9. Saved books and episodes
10. Downloads / offline items
11. Purchase history
12. Settings

### Progress widgets

- Weekly learning goal
- Daily streak
- Minutes learned this week
- Letters or skills mastered
- Next live class
- Instructor feedback waiting

### UX intent

The dashboard emphasizes the next useful action, not vanity analytics. “Continue learning” and “Reviews due” always precede totals and charts.

## 4.3 Course player sidebar

### Header area

- Course title
- Instructor name
- Level badge
- Self-paced or Live badge
- Overall progress percentage
- Collapse sidebar button

### Curriculum tree

Each module expands to lessons with a consistent icon system:

- Video lesson
- Audio lesson
- Reading
- Typing practice
- Handwriting practice
- Quiz
- Assignment
- Live session
- Final assessment

### Lesson states

- Completed
- Current
- Available
- Preview
- Locked by purchase
- Scheduled
- Waiting for grading
- Needs revision

### Quick tools

- Course glossary
- ADLaM keyboard
- Notes
- Bookmarks
- Transcript
- Download for offline use, when permitted
- Ask instructor
- Report content issue

### Certificate pipeline

- Eligibility checklist
- Final assessment status
- Payment status for certificate assessment, when separate
- Submitted date
- Instructor review status
- Revision request
- Certificate issued
- Public verification link

### UX intent

Learners can see exactly where they are, why a lesson is locked, and what remains before certification. A locked lesson must always include a direct purchase or subscription explanation rather than a dead end.

## 4.4 Instructor Studio sidebar

### Links and actions

1. Studio overview
2. My courses
3. **Create course**
4. Drafts
5. Live cohorts
6. Calendar
7. Students
8. Assignments
9. **Grading queue** — count badge
10. Certificates awaiting approval
11. Books and documents
12. Podcast or media submissions
13. Messages
14. Reviews and ratings
15. Analytics
16. Earnings and payouts
17. Instructor profile
18. Policies and support

### UX intent

The grading queue and upcoming live sessions receive the strongest visual priority because instructor responsiveness directly affects trust, completion, and certificate value.

---

## 5. Footer

Use a large, structured footer. It is both a navigation safety net and an accessibility/resource center.

## 5.1 Brand and mission

- Alkule logo in Latin and ADLaM
- One-sentence mission
- `About Alkule`
- `Support the mission` or scholarship contribution link, only after the funding model is defined
- Social channels
- Newsletter signup

## 5.2 Learn column

- Free Typing
- ADLaM Alphabet
- Beginner courses
- Intermediate courses
- Advanced courses
- Self-paced courses
- Live courses
- Review practice
- Certificates

## 5.3 Explore column

- Art & Culture
- Podcast
- Literature
- History
- Library
- Community
- Events
- Instructors

## 5.4 Teach column

- Become an instructor
- Instructor requirements
- Course quality standards
- Create a course
- Teach live
- Publish a book
- Instructor payments
- Copyright and licensing guide
- Instructor support

## 5.5 Support and accessibility column

- Help Center
- Contact support
- Install an ADLaM font
- Install an ADLaM keyboard
- Typing layout guide
- Low-data mode
- Download and offline help
- Captions and transcripts
- Accessibility settings
- Accessibility statement
- Report a problem

## 5.6 Legal and trust column

- Terms of use
- Privacy policy
- Cookie preferences
- Refund policy
- Subscription terms
- Instructor terms
- Community guidelines
- Copyright / takedown policy
- Child safety policy
- Content standards
- Certificate verification

## 5.7 Language, direction, and display controls

- Interface language selector
- ADLaM / Latin reading aid preference
- Text size controls
- High contrast option
- Reduced motion
- Low-data mode
- Install web app

## 5.8 External resource map

Create a dedicated `Resources` page and show a curated subset in the footer.

### ADLaM and Fulani resources

- Tabalde
- Akweeyo
- Atlas of Endangered Alphabets — ADLaM

### Related African-language and script-learning references

- An ka taa
- N'Ko Learner
- N'Ko Institute

Every external link must:

- Use an external-link indicator
- Open safely
- State that Alkule is not responsible for third-party content
- Avoid implying a partnership without permission

---

## 6. Course Marketplace and Access Model

## 6.1 Course catalog filters

- Level: Beginner, Intermediate, Advanced
- Format: Self-paced, Live cohort
- Subject
- Interface language
- Teaching language
- Fulani variety or region
- Instructor
- Price
- Included in subscription
- Certificate available
- Captions available
- Downloadable / offline-ready
- Duration
- Rating, only after sufficient verified reviews exist

## 6.2 Course card

- Cover image
- Course title
- Instructor
- Level
- Format
- Teaching language
- Duration
- Price or `Included in subscription`
- Certificate availability
- Rating and review count
- `Preview` or `View course`

## 6.3 Course detail wireframe

```text
Breadcrumb
Course title · level · format · language
Short outcome statement
Instructor identity and credentials
Trailer / preview media
[Enroll / Buy course / Start preview / Included in plan]

What you will learn
Who this course is for
Prerequisites
Full curriculum with preview markers
Teaching language, captions, transcripts, and dialect context
Assignments and assessment method
Certificate requirements
Instructor response expectations
Reviews
Related books, podcasts, culture, literature, and history
```

## 6.4 Entitlement matrix

| Capability | Visitor | Free account | Course buyer | Subscriber | Live enrollee |
|---|---:|---:|---:|---:|---:|
| Anonymous typing | Yes | Yes | Yes | Yes | Yes |
| Saved typing progress | No | Yes | Yes | Yes | Yes |
| Browse catalog and public content | Yes | Yes | Yes | Yes | Yes |
| Course trailer | Yes | Yes | Yes | Yes | Yes |
| Preview lessons | Account prompt | Yes | Yes | Yes | Yes |
| Purchased course content | No | No | Purchased course | When also purchased | When also purchased |
| Subscription catalog | No | No | No | Yes | When subscribed |
| Live cohort | No | No | No | Not by default | Yes |
| Auto-graded quizzes | Preview only | Preview only | Yes | Yes for included courses | Yes |
| Instructor-reviewed certificate | No | Add-on possible | Add-on or included | Add-on possible | Usually included |
| Offline downloads | No | Limited free items | Course policy | Plan policy | Cohort policy |

## 6.5 Pricing principles

- Support one-time course purchases and monthly or annual subscriptions.
- Keep the entry price low, but do not depend on a large future audience to make an unprofitable model viable.
- Allow regional pricing, scholarships, sponsored seats, and instructor coupons.
- Show the full price, taxes, renewal terms, refund rules, and certificate fees before payment.
- Build payments behind a provider adapter so card, bank, wallet, and mobile-money options can be added by market.

---

## 7. Curriculum Architecture

## 7.1 Free Typing Lab progression

1. Recognize core letters
2. Match letter name and sound
3. Learn keyboard positions
4. Type isolated letters
5. Type common syllables
6. Type common words
7. Listen and type
8. Build speed and accuracy
9. Review weak items with spaced repetition

## 7.2 Beginner

- Right-to-left orientation
- The 28 core ADLaM letters
- Uppercase and lowercase
- Letter names and sounds
- Unjoined educational forms
- Basic keyboard use
- Simple syllables and words
- Introductory reading and copying
- Core cultural vocabulary

## 7.3 Intermediate

- Joined and contextual forms
- Word construction
- Vowel length and relevant marks
- Gemination and other common diacritics
- Native digits and punctuation
- Sentence reading
- Dictation
- Graded readers
- Everyday communication

## 7.4 Advanced

- Supplementary characters and loan-sound usage, reviewed by qualified native-language experts
- Advanced orthography
- Longer-form reading and composition
- Literature and historical texts
- Translation between ADLaM and Latin Fulani where pedagogically appropriate
- Editing and proofreading
- High-speed typing
- Research, presentation, and teaching practice

## 7.5 Content validation

All alphabet names, romanizations, pronunciations, example words, translations, and Fulani interface copy require documented review by qualified speakers representing relevant varieties. The system must store reviewer, review date, variety, and approval status.

---

## 8. Cultural and Media Hubs

## 8.1 Art & Culture

- Featured cultural story
- Topic filters: music, dress, crafts, food, architecture, ceremonies, oral traditions
- Image galleries with captions and rights metadata
- Interviews
- Related courses
- Related books and podcast episodes
- Region and community context
- Source list and corrections link

### Learning support

Every cultural item should expose vocabulary, audio pronunciation where available, and links into relevant language lessons.

## 8.2 Podcast

- Series and episode pages
- Audio player with speed controls
- Download or low-quality stream
- Full transcript
- ADLaM / Latin / translation tabs where licensed
- Follow-along sentence highlighting
- Vocabulary list
- Save episode
- Continue listening
- Related course or discussion

## 8.3 Literature

- Poetry, short stories, proverbs, children’s readers, and longer works
- Level filters
- Side-by-side or toggle reading modes
- Audio narration
- Click a word for glossary help
- Bookmarks and notes
- Reading progress
- Author, publication, rights, and source information

## 8.4 History

- Timeline
- Regional map
- Topic collections
- Biographies
- Primary and secondary source notes
- Audio and video interviews
- Related literature and courses
- Corrections and scholarly review workflow

## 8.5 Library

### Filters

- Books
- Graded readers
- Dictionaries
- Worksheets
- Newspapers and magazines
- Research
- Children’s materials
- Audio books
- Free / paid / subscription
- Language, script, variety, level, author, publisher, and year

### Rights workflow

Every uploaded asset requires ownership or permission status, license type, permitted territories, download rules, expiry, and takedown contact.

## 8.6 Community

- General Q&A
- Typing practice
- Beginner, Intermediate, and Advanced groups
- Course communities
- Reading clubs
- Podcast discussions
- Events and live practice rooms
- Instructor announcements
- Report, block, and moderation tools

Community launches only with moderation queues, community guidelines, anti-spam controls, and escalation procedures.

---

## 9. Technical Architecture

## 9.1 Architecture style

Start with a **modular monolith**, not microservices. Preserve domain boundaries in code and data so high-load areas can be separated later. This reduces early operational complexity while remaining horizontally scalable.

## 9.2 Frontend

- Next.js App Router
- Locale-prefixed routes: `/{locale}/...`
- Server-rendered marketing, catalog, article, and library pages
- Client components only for interactive learning tools
- Shared bidi-aware design system
- Logical CSS properties rather than left/right-specific properties
- `dir="rtl"` at the correct page or content boundary
- Direction isolation for mixed ADLaM, Latin, Arabic, numbers, and code
- Self-hosted ADLaM-capable fonts
- Separate educational unjoined and reading/cursive typography when appropriate
- Progressive Web App shell
- Offline cache for selected lessons and books
- Captions, transcripts, keyboard navigation, and reduced-motion support

## 9.3 Core backend domains

1. Identity and profiles
2. Roles and permissions
3. Localization and translations
4. Catalog and curriculum
5. Learning progress and spaced repetition
6. Assessments and grading
7. Certificates and verification
8. Commerce, subscriptions, and entitlements
9. Live cohorts and scheduling
10. Media and library rights
11. Podcast and editorial publishing
12. Community and moderation
13. Search
14. Notifications
15. Instructor earnings and payouts
16. Analytics and experimentation

## 9.4 Storage and infrastructure

- PostgreSQL for transactional data
- Object storage for videos, audio, books, images, and certificates
- CDN for global media delivery
- Redis or equivalent for caching, rate limits, sessions, and queues
- Background workers for media processing, notifications, search indexing, certificate generation, and scheduled reviews
- Search engine introduced only when PostgreSQL full-text search is insufficient
- Managed live-video provider behind an adapter
- Payment providers behind an adapter
- Central audit log for grading, certificates, payouts, moderation, and rights changes

## 9.5 Principal entities

- User
- Profile
- Role
- LocalePreference
- InstructorProfile
- Course
- CourseTranslation
- CourseInstructor
- Module
- Lesson
- MediaAsset
- Enrollment
- Purchase
- Subscription
- Entitlement
- LessonProgress
- MasteryRecord
- Assessment
- Question
- Attempt
- Submission
- Grade
- Certificate
- CertificateVerification
- Cohort
- LiveSession
- Attendance
- Book
- PublicationLicense
- PodcastSeries
- PodcastEpisode
- Article
- CulturalCollection
- LiteratureWork
- HistoryTopic
- CommunitySpace
- Post
- Comment
- Report
- Notification
- Payout

## 9.6 Scale and reliability

- Cache public catalog and editorial pages at the CDN.
- Serve media from object storage/CDN, never from the application server.
- Make learning-progress writes idempotent.
- Queue expensive work.
- Add observability for page latency, lesson startup time, failed media, payment errors, grading age, and SRS events.
- Partition or archive high-volume event data separately from core transactional tables.
- Treat a potential worldwide audience as a product opportunity, not as an assumption of day-one concurrent load.

## 9.7 Security and trust

- Server-side entitlement checks for every paid lesson or asset
- Signed, expiring media URLs
- Role-based access control
- Multi-factor authentication for admins and payout-changing instructor actions
- Secure upload scanning
- Copyright and takedown workflow
- Payment webhook verification
- Rate limiting and bot controls
- Child-safety and community moderation controls
- Immutable certificate verification record
- Privacy-conscious analytics

---

## 10. Recommended Route Map

```text
/{locale}
/{locale}/learn/typing
/{locale}/alphabet
/{locale}/courses
/{locale}/courses/[courseSlug]
/{locale}/learn/[enrollmentId]/lesson/[lessonId]
/{locale}/live/[cohortId]
/{locale}/art-culture
/{locale}/art-culture/[slug]
/{locale}/podcast
/{locale}/podcast/[seriesSlug]/[episodeSlug]
/{locale}/literature
/{locale}/literature/[slug]
/{locale}/history
/{locale}/history/[slug]
/{locale}/library
/{locale}/library/[itemSlug]
/{locale}/community
/{locale}/community/[spaceSlug]
/{locale}/dashboard
/{locale}/my-learning
/{locale}/certificates
/{locale}/certificate/[verificationCode]
/{locale}/teach
/{locale}/studio
/{locale}/studio/courses
/{locale}/studio/courses/new
/{locale}/studio/grading
/{locale}/studio/live
/{locale}/studio/library
/{locale}/studio/earnings
/{locale}/search
/{locale}/login
/{locale}/signup
/{locale}/checkout/[productId]
/{locale}/account
/{locale}/help
/{locale}/resources
```

---

## 11. Current Starter Audit

## 11.1 What is already strong

- Next.js App Router foundation
- ADLaM-capable UI and data model
- Five interface locales
- Whole-document RTL switching
- Logical spacing utilities in key components
- Free in-memory typing game
- Initial spaced-repetition model
- Alphabet explorer
- Accessible button labels and live feedback
- Successful production build

## 11.2 Immediate gaps

1. The header does not yet include Art & Culture, Podcast, Literature, or History.
2. Courses currently treats those destinations only as course-category cards; they need their own content hubs.
3. `/community` and `/login` are linked but do not exist.
4. Courses and Library are placeholders.
5. Font loading depends on a remote Google stylesheet and emitted a build-time optimization warning.
6. Client-only locale restoration can create a language/direction flash and does not provide locale-specific SEO routes.
7. The random first typing round can differ between server render and hydration; initialize it deterministically or after mount.
8. The typing buttons are not locked during feedback, allowing rapid repeat taps before the next round.
9. The alphabet data includes the 28 core letters but does not model the six supplementary letters, diacritics, or punctuation.
10. Fulani strings and romanizations are explicitly provisional and need native-speaker review.
11. There are no automated tests.
12. The dependency audit reports one high and one moderate vulnerability in the current framework dependency tree; upgrade deliberately and retest rather than applying a blind forced update.

## 11.3 First implementation slice

1. Add a centralized navigation configuration.
2. Replace the header with the two-row responsive shell.
3. Add route placeholders for Art & Culture, Podcast, Literature, History, Community, Login, Signup, Dashboard, and Teach.
4. Harden the typing game:
   - deterministic or post-mount first round
   - answer lock during feedback
   - keyboard input
   - clear anonymous no-save message
5. Self-host the ADLaM font and add a font-rendering check.
6. Extend the ADLaM data model into core letters, supplementary letters, marks, digits, and punctuation.
7. Add tests for direction, navigation, character mapping, scoring, and SRS transitions.
8. Introduce locale-prefixed routing before a large amount of content is created.

---

## 12. Delivery Roadmap

### Phase 0 — Foundation and governance

- Confirm product name and visual identity
- Form native-speaker and cultural review group
- Define course quality, rights, moderation, refund, and certificate policies
- Finalize route and navigation architecture
- Fix current starter issues

### Phase 1 — Free typing and alphabet MVP

- Core letters
- Audio
- Keyboard mapping
- Session-only visitor mode
- Account-saved progress
- Spaced review
- Mobile and low-bandwidth support

### Phase 2 — Accounts, dashboard, and persistence

- Authentication
- Learner profiles
- Saved progress
- Review queue
- Bookmarks and wishlists
- Notifications

### Phase 3 — Self-paced courses

- Catalog
- Course detail page
- Course player
- Auto-graded quizzes
- Instructor course builder
- Preview and entitlement rules

### Phase 4 — Commerce and certificates

- One-time purchases
- Subscription catalog
- Regional pricing and scholarships
- Instructor-reviewed final submissions
- Certificate generation and verification
- Refunds, tax, and payout records

### Phase 5 — Live learning and instructor operations

- Cohorts
- Scheduling
- Attendance
- Live links
- Assignments
- Grading queue
- Instructor analytics and payouts

### Phase 6 — Library and cultural media

- Rights-managed library
- Art & Culture
- Podcast with transcripts
- Literature reader
- History timeline and sourced articles

### Phase 7 — Community

- Course groups
- Q&A
- Reading and practice clubs
- Events
- Moderation and trust tooling

### Phase 8 — News and TV

- Editorial newsroom
- Video channels
- Live and scheduled programming
- Expanded sponsorship and publishing model

---

## 13. Success Metrics

### Learning

- First typing exercise completion
- First seven-day return
- Review completion rate
- Accuracy improvement
- Course lesson completion
- Assessment pass and revision rates

### Product

- Visitor-to-account conversion after typing
- Preview-to-purchase conversion
- Subscription retention
- Live attendance
- Library reading/listening completion
- Search success rate

### Trust and operations

- Median grading turnaround
- Certificate dispute rate
- Copyright resolution time
- Community report resolution time
- Instructor response time
- Media start failures on low-bandwidth connections

Avoid optimizing only for total registrations. The main north-star metric should combine meaningful learning activity with sustained return.

---

## 14. Research and Inspiration Map

These sites are references or ecosystem resources, not automatically formal partners:

- Tabalde — https://tabalde.com/
- Akweeyo — https://www.akweeyo.com/
- An ka taa — https://www.ankataa.com/videos
- N'Ko Learner — https://nkolearner.com/
- N'Ko Institute — https://nkoinstitute.com/
- Atlas of Endangered Alphabets: ADLaM — https://www.endangeredalphabets.net/alphabets/adlam/
- Unicode ADLaM chart — https://www.unicode.org/charts/PDF/U1E900.pdf
- ADLaM orthography notes — https://r12a.github.io/scripts/adlm/fuf.html

