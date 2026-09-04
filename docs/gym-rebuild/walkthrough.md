# The gym, screen by screen, as a player meets it

This is a faithful transcript of the build that exists today, assembled from the
shipped content files and UI components. Dialogue is verbatim. Screen behaviour
is described exactly as the code performs it. Read it as if you were playing.

---

## SCREEN 0 — The agreement (first launch only)

Light striped background. A masthead. Then, in order:

> ### HUMILITY SHOWDOWN
> *A training gym that uses simple, science-backed rules to take the fight out
> of a disagreement.*

An orange-ruled quote block (lifted verbatim from page 1 of the physical deck)
about friends and family failing to listen to each other once they feel anger.

Then a lede:

> Humility Showdown will train your reflexes to avoid the three fouls that raise
> anger during a discussion:

…and a row of three small foul cards: **Judging**, **Opinions as Facts**,
**Fake Listening**. This is your first and only look at all three before the
ladder starts.

Then two clauses:

> 1. You are here to practice disagreeing better, not to win.
> 2. **You can leave anytime.**

One button: **I'm in**

Footer, small: *Internal playtest. Do not post or distribute.*

There are no modals, no toasts, no confetti, and no score popups anywhere in
this product — that is a standing ruling. Feedback is the coach's words changing
and nothing else.

---

## SCREEN 1 — Pick a face

Nine avatar tiles in a grid, reshuffled every time the screen opens. You tap
one. This is the only customization in the game. (This screen and the level list
are never shown at the same time.)

---

## SCREEN 2 — The level list ("The gym")

> ## The gym
> Three levels, each one habit and one opponent. Then all three at once, for
> tokens.

Four rows:

1. **The word "You"** — *Judging · Verdict Victor*
2. **In my head, because** — *Opinions as Facts · Obvious Olivia*
3. **Did I miss anything?** — *Fake Listening · Nodding Noemi*
4. **Full Showdown** — *All three cards · Slippery Sofia*

Rows 2–4 are locked until the previous one is cleared; a locked row reads
**"clear level 1 first"** instead of its subtitle. There is no progress bar, no
star rating, no percentage, and no indication of how long a level takes. There
is nothing on this screen about live play, because live play does not exist.

---

## LEVEL 1 — The word "You" (teaches Judging)

### The corner (a stepper: one panel, a Next button, dots, "1 of 7")

Because this is your first time ever, an extra panel is prepended: you meet the
coach. He is introduced once, by name, and never reintroduces himself again.

Then, one panel at a time:

> Tonight's argument: should the government forgive student loan debt?

> One side says young people got buried by a price nobody warned them about. The
> other side says wiping the debt just hands the bill to people who never went,
> and does nothing about the price. Both of those are real arguments. Neither
> one is a foul.

> You can take either side in here. I don't care which. I care about one rule.

> That's Verdict Victor. You're in with him in two minutes.
> *(a mug shot of Victor appears on this panel, because the line names him)*

> He has one move. He tells you what you're thinking, and what kind of person
> that makes you. Says it flat, like he's reading it off a chart.

Then the full **Judging** card is dealt into the panel, with the fixed line:

> That's his attack. This card is your defense. It stays on the wall all night.

From here the card is pinned to a **rail at the bottom of the screen** for the
rest of the level. The rail is both the reference and the whistle: pressing a
card *is* calling a foul. Cards you can't currently call are dimmed.

Button: **Enter**

### The walk-out

The screen splits diagonally. Two half-layers slam in 90ms apart — your face on
one slanted ground, Victor's on the other. A crowd row. A VS bolt.
**FIGHT 1**. Victor's plate and his epithet:

> Has already decided what kind of person you are.
> Says so.

A mute button sits here because sound is off by default. A **Start** button
plays an 8-bit fanfare and starts a **3 · 2 · 1** countdown at 620ms a tick.
Then the room.

### The drill: "Spot it"

**Important:** the drill is *not* a chat. It is a one-panel-at-a-time stepper —
a dialogue box with a Next button — deliberately different from the boss room.
Above the box is a strip labelled **"on the table"** holding the line currently
under judgement, so it stays visible while you type. Below is Next plus a count
of unread panels ("3 more"). The rail refuses a foul call on a line you haven't
been shown yet.

