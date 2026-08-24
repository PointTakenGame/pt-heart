// Vercel serverless function. The only server-side code in Heart's MVP.
//
// No auth, no database, no session. It takes text, returns text, stores nothing.
// Auth arrives later from the Brain agent (Steve's ruling, 2026-08-23); nothing in
// here has to change when it does.
//
// Needs ANTHROPIC_API_KEY in the Vercel project env. Without it this returns 503 and
// the client falls back to authored copy, which is the intended local-dev path.

const MODEL = 'claude-haiku-4-5-20251001';

const TEMPLATE = 'So what I\'m hearing is: it bugs you that [X], because [Y]. Did I get that right?';

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
} as const;

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

  let prompt: string;
  if (body.task === 'restate_perfect' || body.task === 'restate_flawed') {
    if (typeof body.playerText !== 'string' || !body.playerText.trim()) {
      return new Response('missing playerText', { status: 400 });
    }
    prompt = PROMPTS[body.task as 'restate_perfect'](body.playerText.slice(0, 1200));
  } else if (body.task === 'judge_edit') {
    prompt = PROMPTS.judge_edit(
      String(body.target ?? '').slice(0, 1200),
      String(body.original ?? '').slice(0, 600),
      String(body.answer ?? '').slice(0, 1200),
    );
  } else {
    return new Response('unknown task', { status: 400 });
  }

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

  if (!res.ok) return new Response('upstream error', { status: 502 });

  const data: any = await res.json();
  const raw: string = data?.content?.[0]?.text?.trim() ?? '';

  if (body.task === 'judge_edit') {
    try {
      const parsed = JSON.parse(raw.replace(/^```(?:json)?|```$/g, '').trim());
      return Response.json({ pass: parsed.pass === true, text: String(parsed.text ?? '') });
    } catch {
      // The model wrote prose instead of JSON. Prose is still usable feedback.
      return Response.json({ pass: true, text: raw });
    }
  }

  return Response.json({ text: raw });
}
