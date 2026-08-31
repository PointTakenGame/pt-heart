---
slot: rules.md
game: heart
purpose: The complete player-facing rules of Humility Showdown, print and online, with every specific value marked ruled, unratified, vibecoded, or gapped.
written: 2026-08-28 by biz
status: draft, unreviewed by Steve
sources:
  - point-taken-heart/docs/reference/print/v7/deck-content-v7.md
  - point-taken-heart/docs/reference/print/v7/card-anatomy.md
  - point-taken-heart/docs/design/rules-gaps-and-resolutions.md
  - point-taken-heart/docs/design/2026-08-15_ordinal-teaching-sequence.md
  - point-taken-heart/docs/design/2026-08-09_heart-level-build-table.md
  - point-taken-heart/docs/design/scenario-cards.md
  - point-taken-heart/docs/design/buzzer-tap-card-v2.md
  - point-taken-heart/game/src/{engine,showdown,detectors,coach,types}.ts
  - point-taken-heart/game/src/content/{cards,showdown,level1,level2,level3}.ts
---

# Humility Showdown: the rules

This is the Heart edition of Point Taken. It is a separate game from Point Taken Brain, not a second medium of it. Nothing about argument mapping, logical fallacies, an AI-only referee, or Brain's Gym belongs here. If you find yourself importing a Brain concept, stop.

**Status markers**, inline on every specific value. A marker says who put a number there, so a reader can tell a decision from a placeholder without having to ask. `[ruled]` Steve or a registry decision established it. `[ruled, Nathan]` Nathan established it; his rulings are attributed inline, because the bare marker means Steve. `[ruled, Nathan; Steve's confirmation outstanding]` the same, on a point Steve has standing to overturn. `[unratified]` it exists in the shipped code and nobody ruled it, with file and line. `[vibecoded]` the author of this document invented it because a sketch is easier to correct than a blank; a proposal, not canon. `GAP:` refused to invent, a human must answer, and a name in parentheses says whose answer it is. Section 10 collects the gaps. `cards.md` and `roadmap.md` carry the same vocabulary.

Card and page text is quoted as printed, except that em dashes in the source appear here as commas or ellipses, the same substitution the shipped card content made (`game/src/content/cards.ts`).

---

## 1. Object of the game and win condition

Three players. Two of them, Player A and Player B, actually disagree about something. The third, Player C, is the Referee and does not argue. `[ruled]` The deck's pitch, verbatim: "A 3-player game that applies simple science-backed rules to remove the fight from your disagreement."

The object is not to win the argument. Nobody is ever ruled correct about the topic, and the Referee is forbidden from judging who is right. The object is to listen and speak cleanly enough to keep your tokens, and generously enough to earn more.

- **Win condition:** most 🙏 tokens at the end wins. `[ruled]`
- **Instant loss:** a disputant who reaches zero tokens loses on the spot, mid round. Printed on page 1 as "If Player A or B hits zero, Instant loss 🏳️". Kept unsoftened on purpose `[ruled]`, a 2026-08-10 decision that withdrew a proposal to make the first zero a forced break instead.
- **A tie:** equal tokens at the end is a draw. `[ruled, Nathan]` There is no tiebreak, and Final Showdown bonuses are not counted separately to break one. The print deck does not address a tie; the online edition already resolves it this way (`game/src/showdown.ts:517-522`), so the code and the rule now agree rather than the code standing alone.
- **A full game** is three listen-and-summarize rounds, then one Final Showdown round. Roles swap between games: page 1 ends "Next game: Swap Roles!" `[ruled]` The swap rotates the Referee's seat as well as the two disputants', and one game makes a session. `roadmap.md` section 5 and `cards.md` section 6 are the homes of those two rulings.

---

## 2. Setup: players, roles, cards, tokens

**Players and roles.** Exactly three. `[ruled]` Player A and Player B are the disputants. Player C referees the whole game, both directions of every round, including the Final Showdown, and never states a position on the topic.

**Tokens.** Seven 🙏 per disputant, fourteen on the table. `[ruled]` Page 1's setup band prints "x7" against each of A and B; page 3 carries a cutout panel of two token columns, seven 🙏 each. Note that `docs/reference/print/v7/card-anatomy.md` section B.3 says six per column; that is a known error in that file (`HEART-T260827-03`) and the correct count is seven.

