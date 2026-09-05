---
slot: soul.md
game: heart
purpose: Why Humility Showdown exists and what it is for, so that a judgment call made without Steve in the room lands where he would have put it.
written: 2026-08-28 by biz
status: draft, unreviewed by Steve
sources:
  - point-taken-heart/docs/design/heart-soul.md
  - point-taken-biz/docs/brand/PT-soul.md
  - point-taken-heart/docs/design/rules-gaps-and-resolutions.md
  - point-taken-heart/docs/design/design-decisions-braindump.md
  - point-taken-heart/game/src/ (cards.ts, showdown.ts, content/showdown.ts, engine.ts, types.ts, pacing.ts)
---

# Humility Showdown: Soul

The source documents in the frontmatter live **above this repository's root** and are not pushed
with it. Their substance is carried into this file. Do not go looking for them; if you need
something only in them, ask Steve for it by name. This is the conscience document. `rules.md` states
what the rules are; this states why, so that when you hit a case the rules do not cover you can pick
the answer Steve would pick. If the two disagree on a mechanic, `rules.md` wins on the mechanic and
this file wins on the reason; escalate rather than quietly reconciling. Steve is founder,
vision-holder, and game designer `[ruled]`, and every design question with a values component is
his.

## 1. The problem the game addresses

Almost everyone has a beloved relative or an old friend they can no longer talk to, because one
topic now detonates on contact. Within about a minute of a hard subject the armor goes up and the
exchange turns angry, and the relationship, not the argument, is what gets lost. That loss is the
target.

Three framings Steve uses, which should shape any copy you write. **Junk food and broccoli:**
arguing is primate junk food, feeding the urge to signal to your own side and demonize the other,
while dialogue is broccoli, needing stamina and emotional regulation, so the game has to supply the
structure willpower will not. **Tug-of-war and the joint puzzle:** media trains people into sports
mode, where the point is to humiliate the other side; Heart moves them into teamwork mode, working
one puzzle. **The knot:** you cannot untie a knot while both people pull on the string, so every
mechanic in the game is a device for producing slack.

What makes this tractable is that people are fighting caricatures, not each other. Two paired
figures from the brand narrative, one about each side: Republicans estimate 32% of Democrats are
LGBT (true figure about 6%), Democrats estimate 38% of Republicans earn over $250,000 (about 2%).
Affective polarization is reported as falling from a neutral 48 degrees in the 1970s to a cold 20
today, outparty dislike now exceeding inparty affection. Both `[unratified]`; the citations are not
in this repository.

GAP: (Steve) What is the source study and year for the 32%/6%, 38%/2%, and 48-to-20-degree figures, and are they cleared for player-facing or press-facing copy? Steve holds the source and has to locate it; until he does the figures stay `[unratified]` and stay out of anything a player or a journalist reads.

## 2. Lineage: deep canvassing

The game is inspired by deep-canvassing research (Broockman and Kalla). Canvassers changed minds not
by arguing but by listening, and by inviting the other person to connect the issue to their own
lived experience. The refinement that matters: the most effective perspective-taking is **not**
"imagine how they feel", it is recalling a personal experience that produced the same emotion in
another context (Kalla and Broockman 2021). The literature also flags fade-out, the warmth gains
decay (Santoro and Broockman 2022), which is why the game is a repeatable drill with a ladder rather
than one transformative session. Heart trains the field posture: relational safety first, persuasion
never the goal.

## 3. Who plays, and why

Three people at a table, or three in a thread: two speakers and a third who moderates `[ruled]`.
Roles swap between games `[ruled]`, so nobody is permanently the adult in the room. Who shows up:
family or old friends with one live wire between them who want the relationship back more than the
point; couples, where the subject is not politics and the fouls are the same; workplaces, where a
manager and a report are formally equal inside the game and unequal outside it; classrooms, where a
facilitator runs the moderator seat. The game is strictly **opt-in** `[ruled]`. It never obliges a
vulnerable person to sit down and educate someone hostile. If a session would function as that,
Heart is the wrong tool, and every surface you build should make leaving cheap and unpunished.

