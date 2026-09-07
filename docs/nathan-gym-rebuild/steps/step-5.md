# Step 5 — The referee level at 4

## Prompt

> Read `CLAUDE.md`, then `docs/gym-rebuild/steps/step-5.md`. Do step 5 only. Do not
> read the other step briefs. Open a file only when you are about to edit it.

## Goal

A new `src/content/level4.ts`. Slug `in-the-ref-seat`. **Victor vs Olivia, and the
player referees.** This is where the referee role and three-player play are introduced
for the first time — L1–L3 withhold the word entirely.

## Do

- **The level must OPEN by telling the player they learn as ref first and play it
  themselves next**, so the sequence is legible while they are in it.
- **A full round, all three cards live.** Remove the one-card hardwires — defect 4:
  `App.tsx:425` `enabled={[level.rule]}`, `engine.ts:273` and `:408`
  `callable: [step.rule]`. Use `LevelDef.cards` and `CallOrPassStep.callable` from step 2.
- **Q8: the referee calls Fake Listening, and the offended player then votes yes or
  no** — the confirm step kind. **The AI referee must be wrong sometimes; denying it
  must be free and acknowledged.**
- **Coach = moderator, one entity. A thread holds at most three parties. There is no
  separate referee character — inside the gym the coach holds the judge seat.**
- **Q7:** in the gym the boss's ruling is a scripted answer key, not a judgment.
- **Tokens are real here.** L1–L3 were a learning allowance and said so; this is where
  the cost lands. Judging costs 2 (defect 3 must be fixed for this to be true —
  `CARDS[rule].cost`, not a hardcoded 1). No half tokens. No instant loss at zero. No
  negatives. Purses always sum to 14.
- **Q18:** both bosses get a clean line and a concession.
- **Q17:** one unscaffolded closing sentence.
- Political-balance ledger comment in the header, accurate.

## Watch for

- The difficulty curve currently inverts (boss depth runs 3 exchanges → 2 → 1 button →
  12 turns). This level sits where the cliff was. Don't rebuild the cliff.
- **Card placement: cards on the bottom. Ref avatar and ref rulings at the top.**

## Done-check

```bash
grep -rn "callable: \[step.rule\]\|enabled={\[level.rule\]}" src/    # want 0
grep -n "transfer('player', 1)\|transfer('opponent', 1)" src/engine.ts   # want 0
npm run build
```

Then play it: all three cards callable, Judging moves 2 tokens, purses sum to 14.

## Commit

`feat(level4): the ref seat — Victor vs Olivia, three cards live`
