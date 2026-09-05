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
| 3 | Level 3 rebuilt as a full round | not started |
| 4 | Levels 1 and 2 retitled and repaired | not started |
| 5 | The referee level at 4 | not started |
| 6 | Showdown renumbered to 5 and reconciled | not started |
| 7 | The passes | not started |
| 8 | Doc reconciliation and the PR | not started |

## Carried state

- `src/storage.ts` was already on `.v2` **and already committed** in `1f0b8b3`.
  The step-1 brief's "uncommitted, step 1 commits it" note was stale; defect 10's
  grep returns nothing, so it is closed either way.
- The ladder is now data: `LEVELS` in `src/content/index.ts` is a `LadderRow[]`,
  five rows, each row carrying `screen: 'level' | 'showdown'` so `App` dispatches
  instead of hand-writing the Showdown. **Add a level by adding a row.**
- `src/content/level4.ts` is a **stub** — one prefight line, one beat, enough that
  the row renders and the room does not crash. Step 5 writes it. Two things step 5
  must settle are recorded in its header comment: `LevelDef.rule` is a single
  `FoulType` and level 4 runs all three, and the ledger opens with its first line.
- **A locked row prints "Locked", not its title.** Level 4 is where the referee is
  introduced, and CLAUDE.md withholds the word until then — a locked row reading
  "In the ref seat" would leak it on the first screen of the game. Applied to all
  rows, so no row is a special case. Step 5 should not undo this.
- New slugs are live: `about-the-argument` · `my-opinion-not-a-fact` ·
  `the-summary-gate` · `in-the-ref-seat` · `the-showdown`.
- `.level-card-boss` in `src/styles.css` is now `.level-card-showdown`; there is a
  new `.level-card-live` for the placeholder row.
- Nothing else in `src/` has been touched. The rest of the tree is pre-rebuild.
- **`confirm` is the new core component** (Q6/Q7/Q8): `ask` → two buttons and an
  always-present note box → `onYes` / `onNo`. `pays: 'player' | 'opponent'` moves
  `CARDS[rule].cost` on a **yes only**; a **no is always free**, which is the ruling
  that the AI ref must be wrong sometimes and denying it must cost nothing.
- **Confirm wire format:** `submit()` takes one string, so the value is `'yes'` or
  `'no'`, optionally followed by `\n` and the offendee's note. A newline is untypeable
  in the composers, so it is a safe separator. `confirmValue()` / `parseConfirm()` are
  exported from `src/engine.ts`; `Composer.tsx` imports `confirmValue` (no cycle).
- **Both new kinds record `correct: null`.** soul.md §6: the offendee's verdict can
  never be graded. Both are registered in `isItem()` **and** in `submit()`'s switch —
  a new interactive kind that misses `submit()` silently no-ops in `default:`.
- **No retries anywhere** (Q12, read as blanket): the `sort`, `edit` and `call_or_pass`
  ceilings and the showdown summary redo are all gone. A wrong answer still costs a
  token — that is consequence, not a retry. Non-answers (thin text, an unchanged
  prefill) still reopen the same step free of charge.
- `COACH.redoSummary` in `src/content/showdown.ts` is now **dead copy**. Left in place
  for step 6 to delete along with the rest of the showdown reconciliation.
- **Defect 4 left deliberately open.** `CallOrPassStep.callable?: FoulType[]` is added
  as a *type* only; `engine.ts` still passes `[step.rule]` and `App.tsx:425` still has
  `enabled={[level.rule]}`. Wiring it is step 5's job, and closing the grep early would
  read as a false all-clear.
- **Defect 3 left deliberately open.** `chargeMiss()` and the good-call transfer keep
  their literal `1`. `CARDS[rule].cost` is used only at the new confirm site.
- `docs/soul.md` has now had **its one permitted edit** — the Q7 carve-out, one line in
  §6. It is spent. Nothing else in soul.md may change this rebuild.

## Carried questions

- The live-play row (Q5) is a disabled button that changes appearance when the
  ladder is complete. That flip is currently the *only* thing that makes clearing
  level 5 feel different from clearing level 4. If step 6 gives the Showdown a
  proper ending, revisit whether the row is still carrying that weight.
