// Client side of every model call the game makes: two in the ladder, two in live
// play.
//
// Everything here degrades to a hand-authored fallback. With no API key
// `fetch('/api/coach')` returns 503, and the game stays fully playable: Level 3
// shows the shape of a good restatement instead of the player's own words, edit
// feedback shows the authored model answer instead of a ruling, and the showdown
// runs on Sofia's authored lines and local phrase rules. A broken key must never
// look like a broken game.

import type { FoulType } from './types.ts';

export interface RestateResult {
  text: string;
  fromModel: boolean;
}

export interface JudgeResult {
  pass: boolean | null; // null when the model was unreachable: no ruling was made
  text: string;
  fromModel: boolean;
}

// Degrading in content is not enough; it has to degrade in time as well. Without
// a deadline here, an upstream that hangs rather than refusing takes the beat with
// it, and the player sits in front of a locked composer with nothing to look at.
// A dead operator key on 2026-08-23 turned every beat into a multi-minute wait
// this way, even though the authored fallback was right there the whole time.
//
// 6 seconds is well past a normal short Haiku line and well short of feeling
// broken. Past it we stop waiting and use the authored line, which is what a
// refusal would have given us anyway.
const COACH_TIMEOUT_MS = 6000;

async function callCoach(body: unknown): Promise<any | null> {
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(COACH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // includes the abort: a timeout is just one more unreachable model
    return null;
  }
}

export async function restate(
  task: 'restate_perfect' | 'restate_flawed',
  playerText: string,
  fallback: string,
): Promise<RestateResult> {
  const out = await callCoach({ task, playerText });
  const text = typeof out?.text === 'string' ? out.text.trim() : '';
  if (!text) return { text: fallback, fromModel: false };
  return { text, fromModel: true };
}

export async function judgeEdit(
  target: string,
  original: string,
  answer: string,
  fallback: string,
): Promise<JudgeResult> {
  const out = await callCoach({ task: 'judge_edit', target, original, answer });
  const text = typeof out?.text === 'string' ? out.text.trim() : '';
  if (!text) return { pass: null, text: fallback, fromModel: false };
  return { pass: out.pass === true, text, fromModel: true };
}

// Live play. Two more calls, both with the same contract as the ones above: a
// dead model degrades to authored behaviour rather than to a broken match.

export interface TurnRuling {
  foul: FoulType | null;
  text: string;
  fromModel: boolean;
  // Summarizing turns only, and null whenever the model did not answer it.
  // Separate from `foul` on purpose: the foul says whether the summary had the
  // shape of listening, this says whether the other person's point and reason
  // actually survived. A summary can have a because and a check and still put
  // words in their mouth. Null means unknown, never "fine".
  carried: boolean | null;
}

/**
 * The coach rules on the player's own turn, because a player cannot whistle
 * themselves. Callers pass a local fallback ruling for the no-model case; a silent
 * fallback is the right failure here, since a coach with no model should under-call
 * rather than over-call.
 */
export async function judgeTurn(
  topic: string,
  kind: 'speak' | 'summarize',
  playerText: string,
  /** on a summarizing turn, the line being summarized. Fake Listening cannot be
   *  ruled on without it: the tell is what the summary dropped. */
  target: string,
): Promise<TurnRuling | null> {
  const out = await callCoach({ task: 'judge_turn', topic, kind, playerText, target });
  // A blank ruling is a failed call, not a silent ruling. Without this the
  // caller's `ruled?.text ?? authored` keeps the empty string, because '' is not
  // nullish, and the player gets an empty coach bubble.
  const text = typeof out?.text === 'string' ? out.text.trim() : '';
  if (!text) return null;
  const foul = out?.foul;
  const valid = foul === 'judging' || foul === 'opinion_as_fact' || foul === 'fake_listening';
  const carried = out?.carried;
  return {
    foul: valid ? foul : null,
    text,
    fromModel: true,
    carried: typeof carried === 'boolean' ? carried : null,
  };
}

/**
 * The mirroring opponent's line: Sofia in Level 4, Sung-min in Level 7. Neither
 * has a position of their own, which is what keeps those levels balanced without
 * anybody authoring a side. `foul` is an instruction, not a prediction: the
 * schedule that decides it is authored in the level's content file and the model
 * only writes wording.
 */
