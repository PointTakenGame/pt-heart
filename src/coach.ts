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

async function callCoach(body: unknown): Promise<any | null> {
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
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
  if (!out || typeof out.text !== 'string') return null;
  const foul = out.foul;
  const valid = foul === 'judging' || foul === 'opinion_as_fact' || foul === 'fake_listening';
  return { foul: valid ? foul : null, text: out.text.trim(), fromModel: true };
}

/**
 * Sofia's line. `foul` is her instruction, not a prediction: the schedule that
 * decides it is authored in content/showdown.ts and the model only writes wording.
 */
export async function sofiaLine(
  topic: string,
  playerText: string,
  kind: 'speak' | 'summarize',
  foul: FoulType | null,
  fallback: string,
): Promise<{ text: string; fromModel: boolean }> {
  const out = await callCoach({
    task: 'showdown_line',
    topic,
    playerText,
    kind,
    foul: foul ?? 'clean',
  });
  const text = typeof out?.text === 'string' ? out.text.trim() : '';
  if (!text) return { text: fallback, fromModel: false };
  return { text, fromModel: true };
}
