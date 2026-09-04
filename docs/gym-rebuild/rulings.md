# Rulings ledger — gym level system rebuild
Running record of Nathan's rulings on the 32-question document.
Status: Q1-Q5 ruled. Q6-Q32 outstanding.

## Q1 / Q2 — ladder shape and where the referee seat goes  [RULED]
Player-first. **Seven levels.** Ref-then-player for both showdown pairs.

| # | Seat | Content |
|---|---|---|
| 1 | player | Judging |
| 2 | player | Opinions as Facts |
| 3 | player | Fake Listening |
| 4 | referee | full round, all three cards — introduces the ref role and 3-player play |
| 5 | player | the Showdown — BASE GAME COMPLETE, live play unlocks |
| 6 | referee | the Final Showdown |
| 7 | player | the Final Showdown — full game unlocks |

Binding sub-rulings:
- **L1-L3 ignore the presence of a referee entirely.** The word, the role, and the
  three-player structure are all withheld until L4. (This overrules my proposal to
  label the L1-L3 drill halves as the referee seat.)
- **L4 and L6 must open by telling the player they learn as ref first and play it
  themselves next**, so the sequence is legible while they are in it.
- Steve: the Final Showdown is an **add-on**. The game is complete and playable
  without it. The player must be able to do it as either player or referee.
  Hence the L5 / L6 boundary in the table above.

## Q3 — does free play ship in this build  [RULED]  No.
This build is the level system and nothing else. No "Play a round", no
"Referee a round", no live play.

## Q4 — Level 0 / agreement screen  [RULED]  Cut.
The conduct agreement moves to signup. Not built here.
KNOCK-ON: Q22's recommended vehicle for teaching the card-tap gesture is gone.
Falls back to a coach line in L1 plus a first-run affordance on the chip.

## Q5 — where live play sits  [RULED]
Separate main-menu page: live play OR the level system. Live play gated behind
L5 (base game). Live-play-with-Final-Showdown gated behind L7. **Not built here.**
KNOCK-ON: clearing L5 must feel different from clearing L4 even with nowhere to go.

