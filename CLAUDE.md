# CLAUDE.md — PT Heart / Humility Showdown

Written 2026-09-04 as a handoff. The design work for the gym level-system rebuild
was done in a long chat that ran out of context. Everything that thread decided is
either in this file or in `docs/gym-rebuild/`. **Nothing has been built yet.** The
working tree at the time of writing is the pre-rebuild code.

The current job: **rebuild the gym level system, levels 1 through 5.**

---

## 0. Where things are

| Path | What it is |
|---|---|
| `docs/gym-rebuild/rulings.md` | **Read this first.** Nathan's rulings on all 32 design questions. Binding. |
| `docs/gym-rebuild/questions.md` | The 32-question design doc the rulings answer. Context for *why* each question was asked. |
| `docs/gym-rebuild/learner-report.md` | Playtest report from five AI learners who played the current gym cold. The evidence base. |
| `docs/gym-rebuild/walkthrough.md` | Beat-by-beat notes on the current levels. |
| `docs/gym-rebuild/learner-brief.md` | The brief the five learners were given. |
| `docs/soul.md` | Governs everything. Can veto a mechanic. Change only where a ruling requires it. |
| `docs/rules.md`, `docs/roadmap.md`, `docs/cards.md`, `docs/script.md` | The rest of the design record. Stale in places; see §7. |

**Precedence:** `soul.md` > the teaching-sequence doc > the level build table >
the online-edition roadmap. **Above all of them, on what is true today, sits the
code.** And above all of that, for this rebuild, sit Nathan's rulings in
`docs/gym-rebuild/rulings.md` — he explicitly ruled (Q30) that his directions
override `rules.md` and the other docs freely.

---

## 1. The game

**Humility Showdown** (called PT Heart in the docs). Two editions:

- **Print** — a physical deck. Exactly three players: A and B disagree, C referees
  and never argues. Three listen-and-summarize rounds, then one Final Showdown
  round. Seven tokens per disputant, fourteen on the table, the referee holds none.
- **Online** — splits into **Gym** (solo, one human against AI; all shipped code
  is here) and **Live play** (two humans moderated by an AI coach; **none built,
  out of scope**).

**A round** (`rules.md` §5): A gives their view ("The way I see it is…") → B
summarizes ("What I heard is [x]… did I miss anything?") → **A answers, and that
answer is the ground truth for Fake Listening** → roles switch and mirror. The
summary is a gate, not a courtesy.

**Three fouls only** (`FoulType`): `judging`, `opinion_as_fact`, `fake_listening`.

**Token economy:** 14 on the table, 7 a side (`START_TOKENS = 7`). A foul **moves**
a token, never burns one; purses always sum to 14. Nathan's rulings: **no half
tokens anywhere, no instant loss at zero, no negatives, Judging costs 2.**

### The ruling that never moves — `soul.md` §6

> "Did I foul?" has exactly one correct answer: **did the other person feel fouled?**

Software never decides a foul happened. It flags a candidate cheaply, then routes
the call to the possibly-wronged human. **Do not improve the detector's precision.**
False positives are expected and collected — they are the corpus.

**Q7 adds one carve-out, and it must be written into `soul.md`:** inside the gym,
the boss's ruling is a scripted answer key, not a judgment. One line, nothing more.

