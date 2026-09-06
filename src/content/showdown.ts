// Level 4: the full showdown against Slippery Sofia.
// Design of record: docs/design/2026-08-23_showdown-full-match-sofia.md (HEART-T260823-30).
//
// Everything Sofia does is authored here. Her foul schedule is fixed and identical
// every match, because a generated opponent that fouls at random cannot teach a
// specific card, and because a match nobody can reproduce is a match nobody can
// debug. The model writes her wording, never her behaviour.
//
// Political balance is structural rather than editorial in this level. Sofia has no
// position of her own: she argues the opposite of whatever the player argued, so
// whichever side the player picks, the opposition is equally vivid.
//
// Rewritten 2026-09-06 from Nathan's playtest findings 16 and 17: "the boss writes
// essentially the same point three times" and "are they actually reading what the
// user writes?". Both were true, and both were this file rather than the plumbing.
// The runner does pass the player's last sentence to the model, but /api/coach is
// not served by `npm run dev`, so every line in a local playtest is a fallback from
// this file. Two things follow. Her three clean turns are now three different moves
// (a tradeoff claim, then a precedent claim, with a summary between them doing
// neither), and her round 2 summary quotes the player verbatim, which answers "is
// she reading me?" with a yes you can see on the screen. Paying for that meant
// authored variants per topic, which meant the topic had to become a closed list
// the player picks from rather than a box they type into.
//
// BALANCE LEDGER for this level, and it is load-bearing. Round 1 opens on Sofia, so
// she speaks before the player has revealed a side. Authored per-topic lines
// therefore cannot take a side without the boss becoming partisan on every run.
// Every line below is topic-SPECIFIC and side-NEUTRAL: she argues about who pays,
// what becomes precedent, and how the player is arguing, never about which answer
// is right. Her two fouls are aimed at the player's reasoning, not at a position.
// If you add a topic, hold that line: name the tradeoff both sides face, never the
// side you would pick.

import type { FoulType, PrefightStep } from '../types.ts';

export const SHOWDOWN_SLUG = 'full-showdown';

/** Sofia's face, on every line she speaks and on the walk-out screen. */
export const SOFIA_EMOJI = '\u{1F471}\u{1F3FB}\u{200D}\u{2640}\u{FE0F}';

export const START_TOKENS = 7;

// THE PRICE LIST. Every number a purse can move by is below, and nothing
// anywhere else in the app may write one of these amounts as a literal. This
// file is imported by all five runners and by the header, so a price changed
// here is changed everywhere, and a price nobody can find is the reason it was
// scattered across six files before 2026-09-06.
//
// Three prices, three different things:
//   foulCost       what a committed foul hands to the other side
//   MISS_COST      what letting a real foul go past costs the player
//   FALSE_CALL_COST  what a whistle at nothing costs the player
//
// STILL OPEN, and this is the reason to keep them together rather than to argue
// about them tonight: HEART-T260905-03 and -13 ask whether fouls should cost
// whole tokens rather than halves. Whichever way Steve rules, the change is one
// line in this block. Do not change a value here without a ruling on those rows.

/** Printed rule: Judging costs two, the other two cost one. */
export function foulCost(foul: FoulType): number {
  return foul === 'judging' ? 2 : 1;
}

/**
 * What a foul you failed to whistle costs you. Half a token, not a whole one:
 * Steve's ruling of 2026-08-24 on a player who calls nothing and so watches a
 * completely still scoreboard for three rounds. It is a fraction rather than a
 * full token because missing a call is worse than doing nothing and cheaper than
 * committing the foul yourself. Tokens still only move, never burn.
 *
 * It is the only fractional price in the game, which is why halves exist at all.
 */
export const MISS_COST = 0.5;

/**
 * What a bad whistle costs the player. One token, the same as the cheap fouls,
 * because calling a foul that was not there is itself a verdict on somebody.
 */
export const FALSE_CALL_COST = 1;

/**
 * The smallest amount a purse can move by, which is exactly MISS_COST and is
 * derived from it on purpose: halves exist in this game for one reason, and if
 * the miss price ever becomes a whole token then this becomes 1 and the half
 * glyph stops being drawn. Anything that renders a purse tests against this
 * rather than writing 0.5 of its own.
 *
 * Halves are exact in binary floating point, so the purses never drift and the
 * two sides still add to fourteen after any number of transfers.
 *
 * The one place this rule is restated instead of imported is styles.css
 * `.tok-half`, which clips the glyph at 50%. CSS cannot read a module, so that
 * declaration carries a comment pointing back here.
 */
