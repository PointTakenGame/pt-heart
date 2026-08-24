// Vercel serverless function. The only server-side code in Heart's MVP.
//
// No auth, no database, no session. It takes text, returns text, stores nothing.
// Auth arrives later from the Brain agent (Steve's ruling, 2026-08-23); nothing in
// here has to change when it does.
//
// Needs ANTHROPIC_API_KEY. On Vercel that comes from the project env. In local dev
// the plugin in vite.config.ts loads it from a file outside the repo and calls this
// same handler, so there is one implementation and local play exercises it.
// Without a key this returns 503 and every caller falls back to authored copy.

const MODEL = 'claude-haiku-4-5-20251001';

const TEMPLATE = 'So what I\'m hearing is: it bugs you that [X], because [Y]. Did I get that right?';

const RULES: Record<string, string> = {
  judging:
    'Judging: a verdict on the person, their character, or their motives, rather than on the argument.',
  opinion_as_fact:
    'Opinions as Facts: stating a contested opinion as settled fact, with no ownership ("in my head", "I think") and no reason.',
  fake_listening:
    'Fake Listening: summarizing without the because, or without inviting a correction. Agreeable noise that skips the check.',
};

const PROMPTS = {
  restate_perfect: (t: string) =>
    `A player in a listening drill just said this:\n\n"${t}"\n\n` +
    `Restate it back to them in exactly this template:\n${TEMPLATE}\n\n` +
    `Fill [X] with their complaint and [Y] with their reason, in their own register. ` +
    `If they gave no reason, infer the most charitable one from what they wrote. ` +
    `Reply with the sentence only, no preamble, no quotation marks.`,

  restate_flawed: (t: string) =>
    `A player in a listening drill just said this:\n\n"${t}"\n\n` +
    `Restate it back to them with the reason deliberately removed: "So it bugs you that [X]." ` +
    `Keep [X] accurate and warm. Drop the why entirely. This is a teaching example of fake ` +
    `listening, so it must sound agreeable and be missing exactly one thing: the because. ` +
    `Reply with the sentence only, no preamble, no quotation marks.`,

  judge_edit: (target: string, original: string, answer: string) =>
    `A player was given this line to fix:\n\n"${original}"\n\n` +
    `They submitted:\n\n"${answer}"\n\n` +
    `A passing edit must do this:\n${target}\n\n` +
    `Reply with strict JSON and nothing else: {"pass": true|false, "text": "one or two ` +
    `sentences of coach feedback"}. The coach is warm, brief, and specific about the words on ` +
    `the page. Never say who is right about the underlying political question; you are ruling ` +
    `on the sentence, not the position. If they passed, say what worked. If they did not, name ` +
    `the missing half without scolding.`,

  // Live play. The coach rules on the player's own turn, because a player cannot
  // whistle themselves. Under-calling is the correct bias: a marginal line is clean.
  judge_turn: (topic: string, kind: string, text: string, target: string) =>
    `Two people are having a structured disagreement about: ${topic}\n\n` +
    (kind === 'summarize' && target
      ? `The other person said this:\n\n"${target}"\n\nThe one being ruled on then summarized ` +
        `it back:\n\n"${text}"\n\n`
      : `One of them just took a ${kind === 'summarize' ? 'summarizing' : 'speaking'} turn:` +
        `\n\n"${text}"\n\n`) +
    `Three fouls are live:\n${Object.values(RULES).join('\n')}\n\n` +
    (kind === 'summarize'
      ? `On a summarizing turn, Fake Listening is the live risk: a summary that drops the other ` +
        `person's reason, or never asks whether it landed, is a foul.\n\n`
      : `On a speaking turn, Judging and Opinions as Facts are the live risks. Fake Listening ` +
        `almost never applies.\n\n`) +
    `Rule on it. Be reluctant: call a foul only if you could point at the exact words that ` +
    `commit it. Blunt, cold, or strongly worded disagreement is not a foul. ` +
    `Never say who is right about the underlying question; you rule on the sentence.\n\n` +
    `Reply with strict JSON and nothing else: ` +
    `{"foul": "judging" | "opinion_as_fact" | "fake_listening" | null, ` +
    `"text": "one sentence, quoting the words at fault if there is a foul, or one short line ` +
    `of credit if there is not"}`,

  // Sofia's turn. She argues the opposite of the player, and commits the foul she
  // is told to commit, mildly. Her position is never authored, only her manner.
  showdown_line: (topic: string, playerLine: string, kind: string, foul: string) =>
    `You are Slippery Sofia, an opponent character in a game about disagreeing well. ` +
    `The topic is: ${topic}\n\n` +
    `The other player just said:\n\n"${playerLine}"\n\n` +
    `Take the opposite side from them on this topic. You never have a position of your own; ` +
    `you argue against whatever they argued, and you argue it well.\n\n` +
    (kind === 'summarize'
      ? `This is a SUMMARIZING turn. Restate what they just said back to them. Do not rebut yet.\n\n`
      : `This is a SPEAKING turn. Make your own argument in two or three sentences.\n\n`) +
    (foul === 'clean'
      ? `Play this turn completely clean. No verdicts on them, no opinion stated as fact, and ` +
        `if you are summarizing, keep their reason and end by checking that you got it right.`
      : `Commit exactly one foul, mildly, so that an alert opponent could catch it and a ` +
        `distracted one would not:\n${RULES[foul]}\nEverything else about the turn should be ` +
        `reasonable and in good faith. Do not be a cartoon.`) +
    `\n\nReply with your line only. No preamble, no quotation marks, no stage directions.`,
} as const;