## Steve's note on foul calls  [RULED — supersedes my §6 reading]
"Ref OR offendee can suggest, 'offendee' always is the final decider. 90% of time
the ref suggests (it's faster on the buzzer) and the offendee just clicks 'yes/no'
click to make it easy, but always a text entry on that dialogue in case they want
to say something."

Consequences for the build:
1. A confirm dialogue (yes / no / free text) is a core component in every level,
   both seats. Needs an authored no-API-key path.
2. The AI referee must be wrong sometimes; denying it must be free and
   acknowledged. This is where the false-positive corpus finally comes from.
3. MISS_COST (Q9) is hard to defend once no foul is charged without confirmation.
4. "Faster on the buzzer" implies a clock, in a codebase with no timers (Q25).
5. Open: is the "did I miss anything?" gate the same component as this dialogue?
   Folded into Q6.

## Q6-Q32 — OUTSTANDING
Blocking subset still open: Q6, Q7, Q13, Q14, Q19, Q27.

## Standing constraints
- Do not change any code yet. Build is gated on remaining rulings + explicit go-ahead.
- Push to a NEW branch so Steve can test without overriding what exists.
- Docs rule SIX levels (docs/rules.md:219, docs/roadmap.md:251). Seven now supersedes;
  must be recorded when Q30 (docs in the same PR) is ruled.

---
# Batch 2 — Q6-Q32

## B. Core mechanic
- **Q6 [RULED (a)]** The opponent answers "did I miss anything?", authored per beat,
  no model needed. **AND: no redo, ever.** One check only. The offended party briefly
  explains what the summary missed; the summarizer does not get another attempt.
  This supersedes the earlier no-retry-cap ruling — the cap question is moot because
  there are no retries.
- **Q7 [RULED (a)]** Inside the gym the boss's ruling is a scripted answer key, not a
  judgment. §6 gets an explicit one-line carve-out. **Write it into soul.md.**
- **Q8 [RULED]** The referee DOES call Fake Listening. The offended player then votes
  yes or no — regardless of whether the ref is an AI or a human.
- **Q9 [RULED]** Delete every half-token amount. No `MISS_COST = 0.5`, no `6½`.
  A level may cost zero tokens; if a level costs tokens, it costs the normal amount.
- **Q10 [RULED]** Unify Judging at 2 everywhere. The card is the source of truth.
- **Q11 [RULED — Nathan overrules Steve]** No instant loss at zero tokens. Players keep
  playing and can climb back. **Players cannot go negative.** Fix rules.md to match.
- **Q12 [RULED]** No retries. See Q6.

## C. Teaching content
- **Q13 [RULED — my rec]** Retitle L1 to "About the argument, not the person" AND add a
  beat covering mind-reading / verdicts-on-character. "You" becomes one tell of two.
- **Q14 [CLARIFICATION REQUESTED]** — deep canvassing explained; awaiting ruling.
  NOTE: the blocking constraint is resolved by inspection. cards.ts's
  no-new-bad-examples rule binds cards.ts ONLY. Level files already author their own
  specimens (e.g. level2.ts:260). The L2 diner beat can be rewritten in level content
  without touching a card or consulting Steve.
- **Q15 [RULED — my rec (a)]** The player DOES get summarized. A beat in the Fake
  Listening level where the boss summarizes the player badly and the player rules.
- **Q16 [CLARIFICATION REQUESTED]** — awaiting ruling.
- **Q17 [RULED — my rec (a)]** Every level ends with one unscaffolded sentence the
  player writes themselves, checked loosely, never rejected outright.
- **Q18 [RULED — my rec]** Standard boss shape: every boss gets at least one clean
  line (so the player must decline to call at least once) and a scripted concession
  when their habit is retired.

## D
- **Q19 [RE-POSED]** — awaiting ruling.

## E. UI/UX
- **Q20 [RULED]** Level rows: add replay. **No stats** — no tokens, no foul counts.
  If the level title doesn't already say it, add a line naming the rule learned,
  identical for everyone who finished.
- **Q21 [RULED — my rec]** One end-of-level review screen: the card, its `trains`
  line, what you did. No score, no confetti, no modal.
- **Q22 [RULED]** Taught in Level 1: one gesture plus one coach line.
- **Q23 [CLARIFICATION REQUESTED]** — awaiting ruling.
- **Q24 [RULED]** No change to the composer.
- **Q25 [RULED]** Remove ALL clock mentions from the online edition. Permanent for the
  level system. A timer may return later for live play, which is out of scope.
- **Q26 [RULED — my rec]** "foul" for the act, "card" for the object. Nothing else.
  "Habit" survives only in a boss's mouth about themselves.
- **EXTRA [RULED]** Two UI notes:
  1. The current build does not fit a laptop screen at 100% zoom; Nathan runs it at 75%.
     Likely cause: `--dlg-h: 34rem` (544px) for the dialogue box alone, stacked with
     header + rail + composer. Vertical budget must fit ~700px of viewport.
  2. Live play's style will be a message conversation between two people with the ref
     at the top, able to play cards. **The level system UI should move closer to this.**
     OPEN: "ref at the top" may conflict with Steve's 2026-08-25 ruling that the foul
     cards sit at the bottom. Needs disambiguation before the UI pass.

## F. Scope and process
- **Q27 [RULED (a), with an amendment]** Restructure. Keep cards.ts, the coach's voice,
  the drill stepper, the thread, the rail. **Scale the coach's voice back** to remove
  confusing lingo and invented terms the player must learn. Ties to Q26.
- **Q28 [RULED — my rec]** New slugs for rebuilt levels; bump storage to
  `humility-showdown.v2`.
- **Q29 [RULED — my rec]** I keep the balance ledger accurate; Nathan reviews in the PR.
- **Q30 [RULED]** Docs update in the same PR. Nathan's directions may override rules.md
  and the other docs freely. **Be careful with soul.md** — change it only where a
  ruling explicitly requires it (currently: Q7's carve-out only).
- **Q31 [RULED]** Branch name includes Nathan. Proposed: `nathan-gym-ladder-rebuild`,
  off `main`.
- **Q32 [RULED]** Build order as proposed, amended for seven levels.

---
# Batch 3 — the four reserved questions

- **Q14 [RULED]** Rewrite the diner beat as proposed. When the good version of that
  line is shown, **someone must say out loud that it is a personal experience, not a
  fact** — the coach, or the line itself. It stays a positive example.
- **Q16 [RULED (b)]** Drill the personal-experience move inside an existing level,
  **carefully**: a story is a tool, and it must always be framed as an opinion, never
  as a fact that settles the question for everyone. The framing is the lesson.
- **Q23 [RULED — REVERSES MY RECOMMENDATION]** **The gym is open book.** The
  conversation scrolls; the player can read back. Nathan's reason: better to keep the
  reps at summarizing than to risk people failing on memory. **Flagged for Steve to
  rule on later** — this is the one item Nathan wants re-opened with him.
  KNOCK-ON: the docs' claim that the thread's forgetfulness is load-bearing for Fake
  Listening is now wrong and must be corrected in the same PR.
  KNOCK-ON: Thread.tsx fades old lines by position; that has to go or become cosmetic.
- **Q19 [RULED]** Level 3 as proposed, but open book per Q23. **The Fake Listening
  card IS played against the player when their summary misses something** — the point
  is to learn that cards work in both directions. **No token penalty.** **Never forced
  when the summary was clean** — a good summary must be able to pass with no card.
- **CARD PLACEMENT [RULED]** Cards on the bottom. Ref avatar and ref rulings at the
  top. Steve's 2026-08-25 placement stands; Nathan's note referred to the ref, not the
  rail. No conflict.