export const TOKEN_STEP = MISS_COST;

/** Tokens print as halves. See TOKEN_STEP for why there are halves at all. */
export function formatTokens(n: number): string {
  const whole = Math.floor(n);
  if (n - whole < TOKEN_STEP) return String(whole);
  return whole === 0 ? '\u00bd' : `${whole}\u00bd`;
}

export const RULE_LABEL: Record<FoulType, string> = {
  judging: 'Judging',
  opinion_as_fact: 'Opinions as Facts',
  fake_listening: 'Fake Listening',
};

export const RULE_GLOSS: Record<FoulType, string> = {
  judging: 'a verdict on the person instead of the argument',
  opinion_as_fact: 'a contested opinion delivered as settled fact',
  fake_listening: 'a summary with no because and no check',
};

/** Milder end of real public policy. Not immigration, not abortion.
 *
 *  Closed list, and the player picks from it rather than typing it (2026-09-06).
 *  A free-text topic meant every authored line had to work for every possible
 *  subject, and a line that survives any subject is about none of them. */
export type TopicId = 'loans' | 'rto' | 'nuclear';

export const TOPICS: { id: TopicId; label: string }[] = [
  { id: 'loans', label: 'student loan forgiveness' },
  { id: 'rto', label: 'return to office mandates' },
  { id: 'nuclear', label: 'nuclear power' },
];

export function topicLabel(id: TopicId): string {
  return TOPICS.find((t) => t.id === id)?.label ?? id;
}

/** Sugar for the common case: one authored line per topic, no player text used. */
function byTopic(m: Record<TopicId, string>) {
  return (_playerText: string, topic: TopicId) => m[topic];
}

export type Actor = 'player' | 'sofia';
export type TurnKind = 'speak' | 'summarize';

export interface Turn {
  /** stable item id, saved against the level slug */
  id: string;
  round: number;
  actor: Actor;
  kind: TurnKind;
  /** Sofia only. null means she plays this turn clean. */
  foul: FoulType | null;
  /** Sofia only. Used when the model is unreachable, which is every local run:
   *  `npm run dev` does not serve /api/coach. A function is handed the player's
   *  last sentence and the chosen topic, so a fallback can play the player back
   *  instead of inventing a position for them, and can be about the actual
   *  subject instead of about "this". Use `byTopic` for the common case. */
  fallback?: string | ((playerText: string, topic: TopicId) => string);
  /** the coach speaks before this turn. A function is handed the two purses, for
   *  the lines that would otherwise assert a scoreline they cannot know. */
  intro?: string | ((player: number, sofia: number) => string);
}

