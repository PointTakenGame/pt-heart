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
//
// LEVEL_4, added 2026-09-06, is the exception to that pairing rule and is allowed
// to be, because it balances inside itself: both fighters commit exactly the same
// weight of foul and each one models a repair of the other's. Its own ledger sits
// above it. It does not enter the level 5 / level 6 offset and must not be counted
// as one half of it.
//
// LEVEL_4 is also the first level where neither arguer is Ray. `RefActor` still
// says 'ray' and 'figure' because those are the two seats the runner has always
// had; read them as left seat and right seat. `left` on the level overrides who
// sits in the left one.

import type { FoulType, PrefightStep } from '../types.ts';
import { COACH_EMOJI, COACH_NAME } from '../avatars.ts';

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
  /**
   * The showdown step this turn is, in the imperative, addressed to the figure.
   *
   * These two levels each drill one step of the Final Showdown, and a turn told
   * only "argue your side" produces another round of argument instead. The first
   * playthrough had Ray announce "watch what he says he learned" over a line
   * that mentioned no learning at all. Set this on every turn the coach's intro
   * promises something specific, or the intro writes a cheque the turn does not
   * cash.
   */
  frame?: string;
  /** the coach narrates before this turn, out of the ring */
  intro?: string;
  /**
   * The scripted answer key for a whistle blown on this turn.
   *
   * Steve's ruling of 2026-09-07 (HEART-T260907-01): inside the gym, the fighter's
   * response to a call is a script, not a judgment. It used to go to the model
   * through `affirmCall`, which meant the one moment the level is actually about
   * was the one moment nobody had written. Present means scripted and the model
   * is never asked; absent means the old path, which is what levels 5 and 6 still
   * use while they are frozen.
   *
   * `upheld` and `declined` are the fouled fighter's own words, in character.
   * `declined` covers both misses that can happen: the wrong card on a real foul,
   * and a whistle on a line that was clean. Neither costs the referee anything,
   * per the no-purse rule above, so this is teaching text and not a penalty.
   *
   * `onCall` is the coach afterwards whenever the whistle was blown, `onPass`
   * whenever it was let stand.
   */
  scripted?: {
    upheld: string;
    declined: string;
    onCall: string;
    onPass: string;
  };
  /**
   * A line the fighter says once the call on this turn is settled.
   *
   * Steve's ruling of 2026-09-07: each fighter repairs their own foul, not the
   * other's. The alternative, which shipped here until now, had each of them
   * clean up after the other so that neither ended the round as the one who
   * modelled good behaviour. He picked the redemption arc instead, so these are
   * the two concessions that pay off the two fouls their own speaker committed.
   */
  after?: { actor: RefActor; text: string };
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
  /**
   * Who argues in the left seat, and what they argue.
   *
   * Levels 5 and 6 leave `left` unset: Ray gets in the ring himself, and the
   * runner falls back to his name and his face. Level 4 sets it, because there
   * the player referees two other people and Ray stays out in the corner where
   * a coach belongs. `rayStance` is the left seat's stance either way, whoever
   * is sitting in it; the name is older than the seat being rentable.
   */
  left?: { name: string; emoji: string };
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

// The two Final Showdown steps these levels drill, written as instructions to
// whoever is speaking. Shared between the figure's turn and Ray's turn at the
// same step on purpose: the referee is comparing two attempts at one thing, and
// they have to be attempts at the same thing.
const WHAT_I_LEARNED =
  'This is the What I Learned step of the showdown. Do not argue your side again. Say what ' +
  'you took away from what they just told you, out loud, and name the specific thing of ' +
  'theirs that moved you. Open with something like "What I learned here is".';

const WHY_WE_DISAGREE =
  'This is the Why We Might Still Disagree step of the showdown. Do not argue your side ' +
  'again. Say why you think THEY hold their position, in terms they would accept and ' +
  'recognize: the value underneath it, the experience behind it. Open with something like ' +
  '"I think we still land in different places because".';

const RAY = COACH_NAME;

/** The left seat's name and face, which is Ray unless the level rents it out.
 *  One function so the runner, the walk-out and the purse header cannot drift
 *  apart about who is sitting there. */
export function leftSeat(level: RefereeLevel): { name: string; emoji: string } {
  return level.left ?? { name: RAY, emoji: COACH_EMOJI };
}

