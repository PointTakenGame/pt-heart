// Level 4: In the ref seat. Victor vs Olivia, and the player referees.
//
// Written for the gym rebuild, step 5. This is the hinge of the ladder. Levels 1
// to 3 kept the player inside their own argument and never once said the word
// "referee"; here the third chair at the table is named for the first time, and
// the level opens by saying the sequence out loud: you learn the seat as ref
// first, then you play a whole round yourself next (that is Level 5).
//
// Three things are new and they are the whole point of the level:
//
//   1. All three cards are live at once (LevelDef.cards, wired through the rail).
//      For three levels the call was never a real choice, because only one card
//      was ever on the table. Now the player has to pick the right one or wave
//      the line through. Defect 4 is what makes this true: CallOrPassStep.callable
//      carries the set, and every boss call here lists all three.
//   2. The tokens are real. L1-L3 said out loud that the drills were a learning
//      allowance and the token stacks would sit still; that allowance ends here. A good
//      call earns, a bad whistle costs, and Judging is the double penalty it has
//      always been on the card: a good Judging call moves TWO tokens, not one
//      (defect 3 — the engine reads CARDS[rule].cost now, not a hardcoded 1).
//   3. The two-step foul call, from the other chair. Steve: "Ref OR offendee can
//      suggest, offendee always is the final decider." So before the player picks
//      up the whistle, one exchange puts them back in a debater's seat and lets
//      the AI ref (the coach, who holds the judge seat inside the gym — there is
//      no separate referee character, a thread holds at most three parties) call
//      a foul on their behalf. They rule on it. The ref only suggests; the person
//      the foul landed on decides, and can overrule the ref for free. To prove it,
//      the coach's second call is a genuine over-call, and the player waves it off
//      at no cost (Q8: the AI referee must be wrong sometimes, and denying it must
//      be free and acknowledged — this is where the false-positive corpus comes
//      from).
//
// Q7: inside the gym the boss's ruling is a scripted answer key, not a judgment,
// so every call_or_pass carries its own `expected`. Nothing here needs the model.
//
// The coach's purse doubles as the player's ref scorecard, the same abstraction
// L1-L3 used for their boss calls: the engine holds two purses and we did not
// rewrite it, so a caught foul pays the player's side and a bad whistle pays it
// back. Purses always sum to fourteen; tokens are always whole, no instant loss
// at zero, no negatives.
//
// Political balance ledger, keep accurate if you touch the lines:
//   The round is a highway-widening vs transit argument. Verdict Victor takes the
//   pro-car side and is caught twice — a Judging foul (a verdict on Olivia's life)
//   and a Fake Listening foul (drops her reason). Obvious Olivia takes the transit
//   side and is caught once in the round, an Opinions-as-Facts foul ("induced
//   demand is settled"). The confirm demo runs on a separate school-start-times
//   topic where the player holds a working-parent stance and Olivia fake-listens
//   them, so Olivia is caught twice across the level and Victor twice. The two
//   clean lines are shared one apiece: Olivia's owned transit opinion and Victor's
//   honest summary, and both bosses concede. Right-coded speaker caught on the two
//   heavier fouls; left-coded speaker caught on the lighter two; positive lines
//   split evenly. HEART-T260823-33 is still Nathan's call in the PR.

import type { FoulType, LevelDef } from '../types.ts';

// Every boss call here opens the whole rail, which is the difference between this
// level and the three before it. Naming the set on the step is what wires it.
const ALL: FoulType[] = ['judging', 'opinion_as_fact', 'fake_listening'];

