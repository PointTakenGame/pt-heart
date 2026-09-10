---
tid: HEART-T260831-28
slot: tech-spec.md
game: heart
purpose: Architecture and data contracts for the Heart web build, as the code actually implements them today.
written: 2026-08-28 by biz
status: draft, unreviewed by Steve
sources:
  - point-taken-heart/game/package.json
  - point-taken-heart/game/src/types.ts
  - point-taken-heart/game/src/engine.ts
  - point-taken-heart/game/src/showdown.ts
  - point-taken-heart/game/src/detectors.ts
  - point-taken-heart/game/src/pacing.ts
  - point-taken-heart/game/src/coach.ts
  - point-taken-heart/game/src/storage.ts
  - point-taken-heart/game/src/content/*.ts
  - point-taken-heart/game/src/App.tsx
  - point-taken-heart/game/src/avatars.ts
  - point-taken-heart/game/src/main.tsx
  - point-taken-heart/game/src/ui/*.tsx
  - point-taken-heart/game/api/coach.ts
  - point-taken-heart/game/middleware.ts
  - point-taken-heart/game/vite.config.ts
  - point-taken-heart/game/README.md
  - point-taken-heart/docs/design/2026-08-23_infrastructure-plan.md
  - point-taken-heart/docs/design/online-edition-roadmap.md
  - point-taken-heart/docs/design/2026-08-23_showdown-full-match-sofia.md
---

# Heart web build: technical specification

This describes `point-taken-heart/game/`, a TypeScript single-page app called
"humility-showdown" in its own `package.json`. It is not the printed 3-player
card game, and it is not Brain's Next.js stack. Where those diverge from this
build, both are stated and this document says which one is what actually runs.

## 1. Stack and versions

From `package.json`: name `humility-showdown`, version `0.1.0`, ESM (`"type":
"module"`). React `^19.2.0`, `react-dom ^19.2.0`. Dev-only: TypeScript `^5.7.0`,
Vite `^7.0.0`, `@vitejs/plugin-react ^5.0.0`, `@types/node ^26.2.0`, `@types/react
^19.2.0`, `@types/react-dom ^19.2.0`, `tsx ^4.23.12`. No test runner, no state
library, no CSS framework, no ORM, and no database driver. There IS a database:
`src/corpus.ts` talks to Supabase over PostgREST with plain `fetch`, so no client
library was needed for it (section 9). `allowScripts` pins
`esbuild@0.28.2`.

Scripts:
- `npm run dev` -> `vite` (dev server, default port 5273 per `README.md`,
  overridable with `PORT`).
- `npm run build` -> `tsc --noEmit && vite build` (typecheck, then bundle; no
  emitted `.js` from `tsc` itself).
- `npm run preview` -> `vite preview`.
- `npm run export:script` -> `tsx scripts/export-script.ts` (dumps authored
  content to a readable markdown transcript).

There is no `vercel.json` in the repo `[unratified, absence confirmed by `ls`]`;
deploy configuration (build command, env vars) is assumed to live in the Vercel
project dashboard, not in-repo. `GAP: is there a vercel.json or equivalent
deploy config anywhere, and what routes/redirects does the live deployment use
beyond the default Vite output and the one Edge Function.`

## 2. Repo layout

Top level of `game/`: `api/`, `dist/` (build output, ignore), `node_modules/`
(ignore), `pdf-game/`, `scripts/`, `src/`.

- `src/` is the entire client app: `App.tsx` (screens and routing), `types.ts`
  (shared type model), `engine.ts` (gym levels 1-3 runner), `showdown.ts` (the
  boss match runner), `referee.ts` (the referee-format runner, two AI figures
  argue and the human only calls fouls), `room.ts` (the live-play runner, one
  human plus a generated stranger, no server), `final.ts` (the Final Showdown
  runner), `detectors.ts` (offline phrase-rule foul detection), `pacing.ts`
  (message-reveal timing), `coach.ts` (client-side model-call wrapper with
  fallbacks), `storage.ts` (localStorage persistence), `corpus.ts` (donates
  answered items to Supabase, section 9), `avatars.ts` (avatar picker data and
  the fair-shuffle constraint), `main.tsx` (React entry point, no StrictMode),
  `styles.css`, `content/` (authored level and card data: `cards.ts`,
  `final.ts`, `ids.ts` (permanent level ids, section 9), `index.ts`,
  `level1.ts`, `level2.ts`, `level3.ts`, `referee.ts`, `room.ts`,
  `showdown.ts`), `ui/` (presentational components: `BossIntro.tsx`,
  `Composer.tsx`, `Dialogue.tsx`, `Drill.tsx`, `Header.tsx` (a `costs` prop
  shows what each foul costs beneath the purses), `Mast.tsx`, `OnTable.tsx`
  (pins the line under judgement above the composer so the question sits next
  to the thing it is about), `Prefight.tsx`, `RuleCards.tsx` (a `hint` prop),
  `Thread.tsx`, `blip.ts`). `GAP: referee.ts, room.ts, and final.ts have no
  architectural section here. Sections 4 and 5 document engine.ts and
  showdown.ts to the depth these three still need: state shape, scoring, and
  beat flow. Somebody has to write that pass.`
- `api/coach.ts` is the one server-side file: a Vercel Edge Function that
  proxies model calls to Anthropic so the API key never reaches the browser.
- `scripts/export-script.ts` imports the content modules directly and renders
  every authored line to a markdown file, so the exported transcript can never
  drift from what actually ships (`npm run export:script`).
- `pdf-game/` is currently an empty placeholder for print production assets.
  Its own `README.md` states: "This folder is production, not specification.
  The normative deck definition lives in `docs/cards.md`." `[unratified,
  point-taken-heart/game/pdf-game/README.md]`
- `middleware.ts` (repo root, outside `src/`) is Vercel Edge Middleware: HTTP
  Basic Auth over the whole site, gated on `SITE_PASSWORD`.
- `vite.config.ts` adds one dev-only plugin, `coachDevApi()`, which loads
  `ANTHROPIC_API_KEY` for local development so `npm run dev` can call the coach
  without a deployed Edge Function.

## 3. The type model (`src/types.ts`)

`FoulType` is the closed set of the three cards: `'judging' | 'opinion_as_fact'
| 'fake_listening'`. `Lane` distinguishes which side of a turn a message
belongs to.

`Message` is the unit the `Thread` UI renders. `ComposerState` is a discriminated
union of seven variants: `locked`, `buttons`, `call`, `prefilled`, `free`,
`template`, `continue`. Each is a distinct input affordance: `call` renders no
text box (the rule cards double as the buttons, "let it stand" is the only
button left in the composer); `template` is a sentence frame with blanks
rendered inside the box rather than loose chips, "on the turns where the shape
of the answer is the thing being taught" `[unratified, src/ui/Composer.tsx
header comment]`.

`Revision` captures composer edit history as boundary snapshots, not
keystrokes: on 900ms idle, on blur, on chip insert, and always on send,
de-duplicated against the previous snapshot. `ItemRecord` is the persisted
record of one scored item (drill step, boss turn, or match turn), correctness,
and its revision trace.

Internally, `engine.ts` levels are built from a `Step` union: `SayStep`,
`CardStep`, `CallOrPassStep`, `SortStep`, `EditStep`, `FreeStep`, `ModelStep`,
`ContinueStep`. Steps are grouped into `Beat`s, and a `LevelDef` is an ordered
list of beats plus a `PrefightStep` sequence shown before the first beat. This
`Step`/`Beat`/`LevelDef` shape only exists for the training ladder; level 4 (the
showdown) is not a `LevelDef` and has no `Step` sequence, it is described
separately in `content/showdown.ts` (section 5 below).

## 4. The match state machine

`GAP: there are five runner modules (engine.ts, showdown.ts, referee.ts,
room.ts, final.ts, per section 2), and only two of them are documented below.
referee.ts, room.ts and final.ts appear here only as their header comments in
section 2. Somebody has to write them up to the depth engine.ts and showdown.ts
get below.` The two runners this section documents in full are not one state
machine, and they are structurally different by design.

**`useGym(level: LevelDef): Gym`, in `engine.ts`.** Drives training levels 1-3
**as they ship today.** `game/docs/roadmap.md` §7 rules a referee-format
redesign for these levels (the human referees a coach-vs-AI-opponent exchange
rather than walking authored items directly); it is a scoped-but-unbuilt open
GAP, not yet mapped onto this runner. Internally a flat array produced by
walking each `Beat`'s `Step`s in order,
with a `cursor` index that advances one step at a time. Each step type maps to
one `ComposerState` and one scoring rule. `tooThin(value)` rejects too-short
free text, replying with `THIN_REPLY`. `CARD_BEFORE_PAY_MS = 950` delays a card
reveal so the payout animation reads as caused by the card, not simultaneous
with it. This is a table-walk: deterministic index advance over a precomputed
array, closest to a classic state machine.

**`useShowdown(): Match`, in `showdown.ts`.** Drives level 4, the boss match
against "Slippery Sofia." The header comment states the design choice
explicitly: a match is a linear script, so it is written as one `async`
function (`void (async () => { ... })()`) that `await`s the player at each
decision point, rather than a step table, "because written as steps it becomes
a state machine nobody can read." `[unratified, src/showdown.ts header
comment]` Screen transitions in `App.tsx` are a plain three-stage local state
on top of this: `prefight` -> `intro` -> `match`.

**Top-level screens (`App.tsx`).** A `Screen` union of eight variants:
`{name:'front'}`, `{name:'select'}`, `{name:'level', level: LevelDef}`,
`{name:'showdown'}`, `{name:'referee', level: RefereeLevel}`,
`{name:'final'}`, `{name:'door', seat: Seat}`, `{name:'live', seat: Seat,
topic: string}`. `GAP: the union above is verified against App.tsx, but the
paragraph below describes only the older screens. What referee, final, door and
live each render needs writing.` There is no consent or agreement gate;
`App.tsx`'s own comment records the ruling that removed it ("there used to be a
homepage for this entire humility showdown game... The gate is retired... You
can retire that.", Steve) `[unratified, src/App.tsx:97-108]`. `front` opens the
app for every visitor, every time. `Select` is the avatar picker plus the level
ladder, gated by `cleared`/`allCleared` from `storage.ts`. A `Level` screen
runs `Prefight` (the stepper introducing the level and, on first visit only,
the coach) then `Room`, which switches on an `inBoss` flag between `Drill`
(the training stepper UI, one panel with a Next button) and `Thread`+`Composer`
(the scrolling chat/boss UI). `Showdown` composes `Prefight` -> a `BossIntro`
countdown -> `Match`, which renders `Header` (token purses), `Thread`,
`Composer`, and `RuleCards` (the three foul cards, always live and tappable as
the whistle) together.

The load-bearing state-machine finding: **`showdown.ts` implements exactly
three rounds and stops.** `content/showdown.ts`'s `TURNS: Turn[]` array is a
fixed schedule covering three rounds (four turns each, twelve turns total: player
speaks, Sofia summarizes and is ruled on, Sofia speaks and is ruled on, player
summarizes Sofia). Win, loss, or draw is computed once, after round 3, purely by
comparing final token totals. There is no fourth round, no separate "Final
Showdown" state or module layered on top of this, and no distinct scoring
rubric anywhere in `showdown.ts` or `content/showdown.ts`. `showdown.ts` *is*
the entire match.

## 5. `showdown.ts`: structure versus a normal round

A normal training round (levels 1-3) is authored content walked by index, with
the coach as the only other party, no tokens, and no player-initiated foul
calls (per `heart-soul.md`'s locked rule, human callout is reserved for level
4). The showdown differs on every one of those axes:

- **Two other parties, not one.** The opponent (Sofia, argued and scripted) and
  the coach (rules on the player's own turns) are both present at once. `The
  player whistles Sofia. The coach whistles the player, because a player cannot
  call a foul on themselves.` `[unratified, docs/design/2026-08-23_showdown-
  full-match-sofia.md:36, matches src/showdown.ts implementation]`
- **Tokens are live and transfer, never burn.** `START_TOKENS = 7` per side
  (`content/showdown.ts`), always summing to 14. `foulCost()`: Judging = 2,
  Opinions as Facts = 1, Fake Listening = 1 (`content/showdown.ts:75`).
  `FALSE_CALL_COST = 1`, what a whistle at nothing costs the player
  (`content/showdown.ts:83`). Every price is a whole token; `TOKEN_STEP = 1`
  (`content/showdown.ts:95`) is the only place a fractional price could
  enter. There is no `MISS_COST`: letting a real foul go past moves nothing at
  all (`content/showdown.ts:62`) `[ruled: HEART-T260907-23]`.
- **Sofia's fouls are authored and fixed, not generated per playthrough.**
  `content/showdown.ts`'s `TURNS` schedule assigns each of Sofia's six turns a
  fixed foul or `'clean'`: round 1 summarize clean, round 1 speak Opinions as
  Facts, round 2 both clean, round 3 summarize Fake Listening, round 3 speak
  Judging (the escalation, placed last, "when she is behind"). This
  deliberately breaks the design doc's own stated rule that she "never fouls
  twice in a row" `[unratified, docs/design/2026-08-23_showdown-full-match-
  sofia.md:89, matches code, doc flags it as an open question for Steve, not
  yet resolved]`.
- **The opponent argues the structural opposite of the player, not a fixed
  stance.** The opening line asks "what are you two actually disagreeing
  about," and Sofia is instructed to argue the side the player did not pick, so
  political balance is achieved by construction rather than by scripting a
  fixed position. Three seed topics are offered as buttons for a player with
  nothing ready: student loan forgiveness, return to office, nuclear power
  (`content/showdown.ts`'s `TOPICS` array matches these three exactly).

## 6. `detectors.ts`: foul detection

Pure heuristic, phrase-based, no model call. Exported arrays of literal
strings/patterns: `ASSERTION_MARKERS`, `OWNERSHIP_PREFIXES`, `TRAIT_WORDS`,
`MOTIVE_PHRASES`. `detectOpinionAsFact()` flags an assertion marker
("obviously", "clearly", "it's a fact", "everyone knows" per the design docs'
description of this list). An ownership prefix ("the story I'm telling myself is,"
"in my head") does **not** clear the flag: the marker still fires, and only the
reason text changes, to "Owns it but still asserts ... as fact; the prefix does not
license a fact-claim" (`detectors.ts:137-150`). `detectJudging()` flags "you" plus a
trait-or-motive word. `runPhraseDetectors(text, activeFouls)` runs both against
whichever fouls are active for the current level and returns the first hit or null,
`PhraseHit | null` (`detectors.ts:221-224`).

This is explicitly the **fallback path**, not the primary ruling mechanism. The
primary path is model-based, through `coach.ts` -> `api/coach.ts` (`judge_turn`
for the player's own turns in the showdown, `showdown_line` for Sofia's
generated lines). `detectors.ts` runs only when the model call fails or times
out, and a code comment states it was "carried over from app-v1 unchanged."
`[unratified, src/detectors.ts header comment]` The online-edition roadmap
confirms the design intent behind this split explicitly: "Detection is
layered, not LLM-first... Judging and Opinions-as-Facts are phrase-callable
with no model call at the refereeing step." `[unratified, docs/design/online-
edition-roadmap.md:103-106]`

## 7. `pacing.ts` and timers

The entire file is two exports: `BEAT_GAP = 400` (a fixed pause in
milliseconds between successive revealed messages) and `dwellMs(text: string):
number`, which returns `Math.min(2500, Math.max(600, 22 * text.length))`, a
per-message reveal duration proportional to text length, clamped to 600-2500ms.
This governs how fast messages *appear* on screen (a typing-simulation pace,
skippable by a tap per `Dialogue.tsx`'s comments), not a deadline the player
must respond within.

Grepping the full `src/` and `src/ui/` trees for any player-facing response
countdown found none. The only other timing code is: `Composer.tsx`'s
`pauseTimer`/`PAUSE_MS`, which fires an idle-detection snapshot for revision
tracking, not a deadline; `BossIntro.tsx`'s three-second walkout countdown
before a match begins, purely presentational; and `Dialogue.tsx`'s typing
animation. None of these are the 30-second-speaker / 45-second-summarizer
timers named in the printed game's rules.

**This is a documented product decision, not an omission.** The online-edition
roadmap states it directly: "The 30-second turn clock: not in the MVP state
machine. Named here so its absence is a decision rather than an oversight."
`[unratified, docs/design/online-edition-roadmap.md:762-763]` The code agrees
with this design doc. It disagrees with the printed game's timers, which the
governing showdown spec itself frames as one of several deltas the digital
build takes from the printed rules `[unratified, docs/design/2026-08-23_
showdown-full-match-sofia.md, section 1, "What the printed game says, and what
changes"]`.

## 8. `coach.ts`: coaching selection and delivery

`COACH_TIMEOUT_MS = 6000`. Four exported functions, each a thin wrapper
around one `fetch('/api/coach', ...)` call with a matching authored fallback:
`restate()` (the perfect/flawed repeat-back demonstration in level 3),
`judgeEdit()` (grading a player's deliberately-flawed rewrite), `judgeTurn()`
(ruling on the player's own turn in the showdown), `opponentLine()` (generating
the mirroring opponent's in-character line for a scripted foul or clean turn:
Sofia in the boss match, Sung-min in the Final Showdown).
Every one of these degrades to authored, hand-written content on timeout,
non-2xx response, or malformed JSON; there is no code path where a coach call
failing blocks the player. This matches `api/coach.ts`'s own design note that a
silent fallback must under-call, never over-call, so "a player penalized by a
broken server would be right to quit" is never possible `[unratified, docs/
design/2026-08-23_showdown-full-match-sofia.md:71-72]`.

## 9. `storage.ts`: persistence

Single localStorage key: `KEY = 'humility-showdown.v1'`. One `SaveFile`
interface holds everything: per-item records (`recordItem()`), which levels are
cleared (`markCleared()`/`isCleared()`), the chosen avatar
(`getAvatar()`/`setAvatar()`), whether the player has met the coach
(`hasMetCoach()`/`markMetCoach()`). `load()`/`save()` read and write the whole
object; `reset()` clears it; `exportJson()` serializes it for the two
undocumented-by-design export paths in `main.tsx` (Ctrl/Cmd+Shift+E to
clipboard, or `window.__export()` from a browser inspector, both deliberately
invisible to a player since "the save file is the whole research corpus").
There are no accounts. There IS server-side persistence: `src/corpus.ts`
donates every answered item to a Supabase table.
`recordItem()` calls `donate(record, file.playerId)` after it saves locally, so
all five runners are covered at a single site.

**What is stored.** One row per answered item, in the `rulings` table: the local
`playerId`, the item id, the level slug, the rule, the answer text as typed, the
correctness flag, the `revisions` array, the answer timestamp, and the build's
commit sha (`VITE_APP_VERSION`, `'dev'` on a laptop). No name, no email, no
account, no IP retained by us. The `playerId` is a random local string that
identifies one browser, not a person.

**The outbox.** Rows that fail to send queue in `localStorage` under
`humility-showdown.outbox`, deliberately a different key from the save file, and
are retried on the next answered item and on the next page load. Every path
swallows its own failure: capture never reaches the player's screen and never
blocks a round.

**The key in the bundle is deliberate.** `VITE_SUPABASE_URL` and
`VITE_SUPABASE_KEY` are compiled into the client, which is what "publishable"
means. Row-level security on the table grants insert and nothing else, so that
key cannot read a row back, its own included, and cannot update or delete. The
request sends `Prefer: return=minimal` because there is no select policy to
satisfy. Reading the corpus is a service-role job run from a laptop with a key
that never enters the bundle. RLS, not secrecy, is what makes the shipped key
safe.

**Duplicates.** Delivery is best effort rather than at-most-once, so the table
carries a unique index on player, item, and answer time, and a 409 is treated as
success because a 409 means the row is already home.

Accounts remain future work: the infrastructure-plan design doc names
Supabase-backed accounts as not built here (section 13), and that is still true.
An insert-only corpus table is not an account system.

## 10. AI and model integration

**Client side (`src/coach.ts`).** Calls the same-origin path `/api/coach` with
a JSON body carrying a `task` field. 6-second client timeout, falls back to
authored content on any failure.

**Server side (`api/coach.ts`).** `export const config = { runtime: 'edge' }`
(Vercel Edge Function). `MODEL = 'claude-haiku-4-5-20251001'`.
`UPSTREAM_TIMEOUT_MS = 5000`. Calls `https://api.anthropic.com/v1/messages`
directly (no Anthropic SDK dependency in `package.json`; this is a raw
`fetch`), with the request header `x-api-key` sourced from
`process.env.ANTHROPIC_API_KEY` (name only; the value was never read or
reproduced while writing this document). `handler(req)` dispatches on
`body.task` across five tasks: `restate_perfect`, `restate_flawed`,
`judge_edit`, `judge_turn`, `showdown_line`. Each has its own prompt builder in
a `PROMPTS` object plus a shared `HOUSE` style-constraint suffix appended to
every prompt. Responses are parsed with `parseJson(raw)`; when the model
returns prose instead of JSON, the handler under-calls rather than erroring
(for example `judge_edit` returns `{pass: true, text: raw}`, `judge_turn`
returns `{foul: null, text: raw}`). Missing key or unreachable upstream returns
HTTP 503/502, which the client treats as a fallback trigger, not a crash.

**Local development.** `vite.config.ts`'s `coachDevApi()` plugin loads
`ANTHROPIC_API_KEY` for `npm run dev` in this documented order: the
`ANTHROPIC_API_KEY` environment variable, else the first
`ANTHROPIC_API_KEY=` line of a file at
`DEFAULT_KEY_FILE = '/Users/stevefranconeri/Documents/Claude/Projects/point-
taken-biz/api-keys/claude-api-key.env'`, overridable by a `HEART_KEY_FILE` env
var. **That default path is inside `point-taken-biz/api-keys/`, which is
off-limits under this document's own security rules; only the path and the
variable name are recorded here, and the file's contents were never opened,
read, or reproduced.**

**Failure behavior, end to end.** Every layer degrades: no key configured ->
503 from the Edge Function -> client falls back to authored content -> the
game remains fully playable. The showdown design spec confirms this actually
happened in practice: "As of tonight the shared key returns 401
(`HEART-T260823-29`), so the match runs entirely on fallbacks. It is playable
that way and was verified that way." `[unratified, docs/design/2026-08-23_
showdown-full-match-sofia.md:116-118]` Offline is a fully supported state, not
a degraded one, by design.

## 11. The `api/` surface and PDF generation

`api/` contains exactly one file, `coach.ts` (section 10). There is no other
server-side route in this repo and no auth API. The corpus write in section 9
does not go through `api/`: the client posts to Supabase's PostgREST endpoint
directly, which is why the database exists without a route here to show for it. `middleware.ts` is Edge
Middleware (not under `api/`) that gates every request behind HTTP Basic Auth:
`process.env.SITE_PASSWORD` compared against the request's Basic Auth header,
fail-closed if the variable is unset ("This prototype is closed. No
SITE_PASSWORD is configured on the deployment"). The middleware's route matcher
excludes only Vercel's own internal `_vercel` paths, so `/api/coach` is also
behind this gate.

PDF generation: `pdf-game/` is an empty placeholder as of the last verified
read of its `README.md` (2026-08-26); the normative print card content lives
outside this repo's build path, in `docs/cards.md` per that same README, and in
`docs/reference/print/v6/` and `v7/` per header comments in
`src/content/cards.ts`. There is no build-time or runtime PDF generation code
inside `game/` today. `GAP: what does npm run export:script's markdown output
feed into for actual print production, and is there a separate print-only
pipeline outside this repo.`

## 12. Architectural decisions and rationale

- **Solo player versus one AI opponent, not the printed 3-player game.** The
  README states the product directly: "Three training levels teach one foul
  each, then a fourth level plays a full match against an AI opponent using all
  three." `App.tsx`'s `Agreement` component carries a code comment making the
  departure from print explicit: "the tagline is rewritten, since the printed
  one says '3-player game' and this is one player against the house."
- **Two separate runners (table-walk for training, linear async script for the
  showdown) instead of one shared state machine**, because a fixed 12-turn
  match "written as steps ... becomes a state machine nobody can read"
  `[unratified, src/showdown.ts]`.
- **Tokens move, never burn.** Enforced by construction: every foul transfers a
  fixed amount between the two purses rather than deducting from a pool, so the
  two totals always sum to 14.
- **Detection is layered: cheap phrase rules first, model second, and the
  model is a backstop for the ruling, never the sole ruling authority.** This
  mirrors `heart-soul.md`'s constraint (cited in the roadmap, not itself read
  for this document) that a high-precision truth-adjudicating classifier is
  undesirable because it would replace the lesson with an authority.
  `[unratified, docs/design/online-edition-roadmap.md:456-460]`
- **Every model call has an authored fallback, and offline is a first-class,
  fully playable state**, not a degraded one, verified in practice during
  development against a dead API key.
- **Deterministic, authored opponent behavior throughout.** Sofia's foul
  schedule is fixed and known in advance ("a player who replays the match
  should be able to beat her by knowing her" `[unratified, docs/design/2026-08-
  23_showdown-full-match-sofia.md:77-78]`); the avatar picker's only randomness
  is presentation-layer shuffling of which face sits where, never which face is
  available, and it explicitly never affects game state (`avatars.ts`:
  "everything else in the build stays deterministic").
- **Political balance by structure, not by editorial control.** The AI
  opponent always argues the side opposite whatever the player chose, so
  neutrality is a mechanical property of the match rather than a fixed
  scripted stance requiring case-by-case review.
- **HTTP Basic Auth gates the entire deployed site**, including the API route,
  fail-closed if unconfigured, because this is an internal prototype, not a
  public release.
- **The API key never reaches the browser.** All model calls proxy through the
  Vercel Edge Function; the client only ever talks to same-origin `/api/coach`.
- **No StrictMode.** `main.tsx`'s comment: "the beat runner is a sequence of
  timed side effects, and StrictMode's double-invoke in dev emits every
  scripted line twice."
- **Training and boss encounters are visually and structurally distinct rooms
  (`Drill` stepper versus `Thread` chat) sharing the same underlying engine**,
  per an embedded 2026-08-25 ruling from Steve quoted in `App.tsx`, because
  presenting a coached drill and a boss fight identically had proven confusing
  in testing.

## 13. Intended but not built

Per the online-edition roadmap (`docs/design/online-edition-roadmap.md`), which
describes intended architecture only, cross-checked against what section 4-11
above confirm is actually in `game/`:

Two things the design docs list as unbuilt are in fact shipped, so they are not
on this list: the referee and Final Showdown runners (`src/referee.ts`,
`src/final.ts`, both wired into `App.tsx`'s `Screen` union and reachable from
level select, sections 2 and 4), and the coach as a distinct third role
(`src/coach.ts`, `api/coach.ts`). How the three referee and final rungs map onto
the design doc's original level numbering, and whether a "judge" role exists at
all, is the section-4 `GAP:` above.

- **Supabase-backed accounts, shared login with Brain, server-authoritative
  writes.** The infrastructure-plan doc (`2026-08-23_infrastructure-plan.md`)
  specifies a full plan: a separate `point-taken-heart-app` Next.js repo, its
  own Supabase project, a shared auth-only project across Brain and Heart, and
  Resend email. **None of this exists in `game/`.** The current build has no
  Next.js, no Supabase client dependency, and no auth of any kind beyond the
  site-wide Basic Auth password. It does persist server-side, but only the
  corpus: `src/corpus.ts` inserts answered items into a Supabase table over
  PostgREST under insert-only RLS (section 9). That is one table and no
  identity. Accounts, shared login, and server-authoritative writes remain the
  single largest design-doc-versus-code gap in this document.
- **Streaming model responses into the transcript.** The infrastructure plan
  calls for streaming Anthropic responses token-by-token (section 6, "Heart's
  typing indicator and transcript want token-by-token"). The current
  `api/coach.ts` returns a single complete JSON/text response per call; there
  is no streaming response handling anywhere in `coach.ts` or `api/coach.ts`.
- **A 30-second turn clock**, named in the roadmap as designed-but-deferred for
  live play, not accidentally missing; it does not exist in `showdown.ts` or
  `engine.ts` today, consistent with the roadmap's own framing. **There is no
  formal `AWAITING_CONTEST` phase and none is intended: it is retired**
  `[ruled]`, per the Steve/Nathan call recorded in
  `game/docs/roadmap.md` §8. AI foul flags route
  only to the wronged party; the accused never sees one and never gets a vote,
  so there is no second opinion to contest and no phase to build.
- **The Family Pack (beats 7-8, four additional foul types)** is explicitly
  "designed, not being built" per the roadmap, and no trace of it (types,
  content, or UI) exists in `src/`.

## 14. Known risks and gaps

- `GAP: is there a vercel.json or equivalent deploy config anywhere, and what
  routes/redirects does the live deployment use beyond the default Vite output
  and the one Edge Function.`
- `GAP: what does npm run export:script's markdown output feed into for actual
  print production, and is there a separate print-only pipeline outside this
  repo.`
- **Sofia breaks her own "never foul twice in a row" rule in round 3, and this
  is a known, named, unresolved question**, not a silent bug: the governing
  design doc flags it and leaves the final call to Steve
  (`docs/design/2026-08-23_showdown-full-match-sofia.md:89-93`), and the code
  currently ships with the rule broken so all three foul cards can appear in
  one match.
- **The README's composer-state list is stale.** `README.md` lists five
  composer states (locked, buttons, prefilled, free, continue); `types.ts`'s
  actual `ComposerState` union has seven, including `call` and `template`,
  both of which are actively used in `showdown.ts` and `Composer.tsx`.
- **The README's showdown topic list does not match the code.** The README's
  prose names five topics including "crypto regulation" and "minimum wage";
  `content/showdown.ts`'s literal `TOPICS` array has exactly three: student
  loan forgiveness, return to office mandates, nuclear power. The code is what
  ships.
- **Level gating is client-trust only**, per the roadmap's own warning applied
  to this codebase: progression lives in `localStorage` with no server-side
  check. The corpus table does not help here, because it is insert-only and the
  client cannot read it back. Acceptable for a single-player prototype; becomes a real hole the
  moment any competitive or scored multiplayer mode exists.
- **Political-balance imbalance is a known, ruled-on gap, not an oversight.**
  Per `README.md`: "Steve's ruling of 2026-08-24 allows the prototype to ship
  to the internal playtest imbalanced; it has to be corrected before anything
  goes out publicly (see `HEART-T260823-33`)."
- **Zero automated tests.** No test runner is even a devDependency in
  `package.json`. The roadmap names the state machine and token arithmetic as
  the two things most worth covering first, because both "silently produce
  wrong numbers rather than crashing." That risk applies unchanged to the
  current `showdown.ts`/`content/showdown.ts` token logic.
- **The shared model key has previously returned 401 in practice**
  (`HEART-T260823-29`, cited in the showdown design spec), confirming the
  fallback path is not merely theoretical; it has already been the only path
  running in at least one verified session.

## Confirmation

No secret value (API key, password, or token) was read, displayed, or
reproduced while researching or writing this document. Only variable names
(`ANTHROPIC_API_KEY`, `SITE_PASSWORD`, `HEART_KEY_FILE`) and file paths
(including `point-taken-biz/api-keys/claude-api-key.env`, referenced by path
only, never opened) appear above.