**The youngest player Heart is designed for is 11, the start of middle school** `[ruled, Nathan;
Steve's confirmation outstanding]`. That is a floor on the player, not a clearance on the subject:
the opt-in rule above and the moderator's judgment still decide whether a particular room should be
running a particular disagreement.

GAP: (Steve) Is there a classroom-specific variant of the moderator seat, or does a facilitator simply take the ordinary third seat?

**Two people can play** `[ruled, Nathan]`. In person, the two of them self-moderate for each other,
each taking the referee's job on the other's turns. Online, the AI takes the referee seat. Both are
real configurations rather than practice-only, and the online one is the only place besides solo
practice where software sits in that seat: otherwise the AI referee exists so that a person playing
alone has a second and third player, and live play with three humans never puts software there.
Section 6 still binds the AI in the two-player online game. It may call something to the table's
attention, and it may not decide over the wronged player's head that a foul happened, because the
wronged player's answer is the only correct answer there is.

## 4. What a good session feels like

Stiff at the start. The required moves feel procedural for two or three rounds, and players have
described the early feel as an exercise rather than a conversation. That awkwardness is functional,
it slows the pace and catches content, and it wears off as players put the phrasing into their own
voice. Do not design the stiffness out; design the onboarding so it arrives expected. Then the tone
flips. Two diagnostics: somebody gets summarized better than they said it themselves and visibly
relaxes, and somebody volunteers a concession the structure made safe. The ending is not agreement.
Locating the exact point of disagreement and finding it is a difference of **priorities, of
information, or of taste** is a full win, so do not build a surface that congratulates convergence
and consoles divergence. Informally, when players state points plainly they retreat from the silly
versions of their own arguments and find they already agree on roughly 75% to 80% of the underlying
logic `[unratified]`.

**One online match is intended to run about 15 minutes** `[ruled, Nathan]`, a design target rather
than a measured result. The figure gets settled by playtesting later, so **no time figure is
approved for player-facing or marketing copy yet** `[ruled, Nathan]`. Build to 15 minutes; print
nothing about it.

## 5. Why humility rather than winning

There is a scoreboard, and it is deliberately not a scoreboard for arguing well. The token economy
`[ruled]`: most 🙏 tokens at the end wins. What produces tokens is not persuasion, not evidence, not
rhetoric. It is not fouling, and catching fouls. The only route to winning is behaving well toward
the person across from you, so the competitive instinct is not suppressed, it is aimed at the one
safe target. Consequences to preserve:

- **A foul moves a token, it never burns one** `[unratified]` (`game/src/engine.ts:116`,
  `game/src/showdown.ts:11`). A token is compensation for something done to you, not a point you
  earned. That is why the wronged party receives it.
- **You do not get a token for playing clean** `[ruled]` (Steve, 2026-08-25, quoted at
  `game/src/engine.ts:332`). Not fouling is the floor, not an achievement.
- **Raw foul count is ruled out as a score** `[ruled]`: it penalizes the player watched more closely
  rather than the one playing worse, and rewards calling fouls tactically.
- **Scoring position movement is ruled out** `[ruled]`. Tested, and players softened positions they
  actually held to earn points. Rewarding movement toward the other person rewards dishonesty.

Humility is the frame because it is the only posture that makes the other mechanics work: you cannot
summarize generously while certain you are right, or accept the other person's ruling on your own
foul unless you grant they know something about their experience that you do not.

## 6. The one ruling that never moves

> The question "did I foul?" has exactly one correct answer in this game, and it is not a rule
> and not a judge: **did the other person feel fouled?**

Steve, 2026-08-23 `[ruled]`. There is no objective test for whether something was Judging or an
Opinion-as-Fact; the only real rule is to keep the other person feeling safe and respected. So the
referee, human or software, must never judge truth or intent. Its job has two parts:

1. **Flag a candidate cheaply.** A surface pattern (a "you" plus a trait word, a bare assertion, a
   hinge like "I hear you, but") nominates a moment. It will be wrong often, and that is fine.
2. **Route the call to the possibly-wronged human.** "Did you feel judged there?" "Do you disagree
   with that, and was it stated without a reason?"

