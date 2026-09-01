---
tid: HEART-T260831-27
slot: script.md
game: heart
purpose: the spoken script for a live match and the UI strings of the web edition, in one document
written: 2026-08-28 by biz
status: draft, unreviewed by Steve
sources:
  - docs/design/2026-08-23_full-game-scripts.md
  - docs/design/game-script-export.md
  - docs/design/2026-08-23_showdown-full-match-sofia.md
  - docs/reference/print/v7/deck-content-v7.md
  - docs/design/2026-08-15_ordinal-teaching-sequence.md
  - game/src/coach.ts
  - game/src/avatars.ts
  - game/src/pacing.ts
  - game/src/showdown.ts
  - game/src/content/cards.ts
  - game/src/content/level1.ts
  - game/src/content/level2.ts
  - game/src/content/level3.ts
  - game/src/content/showdown.ts
  - game/src/content/index.ts
  - game/src/ui/Mast.tsx
  - game/src/ui/BossIntro.tsx
  - game/src/ui/Header.tsx
  - game/src/ui/Prefight.tsx
  - game/src/ui/Drill.tsx
---

# HEART: script.md

All paths below are relative to `point-taken-heart/`. Labels: `[ruled]` means Steve
established it directly. `[ruled, Nathan]` means Nathan established it; his rulings
are attributed inline, because the bare marker means Steve. `[ruled, Nathan; Steve's
confirmation outstanding]` is the same on a point Steve has standing to overturn.
`[unratified]` means it exists in code or a design doc but nobody ruled on it; cited
as `path:LINE`. `[vibecoded]` means I wrote a placeholder because a slot exists but
no copy does; flagged inline every time it occurs. `GAP: <question>` means I refused
to invent and the question is open, and a name in parentheses says whose answer it
is. `cards.md`, `roadmap.md`, and `rules.md` carry the same vocabulary.

## 1. How to use this document

Two different products share this repo, and this document is careful to keep them
apart.

**The live game** is the printed, three-player, human-to-human match: three rounds
of listen-and-summarize, then one Final Showdown round. Its script lives on the v7
print deck (`docs/reference/print/v7/deck-content-v7.md`) and in `game/src/content/cards.ts`.
It contains no level, phase, boss, tier, stage, or chapter vocabulary `[ruled]`, and
neither does this document when describing it.

**The gym** is the solo web app: a player drills against an AI-voiced opponent,
coached by "Coach Ray." It uses levels and bosses (`game/src/content/level1.ts`
through `level3.ts`, plus `content/showdown.ts`). Every gym reference below is
labeled "(gym)" so it is never mistaken for the live game's rules.

Spoken lines (what a Referee, coach, or opponent says aloud, or what a UI shows a
player) are set as blockquotes. UI strings that are pure interface chrome (button
labels, aria text) are set in `code font` with a `file:LINE` citation. Where a
source string contains an em dash, it is quoted faithfully and flagged as violating
this document's own no-em-dash house style; that style applies to my prose, not to
quoted material.

## 2. Setup and welcome script (live game)

Source: `docs/reference/print/v7/deck-content-v7.md:44-96` (page 1 masthead,
tagline, premise, and SET UP band), all `[ruled]` as printed deck content.

> POINT TAKEN: HUMILITY SHOWDOWN

Tagline, read or shown at the top of the session:

> A 3-player game that applies simple science-backed rules to remove the fight from
> your disagreement.

Premise, said to the table before dealing cards:

> You have a disagreement with friends or family, and you want them to understand
> your perspective. But they fail to listen to you as soon as they feel (even a
> hint of) anger. Humility Showdown teaches you how to contain their anger,
> allowing them to actually listen to you.