**Steve's note on foul calls, which supersedes a narrow reading of §6:**
> "Ref OR offendee can suggest, 'offendee' always is the final decider. 90% of
> time the ref suggests (it's faster on the buzzer) and the offendee just clicks
> 'yes/no' click to make it easy, but always a text entry on that dialogue in case
> they want to say something."

So a **confirm dialogue (yes / no / free text) is a core component in every level,
both seats,** with an authored no-API-key path. The AI referee must be wrong
sometimes; denying it must be free and acknowledged.

### Other standing design principles

- **Coach = moderator, one entity.** A thread holds at most three parties. No
  separate referee character. Inside the gym the coach holds the judge seat.
- **Teach by delta** `[ruled]` — never ship a bad example without its repair beside it.
- **Reform the boss, do not deplete the boss.** A foul called correctly retires
  that habit for the rest of the match.
- **No modals, no toasts, no score popups, no confetti anywhere in the gym**
  `[ruled]`. Feedback is the coach's words changing and nothing else.
- **Screen skin is fixed** `[ruled]`: light striped ground, teal, orange, gold,
  Baloo 2 + Nunito. No dark mode.
- **Save by slug, never by number** `[ruled]` (Steve, 2026-08-23).
- **Determinism.** "No randomness anywhere in this build: two players comparing
  notes have to see one game" (`avatars.ts`). The only allowed randomness is the
  avatar picker shuffle, which is presentation only.
- **Political balance is non-negotiable and currently in debt** (`HEART-T260823-33`).
  Each level file carries a balance-ledger comment. Q29: keep it accurate; Nathan
  reviews it in the PR.
- **Deep canvassing** (Broockman & Kalla, *Science* 2016) is the intellectual
  ancestor of the three cards: arguing moves nobody, but getting a person to recall
  a personal experience that produced the same emotion produces durable change.
  Q14/Q16: it may be used **only when framed as opinion**, never as a fact that
  settles the question.

### Status markers used in the docs

`[ruled]` · `[ruled, Nathan]` · `[ruled, Nathan; Steve's confirmation outstanding]` ·
`[unratified]` · `[vibecoded]` · `GAP:` (deliberately blank — do not guess).

---

## 2. The ladder — RULED, seven levels, player-first

| # | Seat | Content | In scope now? |
|---|---|---|---|
| 1 | player | Judging | **yes** |
| 2 | player | Opinions as Facts | **yes** |
| 3 | player | Fake Listening | **yes** |
| 4 | referee | full round, all three cards — introduces the ref role and 3-player play | **yes** |
| 5 | player | the Showdown — BASE GAME COMPLETE, live play unlocks | **yes** |
| 6 | referee | the Final Showdown | deferred |
| 7 | player | the Final Showdown — full game unlocks | deferred |

Binding sub-rulings:

- **L1–L3 ignore the presence of a referee entirely.** The word, the role and the
  three-player structure are all withheld until L4.
- **L4 (and later L6) must open by telling the player they learn as ref first and
  play it themselves next**, so the sequence is legible while they are in it.
- The Final Showdown is an **add-on**. The game is complete and playable without it.
- **Build levels 1–5 only.** 6 and 7 come after.

Planned slugs (new, per Q28 — old saves must not collide):

- L1 `about-the-argument`
- L2 `my-opinion-not-a-fact`
- L3 `the-summary-gate`
- L4 `in-the-ref-seat`
- L5 `the-showdown`

---

## 3. Every ruling, condensed

Full text in `docs/gym-rebuild/rulings.md`. This is the working index.

**A. Shape**
- **Q1/Q2** Player-first, seven levels, ref-then-player for both showdown pairs. (Table above.)
- **Q3** No free play in this build. No "Play a round", no "Referee a round", no live play. **The level system and nothing else.**
- **Q4** The Level-0 conduct agreement is **cut** — it moves to signup. ⚠️ **The `Agreement()` component in `App.tsx` is *both* the conduct gate and the app's front page. Cutting the gate must not delete the front page.**
- **Q5** Separate main-menu page: live play OR the level system. Live play gated behind L5; live-play-with-Final-Showdown behind L7. Not built here — a locked placeholder row only. Clearing L5 must still feel different from clearing L4.

**B. Core mechanic**
- **Q6** The opponent answers "did I miss anything?", **authored per beat, no model needed**. **No redo, ever.** One check; the offended party briefly explains what the summary missed; the summarizer gets no second attempt.
- **Q7** In the gym the boss's ruling is a scripted answer key. **Write the one-line carve-out into `soul.md`.**
- **Q8** The referee **does** call Fake Listening. The offended player then votes yes or no — whether the ref is AI or human.
- **Q9** **Delete every half-token amount.** No `MISS_COST = 0.5`, no `6½`, no `formatTokens`. A level may cost zero tokens; if it costs tokens, it costs the normal amount.
- **Q10** **Unify Judging at 2 everywhere.** The card is the source of truth.
- **Q11** **No instant loss at zero** (Nathan overrules Steve). Players keep playing and can climb back. **Players cannot go negative.** Fix `rules.md` to match.
- **Q12** No retries. See Q6.

**C. Teaching content**
- **Q13** Retitle L1 to **"About the argument, not the person"** and add a beat covering mind-reading / verdicts-on-character. The word "you" becomes one tell of two.
- **Q14** Rewrite the L2 diner beat. When the good version is shown, **someone must say out loud that it is a personal experience, not a fact** — the coach, or the line itself. It stays a positive example.
- **Q15** The player **does** get summarized. A beat in the Fake Listening level where the boss summarizes the player badly and the player rules on it.
- **Q16** Drill the personal-experience move inside an existing level, **carefully**: a story is a tool, and it must always be framed as an opinion, never as a fact that settles the question for everyone. **The framing is the lesson.**
- **Q17** Every level ends with **one unscaffolded sentence** the player writes themselves — checked loosely, never rejected outright.
- **Q18** Standard boss shape: every boss gets **at least one clean line** (so the player must decline to call at least once) and **a scripted concession** when their habit is retired.
- **Q19** Level 3 rebuilt as a full round, open book. **The Fake Listening card IS played against the player when their summary misses something** — cards work in both directions. **No token penalty. Never forced when the summary was clean.**

**D/E. UI/UX**
- **Q20** Level rows get a **replay** option. **No stats** — no tokens, no foul counts. If the title doesn't already say it, add a line naming the rule learned, identical for everyone who finished.
- **Q21** One end-of-level review screen: the card, its `trains` line, what you did. No score, no confetti, no modal.
- **Q22** The card-tap gesture is taught **in Level 1**: one gesture plus one coach line (the agreement screen that used to do this is gone).
- **Q23** **The gym is open book.** The conversation scrolls; the player can read back. Reason: better to keep the reps at summarizing than to risk failure on memory. *Nathan flagged this as the one item he wants Steve to rule on later.* **Apply uniformly.**
  - KNOCK-ON: the docs' claim that the thread's forgetfulness is load-bearing for Fake Listening is now **wrong** and must be corrected in the same PR.
  - KNOCK-ON: `Thread.tsx` fades old lines by position — that has to go or become purely cosmetic.
  - KNOCK-ON: `engine.beginBoss()` wipes the thread; reconcile with open book.
- **Q24** No change to the composer.
- **Q25** **Remove all clock mentions from the online edition.** Permanent for the level system. A timer may return later for live play, which is out of scope. (Known sites listed in §7.)
- **Q26** Vocabulary: **"foul" for the act, "card" for the object. Nothing else.** "Habit" survives only in a boss's mouth about themselves.
- **Card placement** Cards on the bottom. **Ref avatar and ref rulings at the top.** Steve's 2026-08-25 placement stands; no conflict.
- **UI extra 1** The current build does not fit a laptop screen at 100% zoom — Nathan runs it at 75%. Likely cause `--dlg-h: 34rem` (544px) stacked with header + rail + composer. **Vertical budget must fit ~700px of viewport.**
- **UI extra 2** Live play's style will be a message conversation between two people with the ref at the top, able to play cards. **The level system UI should move closer to this.**

**F. Scope and process**
- **Q27** Restructure, don't rewrite. Keep `cards.ts`, the coach's voice, the drill stepper, the thread, the rail. **Scale the coach's voice back** to remove confusing lingo and invented terms the player has to learn.
- **Q28** New slugs for rebuilt levels; bump storage to `humility-showdown.v2`.
- **Q29** Keep the political-balance ledger accurate; Nathan reviews in the PR.
- **Q30** Docs update in the **same PR**. Nathan's directions override `rules.md` and the other docs freely. **Be careful with `soul.md`** — change it only where a ruling requires it (currently: Q7's carve-out only).
- **Q31** Branch name includes "Nathan". Current branch: `NathanGymLadderRebuild`.
- **Q32** Build order as proposed (see §6).