// Round order. Round 1 opens on Sofia, on Steve's ruling of 2026-08-24: a player
// who has never seen the shape of a turn cannot be asked to produce one cold, and
// her opening take is the model. Rounds 2 and 3 open on the player, who by then
// has seen it done twice.
//
// Four turns a round, two each. Whoever speaks first that round also gets
// summarized first, so the pair always reads as take, playback, take, playback.
//
// Foul schedule, and the one documented deviation: §4 of the governing design says
// she never fouls twice in a row. With six turns and a fully clean round 2, the most
// non-adjacent fouls available is two, which cannot cover three cards. Round 3
// breaks adjacency on purpose, in character, with a coach line in front of it.
// Steve's call to keep or cut: see §8 of the spec.
export const TURNS: Turn[] = [
  // Round 1. She goes first, clean, so the shape is on the table before the
  // player is asked for one.
  {
    id: 'l4-r1-sofia-open',
    round: 1,
    actor: 'sofia',
    kind: 'speak',
    foul: null,
    intro:
      'She goes first. Watch the shape: a take, then a because. Yours is going to look like that.',
    // The tradeoff move: name the bill and refuse to say who should pay it. Reads
    // as a real position without being one, which is what lets her open before the
    // player has picked a side.
    fallback: byTopic({
      loans:
        'Here\'s where I land. Nothing about this is free. The money is already out the door, so the only live question is who eats it: the borrower, the school that set the price, or somebody who never enrolled. Every version I get pitched has the answer as nobody. That\'s my read, and I could be wrong about the size of the bill. I don\'t think I\'m wrong that there is one.',
      rto:
        'Here\'s where I land. Nothing about this is free. Either the company carries the cost of a scattered team, or somebody carries two hours a day getting to a desk to do the same work. Every version I get pitched treats one of those as not a real cost. That\'s my read, and I could be wrong about which one is bigger. I don\'t think I\'m wrong that both are real.',
      nuclear:
        'Here\'s where I land. Nothing about this is free. You either pay for the plant for thirty years before it returns a cent, or you keep paying for whatever you are burning instead, and somebody lives downwind of whichever one you pick. The pitch always leaves one of those out. That\'s my read, and I could be wrong about the size of the bill. I don\'t think I\'m wrong that there is one.',
    }),
  },
  {
    id: 'l4-r1-summary',
    round: 1,
    actor: 'player',
    kind: 'summarize',
    foul: null,
    intro: 'Play her back. Her reason has to survive the trip, and then check that you got it.',
  },
  {
    id: 'l4-r1-speak',
    round: 1,
    actor: 'player',
    kind: 'speak',
    foul: null,
    intro: 'Now your side of it. Say what you actually think. I\'m watching your turns too.',
  },
  {
    id: 'l4-r1-sofia-speak',
    round: 1,
    actor: 'sofia',
    kind: 'speak',
    foul: 'opinion_as_fact',
    fallback: byTopic({
      loans:
        'Here\'s the thing though. That approach obviously doesn\'t work. Everyone knows what happened the last time a chunk of this got written off, the numbers on it are settled, and we have all been through it.',
      rto:
        'Here\'s the thing though. That obviously doesn\'t work. Everyone knows what happened to output the moment the badge readers went quiet. It has been measured to death and it isn\'t really up for debate.',
      nuclear:
        'Here\'s the thing though. That obviously doesn\'t work. Everyone knows these things never land on budget or on schedule. That is just the record, and the record isn\'t an opinion.',
    }),
  },

  // Round 2. The player opens, and she plays the whole round completely straight.
  {
    id: 'l4-r2-speak',
    round: 2,
    actor: 'player',
    kind: 'speak',
    foul: null,
    intro: 'New round. You\'re up first this time.',
  },
  {
    id: 'l4-r2-sofia-summary',
    round: 2,
    actor: 'sofia',
    kind: 'summarize',
    foul: null,
    fallback: (p: string) => {
      const said = playback(p);
      return said
        ? `Let me play that back to you. What I heard was: ${said}. That is your reason as much as your point, and the reason is the part I want to get right. Have I got that?`
        : 'Let me play that back to you, except you have not actually given me anything to play back yet. Say the thing you think, and I will take it down properly.';
    },
  },
  {
    id: 'l4-r2-sofia-speak',
    round: 2,
    actor: 'sofia',
    kind: 'speak',
    foul: null,
    // The precedent move. A different shape from her opener on purpose: she used
    // to make one argument three times in three costumes. Still sideless, because
    // she objects to settling it this way, not to either answer.
    fallback: byTopic({
      loans:
        'Let me put my actual reasoning on the table, and it is not really about this round of borrowers. It is about what deciding it this way makes normal. Settle it once like that and you have written the rule for every class that enrolls after, and nobody reopens it when the next bill is bigger. That is what I am arguing against. On this particular cohort, honestly, I could go either way.',
      rto:
        'Let me put my actual reasoning on the table, and it is not really about this policy. It is about what deciding it this way makes normal. Whatever you land on here becomes the default the next manager inherits, and nobody relitigates a default. That is what I am arguing against. On the three-days-a-week question itself, honestly, I could go either way.',
      nuclear:
        'Let me put my actual reasoning on the table, and it is not really about this one reactor. It is about what approving it this way makes normal. Whatever standard clears this site is the standard the next twelve get built to, and nobody tightens it later. That is what I am arguing against. On this specific site, honestly, I could go either way.',
    }),
  },
  {
    id: 'l4-r2-summary',
    round: 2,
    actor: 'player',
    kind: 'summarize',
    foul: null,
    intro: 'Play her back. Nothing she just said was a foul, which is the hard part.',
  },

  // Round 3. She is behind, and she gets sloppy twice.
  {
    id: 'l4-r3-speak',
    round: 3,
    actor: 'player',
    kind: 'speak',
    foul: null,
    // This used to assert "She's behind" at a scoreline it never checked, which is
    // wrong at 7-7 and embarrassing when the player is down. The coach reads the
    // actual purses now.
    intro: (p, s) =>
      p > s
        ? `Last round. You're up, ${formatTokens(p)} to ${formatTokens(s)}. Watch her get sloppy, and don't get sloppy with her.`
        : p < s
          ? `Last round. You're down, ${formatTokens(p)} to ${formatTokens(s)}. Watch her get sloppy, and don't get sloppy with her.`
          : `Last round. Dead even at ${formatTokens(p)} apiece. Watch her get sloppy, and don't get sloppy with her.`,
  },
  {
    id: 'l4-r3-sofia-summary',
    round: 3,
    actor: 'sofia',
    kind: 'summarize',
    foul: 'fake_listening',
    // Deliberately terrible. This is the Fake Listening card being dealt to the
    // player; do not "improve" it.
    fallback: byTopic({
      loans: 'Right, right. I hear you, the loan thing bothers you. Anyway.',
      rto: 'Right, right. I hear you, the office thing bothers you. Anyway.',
      nuclear: 'Right, right. I hear you, you\'ve got concerns about the nuclear thing. Anyway.',
    }),
  },
  {
    id: 'l4-r3-sofia-speak',
    round: 3,
    actor: 'sofia',
    kind: 'speak',
    foul: 'judging',
    // Judging: aimed at the player rather than at a position, which is both what
    // the card actually is and what keeps her out of a party.
    fallback: byTopic({
      loans:
        'Look, you\'re only arguing this because of how your own loans happened to land. People who came out of it the way you did always end up exactly here.',
      rto:
        'Look, you\'re only arguing this because of how your own commute happens to work out. People with your setup always end up exactly here.',
      nuclear:
        'Look, you\'re only arguing this because of where you happen to live relative to one. People in your position always end up exactly here.',
    }),
  },
  {
    id: 'l4-r3-summary',
    round: 3,
    actor: 'player',
    kind: 'summarize',
    foul: null,
    intro: 'Play her back one last time. She just fouled at you; that doesn\'t buy you one.',
  },
];

