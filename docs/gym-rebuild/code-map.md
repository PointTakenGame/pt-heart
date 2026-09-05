# Code map — where things live

## ⚠️ How to use this file

**The line numbers below were verified on 2026-09-04, against the pre-rebuild tree
at commit `8adff59`. They go stale on the first commit of the rebuild.**

Do not open this file to "verify the anchors" before starting work. That habit is
what burned the context window in the sessions before this one. Instead:

- **To find a defect, use the grep pattern in `defects.md`.** Patterns survive edits;
  line numbers do not.
- **To edit a file, open that one file, immediately before editing it.** Not a survey
  pass over twenty files.
- Treat everything below as *"this is roughly where that lives and why it is shaped
  that way"* — orientation, not ground truth. **The code is ground truth.**

## Drift already found against this map

Verified 2026-09-04 while validating the grep patterns. These are corrections to the
map, not new defects:

- **`App.tsx:331`** already derives `fightNumber` via `LEVELS.findIndex(...)`. Only
  the `Showdown` call site (`:457`) is hardcoded. The map used to imply both were.
- **`content/showdown.ts:273`** is an unlisted Q25 clock site — `'You are wasting
  your own clock, not mine.'` in `SOFIA_THIN`.
- **`styles.css` has four `--dlg-h*` variables**, not one (`:54,55,56,57`).
- **`Thread.tsx`'s age assignment is `:117`**; `:116-117` is the two-line pair.
- **`level1.ts:181` and `engine.ts:399`** both assert a token cost in levels where no
  token actually moves. Relevant to the late ruling that L1–L3 must *explain* that a
  mistake would normally cost a token.
- **Stale headers that are themselves defects:** `types.ts:1-4` says "Levels 1 to 3"
  and describes the deleted retry loop; `engine.ts:1-17` and the comment above
  `beginBoss()` at `:163-171` are stale under Q6/Q12/Q23; `types.ts`'s `Beat.boss`
  doc comment says "the thread clears", which Q23 reverses.
- **`storage.ts` is already bumped to `.v2`** (defect 10 closed) but the change is
  uncommitted at the time of writing.

---

## The map (anchors as of 2026-09-04, pre-rebuild — see the warning above)

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

