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
//
// Swapped from Anthropic to Gemini 2026-08-25 (dead key, 401), then back to
// Anthropic 2026-08-26 once the pt-biz operator key was confirmed working and
// designated for production. Nothing below this point is provider-specific
// except MODEL, ask(), and the key lookup in handler().

// Pin the edge runtime. Without this Vercel builds the file for the Node runtime
// and calls it as a legacy (req, res) handler: the Response this function returns
// is discarded, res is never ended, and every request to /api/coach hangs until
// the gateway times out. Edge takes the Web signature this file already uses, and
// is the same signature the dev plugin in vite.config.ts calls, so local and
// deployed stay one implementation. Found live 2026-08-24.
export const config = { runtime: 'edge' };

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

  // Under-calling is correct here, same as in judge_turn below. The old wording
  // ("a passing edit must do this", "name the missing half") read as a checklist
  // and told the model to go looking for something absent, so it failed clean
  // edits: a target that offers three ways to fix a line got treated as three
  // requirements, and a player who did one of them was told to go do the other
  // two. Verified 2026-08-25 on level 1 item 4, twice in a row, with edits that
  // committed no foul at all.
  judge_edit: (target: string, original: string, answer: string) =>
    `A player was given this line to fix:\n\n"${original}"\n\n` +
    `They submitted:\n\n"${answer}"\n\n` +
    `Here is what the fix was for:\n${target}\n\n` +
    `Pass it if the foul is gone and the line still disagrees with something. That is the whole ` +
    `bar. The edit does not have to be well written, complete, or the strongest version of the ` +
    `argument, and where the description above offers several ways to fix the line, doing any ` +
    `one of them is a pass. Fail only if the words they actually submitted still commit the ` +
    `foul, and if you are unsure, pass.\n\n` +
    `Reply with strict JSON and nothing else: {"pass": true|false, "text": "one or two ` +
    `sentences of coach feedback"}. The coach is warm, brief, and specific about the words on ` +
    `the page. Never say who is right about the underlying political question; you are ruling ` +
    `on the sentence, not the position. If they passed, say what worked. If they did not, ` +
    `point at the exact words that still commit the foul, without scolding.`,

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

  // Referee format. Two AI figures argue and the human holds the whistle, so
  // unlike Sofia both sides are authored here: the figure is told which side to
  // take rather than mirroring a human. Balance is the caller's job, in
  // content/referee.ts, which pairs the stances.
  figure_line: (
    persona: string,
    topic: string,
    stance: string,
    lastLine: string,
    kind: string,
    foul: string,
  ) =>
    `You are ${persona}, a character in a game about disagreeing well. ` +
    `The topic is: ${topic}\n\nYour side of it: ${stance}\n\n` +
    (lastLine
      ? `The person you are talking with just said:\n\n"${lastLine}"\n\n`
      : `You are opening the exchange.\n\n`) +
    (kind === 'summarize'
      ? `This is a SUMMARIZING turn. Restate what they just said back to them. Do not rebut yet.\n\n`
      : `This is a SPEAKING turn. Argue your side in two or three sentences.\n\n`) +
    (foul === 'clean'
      ? `Play this turn completely clean. No verdicts on the person, no opinion stated as ` +
        `settled fact, and if you are summarizing, keep their reason and end by checking that ` +
        `you got it right.`
      : `Commit exactly one foul, mildly, so that an alert referee could catch it and a ` +
        `distracted one would not:\n${RULES[foul]}\nEverything else about the turn should be ` +
        `reasonable and in good faith. Do not be a cartoon.`) +
    `\n\nReply with your line only. No preamble, no quotation marks, no stage directions.`,

  // The heart of the referee format, and of section 6 of the soul doc: the
  // referee nominates, the person who was spoken to decides. The figure rules on
  // its own behalf, in character, exactly as a human would. It is never asked
  // whether the label is technically correct, only whether it landed that way,
  // because "did the other person feel fouled?" is the only real question.
  affirm_call: (persona: string, line: string, foul: string) =>
    `You are ${persona}, a character in a game about disagreeing well. ` +
    `The person you are arguing with just said this to you:\n\n"${line}"\n\n` +
    `The referee stopped play and called it ${RULES[foul] ?? foul}\n\n` +
    `You decide, for yourself, in character: did that land on you that way? Not whether the ` +
    `label is technically right, and not whether they had a point. Only whether you felt it. ` +
    `You are a reasonable person who is not looking to be offended and not pretending to be ` +
    `fine either. If it genuinely stung or talked down to you, say so. If it was just blunt ` +
    `disagreement you can take, wave it off.\n\n` +
    `Reply with strict JSON and nothing else: {"upheld": true|false, "text": "one sentence, ` +
    `in your own voice, saying whether it landed"}.`,

} as const;