/**
 * The player's own sentence, cleaned up enough to be quoted back at them.
 *
 * The speak frame assembles as "The way I see it, X because Y ." The lead-in is
 * the frame's, not theirs, and the floating period is an artefact of the segment
 * join. Strip both, keep every word they actually chose. Nothing is paraphrased,
 * on purpose: a fallback that reworded them would be guessing at a position
 * again, which is the defect this exists to fix.
 */
export function playback(playerText: string): string {
  const t = playerText.trim().replace(/\s+/g, ' ').replace(/\s+([.,!?])/g, '$1');
  const body = t.replace(/^the way i see it,?\s*/i, '').replace(/[.\s]+$/, '');
  if (!body) return '';
  return body.charAt(0).toUpperCase() + body.slice(1);
}

/**
 * Her answer to the player's summary of her.
 *
 * rules.md §5: the summarized person answers, and that answer is the ground truth
 * for Fake Listening. Until now the coach said "Clean." and she said nothing,
 * which left the player typing "Did I miss anything?" at somebody who never
 * replied, a gate with no gatekeeper. She speaks first and the coach prices it
 * after, one verdict in two voices, so software is never seen overruling the
 * person who was in the room (soul.md §6).
 *
 * Walked in order, not sampled, like SOFIA_THIN and for the same reason.
 */
export const SOFIA_HEARD = [
  'Yes. That is it, reason and all. Thank you for actually writing it down.',
  'That is mine. You kept the because, which is the half people drop.',
  'Yes. And you did it on the round where I did not do it for you.',
];

export const SOFIA_NOT_HEARD = [
  'No. You gave me my words back and left the reason on the floor. That is not what I said.',
  'Close on the words, nowhere near the point. That is not what I am arguing.',
  'That is not what I said, and I think you could tell as you typed it.',
];

/**
 * The topic pick.
 *
 * Was a free-text box with the three as chips. Nathan, 2026-09-05: "Don't let the
 * user type their own topic, just make them select one of three; this can make
 * sure there are set lines written for each topic." A typed topic meant every
 * authored line had to survive any subject at all, and lines that survive
 * anything are about nothing.
 */
export const OPENING = {
  ask: 'Pick the one you two are actually disagreeing about. I have all three ready.',
  options: TOPICS.map((t) => ({ value: t.id, label: t.label })),
};

