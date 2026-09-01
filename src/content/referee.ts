// Levels 5 and 6: the referee format.
//
// Steve's ruling of 2026-08-31, in his words: "you watch the coach play someone,
// and you make the calls for him while he and the opponent do the typing." The
// human is not a disputant here. Ray steps into the ring against the level's
// figure, both of them type, and the human holds the whistle. Three parties, one
// of them silent until they blow it.
//
// Why this format exists at all: a player who has only ever called fouls on their
// own opponent has only ever ruled on lines aimed at them. The Final Showdown
// steps these two levels teach are judged from the third seat in the printed game,
// so they are taught from the third seat here. game/docs/roadmap.md section 6.
//
// POLITICAL BALANCE, and how it is achieved here. Sofia needs no balancing because
// she has no position: she argues the opposite of whatever the human argued. These
// figures do have positions, authored, so the balance has to be built. It is built
// across the pair: in level 5 the figure who fouls argues the right-coded side of
// student loans and Ray takes the left-coded side; in level 6 the figure who fouls
// argues the left-coded side of nuclear power and Ray takes the right-coded side.
// A player who clears both has watched a bad-faith move come from each direction
// and has heard Ray argue each direction well. Do not add a third level here
// without flipping again, and do not change one level's sides without changing the
// other's.

import type { FoulType, PrefightStep } from '../types.ts';
import { COACH_NAME } from '../avatars.ts';

export type RefActor = 'ray' | 'figure';

export interface RefTurn {
  /** stable item id, saved against the level slug */
  id: string;
  actor: RefActor;
  kind: 'speak' | 'summarize';
  /**
   * The figure's instruction, not a prediction. null means this turn is clean.
   * Ray is always clean: he is the model of the thing being taught, and a coach
   * who fouls in the level about spotting fouls teaches the wrong lesson.
   */
  foul: FoulType | null;
  /** used verbatim when the model is unreachable */
  fallback: string;
  /** the coach narrates before this turn, out of the ring */
  intro?: string;
}

export interface RefereeLevel {
  /** Saves name levels by slug, never by number (ruling B3, 2026-08-23). */
  slug: string;
  title: string;
  teaches: string;
  /** the card this level is really about, for the record written per item */
  rule: FoulType;
  figure: string;
  figureEmoji: string;
  figureEpithet: string;
  topic: string;
  rayStance: string;
  figureStance: string;
  prefight: PrefightStep[];
  turns: RefTurn[];
  /** said once when the whistle work is over */
  outro: string;
}

/** What a foul the referee let go by costs them, in whistle accuracy. The
 *  referee holds no purse: the tokens on the table belong to the two people
 *  arguing, and the third seat has never had one in the printed game either. */
export const REF_PASS_MARK = 0.6;

const RAY = COACH_NAME;

