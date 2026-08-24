// Client side of the one model call in the gym.
//
// Everything here degrades to a hand-authored fallback. Local dev has no Vercel
// runtime and no API key, so `fetch('/api/coach')` fails, and the gym stays fully
// playable: Level 3 shows the shape of a good restatement instead of the player's
// own words, and edit feedback shows the authored model answer instead of a ruling.
// A broken key must never look like a broken game.

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
