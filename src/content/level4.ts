// Level 4: In the ref seat. Victor vs Olivia, and the player referees.
//
// Written for the gym rebuild, step 5; revamped 2026-09-05 on Nathan's playtest
// findings 13 and 14 and his rulings 2, 3 and 5. This is the hinge of the ladder.
// Levels 1 to 3 kept the player inside their own argument and never once said the
// word "referee"; here the third chair at the table is named for the first time,
// and the level opens by saying the sequence out loud: you learn the seat as ref
// first, then you play a whole round yourself next (that is Level 5).
//
// Three things are new and they are the whole point of the level:
//
//   1. All three cards are live at once (LevelDef.cards, wired through the rail).
//      For three levels the call was never a real choice, because only one card
//      was ever on the table. Now the player has to pick the right one or wave
//      the line through. Defect 4 is what makes this true: CallOrPassStep.callable
//      carries the set, and every boss call here lists all three.
//   2. The tokens are real, and none of them are the player's. L1-L3 said out loud
//      that the drills were a learning allowance and the stacks would sit still;
//      that allowance ends here. But the ref holds no purse (Nathan, ruling 2:
//      "the ref does not have a token count, so their mistakes are not
//      penalized"), so the two stacks up top belong to Victor and Olivia — see
//      `fighters` below, and ruling 3, "show both fighter's purses and drop the
//      'you' side". A missed call costs the player nothing. An upheld call moves
//      the fouling fighter's tokens to the fighter they fouled, and Judging is
//      the double penalty it has always been on the card: two, not one (defect 3
//      — the engine reads CARDS[rule].cost, not a hardcoded 1). `charges` on each
//      call names which of the two purses pays, because from this chair neither
//      of them is the player's.
//   3. The whistle only suggests, and you watch them rule on it. Steve: "Ref OR
//      offendee can suggest, offendee always is the final decider." The level used
//      to teach that by dropping the player into a second argument on a second
//      topic and letting the coach ref them — which is exactly what Nathan caught
//      in finding 13: the level's first boss beat handed the *player* an opinion
//      and made *Ray* the ref, in the level whose whole job is the opposite. It is
//      gone. The rule is now taught the way it is played: the player whistles, and
//      the fighter the foul landed on says yes or no out loud (`ruling` on each
//      call_or_pass). Nathan, ruling 5: "the confirm becomes 'suggest it and watch
//      them rule'; the players should be agreeable to demonstrate how the ref
//      works in the level system, no tricks. If the user makes a mistake as the
//      ref and clicks the wrong card, the AI player can rule 'no' instead of Ray
//      explaining that it was the wrong card, making the feedback more game-like."
//      So a right card is taken; a wrong card gets a "no" from the person it
//      landed on and nothing else, and it costs nothing.
//
// That ruling also means this level no longer carries a `confirm` step. Two of
// them lived here and both were the demo above. CLAUDE.md still says a confirm is
// a core component of every level; in the code it never was (L1, L2 and the L5
// showdown have none, L3 has one), and Nathan's ruling 5 supersedes it for this
// level. Flagged for the PR rather than dropped quietly.
//
// Q7: inside the gym the boss's ruling is a scripted answer key, not a judgment,
// so every call_or_pass carries its own `expected`. Nothing here needs the model.
//
// Political balance ledger, keep accurate if you touch the lines:
//   The round is a highway-widening vs transit argument. Verdict Victor takes the
//   pro-car side and is caught twice — a Judging foul (a verdict on Olivia's life)
//   and a Fake Listening foul (drops her reason). Obvious Olivia takes the transit
//   side and is caught once, an Opinions-as-Facts foul ("induced demand is
//   settled"). The two clean lines are shared one apiece: Olivia's owned transit
//   opinion and Victor's honest summary, and both bosses concede their own foul in
//   their own words. CHANGED 2026-09-05: the deleted demo ran on a separate
//   school-start-times topic and was Olivia's second catch, so the level was 2-2
//   before and is 2-1 against the right-coded speaker now. He is caught on the
//   heavier pair and she on the lighter one; the concessions and the clean lines
//   still split evenly. HEART-T260823-33 is still Nathan's call in the PR, and he
//   has said the balance is fine as it stands.

import type { FoulType, LevelDef } from '../types.ts';

// Every boss call here opens the whole rail, which is the difference between this
// level and the three before it. Naming the set on the step is what wires it.
const ALL: FoulType[] = ['judging', 'opinion_as_fact', 'fake_listening'];