// Level 5. The Final Showdown's second step, "tell the other player what you
// learned", and the specific way it goes wrong: a verdict wearing a learning
// sentence. The printed deck's own worked example of the failure is "I learned
// that you don't understand this issue", tagged #humility-fail (rules.md section
// 6). That is a Judging foul at two tokens, not a soft one, and it is hard to
// hear as one because it opens with "I learned".
const LEVEL_5: RefereeLevel = {
  slug: 'referee-what-i-learned',
  title: 'What I Learned',
  teaches: 'A verdict does not stop being a verdict because it starts with "I learned".',
  rule: 'judging',
  figure: 'Enlightened Edwin',
  figureEmoji: '\u{1F468}\u{1F3FC}\u{200D}\u{1F4BC}',
  figureEpithet: 'He has grown so much. What he grew into is your problem.',
  topic: 'student loan forgiveness',
  rayStance:
    'For forgiving student loan debt, at least for low-income borrowers, because the debt ' +
    'falls hardest on people who were eighteen when they signed and had no way to price it.',
  figureStance:
    'Against forgiving student loan debt, because people who paid theirs back, or never went ' +
    'to college at all, end up covering it for people who will out-earn them.',
  prefight: [
    { kind: 'line', text: 'Different job tonight. You are not fighting. You are the referee.' },
    {
      kind: 'line',
      text:
        'I am getting in the ring. Him and me, on student loans, and I will take the side ' +
        'that says forgive them. You watch us both and you call it.',
    },
    {
      kind: 'line',
      text:
        'Watch for the step that says "tell the other player what you learned". It is the ' +
        'easiest place in the whole game to hide a verdict.',
    },
    { kind: 'card', rule: 'judging' },
    {
      kind: 'line',
      text:
        'One more thing. Call it on me too if I earn it. A referee who only whistles one ' +
        'fighter is not a referee.',
    },
  ],
  turns: [
    {
      id: 'l5-t1',
      actor: 'figure',
      kind: 'speak',
      foul: null,
      intro: 'Here we go. He opens.',
      fallback:
        'I think forgiving the loans is unfair to the people who already paid theirs off, ' +
        'and to everybody who skipped college because they did not want the debt.',
    },
    {
      id: 'l5-t2',
      actor: 'ray',
      kind: 'summarize',
      foul: null,
      fallback:
        'What I heard was that it stings for the people who paid up already, because they ' +
        'did the hard thing and now it looks like it did not count. Did I miss anything?',
    },
    {
      id: 'l5-t3',
      actor: 'ray',
      kind: 'speak',
      foul: null,
      fallback:
        'Here is where I am. Most of that debt sits on people who were eighteen and had no ' +
        'way to price what they were signing, because we told them college or nothing.',
    },
    {
      id: 'l5-t4',
      actor: 'figure',
      kind: 'summarize',
      foul: 'fake_listening',
      intro: 'Now he summarizes me. Listen to what comes back.',
      fallback: 'Right, so you want the loans cancelled. Anyway, here is the real issue.',
    },
    {
      id: 'l5-t5',
      actor: 'figure',
      kind: 'speak',
      foul: 'judging',
      intro: 'This is the step. Watch what he says he learned.',
      fallback:
        'I learned something here, honestly. I learned that you have never had to think ' +
        'about where the money actually comes from.',
    },
    {
      id: 'l5-t6',
      actor: 'ray',
      kind: 'speak',
      foul: null,
      intro: 'My turn at the same step. Same question, and you tell me if I clear it.',
      fallback:
        'What I learned is that the fairness part is real and I was treating it like a ' +
        'talking point. I changed my mind on the across-the-board version of this.',
    },
    {
      id: 'l5-t7',
      actor: 'figure',
      kind: 'speak',
      foul: 'opinion_as_fact',
      intro: 'Last one. He is not done.',
      fallback:
        'Everyone knows this is just a handout to people who will earn more than the ones ' +
        'paying for it. That is not really in dispute.',
    },
  ],
  outro:
    'That is the level. The one that gets past people is the "I learned" line, because it ' +
    'sounds like the humble step and it lands like a verdict.',
};