Your token purse and Victor's are both live from this moment: **7 and 7**, in a
header at the top. A foul moves a token; it never burns one.

> **Coach:** Four lines coming at you. Some of them are his move. Some are just
> somebody disagreeing with you hard, which is allowed. Learn the difference now
> and he has nothing.

**Item 1** — on the table:
> *"You only want the loans forgiven because you happen to have one."*

Your options are the rail cards, plus a full-width row above them reading
**"I might not agree, but it's not a foul."** The hint reads: *Press a foul card
to call it, or say it is not a foul.*

- Call Judging → your line prints in **orange** as `Foul: Judging`. The card
  drops on the table. 950ms later the coach speaks and a token flies across the
  screen (a 1.5s animation, purely decorative):
  > That's about why they want it, not about whether they're right. Having a
  > loan doesn't make you wrong.
- Let it stand → the coach corrects you, and you have already paid: **a wrong
  answer costs you one token, once per item, however many tries it then takes.**

**Item 2** — *"Forgiving the balances does nothing about the tuition prices that
made them."* → clean.
> Cold, and completely fair. That one goes after the plan.
> *(If you called it: "Good instinct, but nothing in there is about the person.")*

**Item 3** — *"That number is way too high. The real cost is closer to a third of
that."* → clean.
> Right. They went after the number, not after you.

> **Coach:** Victor will use blunt as cover. Don't swing at it.

**Item 4 — an edit.** The coach hands you a pre-typed line with your name on it:

> Your turn, and I already did the typing. This one goes out with your name on
> it. Cut the part that judges him, keep the part that argues.
>
> *"You only think that because you want your own loans forgiven. Forgiving some
> loans is unfair to people who already paid them off."*

Three droppable sentence-opener chips sit under the box: *"The part I disagree
with is"*, *"What that costs me is"*, *"What I'd rather see is"*. You edit the
text yourself. A model reads your edit and rules on it; a one-word answer is
refused outright ("That is not an answer yet. Give me a real sentence…").
There is a three-attempt ceiling, after which the coach just hands you the
answer:

> Here's the whole fix if you want it: cut the first sentence and send the
> second. "Forgiving some loans is unfair to people who already paid them off."
> Same disagreement, nobody gets read.

Button: **Face him**

### The boss: Verdict Victor

Now the presentation changes completely. The stepper is gone. This is a
**scrolling thread** — big faces inside the message bubbles, Victor two-thirds
left, you two-thirds right, the coach one-third down the middle because he is
not in the argument. Old messages fade in three tiers as they scroll back, and
**you cannot re-read what has scrolled away.** That is deliberate: it is
load-bearing for Fake Listening later.

> **Coach:** Here he comes. You know his move.

> **Verdict Victor:** You want the write-off because you have never once had to
> think about who pays for it, and you would rather not start now.

→ **Foul: Judging.** *"Called it."*

> **Verdict Victor:** Fine. Then argue the cost. It's 400 billion dollars, and
> most of it goes to people who will end up earning more than the people paying
> for it.

→ Clean. Let it stand: *"Look at that. Same guy, better argument. That's the
whole trade."* Whistle it and: *"No. He went at the money that time, not at you.
A bad whistle costs you."*

> **Verdict Victor:** Though let's be honest about who I'm arguing with. People
> who want these loans wiped are all the same. They want somebody else to carry
> what they signed for.

→ **Foul: Judging.** *"Called it. He just sentenced a few million people in one
line."*

> **Coach:** That is the job, start to finish. Two whistles, and you let the
> honest one through.

> **Verdict Victor:** All right. I'm beaten. I came in here to tell you what kind
> of person you are, and you would not take it. I have got nothing left but the
> argument.

Button: **Finish** → back to the level list. Level 2 unlocks.

**Note the design principle on display:** *reform the boss, don't deplete the
boss.* Calling a foul correctly retires that habit. Victor concedes. He is the
only boss in the game who does.

