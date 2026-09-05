# Defects — as grep patterns, not line numbers

Every defect the rebuild has to close, expressed as a command you can run.

**How to use this file:**

- Run the command. **Hits = the defect is still open, and the output tells you exactly
  which lines to edit.** Empty result = closed. That is the done-check.
- Patterns survive edits and commits. Line numbers do not — that is the whole point.
- Do **not** run all seventeen at the start of a session. Run the two or three that
  belong to the step you are on. The step briefs in `steps/` name which.
- All patterns verified live on 2026-09-04 at commit `8adff59`. The "as of" column is
  what they returned then.

---

## Code defects

### 1 — Half tokens (Q9: delete every half-token amount)

```bash
grep -rn "formatTokens\|MISS_COST\|tok-half\|half a token\|half token" src/
```

As of 2026-09-04: 18 hits. Core sites `src/showdown.ts:43,56,413,521`,
`src/styles.css:351,385`, plus the declaration and copy in `src/content/showdown.ts`.
Delete `formatTokens()`, `MISS_COST`, the `.tok-half` CSS, and rewrite the copy.

### 2 — Instant loss at zero (Q11: delete; Nathan overrules Steve)

```bash
grep -rn "bankrupt" src/
```

As of 2026-09-04: `src/showdown.ts` (`bankruptCheck` and its four call sites) and
`src/content/showdown.ts` (`COACH.bankrupt`, `COACH.bankruptHer`). Players keep
playing at zero and can climb back. `transfer()` in `engine.ts` is **already correct** —
clamped, never negative, always sums to 14. Do not touch it.

### 3 — Judging charged as 1 (Q10: unify at 2; the card is the source of truth)

```bash
grep -n "transfer('player', 1)\|transfer('opponent', 1)" src/engine.ts
```

As of 2026-09-04: `:348`, `:386`. Both must become `CARDS[rule].cost`. `CARDS` is
already imported at `engine.ts:25`, so no new import is needed. `foulCost()` in
`content/showdown.ts` is **already correct**.

### 4 — One-card rail hardwired (L4 and L5 need all three callable)

```bash
grep -rn "callable: \[step.rule\]\|enabled={\[level.rule\]}" src/
```

As of 2026-09-04: `src/App.tsx:425`, `src/engine.ts:273`, `src/engine.ts:408`.
Needs `CallOrPassStep.callable?: FoulType[]` and `LevelDef.cards: FoulType[]`.

### 5 — `beginBoss()` wipes the thread (Q23: the gym is open book) — ✅ CLOSED

```bash
grep -n "lane: 'crowd', text: crowdRow(0)" src/engine.ts
```

Closed step 7, pass 5 (`5fc32b4`). `beginBoss()` now **appends** a crowd row instead
of wiping the thread, so it survives the boss entrance. The grep locator still hits —
it matches the crowd-row append itself — but the defect is behaviorally closed.

### 6 — Thread fades old lines by position (Q23) — ✅ CLOSED

```bash
grep -n "back <= 2 ? 'now'" src/ui/Thread.tsx
```

Closed step 7, pass 5 (`5fc32b4`). The positional fade is now purely cosmetic
(`opacity: 0.88 / 0.76`, hover restores; the age computation still exists, so the grep
locator may still hit). Scroll pinning was left alone as instructed.

### 7 — Attempt ceilings (Q6/Q12: no retries at all, ever)

```bash
grep -rn "tryNo < 2\|attempt <= 3\|onWrong" src/
```

As of 2026-09-04: `src/showdown.ts:433`, `src/engine.ts:486`, plus
`CallOrPassStep.onWrong` in `types.ts:93`, which exists only to serve the retry path.
One check, then move on. The offended party briefly explains what was missed; the
summarizer gets no second attempt.

⚠️ **`onWrongCard` is not a retry and must survive.** The pattern also matches
`src/showdown.ts:410` and `src/content/showdown.ts:230`, which are the coach's response
when the player calls the *wrong card* — feedback on a decision already made, not a
second attempt at it. Keep them.

### 8 — Clock language (Q25: remove all clock mentions from the online edition)

```bash
grep -rni "two minutes\|the clock\|your clock\|all night" src/
```

As of 2026-09-04: 6 hits. **Genuine player-facing sites, all must go:**

| File | The line |
|---|---|
| `src/ui/Prefight.tsx` | "It stays on the wall all night." |
| `src/content/level1.ts` | "You're in with him in two minutes." |
| `src/content/level2.ts` | "Two minutes. One habit…" |
| `src/content/showdown.ts` | "both of you on the clock" |
| `src/content/showdown.ts` | "You are wasting your own clock, not mine." (`SOFIA_THIN`) |