**Late rulings (Nathan's final go-ahead message)**
- Levels **1–5 only**; 6–7 after.
- `rules.md:219` is stale — correct it in the PR.
- **The token counter stays visible in L1–L3**, and the levels must **explain that a mistake would normally cost a token**, so the no-penalty period reads as a learning allowance and the real cost is not a surprise at L4/L5.
- Apply open book uniformly.

---

## 4. Stack and hard constraints

- Vite 7, React 19.2, TypeScript 5.7 strict. One serverless function `api/coach.ts`
  pinning `claude-haiku-4-5`. Dev port **5273**.
- **No React StrictMode.** The beat runner is timed side effects; a double invoke
  emits every scripted line twice.
- **The whole game must be developable and testable with no API key.** Every
  model-backed line has an authored fallback (6s client / 5s server deadline).
- **There are no tests.** `_driver.js` is a gitignored local harness:
  `window.__mk(levelIndex, buttonAnswers, texts)`.
- `localStorage` key `humility-showdown.v1` → **bump to `.v2`**. Corpus export via
  `Ctrl/Cmd+Shift+E` or `window.__export()`. Level gating is localStorage-trust only.
- **First thing in a fresh clone/session: `npm install`.** `node_modules/` is not in the
  working tree as of 2026-09-04, so `npm run build` fails with `sh: tsc: command not found`
  until it is installed. That error means "no deps", not "broken code".
- **`npm run build` (which runs `tsc --noEmit` first) must pass before every commit.**
- Git commit messages end with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
  PR descriptions end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- **Anything under `docs/` reaches `main` through a pull request, not a direct push.**
- Push to a branch with **"Nathan"** in the name so Steve can test without
  overriding what exists.
- The GitHub MCP server is not authorized in these sessions. Read GitHub docs from
  the local clone; use the `gh` CLI for PRs, or leave the PR to Nathan.

---

## 5. Code map — verified line anchors (as of 2026-09-04, pre-rebuild)

### `src/types.ts` (182 lines) — first edit target
`FoulType` / `Lane` / `Message` / `TemplateSegment` / `ComposerState` (variants
`locked`, `buttons`, `call`, `prefilled`, `free`, `template`, `continue`) /
`Revision` / `ItemRecord`. Step interfaces are module-private and join the exported
union: `SayStep | CardStep | CallOrPassStep | SortStep | EditStep | FreeStep |
ModelStep | ContinueStep`. `Beat { name; steps; boss? }`, `PrefightStep`,
`LevelDef { slug; title; teaches; rule; boss; bossEmoji; bossEpithet; prefight; beats }`.

**Confirmed gaps to close:**
- `ComposerState.template` is produced by **no** Step kind — `TemplateComposer` in
  `Composer.tsx` is complete and working; only a `template` Step kind is missing.
- There is **no** yes/no-plus-free-text vote step kind. Q8 and Q19 both need one.
- `CallOrPassStep.rule` is a single `FoulType`; L4/L5 need all three callable.
- `LevelDef` has no field for which cards the rail enables.

**Planned additions:** step kinds `template` and `confirm` (yes/no + free text, new
`ComposerState` variant); `CallOrPassStep.callable?: FoulType[]`;
`LevelDef.cards: FoulType[]` and a `seat` marker for the referee level.

### `src/engine.ts` (530 lines) — primary edit target
```
 29  function isItem(step: Step): boolean      // new interactive kinds MUST be registered here
176  setMessages([{ id, lane: 'crowd', text: crowdRow(0) }]);  // beginBoss() wipes the thread — Q23 obstacle
273  callable: [step.rule],                    // HARDWIRED one-card rail #1 (runner)
348  transfer('player', 1);                    // Q10: must become CARDS[rule].cost
386  if (clean) transfer('opponent', 1);       // Q10: same
408  callable: [step.rule],                    // HARDWIRED one-card rail #2 (retry path)
506  default:                                  // a new interactive kind silently no-ops here
```
`CARDS` is already imported at line 25, so the Q10 fix needs no new import.
Other structure: `tooThin()`, `THIN_REPLY`, `CARD_BEFORE_PAY_MS = 950`, the `Gym`
interface, the `flat`/`seq` identity memo, `purse = useRef({player: START_TOKENS,
opponent: START_TOKENS})`, `transfer()` (**already Q11-correct**: clamped, never
negative, always sums to 14), `dwell`/`say`/`after`, the boss gate
(`if (beat?.boss && cursor === firstOfBeat && !bossShown.current)`), `chargeMiss()`
(one token once, however many tries), and `submit()`'s switch over `call_or_pass` /
`sort` / `free` / `edit`.

### `src/App.tsx` (525 lines)
```
 23  | { name: 'agreement' }
 29  const seen = Object.keys(load().cleared).length > 0;
 31  seen ? { name: 'select' } : { name: 'agreement' },
216  "Three levels, each one habit and one opponent. Then all three at once, for tokens."  // Q26/Q13 violation
251  className={`level-card level-card-boss${allCleared ? '' : ' is-locked'}`}  // hand-written row outside LEVELS.map
425  enabled={[level.rule]}                    // one-card rail; L4/L5 need three
457  fightNumber={4}                           // hardcoded
```
`Agreement()` is **both** the Q4-cut conduct gate **and** the front page: `<Mast />`,
italic tagline, `<blockquote className="front-quote">`, `CARD_ORDER.map(...)`, two
`front-clause` paragraphs, and the "I'm in" button. A comment warns: *"Two clauses.
Steve cut the other two on 2026-08-23. Do not reintroduce them."*
Helper: `function liveCards(kind: string, callable?: FoulType[]): FoulType[] | null
{ return kind === 'call' ? (callable ?? []) : null; }`.
`Room()` has `const railLive = inBoss || !drillBehind;`.

### `src/storage.ts` (135 lines) — the `.v2` bump is exactly four coordinated edits
```
11  const KEY = 'humility-showdown.v1';
14    version: 1;      // SaveFile literal type
30    version: 1,      // blank()
45    if (parsed.version === 1) {   // load() guard
```
`SaveFile` also carries `playerId`, `cleared: Record<string,string>`,
`items: ItemRecord[]`, `avatar?`, `metCoach?`. Exports: `load`, `recordItem`,
`markCleared`, `isCleared`, `getAvatar`, `setAvatar`, `hasMetCoach`, `markMetCoach`,
`reset`, `exportJson`.

### `src/content/index.ts` (14 lines) — the ladder's source of truth; header is stale
```ts
// The ladder, in play order. MVP is ship levels 1 to 3.   <- stale
export const LEVELS: LevelDef[] = [level1, level2, level3];
export function levelBySlug(slug: string): LevelDef | undefined { ... }
```

### `src/content/showdown.ts` (288 lines) — four ruling violations
```
 31  export function formatTokens(n: number): string {                    // Q9 DELETE
210  '...Three rounds, both of you on the clock, all three cards live.'   // Q25
211  '...half a token crosses anyway. Empty and you're done...'           // Q9 + Q11
225  /* ...A miss costs half a token... */                               // Q9 doc comment
229  `...takes ${formatTokens(cost)} of yours for the miss.`             // Q9
244  '...That is paid for. The summary still has not been done. Do it again.'  // Q6/Q12 no redo
246  `End of the round. You ${formatTokens(p)}, her ${formatTokens(s)}.`  // Q9
250  bankrupt: 'You are empty. That ends it, whatever the round said.'    // Q11
258  bankruptHer: 'She is empty. That ends it right there.'               // Q11
```
Also `SHOWDOWN_SLUG = 'full-showdown'` (needs a new slug), `SOFIA_EMOJI`,
`START_TOKENS = 7`, `foulCost()` (**already Q10-correct**), `RULE_LABEL`/`RULE_GLOSS`/
`TOPICS`, and `TURNS` — 12 turns with ids all `l4-*` prefixed (stale once renumbered
to level 5). Sofia's foul schedule is fixed: `l4-r1-sofia-speak` → `opinion_as_fact`;
`l4-r3-sofia-summary` → `fake_listening`; `l4-r3-sofia-speak` → `judging`. Round 3
has two adjacent fouls — a documented deviation, kept on purpose.

### `src/showdown.ts` (549 lines)
```
 43  formatTokens,                       // import dies with Q9
 56  const MISS_COST = 0.5;              // Q9 DELETE
306  const bankruptCheck = async (): Promise<boolean> => {  // Q11 DELETE
308  await end('loss', COACH.bankrupt);
315  await end('win', COACH.bankruptHer);
405/415/421/484  if (bust && (await bankruptCheck())) return;
413  const { moved, bust } = transfer('player', MISS_COST);
521  `Three rounds. You ${formatTokens(p)}, her ${formatTokens(s)}.`
```
Also: attempt ceilings at `:433` (three attempts then move on) — under Q6/Q12 there
are no retries at all, so this comes out.

### `src/ui/Thread.tsx` (184 lines) — Q23 target
Scroll pinning is already correct (unpinning only counts when a wheel or finger did
it). **The kill target is lines 116–117:**
```tsx
const back = messages.length - 1 - i;
const age = back <= 2 ? 'now' : back <= 5 ? 'recent' : 'old';
```
Positional, not semantic. Under open book this must go or become purely cosmetic.
Also: `toBottom()` sets `scrollTop = scrollHeight`; `land()` via
`useImperativeHandle` is called from Composer's **layout** effect; a 400ms re-land
timer; a `ResizeObserver` backstop; crowd rows render
`<div className="crowd" aria-hidden="true">` with no bubble/face/name;
`const faceless = m.isSpecimen && m.lane === 'coach';`; class list
`msg msg-{lane} msg-specimen msg-take msg-card msg-call`; **a `card` message renders
`<RuleCardMini rule={m.card} />` instead of the body — its `text` is never displayed.**

### `src/ui/RuleCards.tsx` (247 lines)
Header records Steve's 2026-08-24 ruling that the printed cards are the teaching and
must stay on screen. Two jobs: reference on tap, and **pressing a card IS calling
that foul**. "The tray sits at the bottom of the screen, under the thread and the
composer" — this already matches Nathan's card-placement ruling, so **no change is
needed for placement**.
```tsx
interface Props { enabled: FoulType[]; live: FoulType[] | null;
  onCall?: (foul: FoulType) => void; pass?: { label: string; onPass: () => void }; }
const on = enabled.includes(rule);
const callable = on && Boolean(live?.includes(rule));
const dim = !on || (live !== null && !callable);
```
The `rail-slot` wrapper exists so a **disabled** chip can still show its `rail-tip`
hover preview via CSS on the ancestor. `RuleCardMini` = the printed short card.
`RuleCardFull({ rule, full })` renders the printed face slot-for-slot against
`docs/reference/print/v7/card-anatomy.md`; the penalty glyph is
`'\u{1F64F}'.repeat(card.cost)` — **Judging-at-2 already renders correctly from
`cards.ts`**; only the engine's hardcoded `1`s are wrong.

### `src/ui/Drill.tsx` (199 lines) — the stepper; owns the "on the table" strip
A pure cursor into the engine's message list:
`const i = Math.min(cursor, Math.max(0, last)); const behind = i < last;`
`onBehind` is held in a ref (`tell`) so a parent re-creating it every render doesn't
cause an every-render effect; unmount reports `false`. Auto-skips past the player's
own echo via `lastPlayer`, so "Next is now only ever the coach talking."
```tsx
const tableIdx = (() => {
  for (let n = i; n >= 0; n -= 1) { if (messages[n]?.isSpecimen || messages[n]?.isTake) return n; }
  return -1;
})();
const table = tableIdx >= 0 && tableIdx !== i ? messages[tableIdx] : null;
```
`const tone = m.isCall ? 'call' : faceless || m.lane === 'crowd' ? 'table' : m.lane;`
Dialogue is always `compact`. The foot shows `Next` + `${last - i} more` while
behind, else the composer.

### Level content
- `src/content/level1.ts` (218 lines) — `slug: 'the-word-you'`, `title: 'The word "You"'`,
  `teaches: 'Judging'`, `rule: 'judging'`, `boss: 'Verdict Victor'`. Header carries the
  political-balance ledger (4:0 against forgiveness in the judging column, 3:1 in the
  argument column, `HEART-T260823-33`). **Line 65 is a Q25 clock target:** *"That's
  Verdict Victor. You're in with him in two minutes."*
- `src/content/level2.ts` (271 lines) — `slug: 'in-my-head-because'`, boss Obvious Olivia.
  **Line 43 is a Q25 clock target:** *"Two minutes. One habit…"*. The diner beat
  `l2-3c-i4` whistles the deep-canvassing move (Q14 rewrite). Olivia has two
  `expected:'foul'` items, **no clean line and no concession — two Q18 violations**.
- `src/content/level3.ts` (180 lines) — `slug: 'did-i-miss-anything'`, boss Nodding Noemi.
  The Q19 total-rebuild target: currently "a cutscene with a QTE", and the Fake
  Listening card is never pressed in the level that teaches it.
- `src/content/cards.ts` (266 lines, binding) — *"Do not invent new bad examples here"*
  **binds `cards.ts` only**; level files already author their own specimens. Judging
  `cost: 2` / `DOUBLE PENALTY`; the other two `cost: 1`.
  `CARD_ORDER = ['judging','opinion_as_fact','fake_listening']`.

### Other
- `src/ui/Composer.tsx` (422 lines) — `PAUSE_MS = 900`; `state.kind === 'call'` renders
  only the hint (pass moved to the rail); **`TemplateComposer` is complete and working**;
  chip semantics are encoded in capitalization: `const isOpener = (c: string) => /^[A-Z]/.test(c);`
- `src/avatars.ts` (116 lines) — `COACH_NAME = 'Coach Ray'`, nine `TILES`,
  `DEFAULT_AVATAR = PLAYER_AVATARS[6]`, `crowdRow(n) = CROWD_ROWS[Math.abs(n) % 4]`.
- `src/styles.css` — `:1-60` has `--dlg-h: 34rem` (≈544px), the identified cause of the
  app not fitting a laptop viewport at 100%. Other vertical ceilings: `:421 max-height:
  50vh`, `:656 32vh`, `:806 44vh`, `:589 .composer-locked min-height: 3.9rem`,
  `:1263 min-height: var(--dlg-h-text)`. `:385-387 .tok-half` clips a half-token glyph —
  **dead under Q9, delete**.
- Unread in full at handoff time: `src/showdown.ts` body, `src/ui/Header.tsx`,
  `src/ui/Prefight.tsx`, `src/ui/BossIntro.tsx`, `src/ui/Mast.tsx`, `src/coach.ts`,
  `src/detectors.ts`, `src/pacing.ts`, `src/main.tsx`, `src/styles.css` body.

---

## 6. Build order (Q32, amended to levels 1–5)

1. **Ladder scaffold** — five rows, no agreement gate (**keep the front page**),
   replay option (Q20), locked/cleared states, a live-play row gated behind L5 as a
   non-functional placeholder. Bump storage to `.v2`. Fix `content/index.ts`'s header.
2. **Q6/Q7 mechanic** — "did I miss anything?" gets an authored answer per beat; the
   confirm dialogue (yes / no / free text) lands as a real step kind; add the §6
   carve-out line to `soul.md`.
3. **Level 3 rebuilt** as a full round (Q19: open book, card playable against the
   player, no token penalty, never forced on a clean summary; Q15's bad-summary beat).
4. **Levels 1 and 2 retitled and repaired** — Q13 title plus the mind-reading beat;
   Q14 diner rewrite; Q16 story-as-opinion drill; Q18 clean line and concession for
   Olivia; the token-counter explanation for the no-penalty period.
5. **The referee level at 4** — Victor vs Olivia, the player referees, opening by
   telling them they'll play it themselves next. Three-card rail (remove the
   `enabled={[level.rule]}` hardwire and both `callable: [step.rule]` hardwires).
6. **Showdown renumbered to 5 and reconciled** — no half tokens, no instant loss,
   Judging at 2, no redo, no attempt ceiling, no clock, new slug, `l5-*` turn ids.
7. **Passes** — review screens (Q21), tap-teaching (Q22), clock-language purge (Q25),
   vocabulary pass (Q26/Q27), open book applied uniformly, the fit-at-100%-zoom UI
   pass, ref avatar at top / cards at bottom.
8. **Doc reconciliation, same PR** — `rules.md:219` (six levels → seven; the boss-names
   line is stale), `rules.md:214` (instant loss), `rules.md` §9 items 2/3/4/5,
   `roadmap.md:251`, and every doc claiming the thread's forgetfulness is load-bearing
   for Fake Listening.

Then: commit regularly, push to the Nathan-named branch, spawn multiple **Fable**
agents to test for bugs and give feedback, fix bugs immediately, and report the
feedback to Nathan.

**"Fable" is a model, not an agent type.** Spawn with `Agent`, `model: "fable"`,
`subagent_type: "general-purpose"`, `run_in_background: true`.

---

## 7. Known defects, in one list

| # | Defect | Ruling |
|---|---|---|
| 1 | `MISS_COST = 0.5`, `formatTokens()`, `.tok-half` CSS, "half a token" copy | Q9 — delete all |
| 2 | Instant loss at zero (`bankruptCheck`, `COACH.bankrupt`, `bankruptHer`) | Q11 — delete |
| 3 | Judging charged as `1` at `engine.ts:348` and `:386` | Q10 — use `CARDS[rule].cost` |
| 4 | One-card rail hardwired in three places (`engine.ts:273`, `:408`, `App.tsx:425`) | L4/L5 need all three |
| 5 | `engine.beginBoss()` wipes the thread (`engine.ts:176`) | Q23 open book |
| 6 | `Thread.tsx:116-117` fades old lines by position | Q23 — remove or make cosmetic |
| 7 | Attempt ceilings (`engine.ts:486`, `showdown.ts:433`) | Q6/Q12 — no retries at all |
| 8 | Clock language: `level1.ts:65`, `level2.ts:43`, `content/showdown.ts:210`, `Prefight.tsx:98` ("all night") | Q25 — purge |
| 9 | Hand-written Showdown ladder row outside `LEVELS.map` (`App.tsx:251`), hardcoded `fightNumber={4}` (`:457`) | rebuild as data |
| 10 | Storage still `.v1` in four places | Q28 |
| 11 | `content/index.ts` header says "MVP is ship levels 1 to 3" | stale |
| 12 | `--dlg-h: 34rem` — app doesn't fit a laptop at 100% zoom | UI extra 1 |
| 13 | Olivia never concedes and has no clean line | Q18 |
| 14 | Level 3 is a cutscene; its own card is never pressed | Q19 |
| 15 | `App.tsx:216` "Three levels… one habit and one opponent" | Q13/Q26 |
| 16 | `rules.md:219` and `roadmap.md:251` rule six levels | superseded by seven |
| 17 | `rules.md` §9 still describes half-token misses, instant loss, and attempt ceilings | Q9/Q11/Q12 |

---

## 8. What the five learners found

The evidence behind the questions. Full report: `docs/gym-rebuild/learner-report.md`.

1. **Level 3's boss is the biggest failure** — 5/5 flagged it; 4/5 made rebuilding it
   their single requested change.
2. **The difficulty curve inverts** — boss depth runs 3 exchanges → 2 → 1 button → 12 turns.
3. **"Did I miss anything?" is never answered** — 5/5. Called "the single most
   important missing button in the product."
4. The L2 diner beat whistles the deep-canvassing move without naming it.
5. Tokens are decorative in L1–L3 and lethal at L4.
6. **Detection-training, not production-training** — ~22 detection decisions against
   ~11 production acts; from-scratch summaries: zero.
7. **Boss asymmetry** — Victor concedes, Olivia never does, Noemi is never faced.
8. The composer changes shape four times while the coach promises the card "stays on
   the wall all night."
9. Nothing bridges the gym to a real conversation.
10. The deep-canvassing move is never drilled anywhere.
11. **The coach's voice is universally praised.** Keep it (Q27 scales back the lingo,
    not the voice).
12. Learner 5's 61-item confusion ledger is the most actionable single artifact.