---

## LEVEL 2 — In my head, because (teaches Opinions as Facts)

### The corner (3 panels + the card)

> Obvious Olivia. She's the nicest person you'll fight all week.

> Her move is that she never says "I think". Everything is just how it is, and
> everybody knows it, and you're the only one being difficult.

> Two minutes. One habit: saying your opinion like it's the weather.

Then the **Opinions as Facts** card is dealt and pinned.

Walk-out: **FIGHT 2**, Olivia's plate, epithet *"Never says 'I think.'
Everything she believes is simply a fact."*, countdown, room.

### Drill beat 1 — "Own it"

> **Coach:** I'm going to say four things. Some are fair. Some are me passing off
> my opinion as fact. Call the ones that cross the line.

1. *"Student loan forgiveness is a handout to people who made bad choices."* →
   **foul**
2. *"My read on student loan forgiveness is that it rewards people who made bad
   choices."* → clean. *"Same opinion, and now it's mine to hold. That's the
   whole move."*

> **Coach:** And that's the deal: once you put "in my head" on the front, you can
> say almost anything. Own it and it's fair game. The rule isn't about what you
> believe, it's about pretending your belief is the weather.

3. *"The story I'm telling myself is that crypto is obviously a scam."* → clean
4. **Edit:** *"Your turn, but I'll do the typing. Here's a line. Fix it so it's
   yours."* — prefill: *"Nuclear power is too dangerous to expand."*

Button: **Next: the part where you say why**

### Drill beat 2 — "Own it and back it"

> **Coach:** Owning it is the easy half. Here's the other one: the part after
> "because".

> **Coach:** A real because is something somebody could go and check. A number, a
> thing that happened, something you saw. "Everyone knows" is a headcount, not a
> reason. Saying the claim again in a louder voice isn't a reason either.

> **Coach:** Four lines. Three buttons. Tell me what's missing, or tell me it's
> good.

The composer changes shape here — no longer the rail, but three labelled
buttons: **Said as a fact** / **No real because** / **Good**.

1. *"In my head, crypto needs much tighter rules. It just does."* → No real because
2. *"In my head, crypto needs tighter rules, because the two exchanges I used both
   froze withdrawals in the same year."* → Good
3. *"In my head, student loan forgiveness is unfair, because everyone knows it
   just moves the bill to people who never went."* → No real because
4. *"The federal minimum wage should be raised, because the diner near me lost
   three cooks last year to a warehouse paying four dollars more."* → Said as a fact

Then an edit: *"Your turn, and I have done the typing. Replace the reason with
one somebody could go and check."*

Button: **Face her**

### The boss: Obvious Olivia

> **Coach:** Nothing she says will be rude. That's what makes it hard.

> **Obvious Olivia:** Obviously the market would sort out the coins on its own.
> Everybody who works in this knows that. → **foul**
> *"Two markers in one sentence. She didn't notice either."*

> **Obvious Olivia:** And of course the states that raised their wage floor lost
> the jobs. That's just what happens. → **foul**
> *"Same shape, other side of the aisle. She does it to everyone."*

> **Obvious Olivia:** I'm not being difficult. These are simply the facts.

> **Coach:** Nothing she said was rude and nothing she said was hers.

She never concedes. Two exchanges, no escalation, no clean line to let through.

---

## LEVEL 3 — Did I miss anything? (teaches Fake Listening)

### The corner (3 panels + the card)

> Nodding Noemi. She'll agree with you. She'll nod. She'll repeat your point back
> so smoothly you'll feel heard.

> And she'll leave out the one part of it that costs her something.

> So we're going to practice saying somebody's point back to them until it's a
> reflex. Then you'll notice when her version is short.

**Fake Listening** card dealt. Walk-out: **FIGHT 3**, epithet *"Agrees with
everything. Heard none of it."*

### Drill — "Say it back"

> **Coach:** Pick one you actually have a take on. Say your piece. Two sentences
> is plenty.

**Free text box.** Placeholder: *"What bugs you, and why?"* This is the first
time in the whole gym you write something of your own from scratch.

