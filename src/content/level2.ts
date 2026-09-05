// Level 2: In my head, because (Opinions as Facts).
// Source: docs/design/2026-08-23_mvp-build-plan.md §4, beats 3A / 3B / 3C, plus
// the cold open and boss from 2026-08-23_full-game-scripts.md §2.
//
// Restructured 2026-08-24 on Steve's playtest ruling: three teaching beats (own
// it / because / both halves) compressed to two (own it / both halves at once).
// The four-way verdict became three buttons, because "Owned only" and "Reason
// only" made the player name a taxonomy instead of a fault. The ownership prefix
// now rides every item in beat 2 except the last one, which drops it as the
// final test.
//
// Political balance ledger, keep accurate if you touch the lines:
//   Beat 1 items 1 and 2 voice a fiscally conservative objection to loan
//   forgiveness. Items 3 and 4 voice a pro-regulation and an anti-nuclear
//   position.
//   Beat 2 items 1 and 2 sit on the pro-regulation side of crypto, item 3 on the
//   conservative side of loans, item 4 on the pro-raise side of the minimum wage,
//   and the closing edit puts a pro-return-to-office line in the player's own
//   mouth. Two left, two right, and the one the player has to author is the
//   right-leaning one.
//   Boss (step 4): Olivia's two fouls both lean right, the market sorting out crypto
//   and wage floors killing jobs. Her one clean, owned line, added under Q18 so the
//   player has a call to decline, leans left (the wage should go up, because her
//   niece works two jobs and can't make rent) and offsets them. The token-counter,
//   the personal-experience framing, and the closing-sentence lines added in step 4
//   carry no position.

import type { LevelDef } from '../types.ts';