async function ask(key: string, prompt: string): Promise<string | null> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) return null;
  const data: any = await res.json();
  return data?.content?.[0]?.text?.trim() ?? '';
}

/** Models sometimes fence their JSON, and sometimes write prose instead. */
function parseJson(raw: string): any | null {
  try {
    return JSON.parse(raw.replace(/^```(?:json)?|```$/g, '').trim());
  } catch {
    return null;
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return new Response('no key', { status: 503 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response('bad json', { status: 400 });
  }

  const task = body.task;
  let prompt: string;

  if (task === 'restate_perfect' || task === 'restate_flawed') {
    if (typeof body.playerText !== 'string' || !body.playerText.trim()) {
      return new Response('missing playerText', { status: 400 });
    }
    prompt = PROMPTS[task as 'restate_perfect'](body.playerText.slice(0, 1200));
  } else if (task === 'judge_edit') {
    prompt = PROMPTS.judge_edit(
      String(body.target ?? '').slice(0, 1200),
      String(body.original ?? '').slice(0, 600),
      String(body.answer ?? '').slice(0, 1200),
    );
  } else if (task === 'judge_turn') {
    prompt = PROMPTS.judge_turn(
      String(body.topic ?? '').slice(0, 300),
      String(body.kind ?? 'speak'),
      String(body.playerText ?? '').slice(0, 1200),
      String(body.target ?? '').slice(0, 1200),
    );
  } else if (task === 'showdown_line') {
    prompt = PROMPTS.showdown_line(
      String(body.topic ?? '').slice(0, 300),
      String(body.playerText ?? '').slice(0, 1200),
      String(body.kind ?? 'speak'),
      String(body.foul ?? 'clean'),
    );
  } else {
    return new Response('unknown task', { status: 400 });
  }

  const raw = await ask(key, prompt);
  if (raw === null) return new Response('upstream error', { status: 502 });

  if (task === 'judge_edit') {
    const parsed = parseJson(raw);
    if (!parsed) {
      // The model wrote prose instead of JSON. Prose is still usable feedback.
      return Response.json({ pass: true, text: raw });
    }
    return Response.json({ pass: parsed.pass === true, text: String(parsed.text ?? '') });
  }

  if (task === 'judge_turn') {
    const parsed = parseJson(raw);
    // Prose where JSON was asked for means no ruling was made. Under-call.
    if (!parsed) return Response.json({ foul: null, text: raw });
    const foul = parsed.foul;
    return Response.json({
      foul: foul in RULES ? foul : null,
      text: String(parsed.text ?? ''),
    });
  }

  return Response.json({ text: raw });
}