Tokens never leave the table. A foul moves a token from the offender to the other disputant; it is never destroyed and never paid to the house or to the Referee `[ruled]`, so the two purses always sum to fourteen, which is how the code enforces it (`game/src/engine.ts:118-126`). The Referee holds no tokens and scores nothing at all. `[ruled, Nathan]`

**Cards.** Three, and only three: Fake Listening, Judging, Opinions as Facts. `[ruled]` They print on page 3 and are read aloud before play starts, per page 1's "Read foul cards (pg 3)".

**The topic.** Pick one thing you disagree about. Page 2 prints twelve sample propositions as a fallback, and the deck's footer strip says the better option out loud: "BETTER: USE THAT REAL DISAGREEMENT YOU'VE BEEN CARRYING". For the online edition Steve ruled on 2026-08-10 that the front door is "state the disagreement in one sentence", typed by either party, with the sample grid only a fallback for players who arrive without one. `[ruled]`

The twelve printed samples, each a single proposition to agree or disagree with: forgiving community college loan debt; eliminating standardized college tests as unfair or biased; temporary asylum for people facing persecution; free health insurance; letting a researcher who argues women have a genetic math disadvantage present on campus; deporting a person here twenty years without documents or violence even if it splits a family; taxing sugary soda; team eligibility by gender identity rather than sex at birth; the death penalty for a confident premeditated-murder conviction; crypto as legal tender; ownership of military-grade automatic weapons; substantial regulation of the AI industry.

*Balance note.* Read as a set, these cut both directions: roughly six lean toward positions more often held on the left (forgiveness, test elimination, asylum, public insurance, gender identity in sport, AI regulation) and six toward the right or toward contested-speech and enforcement positions (the campus platform, deportation, the death penalty, crypto, weapons, and the soda tax, which cuts across). A game built on two real people's real disagreement needs no house position and the deck does not take one. Anyone editing this list must keep it balanced by vividness as well as by count.

---

## 3. The three cards

Quoted from the v7 print faces. The order below follows page 3's grid; page 1 orders the same three differently and the code a third way. That is cosmetic, not a rule.

### 3.1 Fake Listening 🙃

Eyebrow SUMMARIZATION FOUL. Penalty 🙏, "For each missing major point". `[ruled]`

Rule, verbatim: "Before you respond: show you actually heard them, instead of nodding, while loading your mic-drop rebuttal."

**Two required steps**, printed as their own band: "Two steps are required during the Summarize step: (1) 'What I heard is [...]' then (2) 'Did I miss anything?'" Both halves are mandatory. The procedure column adds a third beat that is deliberately unscored: "Thank them for corrections."

Smoke alarm terms: "I hear you, but..." / "Sure, but my point is..." / "Respectfully..." / "First of all..."
Incorrect: "I hear you, but [my opinion]". Correct: "What I heard is [X], did I miss anything?"
Trains: "Set a high bar for respectful listening."

### 3.2 Opinions as Facts 🧐

Eyebrow TONE FOUL. Penalty 🙏, single. `[ruled]`

Rule, verbatim: "Don't state a contested opinion as fact. Rule: 'Contested' = other player *disagrees*." That definition is the whole card: contested is not a judgment about the world, it is the plain fact that the person across the table disagrees.

**Two required steps:** (1) "In my head, [opinion]" then (2) "because [evidence]". The card's own note names the point of the mechanic: "It doesn't matter if you are right. The point: keep anger from rising."

Accepted ownership openers, from the card: "In my head, [opinion]" / "The story I tell myself..." / "The way I think is..." / "I feel like..."
Smoke alarm terms: "Obviously..." / "Of course..." / "Everyone knows..." / "It's a fact that..." / "X would cause Y..."
Incorrect: "That policy would fail...", "Obviously that's deeply offensive". Correct: "I feel like that policy would fail, because in the past...", "In my head, that felt offensive, because my experience..."
Trains: "Be a role model for comfortable uncertainty."

### 3.3 Judging 😒