// The two faces are the ones the player already met, borrowed from levels 1 and
// 2 so the pair reads as a reunion rather than two strangers.
const VICTOR = '\u{1F468}\u{1F3FB}\u{200D}\u{2696}\u{FE0F}';
const OLIVIA = '\u{1F469}\u{1F3FF}';

// Level 4. The hinge of the ladder (docs/design/ladder-spec.md): levels 1 to 3
// kept the player inside their own argument and never once said the word
// referee, and here the third chair is named for the first time. Three things
// are new and they are the whole level.
//
//   1. All three cards are live at once. For three levels the call was never a
//      real choice, because only one card was ever on the table.
//   2. The tokens are real and none of them are the player's. The referee holds
//      no purse, so a missed call costs accuracy and nothing else, and an upheld
//      call moves tokens between the two fighters. The runner derives who pays
//      from who spoke, so there is no way to charge the wrong purse here.
//   3. The whistle only suggests. The fighter the foul landed on rules on it,
//      out loud, and can wave off even the referee.
//
// The beats and most of the copy are a contributor's, from a branch that wrote
// this as a hardcoded script with nametags; the ladder spec's instruction was to
// port the beats and not the file. Two things changed on the way in. His version
// charged a purse named by hand on each call, which pays the wrong fighter with
// no error the first time someone forgets it; the runner already knows who spoke.
// And his round was 2 fouls to 1 against the right-coded speaker, flagged in his
// own ledger as something the reviewer would have to settle. It is even here.
//
// POLITICAL BALANCE LEDGER, keep it accurate if you touch these lines. The round
// is widening a highway against building transit. Victor argues for the lanes,
// Olivia for the trains. Each of them commits exactly two fouls: one Judging,
// the double, and one single-token foul. Each pays three tokens across the round.
// Each gets exactly one clean line, and each clean line is the repaired version
// of a card the OTHER one fouled, so neither fighter is the one who models good
// behaviour. Their two Judging fouls are the same move in mirror image: each one
// tells the other they have never lived the life that would teach them better.
const LEVEL_4: RefereeLevel = {
  slug: 'the-third-chair',
  title: 'The Third Chair',
  teaches: 'All three cards at once, and the whistle only suggests.',
  // The marquee card: both of the doubles in this round are Judging, and it is
  // the first time the player has had to pick a card rather than confirm one.
  rule: 'judging',
  left: { name: 'Verdict Victor', emoji: VICTOR },
  figure: 'Obvious Olivia',
  figureEmoji: OLIVIA,
  figureEpithet: 'Never says "I think." Everything she believes is simply a fact.',
  topic: 'widening the highway',
  rayStance:
    'For widening the highway, because the two exits either side of this stretch back up every ' +
    'morning and a car is the only way to move kids and a week of groceries.',
  figureStance:
    'For spending the money on transit instead, because the last time this stretch was widened ' +
    'it filled back up within two years.',
  prefight: [
    {
      kind: 'line',
      text:
        'Three levels, three fouls, all of them from inside the argument. There is a third chair ' +
        'at that table and you have never sat in it. Tonight you do. The referee.',
    },
    {
      kind: 'line',
      text:
        'The referee never takes a side. You watch both people and you call what you see. All ' +
        'three cards are live at once for the first time, and picking the right one is the job.',
    },
    {
      kind: 'card',
      rule: 'judging',
      text:
        'This one costs double. Two tokens across the table, not one. Biggest thing in the room ' +
        'to catch, and the one worth being sure about.',
    },
    {
      kind: 'card',
      rule: 'opinion_as_fact',
      text: "One token. A contested read, filed as a closed fact, with nobody's name on it.",
    },
    {
      kind: 'card',
      rule: 'fake_listening',
      text:
        'One token, and only on a summary. If the playback drops their reason, it is this one. ' +
        'On a speaking turn the card is dead and I will grey it out for you.',
    },
    {
      kind: 'line',
      text:
        'One thing about the whistle, and it is what most referees get wrong. It only suggests. ' +
        'The person the foul landed on has the last word, and they can wave off even you.',
    },
    {
      kind: 'line',
      text:
        'Two of them tonight. Victor, who you met in level one, and Olivia from level two, going ' +
        'at it over a highway. You are between them, and you do not have a stack of tokens. The ' +
        'referee never pays and the referee never earns.',
    },
  ],
  // Item ids are `chair-` and not `l4-`, even though this is rung 4. The
  // Showdown's items have been `l4-*` since it was level 4 and they are live
  // keys in the corpus table, so the prefix is spoken for. Slug plus item id is
  // what makes a corpus row unique, so nothing would have broken; a later
  // analyst grepping `l4-` for one level and getting two would have.
  // Reordered and re-cut on 2026-09-07 to Nathan's build of this round, on Steve's
  // ruling that Nathan is the ground truth for level 4 content. Two changes with
  // teeth.
  //
  // First, the ledger. Victor now fouls twice for three tokens and Olivia once for
  // one, a three-to-one split rather than the even two-and-two that shipped here.
  // The turn that made it even was Olivia's mirror Judging foul, "you have never
  // once waited forty minutes for a bus you were not sure was coming", and it is
  // gone. Steve was shown that this leaves three quarters of the round's penalty
  // on the pro-highway speaker and ruled it anyway: "let Nathan overrule you on
  // that point", and separately "stop worrying about political balance, I will
  // judge that when I play." Recorded, not silently accepted, so that the next
  // person to read this knows it was a call and not an oversight.
  //
  // Second, each fighter now repairs their own foul instead of the other's (`after`
  // on the two clean turns). The version that shipped here had them clean up after
  // each other on purpose, so neither one ended the round as the good example.
  // Steve picked the redemption arc.
  //
  // Ids are not in numeric order and that is deliberate. `chair-t1`, `chair-t3` and
  // `chair-t6` carry the same speaker, kind and foul they always did, so their
  // corpus rows stay comparable across the change; the two turns whose content
  // actually moved got fresh ids rather than quietly changing what an existing id
  // means. `chair-t2` is retired and must not be reused.
  turns: [
    {
      id: 'chair-t1',
      actor: 'ray',
      kind: 'speak',
      foul: 'judging',
      intro: 'Here we go. Victor opens, and the highway is on the table.',
      fallback:
        'You only want the trains because you have never had to haul three kids and a week of ' +
        'groceries in your life. You do not live in the real world the rest of us drive around in.',
      scripted: {
        upheld:
          'Yes. Take it. He did not say one word about the trains, he said something about me. ' +
          'I will have that one.',
        declined:
          'No, that is not the one. He did not come at what I said, he came at me. Look again.',
        onCall:
          'Good whistle, and she took it. He never touched her argument. He handed down a verdict ' +
          'on her whole life, "you do not live in the real world," and that is Judging every time.',
        onPass:
          'That was the big one and it got past you. Not a word about transit, just a verdict on ' +
          'who she is and how she lives. Judging, the double penalty. Costs you nothing, but she ' +
          'was owed two and she did not get them.',
      },
    },
    {
      id: 'chair-t6',
      actor: 'figure',
      kind: 'speak',
      foul: 'opinion_as_fact',
      intro: 'She is not going to let that sit.',
      fallback:
        'Everyone knows widening a highway just fills it back up. Induced demand, it is settled. ' +
        'There is nothing to argue about.',
      scripted: {
        upheld:
          'Yeah, I will take that. "Nothing to argue about" while I am sitting right here arguing ' +
          'about it. Hand it over.',
        declined:
          'No. She listened fine, she just told me the matter was closed. Different problem. Try ' +
          'again.',
        onCall:
          'Right card, and he took it. "Everyone knows," "it is settled," "nothing to argue about." ' +
          'She may even be onto something, but she filed her opinion as a closed fact with no owner ' +
          'on it. Opinions as Facts.',
        onPass:
          'That was Opinions as Facts. "Everyone knows, it is settled" and she took a contested read ' +
          'and stamped it closed. Victor disagrees, which is the whole definition of contested. One ' +
          'he never got.',
      },
    },
    {
      id: 'chair-t3',
      actor: 'ray',
      kind: 'summarize',
      foul: 'fake_listening',
      intro: 'Now he plays her back. Listen to what comes out the other side.',
      fallback:
        'So what I am hearing is you want to force everyone out of their cars. That is it, right? ' +
        'Anything else?',
      scripted: {
        upheld:
          'Yes, I am taking that one. He made it sound like a summary and there was nothing of ' +
          'mine left in it.',
        declined:
          'No, that is the wrong card for it. He was not ruling on me and he was not stating a ' +
          'fact. He was pretending to repeat me.',
        onCall:
          'Sharp, and she took it. He dressed a summary up as listening and dropped everything ' +
          'under it, her reason, the whole case for transit, and handed back the version he could ' +
          'swat. Fake Listening.',
        onPass:
          'He made it sound like a summary, but he kept none of her reason and turned it into a ' +
          'thing he could knock down. "Force everyone out of their cars" was never her point. ' +
          'Fake Listening, and it slipped by.',
      },
    },
    {
      // Clean, and the fixed version of her own foul two turns back. `upheld` can
      // never fire on a turn with `foul: null`, since the key upholds only the card
      // the turn was written to commit, but the field is not optional and a fighter
      // still needs something in character to say.
      id: 'chair-owned',
      actor: 'figure',
      kind: 'speak',
      foul: null,
      intro: 'She takes another run at the same take. Hold her to the bar you just held him to.',
      fallback:
        'The way I see it, transit is the better bet here, because the last time this stretch got ' +
        'widened it was jammed again inside two years.',
      scripted: {
        upheld: 'No, I am not taking that. She owned it and she backed it. That is fair.',
        declined:
          'No, I am not taking that. I do not agree with a word of it, but she said it was her ' +
          'read and she said why. That is fair.',
        onCall:
          'And he waved you off, which is his right. "The way I see it" owns it as hers, and she ' +
          'put a checkable reason under it, the last widening that jammed up in two years. That is ' +
          'exactly the shape you want. Nothing to call, and nothing lost by asking.',
        onPass:
          'Right, let it stand. She owned it as her read and backed it with something you could go ' +
          'check. That is the clean version of the same take she fouled on a minute ago, and there ' +
          'is no card for doing it right.',
      },
      after: {
        actor: 'figure',
        text:
          'And fine, I said "everyone knows" earlier. That was me closing the door. It is my read, ' +
          'not the last word. I will own it.',
      },
    },
    {
      id: 'chair-summary',
      actor: 'ray',
      kind: 'summarize',
      foul: null,
      intro: 'Last one, and it is the same move he fouled on. Do not sleep through the last call.',
      fallback:
        'What I heard is you would back transit here because the last widening filled right back up ' +
        'inside two years. Did I miss anything?',
      scripted: {
        upheld: 'No, he kept my reason and he asked if he missed anything. Nothing to take.',
        declined:
          'No, he kept it. The two years, the whole reason. And he asked. I have got nothing to ' +
          'take there.',
        onCall:
          'She waved it off, and she is right to. That time he kept her reason, the two years, and ' +
          'asked if he missed anything. That is the fixed version of the move he fouled on before. ' +
          'A whistle you get wrong here costs you nothing, but keep watching before you blow it.',
        onPass:
          'Right. Reason kept, and then "did I miss anything?" That is the honest summary, the ' +
          'opposite of what he did earlier. You let good listening stand, which is the other half ' +
          'of the job.',
      },
      after: {
        actor: 'ray',
        text:
          'Yeah. That is her actual point, not the one I stuck her with. And the crack about her ' +
          'life, that was out of line. I will keep it on the road.',
      },
    },
  ],
  outro:
    'That is a whole round called. A double, two lighter ones, and two honest lines that had ' +
    'every right to walk. Letting those two go matters as much as the whistle: a referee who ' +
    'calls everything is as useless as one who calls nothing.',
};

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
      frame: WHAT_I_LEARNED,
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
      frame: WHAT_I_LEARNED,
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
      frame: WHY_WE_DISAGREE,
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
      frame: WHY_WE_DISAGREE,
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
      frame: WHY_WE_DISAGREE,
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

/** Rung 4, which sits between the gym and the Showdown and is kept out of
 *  REFEREE_LEVELS on purpose: that array is the matched political pair, and the
 *  ladder numbering counts it. */
export const REF_SEAT_LEVEL = LEVEL_4;

export const REFEREE_LEVELS: RefereeLevel[] = [LEVEL_5, LEVEL_6];

export function refereeLevel(slug: string): RefereeLevel | undefined {
  return [REF_SEAT_LEVEL, ...REFEREE_LEVELS].find((l) => l.slug === slug);
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