// Level 6. The Final Showdown's third step, "why might the other player think
// differently", and the reason it is the hardest call in the game: the step's
// bonus and the step's foul are the same grammatical move pointed in opposite
// directions. "You think that because you value fairness" earns a token. "You
// think that because you don't care about people" costs two. rules.md section 6
// rules the line between them the Referee's call, made in the room. This level is
// where a player learns to make it.
const LEVEL_6: RefereeLevel = {
  slug: 'referee-why-we-disagree',
  title: 'Why We Might Still Disagree',
  teaches:
    'Naming what the other person values earns a token. Naming what they lack costs two.',
  rule: 'judging',
  figure: 'Deep-Down Diego',
  figureEmoji: '\u{1F9D1}\u{1F3FD}\u{200D}\u{1F3A4}',
  figureEpithet: 'He knows what you really think. He is about to tell you.',
  topic: 'nuclear power',
  rayStance:
    'For building more nuclear plants, because it is the only carbon-free source that runs ' +
    'at night and in still air, and the waste problem is smaller than the coal it replaces.',
  figureStance:
    'Against building more nuclear plants, because the accident risk and the waste last ' +
    'longer than any institution we have ever built to manage them.',
  prefight: [
    { kind: 'line', text: 'Same seat as last time. You referee. I am in the ring again.' },
    {
      kind: 'line',
      text:
        'Nuclear power tonight, and I am arguing for building more of it. He is against. ' +
        'Sides are flipped from last level on purpose.',
    },
    {
      kind: 'line',
      text:
        'The step to watch is the last one: why might the other guy think differently. ' +
        'Done right it is the best move in the game. Done wrong it is the worst.',
    },
    { kind: 'card', rule: 'judging' },
    {
      kind: 'line',
      text:
        'Both versions start the same way. "You think that because." What comes after the ' +
        'because is the whole call. This one is on you and it is close.',
    },
  ],
  turns: [
    {
      id: 'l6-t1',
      actor: 'ray',
      kind: 'speak',
      foul: null,
      intro: 'I will open this one.',
      fallback:
        'The way I see it, we should build more nuclear, because it is the only clean source ' +
        'that keeps running when the wind drops and the sun goes down.',
    },
    {
      id: 'l6-t2',
      actor: 'figure',
      kind: 'summarize',
      foul: null,
      fallback:
        'What I heard was that you want nuclear because it runs around the clock, and the ' +
        'renewables you would otherwise lean on do not. Did I get that right?',
    },
    {
      id: 'l6-t3',
      actor: 'figure',
      kind: 'speak',
      foul: null,
      fallback:
        'My worry is the waste and the accidents. That material outlasts every agency and ' +
        'every government we have ever set up to watch it.',
    },
    {
      id: 'l6-t4',
      actor: 'figure',
      kind: 'speak',
      foul: 'judging',
      intro: 'Now the last step. Why does he think I think what I think.',
      fallback:
        'You think that because deep down you have never lived near one of these things and ' +
        'you do not have to care what happens to the people who do.',
    },
    {
      id: 'l6-t5',
      actor: 'ray',
      kind: 'speak',
      foul: null,
      intro: 'My turn at it. Same step. Hold me to the same bar.',
      fallback:
        'You think that because you value not handing our grandkids a problem they did not ' +
        'agree to. That is a real thing to want and I am not going to pretend it is not.',
    },
    {
      id: 'l6-t6',
      actor: 'figure',
      kind: 'speak',
      foul: null,
      intro: 'He gets another swing at it. Careful here.',
      fallback:
        'Fine. You think that because you value keeping the lights on for people who cannot ' +
        'afford an outage, and I will grant that matters.',
    },
    {
      id: 'l6-t7',
      actor: 'figure',
      kind: 'speak',
      foul: 'opinion_as_fact',
      intro: 'One more.',
      fallback:
        'The plants are obviously not worth what they cost. Nobody serious argues otherwise ' +
        'at this point.',
    },
  ],
  outro:
    'Both of us used the same sentence tonight. "You think that because." One of them was ' +
    'worth a token and one cost two. Now you know which is which.',
};

export const REFEREE_LEVELS: RefereeLevel[] = [LEVEL_5, LEVEL_6];

export function refereeLevel(slug: string): RefereeLevel | undefined {
  return REFEREE_LEVELS.find((l) => l.slug === slug);
}

/** The coach's lines out of the ring, where he narrates instead of arguing. */
export const REF_COACH = {
  callPrompt: 'Call it, or let it stand.',
  upheld: (who: string) => `${who} says it landed. Tokens move.`,
  declined: (who: string) => `${who} says it was fine. No tokens.`,
  missed: 'That one was a foul and it went by. Nobody stopped it.',
  clean: 'Nothing there. Good hold.',
  rayName: RAY,
};
