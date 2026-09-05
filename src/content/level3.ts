// Level 3: Did I miss anything? (Fake Listening).
//
// Rebuilt for the gym rebuild, step 3. The old level was a cutscene with a QTE and
// never once pressed the Fake Listening card in the level that teaches Fake
// Listening (defect 14). This is a full round, open book: the player learns the
// move, does one clean rep themselves, watches the card get pointed at their own
// chair, rules on a bad summary of their own words, then calls the card on the boss
// for real. The round shape is rules.md §5 — a view, a summary, the speaker answers
// "did I miss anything?", then the roles switch.
//
// Nothing here needs the model. Q6 (2026-08-.., ruling index): the answer to "did I
// miss anything?" is authored per beat, no model, and there is no redo. The offended
// party is the only one who can rule on a foul (soul.md §6), so the two confirm
// replies are both authored and neither is wrong.
//
// Nothing in this level costs a token (`tokens: 'off'`; Nathan, 2026-09-05). Q19
// already said the card played against the player carries no penalty and is never
// played on a clean summary; the ruling extends that to the whole level, boss calls
// included. The counter still shows, and the coach says out loud that a dropped
// reason would normally move a token, so the free period reads as a learning
// allowance and the real cost, which arrives at L4, is not a surprise.
//
// L1-L3 never name the referee; the word, the role and the three-player table are all
// withheld until L4. Nothing here mentions a ref.
//
// Political balance ledger, keep accurate if you touch the lines:
//   The examples spread across the aisle so no side owns "the person who fake
//   listens". Left: raising the minimum wage (beat 1 delta), and Noemi's own take
//   that working from home is better (beat 2). Right: the skeptic of full remote who
//   trained juniors at a whiteboard (beat 1 template), and the player's stated view
//   against a city gas-stove ban (beat 2 confirm). The stadium subsidy the player
//   objects to in the two boss calls is a cross-partisan gripe. Two clearly left,
//   two clearly right, and Noemi — the one caught fouling — is voicing the left take,
//   which is counterweighted by the boss of Level 2 being caught on a conservative one.

import type { LevelDef } from '../types.ts';

