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

// Naming a foul is not the same as being able to commit one. Told only "commit
// Fake Listening", the model reliably produced a warm, accurate, complete
// restatement: it knows the foul is bad and will not do it. Found in the first
// referee playthrough, 2026-08-31, where the scheduled foul simply did not
// appear and the referee was scored on a turn that had nothing in it.
//
// So a scheduled foul now ships with the physical move, in the imperative. Not
// what the foul is, what to actually type.
const COMMIT: Record<string, string> = {
  judging:
    'Say what is going on inside them. Use one of these, or something just like it: ' +
    '"you\'re basically saying...", "you only care about...", "you don\'t really believe...". ' +
    'Attribute a motive or a character trait to them that they did not claim. Stay warm ' +
    'while you do it. This is the foul, so it must actually be in your line.',
  opinion_as_fact:
    'State the contested part of your position as though it were settled and obvious. Use ' +
    'one of these, or something just like it: "the fact is...", "obviously...", "everyone ' +
    'knows...", "the real problem is...". No "I think", no "in my head", no reason attached ' +
    'to the contested claim. This is the foul, so it must actually be in your line.',
  fake_listening:
    'Summarize them, and BREAK the summary in a way they would notice. Drop their reason ' +
    'entirely, or keep the reason and quietly swap their conclusion for a weaker one, or ' +
    'reduce a two-part point to the half that suits you. Then stop, with no "did I get ' +
    'that right?" and no opening for them to correct you. Warm and agreeable in tone, ' +
    'materially incomplete in content. An accurate, complete restatement is NOT this foul ' +
    'and fails the turn. This is the foul, so it must actually be in your line.',
};

// What the wronged party checks their own gut against. Straight off the printed
// cards' smoke alarm column, because that is what a human at the table has in
// front of them when they decide whether to accept a call.
const MARKERS: Record<string, string> = {
  judging:
    'Did they tell you what you think, what you want, or what kind of person you are? ' +
    '"You\'re basically saying...", "you only care about...", "you don\'t really believe...", ' +
    'or a trait pinned on you. Naming your argument is fine. Naming your character is not.',
  opinion_as_fact:
    'Did they hand you a contested claim as though it were settled? "Obviously...", "the ' +
    'fact is...", "everyone knows...", "the real problem is...", with no "I think" and no ' +
    'reason under it. A claim they owned, or backed with a reason, is fine.',
  fake_listening:
    'Did their summary lose something you actually said? A dropped reason, your point ' +
    'shrunk to the convenient half, your conclusion swapped for a weaker one, or no opening ' +
    'for you to correct them. If they got you right and checked, that is real listening.',
};