Referee, assigning seats (deck's "HOW IT WORKS", `deck-content-v7.md:75-77`):

> Players A and B take turns giving their view on a topic where they disagree.
> Player C, that's you, serves as referee: you call fouls while A and B speak.

Token setup (`deck-content-v7.md:83-96`, `content/showdown.ts:22` for the digital
mirror of the same number):

> Each of you takes seven humility tokens. ["humility token" is what a Referee
> calls the 🙏 emoji token out loud `[ruled, Nathan; Steve's confirmation
> outstanding]`. The deck never names the emoji in words, only shows it, so this
> name lives in the script and not yet on the card; the glyph is still described as
> pray-hands in `cards.md` and `ui-components.md`, which describe the artwork
> rather than the spoken word.]
> Most tokens at the end wins. If either of you hits zero, that's an instant loss,
> whatever round we're on.

Topic pick: "Pick a topic (pg 3)" (`deck-content-v7.md:81`) refers players to the
Sample Topics table, carried in full at Section 5 below.

## 3. A listen-and-summarize round (live game)

Source: `deck-content-v7.md:150-207` (PLAY band). `[ruled]`: 30 seconds to speak,
45 seconds to summarize (Established Facts, this task's brief).

Referee, opening the round:

> Player A gives their view.

Speaker's frame (`deck-content-v7.md:159`, exact deck string):

> "The way I see it is..."

Referee calls time at 30 seconds. `[unratified]`: the deck's own timer badge
reads "⏱️ 30 sec" on all four PLAY-band exchange steps, both the speak step and the
summarize step (`deck-content-v7.md:186-188`), which does not distinguish a
45-second summarize call from a 30-second speak call. This is a real divergence
between the printed deck and the Established Fact of a 45-second summary window;
flagged, not resolved.

Referee, handing off to the listener:

> Player B, summarize.

Summarizer's frame (`deck-content-v7.md:161-162`):

> "What I heard is [x]... did I miss anything?"

Referee calls time at 45 seconds `[ruled]`. If the summary is missing a major
point, that's a Fake Listening foul; see Section 4.

Role flip, mid-round (`deck-content-v7.md:164`, `168-169`):

> Switch roles.

The mirrored half repeats with B speaking and A summarizing, same frames, same
timers. Referee, at the end of the round (`deck-content-v7.md:194-196`):

> Repeat three times. Then, the Final Showdown round.

## 4. Foul-calling script

Source: `game/src/content/cards.ts:85-255`, cross-checked against
`deck-content-v7.md:483-671` (page 3, the physical cards). Both are `[ruled]`
canonical content; where they diverge, it is noted.

**Judging.** Cost: 2 tokens (`cards.ts:90`), "DOUBLE PENALTY" (`cards.ts:110`,
deck header `deck-content-v7.md:600`). Definition, Referee reads aloud:

> A verdict on who the person is, or a claim about what they secretly want,
> instead of an answer to what they said. (`cards.ts:91`)

Smoke-alarm terms to listen for (`cards.ts`, printed face; deck
`deck-content-v7.md:645-649`): "You're saying that because...", "You only care
about...", "You don't really believe that", "You're an [X]-ist / -phobe", "You're
so [adjective]". Incorrect vs. correct pair, Referee's example script
(`cards.ts:128-135`, deck `deck-content-v7.md:658-664`):

> INCORRECT: "That's typical conservative / liberal thinking." / "You just don't
> care about the poor."
> CORRECT: "I noticed you cited [X] but skipped [Y]." / "I worry that policy would
> be unfair to the poor."

Trains: "Critique the argument, not the person." (`cards.ts`, deck
`deck-content-v7.md:668`)

**Opinions as Facts.** Cost: 1 token (`cards.ts:145`). Definition:

> A contested opinion delivered as settled truth, with nobody named as the one who
> holds it. (`cards.ts:146`)

Two-step fix, Referee's script (`deck-content-v7.md:566-568`, `591-593`; the
deck's own dash is quoted faithfully and violates this document's no-em-dash
style):

> (1) "In my head, [opinion]" → (2) "— because [evidence]"

`[unratified]`: the deck itself is internally inconsistent between an en dash and
an em dash in near-identical instances of this same phrase
(`deck-content-v7.md:591`, `609`), not something this document introduces.
Incorrect vs. correct (`cards.ts:189-196`), paired by index: "That policy would
fail..." is fixed to "I feel like that policy would fail, because in the past...",
and "Obviously that's deeply offensive" is fixed to "In my head, that felt
offensive, because my experience...". Trains: "Be a role model for comfortable
uncertainty."

**Fake Listening.** Cost: 1 token per missing major point (`cards.ts:206`,
penaltyNote at `cards.ts` printed face). Definition:

> Reloading your rebuttal while they talk, then playing back a version of it that
> leaves out the part you cannot answer. (`cards.ts:207`)

Two required steps, Referee's script (`deck-content-v7.md:508-509`):

> (1) "What I heard is [...]" → (2) "Did I miss anything?"

Incorrect vs. correct (`cards.ts:251-252`): "I hear you, but [my opinion]" is
fixed to "What I heard is [X]. Did I miss anything?" Trains: "Set a high bar for
respectful listening."

`[unratified]` ordering divergence, four different orders exist for the same three
fouls and none of them agree: the page-1 summary row and page-1 foul-call band
both list Fake Listening, Judging, Opinions as Facts (`deck-content-v7.md:63-69`,
`178-207`); the page-3 physical card layout is Fake Listening (top-left), Opinions
as Facts (top-right), Judging (bottom-left) (`deck-content-v7.md:478-480`); and the
code's `CARD_ORDER` is Judging, Opinions as Facts, Fake Listening (`cards.ts:259`).
Also `[unratified]`, self-flagged by the deck's own author: the page-1 foul-call
band renders all three foul titles with the 😒 emoji instead of each foul's own
emoji, and the third card there is titled "Opinion as Facts" (singular), against
"Opinions as Facts" (plural, the Established Fact) everywhere else
(`deck-content-v7.md:215-219`).

## 5. The Final Showdown script

Source: `deck-content-v7.md:270-411`. Own three steps, own Referee lines and
rubric, separate from the loop's script `[ruled]`.

Referee, opening:

> Three steps, starting with Player A.

**Step 1, Give a Super-Summary** (`deck-content-v7.md:284-287`):

> Summarize the other player's view across what you learned in all three rounds.
> Bonus: add a novel point.

**Step 2, Add what you learned** (`deck-content-v7.md:291-293`):

> Tell the other player what you learned. Bonus: admit where you changed your
> mind.

**Step 3, Suggest why you two might still disagree** (`deck-content-v7.md:297-300`):

> Why might the other player think differently? Bonus: frame it as a positive
> value for the other player.

Referee's scoring call, three-way rubric (`deck-content-v7.md:305`, `320-360`):
follows the rules (expected, no tokens change hands), earns a humility bonus
(tokens flow toward the speaker), or is Naughty (tokens flow away from the
speaker). Worked example the Referee can read aloud, step 3
(`deck-content-v7.md:355-360`):

> Follows the rules: "You think that people should pay back their loans, that's
> less important to me." Bonus: "You think that people should pay back their
> loans, because you value fairness and honoring commitments." Naughty: "You don't
> care about low-income people." (marked "#humility-fail" in the deck, an unclosed
> quote in the source, reproduced verbatim.)