export async function opponentLine(
  persona: string,
  manner: string,
  topic: string,
  playerText: string,
  kind: 'speak' | 'summarize',
  foul: FoulType | null,
  fallback: string,
  /** the specific move this turn is, when the level asks for one */
  frame?: string,
): Promise<{ text: string; fromModel: boolean }> {
  const out = await callCoach({
    task: 'showdown_line',
    persona,
    manner,
    topic,
    playerText,
    kind,
    foul: foul ?? 'clean',
    frame: frame ?? '',
  });
  const text = typeof out?.text === 'string' ? out.text.trim() : '';
  if (!text) return { text: fallback, fromModel: false };
  return { text, fromModel: true };
}

// Referee format. The human holds the whistle and both disputants are AI, so
// these two calls replace the ones above rather than adding to them: figureLine
// writes a named figure's turn, affirmCall asks the figure who was spoken to
// whether the referee's call landed.

/**
 * One AI figure's turn. Unlike Sofia, the figure is told which side to argue,
 * because with no human in either seat nobody's position is implied. The pairing
 * that keeps that balanced is authored in content/referee.ts, not here.
 *
 * `foul` is the figure's instruction, not a prediction. The schedule is authored.
 */
export async function figureLine(
  persona: string,
  topic: string,
  stance: string,
  lastLine: string,
  kind: 'speak' | 'summarize',
  foul: FoulType | null,
  fallback: string,
  /** the showdown step this turn is, when the level is drilling one */
  frame?: string,
): Promise<{ text: string; fromModel: boolean }> {
  const out = await callCoach({
    task: 'figure_line',
    persona,
    topic,
    stance,
    lastLine,
    kind,
    foul: foul ?? 'clean',
    frame: frame ?? '',
  });
  const text = typeof out?.text === 'string' ? out.text.trim() : '';
  if (!text) return { text: fallback, fromModel: false };
  return { text, fromModel: true };
}

export interface CallRuling {
  upheld: boolean;
  text: string;
  fromModel: boolean;
}

/**
 * The figure who was spoken to rules on the referee's call, on its own behalf and
 * in character (soul.md section 6). The referee nominates; this decides.
 *
 * The no-model fallback upholds a call the authored schedule says was a real foul
 * and declines one it does not. That is the one place the game reads the answer
 * off the schedule rather than off a ruling, and it is confined to the case where
 * there is no model to ask: the alternative is a referee whose whistle does
 * nothing at all when the key is dead.
 */
export async function affirmCall(
  persona: string,
  line: string,
  foul: FoulType,
  scheduled: FoulType | null,
): Promise<CallRuling> {
  const out = await callCoach({ task: 'affirm_call', persona, line, foul });
  const text = typeof out?.text === 'string' ? out.text.trim() : '';
  if (!text) {
    const right = scheduled === foul;
    return {
      upheld: right,
      text: right ? 'Yeah. That one landed wrong.' : 'That one was fine. I can take it.',
      fromModel: false,
    };
  }
  return { upheld: out.upheld === true, text, fromModel: true };
}

/** The three columns of the printed Final Showdown scoring table, in order. */
export type StepVerdict = 'bonus' | 'rules' | 'naughty';

export interface StepRuling {
  verdict: StepVerdict;
  text: string;
  fromModel: boolean;
}

/**
 * The Final Showdown's bonus ruling. Same architecture as affirmCall, running the
 * other way: a bonus moves tokens toward the player rather than away, and it is
 * still not the software's to award. The party who was summarized, learned from,
 * or described is the one who decides (roadmap section 6). In solo play that
 * party is the boss.
 *
 * The no-model case falls to 'rules', which moves nothing in either direction.
 * There is no schedule to read the answer off here, unlike affirmCall: what the
 * player typed is the whole input, so a dead model has genuinely nothing to go
 * on, and awarding or charging on a guess is the one thing it must not do.
 */
export async function affirmStep(
  persona: string,
  step: string,
  topic: string,
  theirLine: string,
  line: string,
  fallback: string,
): Promise<StepRuling> {
  const out = await callCoach({ task: 'affirm_step', persona, step, topic, theirLine, line });
  const text = typeof out?.text === 'string' ? out.text.trim() : '';
  if (!text) return { verdict: 'rules', text: fallback, fromModel: false };
  const v = out.verdict;
  return {
    verdict: v === 'bonus' || v === 'naughty' ? v : 'rules',
    text,
    fromModel: true,
  };
}
