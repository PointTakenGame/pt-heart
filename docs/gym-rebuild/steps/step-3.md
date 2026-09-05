# Step 3 — Level 3 rebuilt as a full round

## Prompt

> Read `CLAUDE.md`, then `docs/gym-rebuild/steps/step-3.md`. Do step 3 only. Do not
> read the other step briefs. Open a file only when you are about to edit it.

## Goal

`src/content/level3.ts` — the biggest single failure in the current build. 5/5 learners
flagged it; 4/5 made rebuilding it their one requested change. It is currently a
cutscene with a QTE, and **the Fake Listening card is never pressed in the level that
teaches Fake Listening** (defect 14: `grep -c "call_or_pass" src/content/level3.ts` = 0).

New slug: `the-summary-gate`. Boss: Nodding Noemi.

## Do

Rebuild as **a full round, open book**.

- **Q19: the Fake Listening card IS played against the player when their summary
  misses something.** Cards work in both directions. **No token penalty. Never forced
  when the summary was clean.**
- **Q15: the player gets summarized.** A beat where the boss summarizes the player
  badly and **the player rules on it** — the confirm step kind from step 2.
- **Q18 boss shape:** Noemi gets **at least one clean line** (so the player must
  decline to call at least once) **and a scripted concession** when the habit is retired.
- **Q17:** the level ends with **one unscaffolded sentence the player writes
  themselves** — checked loosely, **never rejected outright**.
- **Q6:** "did I miss anything?" is answered, authored, no model. **No redo.**
- **Reform the boss, do not deplete the boss** — a foul called correctly retires that
  habit for the rest of the match.
- **Teach by delta** — never ship a bad example without its repair beside it.
- The round shape (`rules.md` §5): A gives their view ("The way I see it is…") →
  B summarizes ("What I heard is [x]… did I miss anything?") → **A answers, and that
  answer is the ground truth for Fake Listening** → roles switch and mirror.
  **The summary is a gate, not a courtesy.**

## Also

- **The token counter stays visible**, and the level must **explain that a mistake
  would normally cost a token**, so the no-penalty period reads as a learning allowance
  and the real cost is not a surprise at L4/L5.
- **L1–L3 ignore the presence of a referee entirely** — the word, the role, and the
  three-player structure are all withheld until L4.
- Keep the political-balance ledger comment in the file header accurate (Q29 — Nathan
  reviews it in the PR).

## Done-check

```bash
grep -c "call_or_pass" src/content/level3.ts    # want > 0
npm run build
```

Then play it end to end with no API key.

## Commit

`feat(level3): rebuild the summary gate as a full round`