Eyebrow TONE FOUL. Penalty 🙏🙏, DOUBLE PENALTY, the only two-token foul in the game. `[ruled]`

Rule, verbatim: "Don't render a verdict on who they are, and don't tell them what's in their head. The word '*You*' is a major red flag."

This card has no two-step procedure band. There is no compliant way to render a verdict on a person; the fix is to aim at the argument instead.

Smoke alarm terms: "You're saying that because..." / "You only care about..." / "You don't really believe that" / "You're an [X]-ist / -phobe" / "You're so [adjective]"
Instead: "Stick to reasoning, not personal attacks", "Challenge their argument, not their hidden motives."
Incorrect: "That's typical conservative / liberal thinking", "You just don't care about the poor". Correct: "I noticed you cited [X] but skipped [Y]", "I worry that policy would be unfair to the poor."
Trains: "Critique the argument, not the person."

*Balance note.* The card's own incorrect example is self-balancing by design, naming both "conservative" and "liberal" in one breath. Keep it that way in any rewrite.

**Naming footnote.** The v7 print art titles this third card "Opinion as Facts", singular, in page 1's foul row. "Opinions as Facts", plural, is correct and is used everywhere else including the page 3 card face. The singular is a known art bug (`HEART-T260827-04`).

---

## 4. The three fouls: what each is, how it is called, what it costs

| Foul | Kind | Who can commit it | Cost |
|---|---|---|---|
| Fake Listening | Summarization | The summarizing player | 🙏 x1 per missing major point `[ruled]` |
| Opinions as Facts | Tone | The speaking player | 🙏 x1 `[ruled]` |
| Judging | Tone | The speaking player | 🙏🙏, double `[ruled]` |

Page 1's one-line definitions, verbatim: Fake Listening is "Summarizing Player failed to mention critical point(s)". Judging is "Speaker stated a verdict on who Listener is, or what their 'real' beliefs are". Opinions as Facts is "Speaker stated a controversial opinion as an undeniable fact".

**How a foul is called.** Page 1, verbatim: "**Referee** calls **FOUL CARDS** while players speak. The **Naughty Player A/B** gives 🙏's to the other". The mechanism is physical and public: the Referee plays the card, names the foul, and the offender hands tokens across. `[ruled]`

**Order of operations.** The card lands before the tokens move. Steve, 2026-08-25 `[ruled]`, implemented as a 950 ms beat online (`game/src/engine.ts:47`).

**Who else may call.** Foul calling is the Referee's job. A disputant's own whistle is an expert affordance, off by default, because a disputant's job while the other speaks is to listen well enough to summarize, not to monitor. Locked 2026-07-11: "the human is never expected to monitor, only permitted to." `[ruled]`

**Contested calls, print and live-human play.** Ruled 2026-08-15 (`HEART-T260815-09`): when the Referee flags a foul, the wronged player casts the deciding vote on whether it landed. The accused may contest by playing a rule card, which brings a second opinion, and **the wronged player still has the final call after hearing it, so the person who was wronged is the one whose voice decides** `[ruled]`. This governs a live human Referee's call and a live human accused contesting it; the v7 deck does not print it, and what physical object the contesting card is in print is still open: GAP-3.

**This does not describe the online edition's AI foul-flagging pipeline.** A 2026-08-31 Steve/Nathan call ruled that pipeline separately, and stricter: the software only nominates candidates, they go to the wronged party alone, and **the accused never sees the flag and never gets a vote at all**, no contest step of any kind. `roadmap.md` retired its online "contest flow" mechanic on this basis. Do not port the print contest-with-a-card procedure above into the online edition.

**What a foul does not do.** It does not stop play, does not require an apology, and settles nothing about the topic. Being flagged is about one sentence, not about the person. That framing is load-bearing and is told to players up front in the online edition's opening agreement screen.

---

## 5. A listen-and-summarize round, step by step

A round contains both directions. Do not read the flip as a separate round; the game is three rounds, each containing both halves, then the Final Showdown. `[ruled]`