The routing is not a fallback for an unsure classifier. **It is the pedagogy.** A high-precision
classifier is therefore neither necessary nor desirable: it would quietly replace the lesson with an
authority. Between detector accuracy and keeping the call with the human, keep the call with the
human. Two hard consequences:

- **An AI opponent rules on its own behalf, in character**, exactly as a human opponent would. That
  is not a machine judging, it is the machine acting as the party who was spoken to. Do not route
  AI-side rulings through the coach.
- **No path anywhere in the product lets software decide a foul happened and apply a penalty without
  the wronged party's assent.** No exceptions, no confidence threshold high enough.
- **Carve-out, the gym only** `[ruled]` (Q7): a scripted opponent's authored reply is an answer key written by a human author, not software deciding a foul, so it binds inside a drill and nowhere else.

**Coach and moderator are one entity, and a thread holds at most three parties** `[ruled]` (Steve,
2026-08-23). There is no separate referee character. The coach *is* the moderator: one visible third
participant who teaches, flags candidates, asks the wronged party to rule, and narrates the token
economy. The parties are the Player, the opponent (human or AI), and the coach, never a fourth
voice. The coach may lean ("you might have offended them there", or, to the other side, "you would
be within your rights to be offended by that"), but those are coaching, never rulings. **The coach
never converts its own suspicion into a token.**

## 7. The three cards, read through that lens

Three cards, three fouls: Fake Listening, Judging, Opinions as Facts `[ruled]`.

- **Fake Listening** is already built correctly: called during the mandatory summary step, by the
  speaker, over what the listener failed to capture. The *required game move* makes it observable.
- **Judging** is feeling-based. Flag the "you" plus character or motive pattern cheaply, then ask
  the listener whether they felt judged. The machine surfaces, the human decides.
- **Opinions as Facts** flags a bare assertion, but it is only a foul if the listener disagrees with
  it and no justification was offered. The duty to justify is triggered by the other person's
  disagreement, not by a rule the machine holds. The mirror half matters as much: anything with an
  owner on the front ("in my head", "my read is", "I think") is fair game and **cannot** be called.

The pattern across all three: the game's *required moves* are what make detection tractable. A
mandatory summary makes Fake Listening observable; a soft-required "because", or an ownership
prefix, does the same for Opinions as Facts. To make a new behavior detectable, add a required move,
not a classifier. Costs as printed on the card faces: Judging is a double penalty at 2 tokens, the
other two are 1 each, and Fake Listening's is per missing major point rather than flat `[ruled]`
(`game/src/content/cards.ts:90`, `:110`, `:145`, `:167`, `:206`, `:226`, `:227`).

## 8. Design values that decide close calls

1. **The wronged party rules.** Always. Section 6 is not negotiable by any later convenience.
2. **Add a required move, not a judge.** If a behavior is invisible, make the game demand a move
   that exposes it, and flag cheap and wrong rather than accurate and authoritative: a false
   positive costs a question, false authority costs the lesson.
3. **Teach by delta.** A bad line alone is a warning; a bad line with its fixed version under it is
   a lesson (Steve, 2026-08-24: "need the direct deltas") `[ruled]`. Never ship a bad example
   without its repair beside it.
4. **The card in the app is the card on the table.** The printed deck's wording and layout are the
   design of record, so do not invent new bad examples in code. A line that reads wrong is wrong on
   the card too, and the print master gets fixed first `[ruled]`
   (`game/src/content/cards.ts:8`, `:33-34`).
5. **Answer immediately, not at the end of the round**, or the feedback is not attached to anything
   `[ruled]` (ruling of 2026-08-24, `game/src/content/showdown.ts:223`).
6. **Politeness is not compliance.** "With respect, I think it's clear that..." performs humility
   without enacting it, and a repair that drops the trigger word but keeps the courtesy wrapper has
   repaired nothing.
7. **Specifics must not reassemble a verdict.** Enumerating instances until they add up to the
   character judgment the rule prohibits is an evasion; a recurring pattern is legitimate only when
   named openly as a pattern, and as a question.
8. **The speaker owns the word for their own feeling.** If a player said "anxious" and the other
   relabels it "just cautious", the speaker's word wins in every later summary. Information flag,
   not a foul call: no penalty, no pause.
9. **Content fidelity is not emotional fidelity.** A summary can be factually right and still
   launder out what mattered. A feeling word the speaker used belongs in the summary.
10. **Favor the speaker on a genuinely contested call.** Known cost: it mildly rewards contesting a
    call you know is fair. Accepted, because the alternative is reading intent in real time.
11. **The game equalizes turn structure, not social stakes.** Where one player has authority over
    the other, say so rather than pretend the mechanic fixed it. The gift is permission the org
    chart does not grant: the junior person may call a foul.
12. **Leaving is always cheap.** A player can pause, say a card hit a nerve, ask for a reframe, or
    stop the game. A rule-abiding argument can still cause real pain, so the whole thing is
    voluntary.
13. **Every politically-perceptible example gets an equally vivid counterpart, or an explicit
    acknowledgment that it is unbalanced.** Non-negotiable, and live constantly here. See section 9.
14. **Name saved state by slug, never by number** `[ruled]` (ruling B3, 2026-08-23,
    `game/src/types.ts:169`); renumbering the ladder must not orphan a player's saves. Setup and
    card teaching run as a stepper with a Next button, not a stack of coach lines (Steve,
    2026-08-25) `[ruled]` (`game/src/types.ts:158`).
15. **When teaching and pace conflict inside one beat, cut the teaching, not the pace**
    `[vibecoded]`. A bored player stops reading, and a coach line nobody reads teaches nothing.

## 9. Political neutrality in practice

Any politically-perceptible example needs an equally vivid opposite-side counterpart, or an explicit
flag acknowledging the imbalance. "Equally vivid" is the operative phrase: a sharp example from one
side paired with a limp one is worse than no pair, because it teaches which side the game thinks is
the problem. Worked pair, for a Judging foul:

- "You only want open borders because you have never had to compete for a job."
- "You only want the border closed because you have never had a neighbor deported."

Same structure, same sting, opposite direction. The printed Judging card is built this way, naming
"That's typical conservative / liberal thinking" as one paired item rather than picking a side
`[ruled]` (`game/src/content/cards.ts:129`).

Where a real pair is impossible, flag it with a one-line comment saying the example is unbalanced
and why. Do not drop the imbalance silently, and do not invent a false equivalence to satisfy the
count. Non-political subject matter is the default wherever it does the same job (nuclear power,
crypto, commuting, childcare); reach for a political example only when nothing else carries the
charge.

## 10. What Heart is NOT trying to be

- **Not a persuasion tool.** A feature that makes one player likelier to change the other's mind is
  not thereby a good one.
- **Not a truth engine, fact-checker, or classifier benchmark.** The game has no opinion about who
  is right, only about how people treat each other while disagreeing. Nobody is grading detector
  precision, which is instrumentally useful at best and harmful past a point (section 6).
- **Not an enforcement or moderation product.** No automatic penalties, no confidence-scored
  rulings, no transcript sent away to be judged. The design that would make Heart a good moderation
  demo is the design that would destroy it as a game.
- **Not a consensus machine.** A clean, precise, honest disagreement is a win state.
- **Not therapy.** It borrows from couples-therapy practice, treats nothing, and must never present
  itself as clinical.

- **Not the other Point Taken game.** Point Taken ships two separate games. Heart is Humility
  Showdown, emotional hygiene and relational safety, in print and on the web. The other has
  different mechanics, a different audience, and its own documents. Do not import its concepts,
  vocabulary, or features, and never call Heart a mode of it.

## 11. The flow, as ruled

Three rounds of listen-and-summarize, with the two speakers flipping roles inside each round; then,
optionally, one Final Showdown round, flipping once. The third player moderates the whole game. Most
🙏 tokens at the end wins, and roles swap between games. Timers: 30 seconds for the speaker, 45
seconds to summarize `[ruled]`. **The print flow is the same as the live-human flow** `[ruled]`, the
constraint that keeps the web edition honest: if a web mechanic could not be performed by three
people at a table with a printed deck, it is probably wrong.

GAP: (Steve) Do the 30-second and 45-second timers apply to typed play in the web edition, or only to spoken play? If they apply, what starts the summarize clock? There is no timer plan to read off; Steve has it or nobody does.

**The Final Showdown is an add-on, not a required round** `[ruled, Nathan]`. A game played without
it is a whole game, not a truncated one. What sets it apart is not the economy: **token stakes, card
availability, and the three fouls all stay exactly as they are in the ordinary rounds, and tokens
carry straight over from the main game rather than resetting** `[ruled, Nathan]`. What it adds is
its own three-step structure and rubric, the one-token humility bonus included. `rules.md` section 6
is the home of those mechanics and `roadmap.md` section 6 carries the build. It is still absent from
the current code, which runs rounds 1 to 3 and then scores.

**A player who reaches zero is not out** `[ruled, Nathan; Steve's confirmation outstanding]`. Tokens
stop at zero and never go negative, and the player finishes the game from there. The reasoning fits
this document: ejecting the player who fouled most removes the person with the most left to learn,
and section 3 wants the exit to stay cheap for the player who wants one, not to be handed to the
player who does not.

**This reverses a standing ruling and has not been propagated anywhere.** The instant loss at zero
is `[ruled]` in `rules.md` sections 1, 8, and 9, where it records a 2026-08-10 decision that
considered softening the zero and refused. It is printed on page 1 of the deck, it is quoted twice
in `script.md` sections 2 and 6, and the web edition ends the match on empty
(`game/src/content/showdown.ts:250`). None of that has been changed. Steve has standing to overturn
this, and the printed deck has to be reconciled with whichever way it lands, so it is escalated
rather than quietly carried through the other documents.

## 12. The open tension, held open on purpose

Opinions-as-Facts may turn out to be a **phrase-rule** while Judging stays **feeling-based**.
Ownership prefixes ("the story I'm telling myself is...", "in my head...") let you assert anything
without breaking the rule, easy to obey to the letter and easy to check with a string match. The
empirical question, which in-person play cannot settle: does the prefix by itself prevent offense,
or does the listener still feel the underlying claim as a fact-assertion they reject? If it
suffices, Opinions-as-Facts detaches from the feeling-based model governing Judging; if not, it
routes back to the listener's experience and the two fouls share one model. **Do not resolve this in
code.** The instrument for getting that data is a **post-round listener review**: after the round,
show the listener the transcript or bullet points and ask "did you disagree with any of these, and
did the speaker give a reason?" A real-time red button would be cleaner, but pressing it mid-summary
is disruptive and players will not want to interrupt. The review is a first-class feature, not a
nice-to-have.

**The post-round listener review is not in the current build** `[ruled, Nathan]`, and may be picked
up later. That defers the instrument, not the tension: the paragraph above stands, the review stays
a first-class feature of the design, and the Opinions-as-Facts question stays open because nothing
in this build can settle it. The consent question is deferred with it rather than answered, and has
to be settled before any version of the review ships. `roadmap.md` section 8 is the home of
deferrals.

## 13. Things that cannot be carried into this repository

These are load-bearing and live outside the pushed repo. Ask Steve for them by name: the printed
deck master, `PointTaken-HumilityShowdown_2026-08-19.pptx`, and its `.pdf` export, the design of
record for card wording, layout, and penalty labels; the print card-anatomy write-up and
deck-content transcription that `game/src/content/cards.ts` cites in its header comments, whose
paths are **not reachable from inside this repo**, so do not chase them; the corpus annotation files
behind the foul design; and the deep-canvassing notes.

**v7 is the design of record for card copy** `[ruled, Nathan]`: where two print generations
disagree, the more recent one wins. Every other version citation in the code already points at v7,
and the card copy itself was taken from v7 card-anatomy (`game/src/content/cards.ts:24`). The one
stale citation is the file's opening header (`game/src/content/cards.ts:3`), which still names a v6
rules summary. The comment has not been changed here.

## 14. Warning about the older design generation

Two source documents (a rules-gaps analysis and a design braindump, both May 2026) describe an
earlier generation of this game under a different name: six numbered fouls, an Acknowledgment Gate,
a buzzer with a rephrase window, no tokens. That mechanical layer is superseded by the three cards
and the token purse. What survives, and what sections 8 and 12 carry forward, is the **reasoning**:
the failure modes found in live play and the values used to choose between fixes. Read either one
for its judgment, not its rules.