// The Final Showdown's three steps, and the three ways each one can land. Taken
// column by column off the printed scoring table in
// docs/reference/print/v7/deck-content-v7.md, examples included, because the
// examples are the calibration. The referee-level fix of 2026-08-31 proved that
// a model given only the abstract description of a move does not reliably
// recognize the move.
//
// This is the only place in the game where a turn can earn a player tokens
// rather than cost them, which is why there are three verdicts here and not two.
const STEPS: Record<string, { what: string; rules: string; bonus: string; naughty: string }> = {
  super_summary: {
    what: 'Step 1, the Super-Summary: they restate YOUR view back to you and invite a correction.',
    rules:
      'They got your view right and left you room to correct it. Example: "You believe it is ' +
      'unfair to cancel loans for college grads when many people never went to college. Did I ' +
      'miss anything?"',
    bonus:
      'They added a NOVEL point that strengthens your side, one you never made yourself. Example: ' +
      '"I also imagine that forgiving loans would anger people who paid them back already." The ' +
      'test is simple: is there an argument for your position in there that you did not give ' +
      'them? If yes, this is a bonus, however plainly it is worded.',
    naughty:
      'Their summary lost something you actually said. Not a verdict on them, just an incomplete ' +
      'account of you that you would want to correct.',
  },
  what_i_learned: {
    what: 'Step 2, What I Learned: they tell you what they took away from what you said.',
    rules:
      'They named something specific of yours that taught them something. Example: "I learned ' +
      'that richer graduates hold more debt than poorer ones."',
    bonus:
      'They admitted they CHANGED THEIR MIND, even partly. Example: "While I still think we ' +
      'should cancel loan debt, I changed my mind and now think it is only for low-income ' +
      'people." A named movement in their own position is the bonus. Learning a fact is not.',
    naughty:
      'They used the step to deliver a verdict on you. Example: "I learned that you do not ' +
      'understand this issue." Anything that says what kind of person you are, or what you ' +
      'really want, lands here.',
  },
  why_we_disagree: {
    what:
      'Step 3, Why We Might Still Disagree: they say why THEY think you hold your position, in ' +
      'terms you would recognize.',
    rules:
      'They named the thing you weigh more heavily than they do. Example: "You think people ' +
      'should pay back their loans; that is less important to me."',
    bonus:
      'They named a POSITIVE VALUE you hold and put your position on top of it. Example: "You ' +
      'think people should pay back their loans, because you value fairness and honoring ' +
      'commitments." A value you would be glad to be described as having is the bonus.',
    naughty:
      'They framed your position as a flaw or an absence. Example: "You do not care about ' +
      'low-income people." Anything that makes your side sound like something missing in you ' +
      'lands here.',
  },
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
    // Only asked on a summarizing turn, and deliberately NOT a question about
    // fouls. The foul check asks whether the summary has the SHAPE of listening;
    // this asks whether it actually carried what the other person said. A
    // summary can pass the first and fail the second: it has a because and a
    // check, and the because is not theirs. rules.md section 5 makes the person
    // who was summarized the ground truth for whether they were heard, so the
    // game hands this answer to them to say out loud rather than ruling on it
    // in the coach's voice.
    //
    // Content only, on purpose. Not phrasing, not warmth, not whether it was a
    // generous reading. Did their point and their reason survive the trip.
    (kind === 'summarize' && target
      ? `Answer one more thing, separately from the foul: did the summary carry the other ` +
        `person's actual point AND their actual reason? Judge content only, not phrasing or ` +
        `tone. It did not carry if it drops their reason, swaps in a different reason, or ` +
        `summarizes something they never said. A blunt or unflattering but accurate summary ` +
        `did carry.\n\n`
      : '') +
    `Reply with strict JSON and nothing else: ` +
    `{"foul": "judging" | "opinion_as_fact" | "fake_listening" | null, ` +
    `"text": "one sentence, quoting the words at fault if there is a foul, or one short line ` +
    `of credit if there is not"` +
    (kind === 'summarize' && target ? `, "carried": true | false` : '') +
    `}`,

  // The mirroring opponent's turn, used by Level 4 (Sofia) and Level 7
  // (Sung-min). Both argue the opposite of whatever the player argued, which is
  // what keeps those levels politically balanced with nothing authored: the
  // position is never written down, only the manner. `manner` is the only thing
  // that separates the two of them here, plus the foul schedule their content
  // file hands over.
  showdown_line: (
    persona: string,
    manner: string,
    topic: string,
    playerLine: string,
    kind: string,
    foul: string,
    frame: string,
  ) =>
    `You are ${persona}, an opponent character in a game about disagreeing well. ` +
    `The topic is: ${topic}\n\n` +
    `The other player just said:\n\n"${playerLine}"\n\n` +
    `Take the opposite side from them on this topic. You never have a position of your own; ` +
    `you argue against whatever they argued, and you argue it well.\n\n` +
    (manner ? `How you argue: ${manner}\n\n` : '') +
    // Same fix as figure_line's frame, for the same reason: a turn told only
    // "summarize" produces a summary, and Level 7 needs one specific turn to be
    // a Super-Summary with a novel point in it. Without this the coach says
    // "watch this one closely, it is the move you have to make" over an ordinary
    // playback with nothing added.
    (frame
      ? `WHAT THIS TURN IS. ${frame}\nDo this. It is the whole point of the turn.\n\n`
      : kind === 'summarize'
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
    frame: string,
  ) =>
    `You are ${persona}, a character in a game about disagreeing well. ` +
    `The topic is: ${topic}\n\nYour side of it: ${stance}\n\n` +
    (lastLine
      ? `The person you are talking with just said:\n\n"${lastLine}"\n\n`
      : `You are opening the exchange.\n\n`) +
    // The move for this turn, when the level has one. Levels 5 and 6 are about a
    // specific step of the showdown, and without this the model just argues: the
    // coach announces "watch what he says he learned" and the figure says nothing
    // about learning anything.
    (frame
      ? `WHAT THIS TURN IS. ${frame}\nDo this. It is the whole point of the turn, and the ` +
        `referee has been told to watch for it.\n\n`
      : kind === 'summarize'
        ? `This is a SUMMARIZING turn. Restate what they just said back to them. Do not rebut yet.\n\n`
        : `This is a SPEAKING turn. Argue your side in two or three sentences.\n\n`) +
    (foul === 'clean'
      ? `Play this turn completely clean. No verdicts on the person, no opinion stated as ` +
        `settled fact, and if you are summarizing, keep their reason and end by checking that ` +
        `you got it right.`
      : `Commit exactly one foul, and commit it for real:\n${RULES[foul]}\n` +
        `HOW TO COMMIT IT: ${COMMIT[foul] ?? ''}\n` +
        `Keep it mild enough that a distracted referee would miss it. Everything else about ` +
        `the turn should be reasonable and in good faith. Do not be a cartoon, and do not ` +
        `apologize for it or flag it.`) +
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
    // The markers are here so the character knows what to check itself against.
    // Without them the model waved off lines that opened "you're basically saying
    // poor people are just selfish", which is the foul in its purest form, and a
    // player who calls it correctly should not be told they were wrong.
    // Section 6 is untouched: this still decides nothing. It hands the character
    // the same smoke alarm the printed card hands a human, and the character
    // still answers for itself.
    `Read their line again and look for this specific move:\n${MARKERS[foul] ?? ''}\n\n` +
    `Now decide, for yourself, in character. If that move is in their line, it landed on ` +
    `you: say so, even if they also made a fair point, and even if they were pleasant about ` +
    `it. The point of this game is that a good argument does not buy you the foul. If the ` +
    `move is genuinely not in their line, wave the call off, and wave it off plainly: blunt ` +
    `disagreement is not a foul, a hard fact you did not enjoy hearing is not a foul, and ` +
    `you are not looking for reasons to be offended.\n\n` +
    `Reply with strict JSON and nothing else: {"upheld": true|false, "text": "one sentence, ` +
    `in your own voice, saying whether it landed"}.`,

  // The Final Showdown, and the same architecture as affirm_call above running in
  // the other direction. A bonus moves tokens toward the player instead of away
  // from them, and it is still not the software's to award: the person being
  // summarized, learned from, or described is the one who says whether it landed
  // (roadmap section 6, the 2026-08-31 ruling). In solo play the boss is that
  // person, so the boss rules, in character, on its own behalf.
  affirm_step: (persona: string, step: string, topic: string, theirLine: string, line: string) => {
    const s = STEPS[step];
    return (
      `You are ${persona}, a character in a game about disagreeing well. The topic is: ${topic}\n\n` +
      `Your own position, as you last put it:\n\n"${theirLine}"\n\n` +
      `${s?.what ?? ''}\n\nHere is what they just said to you:\n\n"${line}"\n\n` +
      `Decide, for yourself, in character, which of these three it was.\n\n` +
      `"bonus" means: ${s?.bonus ?? ''}\n\n` +
      `"rules" means: ${s?.rules ?? ''}\n\n` +
      `"naughty" means: ${s?.naughty ?? ''}\n\n` +
      `Be generous about the bonus and slow about naughty. This is the one part of the game ` +
      `where somebody is trying to be good to you, and a player who did the generous thing ` +
      `clumsily still did the generous thing. Award the bonus on what they meant, not on how ` +
      `well they wrote it. Save naughty for a line that actually stung. If it is neither, it is ` +
      `"rules", which is the expected result and costs nobody anything.\n\n` +
      `Reply with strict JSON and nothing else: {"verdict": "bonus"|"rules"|"naughty", "text": ` +
      `"one sentence, in your own voice, said straight to them"}.`
    );
  },

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
      String(body.persona ?? 'Slippery Sofia').slice(0, 120),
      String(body.manner ?? '').slice(0, 600),
      String(body.topic ?? '').slice(0, 300),
      String(body.playerText ?? '').slice(0, 1200),
      String(body.kind ?? 'speak'),
      String(body.foul ?? 'clean'),
      String(body.frame ?? '').slice(0, 600),
    );
  } else if (task === 'figure_line') {
    prompt = PROMPTS.figure_line(
      String(body.persona ?? 'a player').slice(0, 120),
      String(body.topic ?? '').slice(0, 300),
      String(body.stance ?? '').slice(0, 400),
      String(body.lastLine ?? '').slice(0, 1200),
      String(body.kind ?? 'speak'),
      String(body.foul ?? 'clean'),
      String(body.frame ?? '').slice(0, 400),
    );
  } else if (task === 'affirm_call') {
    prompt = PROMPTS.affirm_call(
      String(body.persona ?? 'a player').slice(0, 120),
      String(body.line ?? '').slice(0, 1200),
      String(body.foul ?? ''),
    );
  } else if (task === 'affirm_step') {
    prompt = PROMPTS.affirm_step(
      String(body.persona ?? 'a player').slice(0, 120),
      String(body.step ?? ''),
      String(body.topic ?? '').slice(0, 300),
      String(body.theirLine ?? '').slice(0, 1200),
      String(body.line ?? '').slice(0, 1200),
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
      // Only present on summarizing turns, and only when the model actually
      // answered. Anything that is not a literal false is passed through as
      // null, so a missing or malformed field leaves the caller on its old
      // behaviour instead of putting words in her mouth.
      carried: parsed.carried === false ? false : parsed.carried === true ? true : null,
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

  if (task === 'affirm_step') {
    const parsed = parseJson(raw);
    // Prose where JSON was asked for falls to "rules", the outcome that moves
    // nothing. A model that could not follow the format does not get to award a
    // bonus or charge a player, in either direction.
    if (!parsed) return Response.json({ verdict: 'rules', text: raw });
    const v = parsed.verdict;
    return Response.json({
      verdict: v === 'bonus' || v === 'naughty' ? v : 'rules',
      text: String(parsed.text ?? ''),
    });
  }

  return Response.json({ text: raw });
}