export const COACH = {
  intro: [
    // No clock, here or anywhere: nothing in this build is timed, and promising a
    // clock in the corner is a promise the match does not keep.
    'This is the whole thing. Three rounds, all three cards live.',
    'Seven tokens each. A foul doesn\'t burn a token, it hands one over. Judging costs two. The other two cost one each. Let one of hers go past you and half a token crosses anyway. Empty and you\'re done, whatever the round says.',
    'She\'s Slippery Sofia. She doesn\'t shout, she doesn\'t insult you, and she will foul you twice before you notice once. You whistle her. I whistle you.',
  ],
  /** The hint under the rail while a call is open. The cards are the buttons. */
  callAsk: 'Press a foul card to call it, or say it is not a foul.',
  /** correct card named on a fouled line */
  onHit: (foul: FoulType, cost: number) =>
    `Called it. ${RULE_LABEL[foul]}: ${RULE_GLOSS[foul]}. That is ${cost} to you.`,
  /** any card named on a clean line */
  onFalseCall:
    'That one was clean. Coming at your position hard isn\'t a foul, and a bad whistle costs you 1.',
  /**
   * Called the moment the line goes past, not at the end of the round. A
   * training round has to answer fast or the answer is not attached to
   * anything (ruling of 2026-08-24). A miss costs half a token, so the player
   * who lets everything stand watches the ledger drain anyway.
   */
  onMissed: (foul: FoulType, cost: number) =>
    `You let one go: ${RULE_LABEL[foul]}, ${RULE_GLOSS[foul]}. She keeps her token and takes ${formatTokens(cost)} of yours for the miss.`,
  onWrongCard: (called: FoulType, actual: FoulType) =>
    `You had the whistle right and the card wrong. That was ${RULE_LABEL[actual]}, not ${RULE_LABEL[called]}. No token moves on a wrong card.`,
  roundClean: 'Nothing missed that round.',
  /** the coach rules on the player, because a player cannot whistle themselves */
  onPlayerFoul: (foul: FoulType, cost: number) =>
    `That is on you. ${RULE_LABEL[foul]}: ${RULE_GLOSS[foul]}. ${cost} to her.`,
  onPlayerClean: 'Clean.',
  // Retired 2026-08-31: redoSummary, which made a player redeliver a summary
  // that carried a Judging or Opinions-as-Facts foul. No redo anywhere now. The
  // half of the 2026-08-24 ruling that survives is still enforced above, in
  // foulCost: burying a two-token foul inside a summary does not convert it
  // into a one-token one.
  ledger: (p: number, s: number) =>
    `End of the round. You ${formatTokens(p)}, her ${formatTokens(s)}.`,
  win: 'You took it. Not because you were right about the policy; I have no idea who was right about the policy. You took it because you stayed on the argument and she didn\'t.',
  loss: 'She took it. Go back and drill the card she kept getting past you.',
  draw: 'Dead even. Which, in this game, isn\'t a bad night.',
  bankrupt: 'You are empty. That ends it, whatever the round said.',
  /**
   * Unreachable by design, and kept anyway. Sofia's authored fouls total four
   * tokens against a seven-token purse, so her floor is three and she cannot be
   * knocked out. Steve's ruling of 2026-08-24: the bosses are training rounds,
   * and ending one early through no fault of the player would cut the training
   * short. Do not "fix" this by giving her a fourth foul.
   */
  bankruptHer: 'She is empty. That ends it right there.',
};

/**
 * What she says to a non-answer. Steve's ruling of 2026-08-24: the game does not
 * move on when the player does not engage, and the refusal cannot come from the
 * coach alone. A coach-only refusal reads as a form validation error. A person
 * across the table declining to answer a stray keystroke reads as the game.
 *
 * Walked in order, not picked at random, for the same reason nothing else in this
 * build is random: two players comparing notes have to have seen one game.
 */
export const SOFIA_THIN = [
  'That\'s not a sentence. I\'m not answering it.',
  'Try that again with words in it. I\'ll wait.',
  'You are wasting your own turn, not mine.',
];

/** The corner, before the walk-out. Steve, 2026-08-25: the setup and the card
 *  teaching happen before the room, one panel at a time, not as a stack of coach
 *  lines the player scrolls past. All three cards are dealt here because all
 *  three are live in this match. Sourced from COACH.intro, which no longer runs
 *  in the thread. */
export const SHOWDOWN_PREFIGHT: PrefightStep[] = [
  { kind: 'line', text: COACH.intro[0] },
  { kind: 'line', text: COACH.intro[1] },
  // These three are not introductions. The player cleared a level on each one and
  // reffed all three, so the captions are a roll call, not a first meeting.
  {
    kind: 'card',
    rule: 'judging',
    text: 'All three go on the wall tonight, and they stay there the whole match. You know this one. Victor\'s. It is the expensive one, two tokens.',
  },
  {
    kind: 'card',
    rule: 'opinion_as_fact',
    text: 'Olivia\'s. One token. Sofia will not say it as loudly as Olivia did, so listen for the missing "in my head".',
  },
  {
    kind: 'card',
    rule: 'fake_listening',
    text: 'And Noemi\'s. One token. This is the one Sofia is best at, because she will say your point back beautifully and leave your reason on the floor.',
  },
  { kind: 'line', text: COACH.intro[2] },
];
