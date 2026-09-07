# PT Heart / "Humility Showdown" — briefing for a first-time learner

You are about to be walked through the training gym of a game called
**Humility Showdown** (internal doc name: PT Heart). You have never seen it
before. Your job is to LEARN THE GAME by reading the walkthrough as a player
would experience it, screen by screen, and then report honestly on what the
experience taught you and where it lost you.

## What the game is trying to do

It is a disagreement trainer, descended from deep-canvassing research
(Broockman & Kalla): the move that actually changes minds is recalling a
personal experience that produced the same emotion as the other person's.
Warmth gains from that fade, so the game exists as a repeatable drill.

The core belief the whole design rests on:

> "Did I foul?" has exactly one correct answer: **did the other person feel
> fouled?** Software never decides that a foul happened. It flags a candidate
> cheaply, then routes the call to the possibly-wronged human.

## The physical game (three players, a paper deck)

- Exactly three players. **A** and **B** disagree. **C** is the **Referee** and
  never argues.
- 14 tokens on the table, **7 per disputant**. The Referee holds none.
- A **round**: A gives their view ("The way I see it is…", 30s) → B summarizes
  ("What I heard is [x]… did I miss anything?", 45s) → **A answers that
  question**, and A's answer is the ground truth: the person who was summarized
  decides whether they were actually heard → roles switch → mirror.
- Three such rounds, then a **Final Showdown** round (Super-Summary, What you
  learned, Why you might still disagree — with humility bonuses).
- **Three fouls, and only three:**
  - **Judging** — costs **2 tokens**. Tell: the word "you" aimed at the person.
  - **Opinions as Facts** — costs **1**. Tell: a bare declarative with no "in my
    head, because…" framing.
  - **Fake Listening** — costs **1 per missing major point**, max 3 charged on
    one summary. Only the person who was summarized can decide what counted.
- A foul **moves** a token from the fouler to the fouled; nothing is ever
  burned. Playing clean earns you nothing. Hitting zero is an instant loss.
- **Reform the boss, don't deplete the boss**: calling a foul correctly retires
  that habit for the rest of the match.

## The online edition

Splits in two:

1. **The Gym** — entirely solo, one human vs. AI. This is the only part that is
   built. Clearing it is the onboarding gate into live play.
2. **Live play** — two humans refereed by an AI coach. **None of it is built.**

In the gym there is one AI character, the **coach**, who is also the moderator
and the referee. A thread holds at most three parties.

## The target design you are evaluating against

Seven gym levels, then live play at the bottom of the level list:

| Level | Content |
|---|---|
| 1 | teaches Judging |
| 2 | teaches Opinions as Facts |
| 3 | teaches Fake Listening |
| 4 | full showdown, all three cards live, vs. an AI opponent |
| 5 | you sit in the **referee's chair** |
| 6 | you sit in the **referee's chair** again |
| 7 | the **Final Showdown** against the last boss |
| — | **live play**, at the bottom of the list |

Two entry points are also intended:
- ***Play a round*** — you argue against an AI opponent on **a topic you type
  in**. (The AI has no position of its own; it argues the opposite of whatever
  you argued.)
- ***Referee a round*** — you sit above two AI arguers and call the fouls.

**Today only levels 1–3 and the level-4 showdown exist.** Levels 5, 6, 7 and
both "round" entry points are unbuilt. You are reading a walkthrough of what
exists, in order to judge whether the ladder as a whole will teach.

Note: boss names in this build are explicit placeholders and the docs and the
code disagree about them. Do not treat any character name as final.

## What you must report back

Play the walkthrough honestly and in character as your assigned persona. Then
answer, in your own voice, with specifics and quoted lines wherever possible:

1. **Tone.** The intro screen and the coach — how serious vs. fun does it feel,
   and did that vibe help or hurt your ability to learn?
2. **Cohesion.** Does the level system hang together as one thing, or does it
   feel like separate exercises stapled together?
3. **Order.** Is Judging → Opinions as Facts → Fake Listening → full showdown →
   referee → referee → final showdown the right order to learn in? Where would
   you move something, and why?
4. **Seat.** Would you have learned this faster as a **referee** watching two
   others foul, as a **player** getting fouled and fouling, or genuinely both?
   Be concrete about what each seat taught you that the other could not.
5. **UI/UX.** What should the gym and the level list actually look and feel
   like? Say what worked, what confused you, and what you'd change.

Also flag, unprompted: the exact moment you first understood each of the three
fouls well enough to spot one cold; any moment you were bored, lost, or
guessing; and anything you think you "learned" that you suspect is wrong.

Be blunt. A polite report is a useless report. Do not praise the design to be
agreeable, and do not invent problems to seem rigorous. Report what actually
happened to you as you read.