After both players run the three steps, switch roles and repeat
(`deck-content-v7.md:374-379`). `[unratified], flagged by the deck's own author`:
the deck never states whether the Referee scores anything during this repeat, or
what "Next game: Swap Roles!" changes beyond an icon swap
(`deck-content-v7.md:381`, source's own gap notes).

**Sample Topics**, all twelve, carried in full (`deck-content-v7.md:410-454`):

1. Student loan debt for community college degrees should be forgiven.
2. Standardized tests for college should be eliminated due to unfairness / bias.
3. Individuals facing persecution should be allowed temporary asylum in my country.
4. Health insurance should be free for everyone.
5. A researcher who argues women have a genetic disadvantage in math should be
   allowed to present on a college campus.
6. A non-violent person who entered without documentation 20 years ago should be
   deported, even if it breaks up a family.
7. Sugary soda should be taxed for health effects, like cigarettes.
8. Athletes should join sports teams based on gender identity, not sex at birth.
9. The death penalty should be allowed for confident conviction of premeditated
   murder.
10. Cryptocurrency should be legal tender.
11. People should be allowed to own military-grade automatic weapons.
12. The AI industry should be substantially regulated.

See Section 10 for the neutrality audit of this table.

## 6. Closing and scoring script

Source: `deck-content-v7.md:83-96` (HOW TO WIN band), `320-360` (rubric).

Referee, at the end of the Final Showdown round:

> Count the tokens. Most tokens at the end wins. If either of you hit zero at any
> point tonight, that was an instant loss, whatever round it happened in.

**Equal tokens at the end is a draw** `[ruled, Nathan]`. There is no tiebreak, and
Final Showdown bonuses are not counted separately to break one; the game ends level
and the Referee says so. `rules.md` section 1 is the home of that ruling. No
tiebreak rule appears anywhere in the v7 deck or the design docs read for this task,
so the ruling is its only source. The web edition already ends this way
(`game/src/showdown.ts:517-522`) and has the line for it:

> Dead even. Which, in this game, isn't a bad night.

`[unratified]` (`game/src/content/showdown.ts:249`). Print has no closing line of
its own for a draw; the Referee reads the count and the count is the result.

## 7. Coaching lines (gym)

Everything in this section is gym content: solo play against an AI opponent,
never part of the live three-player game. `game/src/coach.ts` is the model-call
plumbing, not a source of copy; it defines `COACH_TIMEOUT_MS = 6000`
(`coach.ts:33`) and four functions: `restate` (`coach.ts:51`), `judgeEdit`
(`coach.ts:62`), `judgeTurn` (`coach.ts:89`), `sofiaLine` (`coach.ts:112`), each
with a hand-authored fallback string so a broken key never looks like a broken
game `[ruled]`.

The coach's name and voice are defined in `game/src/avatars.ts`, not `coach.ts`:

> Coach Ray. (`avatars.ts:19`)
> Ray. Thirty years in this corner. I do not care who wins tonight, I care that
> you can still talk to them tomorrow. (`avatars.ts:22-23`)

Per-level coaching lines (gym), each level teaches one foul against a named boss:

- Level 1, "The word 'You'", teaches Judging, boss Verdict Victor
  (`content/level1.ts:31-41`). Coach line before the fight: "He has one move. He
  tells you what you're thinking, and what kind of person that makes you."
  (`level1.ts:69`)
- Level 2, "In my head, because", teaches Opinions as Facts, boss Obvious Olivia
  (`content/level2.ts:25-31`). Boss line demonstrating the deliberate left/right
  symmetry: "Same shape, other side of the aisle. She does it to everyone."
  (`level2.ts:252`, verbatim: the `onCall` string on the boss beat.)
- Level 3, "Did I miss anything?", teaches Fake Listening, boss Nodding Noemi
  (`content/level3.ts:21-28`). Coach's take, used as the model-restate exercise:
  "Crypto exchanges should have to hold customer funds separately, because I had
  money frozen for nine weeks in a collapse and nobody could tell me where it
  was." (`level3.ts:94`)

`content/index.ts:10` wires only `[level1, level2, level3]` into the exported
`LEVELS` ladder. See Section 8 for the fourth level, which exists as content but
is not in that array.

## 8. Worked example: the Sofia match transcript (gym, not wired into the ladder)

This is Level 4 of the gym, "the full showdown against Slippery Sofia"
(`docs/design/2026-08-23_showdown-full-match-sofia.md`, tid HEART-T260823-30),
authored in full in `content/showdown.ts`. It is solo play against a scripted AI
opponent, never the live three-player game, and it demonstrates all three cards
at once with tokens live. It is carried in below verbatim because it is the only
complete match transcript in the source material.

`[unratified]`: this level is deliberately routed outside the playable `LEVELS`
array (`content/index.ts:10`, whose own comment reads "MVP is ship levels 1 to 3").
It is reachable: the Select screen renders it as its own boss tile
(`App.tsx:250-263`), `disabled={!allCleared}` until levels 1 to 3 are cleared, and
`onShowdown` routes to the wired `<Showdown>` screen (`App.tsx:47`, `:51-52`). The
unlock gate is the unratified part, not the wiring.

Coach's pre-match briefing (`content/showdown.ts:210-212`):

> This is the whole thing. Three rounds, both of you on the clock, all three cards
> live. Seven tokens each. A foul doesn't burn a token, it hands one over. Judging
> costs two. The other two cost one each. Let one of hers go past you and half a
> token crosses anyway. Empty and you're done, whatever the round says. She's
> Slippery Sofia. She doesn't shout, she doesn't insult you, and she will foul you
> twice before you notice once. You whistle her. I whistle you.

Opening prompt (`showdown.ts:203-206`): "What are you two actually disagreeing
about? One line is plenty," with topic chips "student loan forgiveness," "return
to office mandates," "nuclear power" (`showdown.ts:54-58`). Political balance here
is structural: Sofia has no position of her own, only the opposite of whatever the
player argues (`showdown.ts:9-13`).

**Round 1** (`content/showdown.ts:90-128`). Sofia opens clean:

> Here's where I land. I think the cost of this ends up on people who had no say
> in it, because the bill always finds the people with the least room to argue.
> That's my read, and I could be wrong about how big it is.

Player summarizes; player speaks; Sofia fouls Opinions as Facts:

> Here's the thing though. That approach obviously doesn't work. Everyone knows
> what happens when you try it, and we have been through this before.

**Round 2** (`showdown.ts:131-164`), entirely clean. Player speaks first. Sofia
summarizes cleanly:

> Let me play that back to you. It bugs you that the burden sits where it does,
> because you think the people carrying it didn't create it. Have I got that
> right?

Sofia then argues her own reasoning, cleanly:

> Let me put my actual reasoning on the table. I think the cost falls on people
> who had no say in creating it, and I would rather fix the thing that keeps
> generating the cost than keep moving it around after the fact. That's where I
> land, and I could be wrong about the size of it.

Player summarizes.

**Round 3** (`showdown.ts:167-199`), the coach flags an escalation before it
happens. Sofia fouls Fake Listening:

> Right, right. I hear you, you're frustrated about the whole thing. Anyway.

Sofia fouls Judging:

> Look, you're only arguing this because it happens to work out well for you.
> People in your position always land exactly here.

Player summarizes one last time; a foul against the player does not excuse them
from summarizing (`showdown.ts:243-244`, `redoSummary`).

**Endings** (`showdown.ts:247-258`):

> Win: You took it. Not because you were right about the policy; I have no idea
> who was right about the policy. You took it because you stayed on the argument
> and she didn't.
> Loss: She took it. Go back and drill the card she kept getting past you.
> Draw: Dead even. Which, in this game, isn't a bad night.

`[unratified]`, self-documented in the design doc: Sofia's authored fouls total
four tokens against her seven-token purse, so she cannot be knocked out by design
(`content/showdown.ts:251-256`); the design doc also flags round 3 breaking the
"never foul twice in a row" rule on purpose (`2026-08-23_showdown-full-match-sofia.md:89-93`),
open for Steve to keep or cut.

## 9. UI strings of the web edition (gym), by screen

**Note for the reader:** this section is a snapshot of the code as read on
2026-08-27 to 2026-08-28. It will drift the moment anyone edits these files. It is
meant to be regenerated from source, not hand-maintained.

- Masthead (`ui/Mast.tsx:1-32`): eyebrow "Point Taken:", wordmark "Humility" /
  "Showdown", pill "PointTaken.social".
- Boss walk-out screen (`ui/BossIntro.tsx:87`, `116`, `73`): `Fight {fightNumber}`;
  countdown text is the number, or `FIGHT` at zero; mute toggle aria-label
  `"turn the sound on"` / `"turn the sound off"`.
- In-match token header (`ui/Header.tsx:25`, `57`, `156`): token glyph is the
  literal 🙏 character; side labels are the literal strings `"them"` and `"you"`.
- Pre-fight stepper (`ui/Prefight.tsx:86-88`, `98`, `120`): renders `COACH_NAME`
  and `COACH_LINE` on the first panel; fixed transition line "That's his attack.
  This card is your defense. It stays on the wall all night."; default button
  label `"Next"` when a level has not set its own `enterLabel`.
- Drill dialogue lane (`ui/Drill.tsx:152`): the player's display name in the
  transcript is the literal string `"You"`.
- Showdown composer frames (`showdown.ts:69-83`): speak frame is "The way I see
  it," [input: "your take"], "because," [input: "your reason"], "."; summarize
  frame is "What I heard was," [input: "her point, in your words"], ", because,"
  [input: "her reason"], ". Did I miss anything?"
- Pass option label (`showdown.ts:388`): `"I might not agree, but it's not a
  foul"`.

## 10. Neutrality audit

Every politically-perceptible example in this project's own source material was
checked for a same-weight opposite-side counterpart, per the standing rule.
Findings, worst first:

**The v7 deck's Sample Topics table is lopsided and this is not flagged
anywhere in the deck.** The per-topic classification and the count live in
`cards.md` section 7, which is the normative home for that audit; read it there
rather than re-deriving it here. Two findings are specific to the strings
themselves, and stay here. First, two of the three conservative-coded topics are
phrased with language that undercuts the position being tested rather than presenting it
at full strength: the deportation topic is qualified as "non-violent... 20 years
ago... breaks up a family," and the gun-ownership topic uses "military-grade
automatic weapons," a phrase associated with the side that opposes gun rights
rather than a neutral description. `deck-content-v7.md:410-454`. This directly
contradicts the topic policy stated elsewhere in this same codebase: "Milder end
of real public policy. Not immigration, not abortion." (`content/showdown.ts:53`),
since both asylum and deportation are immigration topics.

**Level 1 (gym) self-reports its own imbalance and asks Steve to rule on it.**
Its own header comment states the level runs 4 to 0 against a forgiveness
position in the Judging column and 3 to 1 against it in the argument column,
after Steve's 2026-08-25 dictated replacement text for item 4 removed what had
been the level's counterweight. Open question tagged HEART-T260823-33: "Whether
that is enough is Steve's call." (`content/level1.ts:8-27`) This is not my
finding; it is the file's own self-audit, surfaced here per this task's
instruction to report every neutrality lopsidedness found.

**Level 2 and Level 3 (gym) claim balance and the claim checks out.** Level 2's
own ledger states two items lean left, two lean right, and the boss beat
demonstrates the same move on both a crypto/libertarian-coded line and a
minimum-wage/conservative-coded line: "Same shape, other side of the aisle. She
does it to everyone." (`content/level2.ts:12-20`, boss beat `level2.ts:235-256`)
Level 3 does not balance within itself; its ledger explicitly relies on Level 1
opening on a pro-forgiveness target and Level 2 opening on a conservative one as
its counterweight (`content/level3.ts:11-17`). This is a real but disclosed
design choice, not a silent lopsidedness.

**The Judging card's incorrect-example pair is internally consistent, but its
topic choice is one-directional.** `content/cards.ts:128-131` pairs "That's
typical conservative / liberal thinking" (both sides named) with "You just don't
care about the poor," fixed at `cards.ts:132-135` to "I worry that policy would
be unfair to the poor." Both lines are about the same poverty-policy question,
which the deck and code choose as their one worked example of a Judging line
about economic policy, with no equivalent example built the other direction
(for instance, a judgment aimed at a position associated with the political
right). Minor relative to the Sample Topics finding above, but it is the same
pattern: when this project reaches for one vivid political example, it reaches
left more often than right.

No lopsidedness was found in the Sofia match transcript (Section 8): it is
symmetric by construction, since Sofia only ever argues the opposite of whatever
the player chose (`content/showdown.ts:9-13`).