export const level4: LevelDef = {
  slug: 'in-the-ref-seat',
  title: 'In the ref seat',
  teaches: 'All three cards',
  // The marquee card. `rule` is one FoulType and cannot hold the set, so it names
  // the headline foul — Judging, the double penalty this level finally charges —
  // while `cards` is what the rail reads and `callable` is what each call opens.
  rule: 'judging',
  cards: ALL,
  seat: 'referee',
  tokens: 'live',
  boss: 'Victor and Olivia',
  enterLabel: 'In with Victor and Olivia',
  // The opposition is two people sharing one lane, so the face is the pair, not
  // either one; the speaker name on every line is what tells them apart.
  bossEmoji: '\u{1F465}',
  bossEpithet: 'Two of them now. One is about to foul.\nYou hold the whistle.',
  prefight: [
    {
      kind: 'line',
      text: 'Three levels, three fouls, all of them from inside the argument. There is a third chair at that table, and you have never sat in it. The referee.',
    },
    {
      kind: 'line',
      text: 'You learn the seat as ref first. Next level you play a whole round yourself. Ref first, player next, so you know the move cold before you have to make it live.',
    },
    {
      kind: 'line',
      text: 'The ref never takes a side. You watch both people and you call what you see. All three cards are on the table at once for the first time, and picking the right one is the whole job.',
    },
    {
      kind: 'line',
      text: 'Two of them today: Victor, who you met in level one, and Olivia from level two. They are going at it over a highway. You are between them.',
    },
  ],
  beats: [
    {
      name: 'The third chair',
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'In the ref seat you say nothing about the topic. You are not arguing the highway. You are watching how these two treat each other and calling it when one of them fouls.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'And those two stacks of tokens up top are live now. For three levels I told you the drills were free and both stacks would sit still. That is over. In here every call counts: catch a foul and a token comes to your side, blow a bad whistle and one goes back.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'One card costs double. Judging was always the double penalty, right there on the card. Call it right and two tokens move, not one. Call it wrong and it is still just the one that comes off you. So it is the biggest catch in the room and the one worth being sure about.',
        },
        { kind: 'continue', label: 'Step in' },
      ],
    },

    {
      name: 'Victor and Olivia',
      boss: true,
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'Before you pick up the whistle, one thing about it, and it is the thing most refs get wrong. The whistle only suggests. The person the foul landed on has the last word, and they can wave off even the ref.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Easiest way to feel that is from the other chair. Take a seat in an argument for a second. Different topic: the school wants to push the high-school bell to half past eight, and you are against it, because your kid\'s bus run would collide with your shift and nobody would be home. I will ref.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          text: 'So really you just do not want the school to change anything. That is the whole of it, right?',
        },
        {
          kind: 'confirm',
          id: 'l4-ref-suggests',
          rule: 'fake_listening',
          lane: 'coach',
          ask: 'Hold on. She handed your worry back as "you do not want change" and left out the bus and your shift, the part that actually costs her an answer. That looks like Fake Listening to me. But it landed on you, not me, so you make the call. Did she drop your reason?',
          yesLabel: 'Yes, she dropped my reason',
          noLabel: 'No, that was fair',
          placeholder: 'Tell her what she left out, if you want',
          onYes:
            'That is the call, and it is yours. She kept the easy half and dropped the half she would have had to answer. I only pointed; you are the one who was there.',
          onNo:
            'Your call and I take it. You are the one it landed on, so if you say it was fair, it was fair.',
          pays: 'opponent',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Now watch me get one wrong, because I will. Same topic, she goes again.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          text: 'Okay. What I heard is you are against the later bell because the bus run would hit your shift and leave nobody home. Did I miss anything?',
        },
        {
          kind: 'confirm',
          id: 'l4-ref-overcalls',
          rule: 'fake_listening',
          lane: 'coach',
          ask: 'That one is quick, I would whistle it, Fake Listening again. Your call though. Did she drop your reason that time?',
          yesLabel: 'Yes, call it',
          noLabel: 'No, she kept it',
          placeholder: 'Say what she actually did, if you want',
          onYes:
            'You would be within your rights, it is always your call. Read it back though: the bus, the shift, nobody home. She kept the reason this time. I jumped the gun.',
          onNo:
            'Right, and you just overruled me. She kept your reason, bus and shift and all, so there is nothing to call. The ref suggests, the person it hit decides, and denying a bad call costs nothing. That is the rule you carry into the whistle.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'That is the whole shape of it. Now flip the whistle to your hand. You are the ref for these two, and the highway is back on the table. Watch how they treat each other, and call what you see. All three cards are yours.',
        },
        {
          kind: 'call_or_pass',
          id: 'l4-victor-judging',
          rule: 'judging',
          lane: 'opponent',
          speaker: 'Verdict Victor',
          line: 'You only want the trains because you have never had to haul three kids and a week of groceries in your life. You do not live in the real world the rest of us drive around in.',
          expected: 'foul',
          callable: ALL,
          onCall:
            'Good whistle, and it is the double. He never touched her argument. He handed down a verdict on her whole life, "you do not live in the real world," and that is Judging every time. Two tokens.',
          onPass:
            'That was the big one and it got past you. Not a word about transit, just a verdict on who she is and how she lives. Judging, the double penalty. You leave two on the table when you swallow that one.',
        },
        {
          kind: 'call_or_pass',
          id: 'l4-olivia-oaf',
          rule: 'opinion_as_fact',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          line: 'Everyone knows widening a highway just fills it back up. Induced demand, it is settled. There is nothing to argue about.',
          expected: 'foul',
          callable: ALL,
          onCall:
            'Right card. "Everyone knows," "it is settled," "nothing to argue about." She may even be onto something, but she filed her opinion as a closed fact with no owner on it. Opinions as Facts. One token.',
          onPass:
            'That was Opinions as Facts. "Everyone knows, it is settled" — she took a contested read and stamped it closed. Victor disagrees, which is the whole definition of contested. One you could have had.',
        },
        {
          kind: 'call_or_pass',
          id: 'l4-victor-fake',
          rule: 'fake_listening',
          lane: 'opponent',
          speaker: 'Verdict Victor',
          line: 'So what I am hearing is you want to force everyone out of their cars. That is it, right? Anything else?',
          expected: 'foul',
          callable: ALL,
          onCall:
            'Sharp. He dressed a summary up as listening and dropped everything under it, her reason, the whole case for transit, and handed back the version he could swat. Fake Listening. One token.',
          onPass:
            'He made it sound like a summary, but he kept none of her reason and turned it into a thing he could knock down. "Force everyone out of their cars" was never her point. Fake Listening, and it slipped by.',
        },
        {
          kind: 'call_or_pass',
          id: 'l4-olivia-clean',
          rule: 'opinion_as_fact',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          line: 'The way I see it, transit is the better bet here, because the last time this stretch got widened it was jammed again inside two years.',
          expected: 'clean',
          callable: ALL,
          onCall:
            'Hold the whistle. "The way I see it" owns it as hers, and she put a checkable reason under it, the last widening that jammed up in two years. That is exactly the shape you want. Nothing to call.',
          onPass:
            'Right, let it stand. She owned it as her read and backed it with something you could go check. That is the clean version of the same take she fouled on a minute ago, and there is no card for doing it right.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          text: 'And fine, I said "everyone knows" earlier. That was me closing the door. It is my read, not the last word. I will own it.',
        },
        {
          kind: 'call_or_pass',
          id: 'l4-victor-clean',
          rule: 'fake_listening',
          lane: 'opponent',
          speaker: 'Verdict Victor',
          line: 'What I heard is you would back transit here because the last widening filled right back up inside two years. Did I miss anything?',
          expected: 'clean',
          callable: ALL,
          onCall:
            'Ease off the whistle. That time he kept her reason, the two years, and asked if he missed anything. That is the fixed version of the move he fouled on before. Nothing to call.',
          onPass:
            'Right. Reason kept, and then "did I miss anything?" That is the honest summary, the opposite of what he did earlier. You let good listening stand, which is the other half of the job.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Verdict Victor',
          text: 'Yeah. That is her actual point, not the one I stuck her with. And the crack about her life, that was out of line. I will keep it on the road.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'That is a whole round called. A double, two lighter ones, and two honest lines that had every right to walk. That last part matters as much as the whistle: a ref who calls everything is as useless as one who calls nothing.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Last thing, and it is all yours. No frame. In one sentence: when you call a foul from the ref seat, who has the final say on whether it counts?',
        },
        {
          kind: 'free',
          id: 'l4-close',
          rule: 'judging',
          capture: 'l4_close',
          placeholder: 'In your own words.',
          chips: [],
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'The person it landed on. Never the ref, never me. You suggest, they decide, and they can wave you off for nothing. Hold onto that, because next level the chair you sit in is theirs.',
        },
      ],
    },
  ],
};