// Deliberately under the client's own 6s deadline, so a slow upstream comes back
// here as an ordinary "no line available" and the client uses its authored
// fallback, rather than the client giving up on a request still in flight.
const UPSTREAM_TIMEOUT_MS = 5000;

/**
 * House voice, applied to every generated line.
 *
 * The reading level: a model left to itself writes rulings like "meeting the
 * standard for listening". Steve's bar is middle school, the same bar the
 * printed cards are written to, and a player who has to decode the feedback is
 * not reading the feedback.
 *
 * The em dash: no authored line in this game has one, so a generated line with
 * one is instantly identifiable as the machine talking.
 *
 * Contractions and the banned list, added 2026-08-25. Steve: "coach language is
 * too claude, more lay/informal. everything middle-school level." The tell was
 * never vocabulary alone, it was the missing contractions: a model writes "that
 * is not a foul" where a person says "that's not a foul", and the result reads
 * like a memo no matter how short the words are. The authored lines were swept
 * the same day, so this block is what keeps the generated ones from drifting
 * back. The banned words are the ones live play actually produced; the
 * no-praise-opener rule kills "Good. That's the move", which reads as a grade
 * even though the coach is not supposed to be grading.
 */
const HOUSE =
  '\n\nHow to write it. You are a boxing coach in a gym, not a writing teacher. ' +
  'Middle school reading level. Use contractions every time one fits: that\'s, ' +
  'you\'re, isn\'t, doesn\'t, didn\'t, here\'s, I\'ll. Keep sentences under ' +
  'about fifteen words. Never use these words: circular, dismissive, invalidate, ' +
  'validate, framing, nuance, assertion, premise, characterize, articulate, ' +
  'acknowledge, perspective, effectively, essentially, additionally, however, ' +
  'furthermore. Never open with praise or a label like Good, Nice, Exactly, ' +
  'Correct, or Well done; open with the thing itself. Never use an em dash; use ' +
  'a comma, a semicolon, or two sentences. Do not grade the answer or name the ' +
  'standard it met. When you are ruling on the player, talk straight at them and ' +
  'say you, never "the summary" or "the player". One or two sentences, then stop.';

async function ask(key: string, prompt: string): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt + HOUSE }],
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data: any = await res.json();
  const parts = data?.content;
  if (!Array.isArray(parts)) return '';
  return parts.map((p: any) => p?.text ?? '').join('').trim();
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
  } else if (task === 'figure_line') {
    prompt = PROMPTS.figure_line(
      String(body.persona ?? 'a player').slice(0, 120),
      String(body.topic ?? '').slice(0, 300),
      String(body.stance ?? '').slice(0, 400),
      String(body.lastLine ?? '').slice(0, 1200),
      String(body.kind ?? 'speak'),
      String(body.foul ?? 'clean'),
    );
  } else if (task === 'affirm_call') {
    prompt = PROMPTS.affirm_call(
      String(body.persona ?? 'a player').slice(0, 120),
      String(body.line ?? '').slice(0, 1200),
      String(body.foul ?? ''),
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

  if (task === 'affirm_call') {
    const parsed = parseJson(raw);
    // Prose where JSON was asked for is not an affirmation. The call fails open
    // to not-upheld, which keeps a broken model from moving tokens on its own:
    // no path lets software decide a foul happened (soul.md section 6).
    if (!parsed) return Response.json({ upheld: false, text: raw });
    return Response.json({
      upheld: parsed.upheld === true,
      text: String(parsed.text ?? ''),
    });
  }

  return Response.json({ text: raw });
}
