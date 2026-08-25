// The generic NPC voice: a short square blip per couple of characters, no
// language in it. Steve, 2026-08-25: "that sound of like wonk won wonk won wonk
// wonk that they use that generic Nonsense voice that is free of any language."
//
// Synthesised, not sampled, so it costs nothing to ship and cannot drift out of
// sync with the typewriter. Pitch is picked off the character code, which makes
// the same line sound the same way every time, the way everything else in this
// build is deterministic.
//
// It is safe under browser autoplay rules because a blip only ever fires after
// the player has pressed Next or clicked into the game, so the page has already
// been gestured at by the time an AudioContext is created.

const KEY = 'humility-showdown.blip';

let on = true;
try {
  on = localStorage.getItem(KEY) !== 'off';
} catch {
  /* private mode, or no storage. The voice just does not persist its setting. */
}

let ctx: AudioContext | null = null;

export function blipMuted(): boolean {
  return !on;
}

export function setBlipMuted(muted: boolean): void {
  on = !muted;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* see above */
  }
}

/** One blip. `seed` is a character code, so the pitch wobbles with the text. */
export function blip(seed: number): void {
  if (!on) return;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    // Five pitches inside a narrow band. Wider than this reads as a melody, and
    // a melody is a character trait we did not mean to give anybody.
    osc.frequency.value = 320 + (Math.abs(seed) % 5) * 26;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.045, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  } catch {
    /* no audio device, no problem. The game is playable in silence. */
  }
}