export const level2: LevelDef = {
  slug: 'my-opinion-not-a-fact',
  title: 'In my head, because',
  teaches: 'Opinions as Facts',
  rule: 'opinion_as_fact',
  cards: ['opinion_as_fact'],
  tokens: 'off',
  boss: 'Obvious Olivia',
  bossEmoji: '\u{1F469}\u{1F3FF}',
  bossEpithet: 'Never says "I think." Everything she believes is simply a fact.',
  prefight: [
    {
      kind: 'line',
      text: 'Obvious Olivia. She\'s the nicest person you\'ll fight all week.',
    },
    {
      kind: 'line',
      text: 'Her move is that she never says "I think". Everything is just how it is, and everybody knows it, and you\'re the only one being difficult.',
    },
    {
      kind: 'line',
      text: 'One move to watch for: she says her opinion like it\'s the weather.',
    },
    { kind: 'card', rule: 'opinion_as_fact' },
  ],
  beats: [
    {
      name: 'Own it',
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'I\'m going to say four things. Some are fair. Some are me passing off my opinion as fact. Call the ones that cross the line.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'One word on the counter up top. In a real match, saying your opinion like it\'s a fact moves a token, same as any foul, and a wrong call costs you one too. Still not in here. It won\'t budge in the drills and it won\'t budge against Olivia either, so you can miss freely and learn the shape. That holds a while longer.',
        },

        {
          kind: 'call_or_pass',
          id: 'l2-3a-i1',
          rule: 'opinion_as_fact',
          lane: 'coach',
          line: 'Student loan forgiveness is a handout to people who made bad choices.',
          expected: 'foul',
          onCall:
            'Right. No "I think", no "my read is". I stated my opinion as if it were settled.',
          onPass:
            'That one crossed. I said it like a fact. Watch for the missing "I think".',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-3a-i2',
          rule: 'opinion_as_fact',
          lane: 'coach',
          line: 'My read on student loan forgiveness is that it rewards people who made bad choices.',
          expected: 'clean',
          onCall:
            'Fair instinct, but I owned it. "My read on this is" is exactly the fix.',
          onPass: 'Same opinion, and now it\'s mine to hold. That\'s the whole move.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'And that\'s the deal: once you put "in my head" on the front, you can say almost anything. Own it and it\'s fair game. The rule isn\'t about what you believe, it\'s about pretending your belief is the weather.',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-3a-i3',
          rule: 'opinion_as_fact',
          lane: 'coach',
          line: "The story I'm telling myself is that crypto is obviously a scam.",
          expected: 'foul',
          onCall:
            'Good catch. I said the magic words and then said "obviously" anyway. The phrase isn\'t a password.',
          onPass:
            'This one is sneaky. I used the ownership phrase and still called it obvious. The phrase isn\'t a password.',
        },
        {
          kind: 'edit',
          id: 'l2-3a-i4',
          rule: 'opinion_as_fact',
          ask: 'Your turn, but I\'ll do the typing. Here\'s a line. Fix it so it\'s yours.',
          prefill: 'Nuclear power is too dangerous to expand.',
          chips: ['In my head,', 'My read is that', "The story I'm telling myself is"],
          target:
            'The edit must add an ownership marker (I think, my read is, in my head, the story I am telling myself) without smuggling an assertion marker back in (obviously, clearly, everyone knows, the fact is). Adding the prefix and then saying "obviously" fails.',
          fallback:
            'The shape is: "In my head, nuclear power is too dangerous to expand." Same claim, now it\'s yours to hold.',
        },
        { kind: 'continue', label: 'Next: the part where you say why' },
      ],
    },

    {
      // Beat B and beat C merged, 2026-08-24. The player has just learned to own
      // a claim, so every item here already carries the ownership prefix and the
      // only question is whether the reason holds up. The last item drops the
      // prefix without warning, which is the test that the first half stuck.
      name: 'Own it and back it',
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'Owning it is the easy half. Here\'s the other one: the part after "because".',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'A real because is something somebody could go and check. A number, a thing that happened, something you saw. "Everyone knows" is a headcount, not a reason. Saying the claim again in a louder voice isn\'t a reason either.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Four lines. Three buttons. Tell me what\'s missing, or tell me it\'s good.',
        },

        {
          kind: 'sort',
          id: 'l2-3c-i1',
          rule: 'opinion_as_fact',
          line: 'In my head, crypto needs much tighter rules. It just does.',
          options: [
            { value: 'missing_own', label: 'Said as a fact' },
            { value: 'missing_reason', label: 'No real because' },
            { value: 'good', label: 'Good' },
          ],
          expected: 'missing_reason',
          feedback: {
            missing_own: 'That one is owned. "In my head" is right there at the front.',
            missing_reason: 'Owned, and then nothing. "It just does" is where the reason should be.',
            good: 'Half of it is good. There\'s no reason in there at all.',
          },
        },
        {
          kind: 'sort',
          id: 'l2-3c-i2',
          rule: 'opinion_as_fact',
          line: 'In my head, crypto needs tighter rules, because the two exchanges I used both froze withdrawals in the same year.',
          options: [
            { value: 'missing_own', label: 'Said as a fact' },
            { value: 'missing_reason', label: 'No real because' },
            { value: 'good', label: 'Good' },
          ],
          expected: 'good',
          feedback: {
            missing_own: 'It is owned. "In my head" at the front, doing its job.',
            missing_reason: 'Somebody could go and look up those two exchanges. That is a real because.',
            good: 'Both halves. Owned at the front, checkable at the back.',
          },
        },
        {
          kind: 'sort',
          id: 'l2-3c-i3',
          rule: 'opinion_as_fact',
          line: 'In my head, student loan forgiveness is unfair, because everyone knows it just moves the bill to people who never went.',
          options: [
            { value: 'missing_own', label: 'Said as a fact' },
            { value: 'missing_reason', label: 'No real because' },
            { value: 'good', label: 'Good' },
          ],
          expected: 'missing_reason',
          feedback: {
            missing_own: 'She owned this one. The problem is on the other side of "because".',
            missing_reason: 'Right. "Everyone knows" is a headcount, and it\'s doing all the work here.',
            good: 'The front half is fine. "Everyone knows" isn\'t a reason, it\'s a crowd.',
          },
        },
        {
          // The prefix goes away here, with no announcement. Everything before
          // this had one, so a player running on autopilot reads right past it.
          kind: 'sort',
          id: 'l2-3c-i4',
          rule: 'opinion_as_fact',
          line: 'The federal minimum wage should be raised, because the diner near me lost three cooks last year to a warehouse paying four dollars more.',
          options: [
            { value: 'missing_own', label: 'Said as a fact' },
            { value: 'missing_reason', label: 'No real because' },
            { value: 'good', label: 'Good' },
          ],
          expected: 'missing_own',
          feedback: {
            missing_own: 'Caught it. Good reason, and it still opens like a weather report.',
            missing_reason: 'The reason is the strong part. Read the front again.',
            good: 'The because is solid. Nobody ever said whose opinion this is.',
          },
        },

        {
          kind: 'say',
          lane: 'coach',
          text: 'Own it and it\'s the strongest thing in the round: "In my head, the minimum wage should go up, because the diner near me lost three cooks to a warehouse paying more." That diner is your story, something you actually saw. But hear what it is: it\'s yours. An experience, an opinion built from it. It is not a fact that settles the wage for the whole country. You offer it as your reason. You don\'t drop it like the last word.',
        },

        {
          kind: 'edit',
          id: 'l2-3b-i4',
          rule: 'opinion_as_fact',
          ask: 'Your turn, and I have done the typing. Swap that "obviously" for a real reason, something you saw or lived that somebody could go and check.',
          prefill:
            "Federal workers should be back in the office five days a week, because that's obviously how real work gets done.",
          chips: ['because I noticed', 'because the last time', 'because in my team'],
          target:
            'The edit must replace the reason with something checkable: a specific observation, a number, an event, an experience. "Obviously", "everyone knows", and simply saying the claim over again all fail.',
          fallback:
            'Something like: "because the two projects we ran remote last year both slipped a month." Small, specific, and somebody could argue with it.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'And here\'s the rule that rides with a story like that: it\'s a tool, not a trump card. It\'s yours, your experience, your read. You offer it, you don\'t drop it on the table like it ends the argument for everyone. Frame it as your opinion and it opens the other person up. Wave it around as the fact and you\'ve just done Olivia\'s move with a better anecdote.',
        },
        { kind: 'continue', label: 'Face her' },
      ],
    },

    {
      name: 'Obvious Olivia',
      boss: true,
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'Nothing she says will be rude. That\'s what makes it hard.',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-boss-1',
          rule: 'opinion_as_fact',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          line: 'Obviously the market would sort out the coins on its own. Everybody who works in this knows that.',
          expected: 'foul',
          onCall: 'Two markers in one sentence. She didn\'t notice either.',
          onPass: '"Obviously" and "everybody knows", back to back. That\'s the move.',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-boss-2',
          rule: 'opinion_as_fact',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          line: 'And of course the states that raised their wage floor lost the jobs. That\'s just what happens.',
          expected: 'foul',
          onCall: 'Same shape, other side of the aisle. She does it to everyone.',
          onPass:
            '"Of course" and "that\'s just what happens". A claim she could have owned, and didn\'t.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          text: 'I\'m not being difficult. These are simply the facts.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Nothing rude yet, and nothing of hers either. Hold on, she\'s got one more.',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-boss-clean',
          rule: 'opinion_as_fact',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          line: 'Look, in my head I actually think the wage should go up, because my niece works two jobs and still can\'t make her rent. That\'s just what I\'ve seen.',
          expected: 'clean',
          onCall:
            'Hold the whistle. "In my head" up front, and a real reason behind it, her niece, two jobs. She finally did it right. A bad call costs you.',
          onPass:
            'Nothing to call. She owned it and backed it with something real. First honest thing she\'s said all round.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          text: '...huh. "In my head." Saying it out loud like that, it felt smaller. Less like the weather and more like, well, mine. Maybe that\'s the thing I\'ve been missing.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'There it is. Nothing she said all round was rude, that\'s what made her hard. And the second she owned one, she heard herself. That\'s the card doing its job.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Last one, no frame, your words. In one sentence: what turns your opinion into something you\'re passing off as a fact?',
        },
        {
          kind: 'free',
          id: 'l2-close',
          rule: 'opinion_as_fact',
          capture: 'l2_close',
          placeholder: 'In your own words.',
          chips: [],
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'However you put it, the tell is three words on the front. "In my head." Put them there and your opinion stays yours, no argument. Leave them off and you\'re reporting the weather.',
        },
        { kind: 'continue', label: 'Finish' },
      ],
    },
  ],
};