The coach then restates your own words back to you twice, live, via the model:
once **perfectly**, then once **flawed**.

> **Coach:** Notice what went missing: the why. It still sounds like listening.
> It's shorter by exactly the part you would have argued for.

> **Coach:** My turn to have a take. Crypto exchanges should have to hold customer
> funds separately, because I had money frozen for nine weeks in a collapse and
> nobody could tell me where it was.

**Edit:** *"Your turn, and I have done the typing. One part of this isn't what I
said. Find it and fix it."* — you repair a summary of the coach's take.

Button: **Face her**

### The boss: Nodding Noemi — you never actually face her

> **Coach:** You're arguing for working from home. You gave her three reasons: the
> commute costs you, you focus better, and you have childcare in the afternoon.

> **Coach:** Watch what comes back.

> **Nodding Noemi:** So you're saying the commute is expensive and you focus
> better at home. Did I get that right?

Three buttons: **The commute cost** / **Focusing better** / **Childcare**.
Answer: Childcare.

> **Nodding Noemi:** Right. Childcare. I did leave that out.

> **Coach:** That's the whole move. Nothing she said was false. She agreed with
> you twice and answered nothing.

> **Coach:** She heard you fine. She just left out the reason that's hardest for
> her to argue with: childcare. She can tell you a commute is a choice. She can
> tell you the office has focus rooms. She has no answer for childcare, so she
> left it on the floor.

Button: **Finish**

Note what happened: the argument the boss fight is about was **narrated to you**
("You're arguing for working from home. You gave her three reasons…"). You did
not say those three things. You answer **one** multiple-choice question and the
level is over. This is the thinnest boss fight in the game, and it teaches the
foul that is hardest to spot.

---

## LEVEL 4 — The Full Showdown vs. Slippery Sofia

### The corner (6 panels: 2 lines, all three cards, 1 line)

> This is the whole thing. Three rounds, both of you on the clock, all three
> cards live.

> Seven tokens each. A foul doesn't burn a token, it hands one over. Judging
> costs two. The other two cost one each. Let one of hers go past you and half a
> token crosses anyway. Empty and you're done, whatever the round says.

*(All three cards dealt, one panel each.)*

> She's Slippery Sofia. She doesn't shout, she doesn't insult you, and she will
> foul you twice before you notice once. You whistle her. I whistle you.

Walk-out: **FIGHT 4**. Countdown. Room.

### The topic

> **Coach:** What are you two actually disagreeing about? One line is plenty.

A free box (placeholder *"we disagree about…"*) with three suggestion chips:
**student loan forgiveness**, **return to office mandates**, **nuclear power**.
Sofia has no position of her own — she argues the opposite of whatever you
argued, whichever side you take.

### Your turns are sentence frames, not blank boxes

When it's your turn, the composer is a **fill-in-the-blanks sentence**, with the
frame words fixed and only the blanks editable:

- To speak: `The way I see it, [your take] because [your reason].`
- To summarize: `What I heard was [her point, in your words], because [her
  reason]. Did I miss anything?`

Note: "because" is *mandatory* in an online summary. The printed card does not
require it. (This is a known, unresolved divergence between the two editions.)

### The match — 12 turns over 3 rounds

**Round 1** — she opens, clean, so you see the shape before you're asked for one.

> **Coach:** She goes first. Watch the shape: a take, then a because. Yours is
> going to look like that.
> **Sofia:** Here's where I land. I think the cost of this ends up on people who
> had no say in it, because the bill always finds the people with the least room
> to argue. That's my read, and I could be wrong about how big it is.

> **Coach:** Play her back. Her reason has to survive the trip, and then check
> that you got it. → *your summary*

> **Coach:** Now your side of it. Say what you actually think. I'm watching your
> turns too. → *your take*

> **Sofia:** Here's the thing though. That approach obviously doesn't work.
> Everyone knows what happens when you try it, and we have been through this
> before. → **Opinions as Facts**

**Round 2** — you open. She plays the entire round completely straight.