⚠️ **Two hits are NOT defects.** `src/styles.css:510` and `src/ui/Drill.tsx:133` are
source comments quoting Steve about card persistence, not player-facing copy. Leaving
them is the right call. Do not "close" this defect by deleting a design record.

### 9 — Showdown ladder row is hand-written (rebuild as data)

```bash
grep -n "level-card-boss\|fightNumber={4}" src/App.tsx
```

As of 2026-09-04: `:251` (a row written outside `LEVELS.map`), `:457` (a hardcoded
fight number). Note `App.tsx:331` **already** derives its fight number via
`LEVELS.findIndex(...)` — only the `Showdown` call site is hardcoded.

### 10 — Storage still `.v1` (Q28) — ✅ CLOSED

```bash
grep -rn "humility-showdown.v1\|version === 1\|version: 1" src/
```

As of 2026-09-04: **0 hits.** `src/storage.ts` is on `humility-showdown.v2` with
`version: 2` in the type, in `blank()`, and in the `load()` guard. No migration, on
purpose: v1 progress does not describe the v2 ladder.

### 11 — `content/index.ts` header is stale

```bash
grep -n "MVP is ship levels 1 to 3" src/content/index.ts
```

As of 2026-09-04: `:1`. The ladder is seven levels, of which 1–5 are being built.

### 12 — App does not fit a laptop at 100% zoom (UI extra 1)

```bash
grep -n "dlg-h" src/styles.css
```

As of 2026-09-04: 9 hits — **four** variable definitions at `:54,55,56,57` (not one,
as the old map implied), a comment at `:1234`, and uses at `:1263,1288,1289`.
`--dlg-h: 34rem` is 544px, which stacked with header + rail + composer overflows.
**The vertical budget must fit ~700px of viewport.** Other ceilings to check while
you are in there: `:421 max-height: 50vh`, `:656 32vh`, `:806 44vh`,
`:589 .composer-locked min-height: 3.9rem`.

### 13 — Olivia has no clean line and never concedes (Q18)

```bash
sed -n '/name: .Obvious Olivia./,$p' src/content/level2.ts | grep -c "expected: 'clean'"
```

As of 2026-09-04: **0** — the defect is open.

⚠️ **A naive `grep -n "expected: 'clean'" src/content/level2.ts` returns a hit and looks
like the defect is already closed. It is not.** That hit is in the `'Own it'` *teaching*
beat. The `boss: true` beat contains two `expected: 'foul'` items, no clean line, and
ends on `"I'm not being difficult. These are simply the facts."` — defiance, not a
concession. **Scope the check to the boss beat**, which is what the command above does.

Q18's standard boss shape: **at least one clean line** (so the player must decline to
call at least once) **and a scripted concession** when the habit is retired.

### 14 — Level 3 never plays its own card (Q19)

```bash
grep -c "call_or_pass" src/content/level3.ts
```

As of 2026-09-04: **0.** The level that teaches Fake Listening never lets the player
press the Fake Listening card. Currently a cutscene with a QTE. Full rebuild.

### 15 — Stale level-select copy (Q13/Q26)

```bash
grep -n "Three levels" src/App.tsx
```

As of 2026-09-04: `:216` — "Three levels, each one habit and one opponent. Then all
three at once, for tokens." Wrong count, and "habit" is banned in the app's own voice
(Q26: "foul" for the act, "card" for the object; "habit" survives only in a boss's
mouth about themselves).

---

## Doc defects (Q30 — these land in the same PR)

### 16 — Docs still rule a six-level ladder — ✅ CLOSED

```bash
grep -n "six levels\|Six levels\|six-level" docs/rules.md docs/roadmap.md
```

Closed step 8. `rules.md:219`, `roadmap.md` §6/§7/§8 and the reconciliation note now
describe the seven-level, player-first ladder (L5 completes the base game; L6/L7 the
deferred Final Showdowns). `rules.md`'s boss-names line was corrected too. The only
remaining "six-level" hit is the supersession note in `roadmap.md` naming the interim
scheme it replaced.

### 17 — Docs still describe half tokens, instant loss, and the forgetful thread — ✅ CLOSED

```bash
grep -rn "half a token\|half token\|instant loss\|forget" docs/rules.md docs/roadmap.md docs/script.md
```

Closed step 8. All three corrections landed:
- **Half-token misses** — retired under Q9 (`rules.md` §8/§9); a missed whistle now
  moves nothing.
- **Instant loss at zero** — retired under Q11 (`rules.md`, `roadmap.md`, `script.md`);
  a zero ends nothing and the player climbs back.
- **The thread's forgetfulness** — reversed under Q23 (`roadmap.md` §5); the gym is
  open book and the summary gate never leaned on the thread scrolling away.

`rules.md:206` and `:220` citations were de-lined to `src/showdown.ts`. Remaining
"instant loss" hits are inside editorial brackets that quote the retired deck wording
before overruling it.
