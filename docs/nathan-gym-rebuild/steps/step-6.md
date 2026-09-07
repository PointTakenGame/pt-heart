# Step 6 — Showdown renumbered to 5 and reconciled

## Prompt

> Read `CLAUDE.md`, then `docs/gym-rebuild/steps/step-6.md`. Do step 6 only. Do not
> read the other step briefs. Open a file only when you are about to edit it.

## Goal

`src/content/showdown.ts` and `src/showdown.ts`. The Showdown becomes **level 5**, slug
`the-showdown`. Clearing it means **BASE GAME COMPLETE** and unlocks the live-play row
(placeholder only — Q3: no free play in this build, no "Play a round", no "Referee a
round", no live play; **the level system and nothing else**).

## Do — the six reconciliations

1. **Q9 — no half tokens anywhere.** Delete `formatTokens()` (`content/showdown.ts`),
   `MISS_COST = 0.5` (`showdown.ts:56`), the `.tok-half` CSS (`styles.css`), and every
   "half a token" line of copy. A level may cost zero tokens; if it costs tokens, it
   costs the normal amount.
2. **Q11 — no instant loss at zero.** Delete `bankruptCheck()` and its four call sites,
   `COACH.bankrupt`, `COACH.bankruptHer`. Players keep playing at zero and can climb
   back. **Players cannot go negative.** `transfer()` in `engine.ts` is already correct —
   clamped, never negative, always sums to 14. Leave it alone.
3. **Q10 — Judging costs 2.** `foulCost()` here is already correct; the bug is in
   `engine.ts` (defect 3).
4. **Q6/Q12 — no redo and no attempt ceiling.** Delete the attempt ceiling at
   `showdown.ts:433` and the "Do it again." copy. ⚠️ `onWrongCard` is **not** a retry —
   it is the coach's response to calling the *wrong card*. Keep it.
5. **Q25 — no clock.** Two sites here: "both of you on the clock", and "You are wasting
   your own clock, not mine." in `SOFIA_THIN`.
6. **Renumber.** `SHOWDOWN_SLUG` becomes `the-showdown`. The 12 turn ids are all
   `l4-*` prefixed and become `l5-*`.

## Do not change

**Sofia's foul schedule is fixed:** `r1-sofia-speak` → `opinion_as_fact`;
`r3-sofia-summary` → `fake_listening`; `r3-sofia-speak` → `judging`. **Round 3 has two
adjacent fouls — a documented deviation, kept on purpose.** Do not "fix" it.

Also keep: `SOFIA_EMOJI`, `START_TOKENS = 7`, `RULE_LABEL`, `RULE_GLOSS`, `TOPICS`.

## Done-check

```bash
grep -rn "formatTokens\|MISS_COST\|tok-half\|half a token\|half token" src/   # want 0
grep -rn "bankrupt" src/                                                       # want 0
grep -rni "two minutes\|the clock\|your clock\|all night" src/                 # want only the 2 comment hits
grep -rn "l4-" src/content/showdown.ts                                         # want 0
npm run build
```

The two surviving clock hits are `src/styles.css` and `src/ui/Drill.tsx` — **source
comments quoting Steve about card persistence, not player-facing copy. Leave them.**

## Commit

`feat(showdown): level 5 — no half tokens, no instant loss, no redo, no clock`