export const level3: LevelDef = {
  slug: 'the-summary-gate',
  title: 'Did I miss anything?',
  teaches: 'Fake Listening',
  rule: 'fake_listening',
  cards: ['fake_listening'],
  tokens: 'off',
  boss: 'Nodding Noemi',
  bossEmoji: '\u{1F469}\u{1F3FD}',
  bossEpithet: 'Agrees with everything. Heard none of it.',
  prefight: [
    {
      kind: 'line',
      text: 'Nodding Noemi. She\'ll agree with you. She\'ll nod. She\'ll say your point back so smoothly you\'ll feel heard.',
    },
    {
      kind: 'line',
      text: 'And she\'ll leave out the one part of it that costs her something to answer.',
    },
    {
      kind: 'line',
      text: 'So the move is small. Say the other person\'s reason back, out loud, then ask one question: did I miss anything? Miss the reason and this is the card that gets played.',
    },
    { kind: 'card', rule: 'fake_listening' },
  ],
  beats: [
    {
      name: 'Say it back',
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'Her whole move is to agree with the easy half of what you said and quietly drop the half she can\'t answer. So we practice keeping the reason in.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'One thing about the counter up top. In a real match, dropping someone\'s reason moves a token. It\'s a foul like any other. In here it still costs you nothing — not the drills, not Noemi — so watch the number sit still while you learn the third card. The allowance does not last forever.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Here\'s someone making a point, then the summary they got back. Tell me what went missing.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'She says: "The minimum wage should go up. The diner by me lost three cooks last year to a warehouse paying four dollars more."',
          isSpecimen: true,
        },
        {
          kind: 'sort',
          id: 'l3-say-1',
          rule: 'fake_listening',
          line: 'He says back: "So you want the minimum wage raised. Did I miss anything?"',
          options: [
            { value: 'kept', label: 'Nothing, he got it' },
            { value: 'reason', label: 'He dropped the reason' },
            { value: 'claim', label: 'He dropped the claim' },
          ],
          expected: 'reason',
          feedback: {
            kept: 'Look again. He kept her opinion and nothing else. The reason never came back.',
            reason: 'Right. He kept her opinion and left the reason on the floor. The warehouse, the three cooks, gone.',
            claim: 'The claim survived, that\'s the part he did keep. It\'s the reason underneath it that vanished.',
          },
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Here it is with the reason back in: "So the minimum wage should go up, because the diner by you lost three cooks to a warehouse that pays more. Did I miss anything?" Same breath. The only difference is the one part she\'d have argued for.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Your turn to say one back. Take this: "I don\'t buy full remote. I trained three juniors standing at a whiteboard, and I can\'t picture doing that over video." I\'ll give you the frame. Keep both halves in.',
          isSpecimen: true,
        },
        {
          kind: 'template',
          id: 'l3-say-2',
          rule: 'fake_listening',
          segments: [
            { text: 'What I heard is that ' },
            { input: { placeholder: 'his point' } },
            { text: ', because ' },
            { input: { placeholder: 'his reason' } },
            { text: '. Did I miss anything?' },
          ],
          reply:
            'That\'s the whole move. The point and the reason both survive the trip, not just the opinion. Nothing left to add, so no card comes out. That\'s the shape of a clean summary.',
        },
        { kind: 'continue', label: 'Face her' },
      ],
    },

    {
      name: 'Nodding Noemi',
      boss: true,
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'She\'ll nod at everything. Watch which half she keeps and which she drops.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Nodding Noemi',
          text: 'Honestly? Working from home is just better. I get more done by nine at my kitchen table than I used to manage by noon in that office.',
          isTake: true,
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Here\'s the summary a lot of people would hand her back.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: '"So you think working from home is better. Did I miss anything?"',
          isSpecimen: true,
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Nodding Noemi',
          text: 'That\'s me! ...though you skipped the why.',
        },
        { kind: 'card', rule: 'fake_listening' },
        {
          kind: 'say',
          lane: 'coach',
          text: 'There\'s the card, pointed at your chair this time. That summary gave her opinion back and dropped her reason, the part about getting more done by nine. Same foul, other direction. No charge in here. Keep the reason in and this card never leaves the table.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Now flip it. You just told her you don\'t want the city banning gas stoves, because your mother has cooked on hers for forty years and it\'s how she feeds the whole family on holidays. Here\'s what comes back.',
        },
        {
          kind: 'confirm',
          id: 'l3-summarized',
          rule: 'fake_listening',
          lane: 'opponent',
          speaker: 'Nodding Noemi',
          ask: 'So you just don\'t like change. Did I miss anything?',
          yesLabel: 'You missed it, say my reason back',
          noLabel: 'No, that\'s fair',
          placeholder: 'Tell her what she left out, if you want',
          onYes:
            'You\'re right. Your mother, forty years, the holidays. I dropped all of it and kept "you don\'t like change." That was the easy half, wasn\'t it.',
          onNo:
            'Fine. But I didn\'t say your reason back, not one word of it, and you\'d have had every right to make me.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'That call is yours and only yours. Nobody grades whether a summary landed wrong on you but you, because you\'re the one who said the thing. That\'s the whole point of the question.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Two more from her, and this is the real thing. You just told her the new stadium\'s a waste of public money, because the last one the city built sits empty two hundred nights a year. Same question each time: did she keep your reason, or drop it? Card if she dropped it, wave it off if she didn\'t.',
        },
        {
          kind: 'call_or_pass',
          id: 'l3-boss-1',
          rule: 'fake_listening',
          lane: 'opponent',
          speaker: 'Nodding Noemi',
          line: 'So you\'re against the stadium. Did I miss anything?',
          expected: 'foul',
          onCall:
            'Good whistle. "Against the stadium" is the easy half. The two hundred empty nights, your reason, she left it out.',
          onPass:
            'That one dropped your reason. Two hundred empty nights, gone, and only the opinion came back. That was the card.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Nodding Noemi',
          text: '...okay. Okay. Two hundred nights. Let me say the whole thing back.',
        },
        {
          kind: 'call_or_pass',
          id: 'l3-boss-2',
          rule: 'fake_listening',
          lane: 'opponent',
          speaker: 'Nodding Noemi',
          line: 'So the new stadium\'s a waste because the last one sits empty two hundred nights a year. Did I miss anything?',
          expected: 'clean',
          onCall:
            'Hold the whistle. That time she kept the reason, empty nights and all. Nothing to call.',
          onPass:
            'Right. She said the whole thing back, reason included. Nothing left to catch.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'And that\'s her fixed. Once someone actually says your reason back, there\'s nothing left to catch. You don\'t drain her down to nothing, you reform her. One good call and the move\'s retired for the rest of the match.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Last one, and it\'s all yours. No frame this time. In one sentence: after you say someone\'s point back to them, what do you ask?',
        },
        {
          kind: 'free',
          id: 'l3-close',
          rule: 'fake_listening',
          capture: 'l3_close',
          placeholder: 'In your own words.',
          chips: [],
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Whatever you wrote, the question that proves it is five words: "Did I miss anything?" You hand them the pen and let them correct you. That\'s the bar.',
        },
      ],
    },
  ],
};
