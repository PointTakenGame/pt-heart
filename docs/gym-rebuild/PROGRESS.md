# PROGRESS — gym level-system rebuild

Branch `NathanGymLadderRebuild`. Levels **1–5 only**; 6 and 7 come after.

**One build step, one fresh chat.** Update this file at the end of each step, in the
same commit. Keep it short — it is read at the start of every session.

## Step status

| Step | Brief | Status |
|---|---|---|
| 0 | *(restructure — this scaffolding)* | **done** 2026-09-04 |
| 1 | Ladder scaffold | **done** 2026-09-05 |
| 2 | Q6/Q7 mechanic — `confirm` + `template` step kinds | **done** 2026-09-05 |
| 3 | Level 3 rebuilt as a full round | **done** 2026-09-05 |
| 4 | Levels 1 and 2 retitled and repaired | **done** 2026-09-05 |
| 5 | The referee level at 4 | **done** 2026-09-05 |
| 6 | Showdown renumbered to 5 and reconciled | not started |
| 7 | The passes | not started |
| 8 | Doc reconciliation and the PR | not started |

## Carried state

**Step 5 (just done) wrote `src/content/level4.ts` in full and wired defects 3 and 4.**
No new type, no new step kind — the engine/App edits were the two defect wirings only.
Step 6 renumbers the Showdown to level 5 and reconciles it; it has the full toolbox.

- **Defects 3 and 4 are both closed.** `engine.ts` now reads `step.callable ?? [step.rule]`
  (so a level naming its `callable` set opens the whole rail) and moves `CARDS[step.rule].cost`
  on a good call, so a good Judging call moves **two** tokens; `chargeMiss(n = 1)` still
  costs one on a bad whistle. `App.tsx` renders `enabled={level.cards}`. Done-check greps
  (`callable: [step.rule]`, `enabled={[level.rule]}`, `transfer('player'/'opponent', 1)`)
  all return 0. **Do not reintroduce the literals.**
- **L4 (`in-the-ref-seat`) is the ref-seat level, Victor vs Olivia, all three cards live.**
  It opens (prefight) by naming the referee for the first time and saying the sequence out
  loud: ref first, play a whole round yourself next (L5). Both debaters share the opponent
  lane and one face (`bossEmoji` = the two-people glyph), told apart by `speaker` — the
  engine holds only two purses, so "the opposition" is one party and the player's purse
  doubles as the ref scorecard (same abstraction L1-L3 used for boss calls).
- **The tokens are real from L4 on.** L4 says out loud that the learning allowance is
  over; a good call earns, a bad whistle costs, Judging is the double. Purses start 7/7,
  always sum to 14, clamp at 0 — carry this into L5.
- **Q8 (the two-step foul call) is built with `confirm`, player as offendee.** Inside the
  L4 boss beat, before the player takes the whistle, one confirm has the coach (the AI ref,
  who holds the judge seat — no separate ref character) suggest a Fake Listening foul that
  the player upholds (`pays: 'opponent'`), and a second confirm is a deliberate **over-call**
  the player waves off for free and the coach acknowledges. That over-call is the
  false-positive corpus source; keep the "ref suggests, offendee decides, denial is free"
  shape if L5/L6 reuse it.
- **The Q17 `free`-close is now in all of L1-L4** — `{ kind: 'free', chips: [] }`
  (unscaffolded), records `null`, followed by a plain coach `say`.
- **`confirm` still models one direction only: the human is always the offendee.** L4's
  two confirms both put the player in a debater's chair to rule; the card-played-*against*-
  a-clean-summary is never forced to eat a token.
- **Political balance:** L4's ledger has Victor (right-coded) caught on the two heavier
  fouls (Judging + Fake Listening) and Olivia (left-coded) on the two lighter
  (Opinions-as-Facts + a Fake Listening in the confirm demo), clean lines split one apiece,
  both conceding. L1 4:1, L2's Olivia offset by her owned line — all ledgers current.
  `HEART-T260823-33` is still Nathan's call in the PR.
- **Defect 8 (clock) is still open in `src/ui/Prefight.tsx` ("all night") and
  `src/content/showdown.ts`** — L4 introduced no clock language (Q25). These are step 6's.
- `src/storage.ts` is on `.v2`, committed in `1f0b8b3`; defect 10 is closed.
- The ladder is data: `LEVELS` in `src/content/index.ts` is a `LadderRow[]`, five rows,
  each carrying `screen: 'level' | 'showdown'`. **Add a level by adding a row.**
- **A locked row prints "Locked", not its title.** Do not undo.
- Live slugs: `about-the-argument` · `my-opinion-not-a-fact` · `the-summary-gate` ·
  `in-the-ref-seat` · `the-showdown`. **Save by slug; never rename a live slug** or it
  orphans saves.
- **`confirm` core component** (Q6/Q7/Q8): `ask` → two buttons + always-present note box
  → `onYes` / `onNo`. `pays: 'player' | 'opponent'` moves `CARDS[rule].cost` on a **yes
  only**; a **no is always free**. Wire format: `submit()` value is `'yes'`/`'no'`,
  optionally `\n` + note; `confirmValue()` / `parseConfirm()` exported from `src/engine.ts`.
- **Both `confirm` and `template` record `correct: null`** (soul.md §6). Both are in
  `isItem()` **and** `submit()`'s switch.
- **No retries anywhere** (Q12). A wrong answer costs a token; non-answers (thin text, an
  unchanged prefill) reopen the step free.
- `COACH.redoSummary` in `src/content/showdown.ts` is **dead copy** for step 6 to delete.
- `docs/soul.md` has had **its one permitted edit** (Q7 carve-out, §6). Spent.

## Carried questions

- The live-play row (Q5) is a disabled button that changes appearance when the
  ladder is complete. That flip is currently the *only* thing that makes clearing
  level 5 feel different from clearing level 4. If step 6 gives the Showdown a
  proper ending, revisit whether the row is still carrying that weight.