1. **Player A gives their view.** Printed opener: *"The way I see it is..."* Thirty seconds. `[ruled]`
2. **Player B summarizes it.** Two required halves, printed: "What I heard is [x]... ... did I miss anything?" Forty-five seconds. `[ruled]`
3. **Player A answers the question.** They say what was missed, or that nothing was. This is the ground truth for Fake Listening: the person who was summarized rules on whether they were heard. `[ruled]` **There is no timer on this beat, and for a live human Referee confirming a spoken summary, no cap on the number of corrections** `[ruled, Nathan]`. Player B summarizes again until Player A confirms they were heard, and the game does not move on before that confirmation. **The deduction does not stack:** the miss is charged once, on the first failed summary, and the retries that follow cost nothing however many it takes.

   **This does not carry over to the online solo edition's summary coverage check unchanged.** A 2026-08-31
   Steve/Nathan call ruled the online check specifically no-redo: a miss is charged once and play moves on
   immediately, with no retry prompt at all, because retyping a summary against a bot is tedious in a way a live
   verbal retry is not. `roadmap.md` §7 carries this reversal and its own cross-reference to the shipped
   three-attempt ceiling, which neither this ruling nor that one match. Whether the same no-redo rule should also
   apply to a live-human game refereed by a person is not decided; treat the "no cap" language above as governing
   print and live-human-Referee play only until someone rules on that question explicitly.
4. **Switch Roles.** Printed as its own step between the two sub-flows.
5. **Player B gives their view**, same opener, thirty seconds. `[ruled]`
6. **Player A summarizes it**, same two halves, forty-five seconds. `[ruled]`
7. **Player B answers the question.**

Throughout, Player C watches for the three fouls and plays cards as they happen.

**Repeat three times.** Page 1 prints the loop exit as "Repeat 3x", then "Then", then "Final SHOWDOWN Round, pg 2". `[ruled]`

**The summary is a gate, not a courtesy.** You may not take your turn until you have summarized theirs. In print the Referee enforces this socially; online the turn simply does not advance. `[ruled]`

**Timer discrepancy, flagged not resolved.** The print deck puts a single timer badge, "⏱️ 30 sec", on each of the four exchange steps, including both summarize steps. The ruled timings are thirty to speak and forty-five to summarize; the ruled values are used above, and the printed badge on the summarize steps needs a reprint. Neither timer exists anywhere in the shipped code.

---

## 6. The Final Showdown

Not a fourth iteration of the loop above. It is a different kind of round, with three steps of its own and its own scoring rubric, and it is the only place in the game where humility is scored positively instead of penalized. It prints on its own page, page 2. `[ruled]` Page 2's heading: "FINAL SHOWDOWN ROUND", then "3 Steps (Start with Player A)".

**Step 1: Give a Super-Summary.** "Summarize **other player's view** across what you learned in all 3 rounds." Bonus: "Add a novel point", specifically one that strengthens the *other* player's side and that they did not make themselves.

**Step 2: Add what you learned.** "Tell the other player what **you learned**." Bonus: "Admit where you changed your mind."

**Step 3: Suggest why you two might still disagree.** "Why might the other player think differently?" Bonus: "Frame as positive value for other player."

Player A runs all three steps. Then, printed as its own band, "Switch roles & repeat, 3 Steps... (Now Player B)", and Player B runs the same three. One flip, not three. `[ruled]` Then "Most 🙏 at end wins."

### The referee's rubric