// The two faces are the ones the player already met, borrowed from levels 1 and 2
// so the pair reads as a reunion rather than two strangers. They share the
// opponent lane, so without these they would wear the same head and the player
// could not tell at a glance which of them just fouled (finding 14).
const VICTOR = '\u{1F468}\u{1F3FB}\u{200D}\u{2696}\u{FE0F}';
const OLIVIA = '\u{1F469}\u{1F3FF}';

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
  // The opposition is two people sharing one lane, so the lane's default face is
  // the pair; `bossFaces` is what actually tells them apart in the thread.
  bossEmoji: '\u{1F465}',
  bossFaces: {
    'Verdict Victor': VICTOR,
    'Obvious Olivia': OLIVIA,
  },
  // Ruling 3: both fighters' purses up top, no "you" side, because the ref holds
  // no tokens. `left` is the engine's `opponent` purse and `right` is its
  // `player` purse — there are still exactly two and we relabelled them rather
  // than adding a third. That mapping is what `charges` on each call refers to.
  fighters: {
    left: { name: 'victor', emoji: VICTOR },
    right: { name: 'olivia', emoji: OLIVIA },
  },
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
          text: 'So: not one word from you about the highway. Whichever of them is right about it is not your problem tonight.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'And those two stacks of tokens up top are live now. Look at whose they are, though. One belongs to Victor, one belongs to Olivia. You do not have a stack. The ref never pays and the ref never earns.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'So a foul you catch does not pay you, it pays the person it landed on: the one who fouled hands tokens across the table. And a foul you miss costs you nothing. Nobody fines the ref. Your job is just to see it.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'One card costs double. Judging was always the double penalty, right there on the card. Call that one right and two tokens cross the table, not one. Biggest thing in the room to catch, and the one worth being sure about.',
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
          text: 'So you will not just call these. You will call one and then watch them rule on it. Put a card down and the person it hit tells you, out loud, whether they are taking it. Pick the wrong one and they will tell you that too, and it will not cost you a thing.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'The whistle is in your hand. You are the ref for these two, and the highway is back on the table. Watch how they treat each other, and call what you see. All three cards are yours.',
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
          ruling: {
            speaker: 'Obvious Olivia',
            upheld:
              'Yes. Take it. He did not say one word about the trains, he said something about me. I will have that one.',
            declined:
              'No, that is not the one. He did not come at what I said, he came at me. Look again.',
          },
          onCall:
            'Good whistle, and she took it. He never touched her argument. He handed down a verdict on her whole life, "you do not live in the real world," and that is Judging every time. Two tokens across the table.',
          onPass:
            'That was the big one and it got past you. Not a word about transit, just a verdict on who she is and how she lives. Judging, the double penalty. Costs you nothing, but she was owed two and she did not get them.',
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
          // Olivia is the engine's `player` purse (see `fighters`), so this is the
          // one call in the level where the right stack pays the left one.
          charges: 'player',
          ruling: {
            speaker: 'Verdict Victor',
            upheld:
              'Yeah, I will take that. "Nothing to argue about" while I am sitting right here arguing about it. Hand it over.',
            declined:
              'No. She listened fine, she just told me the matter was closed. Different problem. Try again.',
          },
          onCall:
            'Right card, and he took it. "Everyone knows," "it is settled," "nothing to argue about." She may even be onto something, but she filed her opinion as a closed fact with no owner on it. Opinions as Facts. One token to Victor.',
          onPass:
            'That was Opinions as Facts. "Everyone knows, it is settled" — she took a contested read and stamped it closed. Victor disagrees, which is the whole definition of contested. One he never got.',
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
          ruling: {
            speaker: 'Obvious Olivia',
            upheld:
              'Yes, I am taking that one. He made it sound like a summary and there was nothing of mine left in it.',
            declined:
              'No, that is the wrong card for it. He was not ruling on me and he was not stating a fact. He was pretending to repeat me.',
          },
          onCall:
            'Sharp, and she took it. He dressed a summary up as listening and dropped everything under it, her reason, the whole case for transit, and handed back the version he could swat. Fake Listening. One token.',
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
          ruling: {
            speaker: 'Verdict Victor',
            declined:
              'No, I am not taking that. I do not agree with a word of it, but she said it was her read and she said why. That is fair.',
            upheld: 'No, I am not taking that. She owned it and she backed it. That is fair.',
          },
          onCall:
            'And he waved you off, which is his right. "The way I see it" owns it as hers, and she put a checkable reason under it, the last widening that jammed up in two years. That is exactly the shape you want. Nothing to call, and nothing lost by asking.',
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
          ruling: {
            speaker: 'Obvious Olivia',
            declined:
              'No, he kept it. The two years, the whole reason. And he asked. I have got nothing to take there.',
            upheld: 'No, he kept my reason and he asked if he missed anything. Nothing to take.',
          },
          onCall:
            'She waved it off, and she is right to. That time he kept her reason, the two years, and asked if he missed anything. That is the fixed version of the move he fouled on before. A whistle you get wrong here costs you nothing, but keep watching before you blow it.',
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
          text: 'That is a whole round called. A double, a lighter one, and two honest lines that had every right to walk. That last part matters as much as the whistle: a ref who calls everything is as useless as one who calls nothing.',
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
          text: 'The person it landed on. Never the ref, never me. You suggest, they decide, and they can wave you off for nothing. You watched them do it twice tonight. Hold onto that, because next level the chair you sit in is theirs.',
        },
      ],
    },
  ],
};
