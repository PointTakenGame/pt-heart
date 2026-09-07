# Step 4 — Levels 1 and 2 retitled and repaired

## Prompt

> Read `CLAUDE.md`, then `docs/gym-rebuild/steps/step-4.md`. Do step 4 only. Do not
> read the other step briefs. Open a file only when you are about to edit it.

## Goal

`src/content/level1.ts` and `src/content/level2.ts`.

## Level 1 — `about-the-argument`

- **Q13: retitle to "About the argument, not the person"** (was "The word 'You'") and
  **add a beat covering mind-reading and verdicts-on-character.** The word "you"
  becomes **one tell of two**, not the whole lesson.
- **Q22: teach the card-tap gesture here** — one gesture plus one coach line. The
  agreement screen that used to do this is gone.
- Boss: Verdict Victor. He already concedes; Q18 is satisfied here — check, don't break.
- Defect 8: remove the clock line ("You're in with him in two minutes.").
- The file header carries the political-balance ledger (4:0 against forgiveness in the
  judging column, 3:1 in the argument column, `HEART-T260823-33`). **Political balance
  is non-negotiable and currently in debt.** Keep the ledger accurate as you edit.

## Level 2 — `my-opinion-not-a-fact`

- **Q14: rewrite the diner beat** (`l2-3c-i4`). It currently whistles the deep-canvassing
  move without naming it. When the good version is shown, **someone must say out loud
  that it is a personal experience, not a fact** — the coach, or the line itself. **It
  stays a positive example.**
- **Q16: drill the personal-experience move, carefully.** A story is a tool. It must
  **always be framed as an opinion, never as a fact that settles the question for
  everyone. The framing is the lesson.**
- **Q18: Olivia has no clean line and never concedes — two violations.** Give the
  `boss: true` beat **at least one clean line** and **a scripted concession**.
  ⚠️ Verify with the *scoped* grep in `defects.md` #13, not the naive one: the
  `expected: 'clean'` that already exists is in the earlier teaching beat.
  She currently ends on *"I'm not being difficult. These are simply the facts."*
- Defect 8: remove the clock line ("Two minutes. One habit…").

## Both

- **Q17:** one unscaffolded closing sentence, checked loosely, never rejected outright.
- **The token counter stays visible**, and both levels must **explain that a mistake
  would normally cost a token**.
- **No referee anywhere** — the word, the role, the three-player structure are withheld
  until L4.
- **Q26 vocabulary: "foul" for the act, "card" for the object. Nothing else.**
  "Habit" survives only in a boss's mouth about themselves.

## Background

Deep canvassing (Broockman & Kalla, *Science* 2016) is the intellectual ancestor of the
three cards: arguing moves nobody, but getting a person to recall a personal experience
that produced the same emotion produces durable change. Q14/Q16 permit it **only when
framed as opinion**, never as a fact that settles the question.

## Done-check

```bash
grep -rni "two minutes" src/content/level1.ts src/content/level2.ts   # want 0
sed -n '/name: .Obvious Olivia./,$p' src/content/level2.ts | grep -c "expected: 'clean'"   # want > 0
npm run build
```

## Commit

`feat(levels): retitle L1 to the argument not the person, repair L2`