Page 2's instruction, verbatim: "Referee scoring: Decide when Player A receives (or gives) 🙏's". Three outcomes per step: "... follows the rules", which moves nothing and is printed "(expected, no 🙏's)"; "... earns a humility bonus!", where the other player pays the speaker; "... is Naughty", where the speaker pays the other player. Page 2 prints neither size. **A humility bonus moves one token** `[ruled, Nathan]`. **The three cards and their prices are live in the Final Showdown exactly as they are in the rounds** `[ruled, Nathan]`: "naughty" is not a fourth category of mistake, it is page 2's word for one of the three rules being broken here, and the card is still played when it happens. So a naughty step is charged once, at the price of the card that was broken, two for a Judging and one for the other two. It is not a separate penalty stacked on top of the foul, and a "#humility-fail" that is a Judging costs two in total, not two plus a bonus-sized extra.

The deck's worked examples, verbatim, all on the student loan topic:

- Step 1, rules: "You believe it's unfair to cancel loans for college grads when many people never went to college [...] ... Did I miss anything?" Bonus: "I **also** imagine that forgiving loans would anger people who paid them back already." Naughty: "Close! Player B also mentioned that wealthy doctors should pay back medical school loans", annotated "🧝 can help 🧙 remember points", so a miss is called by the other player filling in what was dropped, not by a silent deduction.
- Step 2, rules: "I **learned** that richer graduates hold more debt than poorer ones." Bonus: "While I still think we should cancel loan debt, I **changed my mind** and now think that it's only for low-income people." Naughty: "I learned that you don't understand this issue", tagged "#humility-fail". That is the sharp case: Judging wearing a learning sentence.
- Step 3, rules: "You think that people should pay back their loans, that's less important to me." Bonus: "You think that people should pay back their loans, **because you value fairness** and honoring **commitments**." Naughty: "You don't care about low-income people", tagged "#humility-fail".

**A generous characterization that lands as a verdict.** Step 3 asks a player to name the other's value, so the step's bonus ("because you value fairness") and its fail ("you don't care about low-income people") are the same grammatical move pointed in opposite directions. Where the line falls between the two is **the Referee's call** `[ruled, Nathan]`, made in the room like any other unclear call and routed to the possibly-wronged player under section 7 item 5. It is unlikely anyone finds a well-meant value statement worth a penalty, but the discretion belongs to the people playing rather than to a written threshold.

*Balance note, and a finding against the source.* All nine worked examples are spoken by a player arguing against loan forgiveness, summarizing a player who is for it. The rubric itself is neutral, but a reader learns the mechanic entirely from one political vantage point. A reprint should mirror at least one full step row from the other direction, for example a step 3 bonus reading "You think loans should be repaid because you value personal responsibility" set against "You think loans should be forgiven because you value not punishing people for being poor at eighteen." Flagged as a source imbalance, not fixed here.

---

## 7. The Referee's job

Player C referees the whole game, both directions, all four rounds. In order of importance:

1. **Never judge the topic.** The Referee does not decide who is right, what is true, or what anyone secretly means. They flag a surface pattern and route the real call to the possibly-wronged player. `[ruled]`
2. **Call the three fouls while players speak**, by playing the card. Nothing else is a foul; there are no other cards.
3. **Run the clock and the turn order:** thirty and forty-five seconds, four exchange steps, the Switch Roles beat, three rounds, then page 2.
4. **Enforce the summary gate.** A player who starts rebutting before summarizing has not taken their turn yet.
5. **Ask, on an unclear call, rather than rule.** The pattern is "I heard 'obviously'. Was that contested for you?", put to the possibly-wronged player, not to the speaker. Their answer is the ruling. `[ruled]` **The Referee may interrupt as often as they judge necessary, with no limit** `[ruled, Nathan]`, and the same discretion covers whether an ambiguous hit goes to the listener mid-turn or waits for the turn boundary. Players may ask for fewer interruptions and the Referee may weigh that request, but nobody at the table can cap the Referee's ability to do the job.
6. **Score the Final Showdown** against the three-column rubric, awarding the humility bonuses.
7. **Keep the ledger.** Tokens are physical in print, so mostly this means noticing a zero.

The Referee's seat is why this game has an obvious place for software: it is a job description written before anyone went looking for one. That is the online edition's whole architecture, section 9.

---

## 8. Scoring and 🙏 tokens

- Seven per disputant, fourteen on the table. `[ruled]`
- A foul moves tokens from the offender to the other disputant. Never burned, never banked. `[ruled]`
- Judging moves two, Opinions as Facts one, Fake Listening one per missing major point, so a badly incomplete summary can cost more than a Judging. `[ruled]` **The summarized player decides what counts as a major point, and at most three are charged on any one summary** `[ruled, Nathan]`, so the worst a single weak turn can cost is three and no summary can empty a purse by itself.
- Zero tokens is an instant loss, immediately, whatever the round. `[ruled]`
- Playing clean earns nothing. Steve, 2026-08-25: points are compensation for fouls, not a reward for letting a line stand. `[ruled]` The one exception is the Final Showdown's humility bonuses.
- There is no repair move: a player cannot win a token back by apologizing or fixing a foul. Deliberate, ruled 2026-08-10, when a Repair Sequence was proposed and pushed to a deferred expansion. `[ruled]`
- Most tokens at the end wins `[ruled]`, and equal tokens is a draw `[ruled, Nathan]`, in print as well as online (`game/src/showdown.ts:517-522`). Section 1 carries it.

**Fractional tokens.** Online, a player who fails to whistle a foul the coach saw is charged half a token, rendered "½" (`game/src/showdown.ts:56`). Steve's ruling of 2026-08-24 `[ruled]`, but online only: print has no half tokens and no penalty for a missed call, because in print the Referee does the calling.

---

## 9. Print edition versus online edition

The print flow and the live-human flow are identical. `[ruled]` The differences are all about who fills the third seat and what software can add.

**Same in both:** the roles, three cards, three fouls, the same penalties, seven tokens each, transfer not destruction, the instant loss at zero, the two-step summary, the two-step opinion frame, three rounds with a flip inside each, the Final Showdown's three steps and rubric, most tokens wins.

**Different online:**

1. **The AI fills a seat, so a second human is optional.** Ruled 2026-08-10: the default second player is the AI and a human opponent is unlocked. `[ruled]` In the shipped code the AI coach referees and the human plays a disputant against an AI opponent, so print's third human seat is software. There is no three-human online mode today.
2. **A teaching ladder in front of the game. Seven levels** `[ruled]`, per a 2026-08-31 Steve/Nathan call Steve
   confirmed directly: L1 the word "You" (Judging), L2 In my head, because (Opinions as Facts), L3 Did I miss
   anything? (Fake Listening), L4 Full Showdown with all three fouls live, L5 What I Learned, L6 Why We Might Still
   Disagree, L7 the combined Final Showdown boss. L1 to L4 are built. L5 and L6 are **referee-format**: the human
   takes the Referee seat, watches the coach play one side of an argument against an AI opponent playing the other,
   both typing, and calls fouls, the same format now also ruled for L1-3 (`roadmap.md` §7, a scoped-but-unbuilt
   redesign). L7 is played for real, like L4. This supersedes both the five-level ladder ruled 2026-08-15
   (`HEART-T260815-27`) and the six-level ladder that briefly followed it. `roadmap.md` section 6 is the home of
   the seven-level ruling; the numbering is settled there, so build against seven. An unnumbered agreement screen
   sits before L1. Boss names are explicitly placeholders and the docs and the code disagree on them, so quote none
   of them anywhere player facing. **None of this vocabulary is player facing in print:** the v7 deck contains zero
   level, phase, boss, tier, stage, or chapter words. Never source a level count from the deck.
3. **The player, not a referee, throws the whistle at the AI.** The human calls fouls on the AI and the coach calls fouls on the human. Missing one of the AI's fouls costs half a token `[ruled]`; whistling a clean line costs a full token `[unratified]` (`game/src/showdown.ts:399-422`). Both exist only because there is no third human.
4. **Wrong answers cost tokens during teaching.** In L1 to L3 a wrong or too-thin answer costs one token, once per item however many tries it takes, and both purses run from seven from L1 on `[unratified]` (`game/src/engine.ts`). Print has no quiz and no equivalent.
5. **Attempt ceilings, and a code conflict.** The shipped code allows three attempts on an answering step and then moves on `[unratified]` (`game/src/engine.ts:486`, `game/src/showdown.ts:433`). **That ceiling is wrong under the ruling in section 5: there is no cap on corrections, and nothing advances until the summarized player confirms they were heard.** Print has no attempt limit either. Two things have to change in the code before it matches the rule: the ceiling has to come off, and a coverage check has to exist for the confirmation to be checked against, because no summary coverage check is implemented anywhere today. Recorded, not changed here; `roadmap.md` section 7 carries the build item.
6. **Sentence frames are shown, not remembered.** The speak box shows "The way I see it," [your take] "because" [your reason]; the summary box shows "What I heard was" [her point, in your words] "because" [her reason] ". Did I miss anything?" Steve's 2026-08-24 ruling that the hint belongs inside the box `[ruled]` (`game/src/showdown.ts:69-83`). This makes "because" mandatory in an online summary, which the printed Fake Listening card does not require. A divergence, unresolved.
7. **No timers.** The thirty and forty-five second clocks are not implemented anywhere in the shipped code; online turns are untimed today. The answer beat in section 5 has no timer in either edition, by ruling rather than by omission.
8. **Post-match review, and a self-correcting whistle.** Ruled 2026-08-10: the match plays back with every foul annotated inline, showing the flag, the words that tripped it, the human's ruling, and the compliant form. Every call carries an agree or disagree tag and the tags tune the detector. `[ruled]` Print has no memory.
9. **Spectators with buzzers.** Ruled 2026-08-10: any number of watchers can buzz a foul the Referee missed, a buzz scores for the spectator only when the wronged player confirms it, and the crowd never rules on whether a disputant pays. `[ruled]` Print supports this informally already, since the game is played in a room.
10. **Neutrality is achieved structurally.** The AI opponent has no position of her own; she argues the opposite of whatever the player argued. `[ruled]` The shipped topic pool is deliberately mild, "student loan forgiveness", "return to office mandates", "nuclear power", with an in-code note that it excludes immigration and abortion on purpose. Note the print deck's own samples do include asylum and deportation, so the online pool is narrower than the print pool by choice.

---

## 10. Unresolved rules

Every item here is a question a human must answer. None has been invented above. The numbering is stable and does not renumber: a missing number means that gap has been ruled, and the ruling lives inline in the section that raised it rather than here.

GAP-3: (Steve) The contested-call procedure is ruled in section 4, and the wronged player has the final call. What is still open is the print object. The v7 deck prints no procedure and no card for the accused to play, so a physical game has nothing to hand them when they contest. Does a reprint add a contesting card, or does contesting stay verbal?

GAP-9: (Nathan) Which of the three cards can be called on which kind of turn. The fouls are not symmetric. Fake Listening is a fault in a summary, so it cannot be committed on a speaking turn at all, while Judging and Opinions as Facts can be committed on either kind. The online edition already enforces exactly that, greying Fake Listening out on speaking turns (`game/src/showdown.ts:376-388`), and it also refuses to let the cheap card absorb the expensive one: a summary that judges the other person is charged as Judging at two, not as Fake Listening at one (`game/src/showdown.ts:113-127`). Print says none of this. Is the online split the print rule too, and does a Judging inside a summary cost two there as well?

GAP-10: (Steve) When does Opinions as Facts fire on a bare declarative with no smoke alarm phrase, for example "that policy will raise costs" said flatly? The card's own incorrect example is exactly that shape, but the shipped detector deliberately does not catch it, conceding it is the larger half of the foul as the card defines it. A human Referee needs a stated threshold. Note that this sits against the ruling recorded under GAP-12 below, that no threshold is written and the people at the table decide; if that answer covers this case too, GAP-10 closes with it.

GAP-12: (Steve) Earlier design work deferred five rule questions that no v7 mechanic replaces. Three of them ask for a written threshold, and the standing answer is that none is written: **a human is making the call rather than an agent, so the people at the table decide** `[ruled, Nathan]`. Those three are what threshold makes a non-canonical certainty phrase ("It's not complicated", "We know what happened", "that's just how it works") an Opinions as Facts foul; whether motive-questioning is a foul in a professional context; and whether adding a missed point to a summary counts as repair or as a new contribution. A fourth, whether letting a disputed call favour the speaker is exploitable, is answered by section 4: a disputed call goes to the wronged player, not to the speaker. The fifth is not a ruling at all, it is a playtest finding: whether the mandatory summary step is too awkward to sustain early, since one pass observed it naturalizing only around the third or fourth round. Steve to narrow any of these that the standing answer does not cover.

**Reprint caution (not a gap, nothing to rule on):** the pray-hands emoji are images rather than text in the deck source, so several page 1 and page 2 strings read as "Most ... at end wins" with the token glyph missing. Verify every token count against the rendered page rather than the source file before reprinting.