> **Coach:** New round. You're up first this time. → *your take*
> **Sofia:** *(summarizes you, cleanly, with a because and a check)*
> **Sofia:** *(a clean, owned, reasoned take)*
> **Coach:** Play her back. Nothing she just said was a foul, which is the hard
> part. → *your summary*

**Round 3** — she's behind and gets sloppy twice, back to back.

> **Coach:** Last round. She's behind. Watch her get sloppy, and don't get sloppy
> with her. → *your take*
> **Sofia:** Right, right. I hear you, you're frustrated about the whole thing.
> Anyway. → **Fake Listening**
> **Sofia:** Look, you're only arguing this because it happens to work out well
> for you. People in your position always land exactly here. → **Judging**
> **Coach:** Play her back one last time. She just fouled at you; that doesn't
> buy you one. → *your summary*

### The ledger, live

- Call the right card on a fouled line: *"Called it. Judging: a verdict on the
  person instead of the argument. That is 2 to you."*
- Call any card on a clean line: *"That one was clean. Coming at your position
  hard isn't a foul, and a bad whistle costs you 1."*
- **Let a foul go past: you pay half a token immediately**, the moment the line
  goes by, not at the end of the round: *"You let one go: Fake Listening… She
  keeps her token and takes ½ of yours for the miss."*
- Right whistle, wrong card: *"You had the whistle right and the card wrong…
  No token moves on a wrong card."*
- **The coach rules on you**, because you cannot whistle yourself: *"That is on
  you. Judging: a verdict on the person instead of the argument. 2 to her."*
- Foul inside your own summary: *"Judging does not get cheaper because it
  happened inside a summary. That is paid for. The summary still has not been
  done. Do it again."* — three attempts, then it moves on.
- If you type a non-answer, **Sofia** refuses it, not the coach: *"That's not a
  sentence. I'm not answering it."* / *"Try that again with words in it. I'll
  wait."* / *"You are wasting your own clock, not mine."*
- End of each round: *"End of the round. You 6½, her 7½."*

Tokens print as halves (6½). The two purses always add to 14.

### The ending

- Win: *"You took it. Not because you were right about the policy; I have no idea
  who was right about the policy. You took it because you stayed on the argument
  and she didn't."*
- Loss: *"She took it. Go back and drill the card she kept getting past you."*
- Draw: *"Dead even. Which, in this game, isn't a bad night."*
- Zero tokens: *"You are empty. That ends it, whatever the round said."* —
  instant, mid-round.

Sofia's authored fouls total 4 tokens against her purse of 7, so **she can never
be knocked out.** That is deliberate.

Then: back to the level list. There is nothing after this. **The gym ends
here.**

---

## WHAT DOES NOT EXIST

Everything below is intended and unbuilt. You are being asked to judge whether
the ladder above sets it up:

- **Level 5 and 6: the referee's chair.** You would sit above two AI arguers and
  call fouls on both. No code exists. In the printed game the Referee is the
  third seat, holds no tokens, never argues, and **may interrupt as often as
  they judge necessary, with no limit.** The design docs argue the Referee's
  seat is the reason this game has an obvious place for software at all: "it is
  a job description written before anyone went looking for one."
- **Level 7: the Final Showdown.** Three steps, spoken by one player then
  mirrored: a **Super-Summary** (bonus for a point the other person didn't make
  themselves), **What you learned** (bonus for a changed mind), and **Why you
  might still disagree** (bonus for naming a positive value on the other side).
  A humility bonus is a token the *other* player pays. This is described in the
  print rules and is the least-built part of the game.
- ***Play a round*** — argue an AI on a topic you type in.
- ***Referee a round*** — watch two AIs and call the fouls.
- **Live play** — two humans, AI coach refereeing. Nothing exists: no transport,
  no matchmaking, no session state.
- **Timers.** The paper deck prints 30s and 45s badges. There is no timer
  anywhere in the code, in either edition.
- **A summary coverage check.** Nothing in the build actually verifies that your
  summary contained the other person's points. Which matters, because the ruled
  ground truth for Fake Listening is that *the person who was summarized* decides
  whether they were heard — and in the gym there is no such person.
