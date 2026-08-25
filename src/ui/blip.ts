// The generic NPC voice: a short blip every few characters, no language in it.
// Steve, 2026-08-25: "that sound of like wonk won wonk won wonk wonk that they
// use that generic Nonsense voice that is free of any language."
//
// Synthesised, not sampled, so it costs nothing to ship and cannot drift out of
// sync with the typewriter. Pitch is picked off the character code, which makes
// the same line sound the same way every time, the way everything else in this
// build is deterministic.
//
// Revised 2026-08-25 on Steve's note: "coach ray voice beeps, too high pitch,
// too fast, irritating. give me 3-4 other samples to vett?" So the single voice
// became four, all of them pitched well below the original 320 to 424 Hz band,
// and the typewriter now fires one every third character instead of every
// other one. The choice is a setting the player (and Steve) can flip mid-line
// from the buttons on the dialogue box, and it persists.
//
// It is safe under browser autoplay rules because a blip only ever fires after
// the player has pressed Next or clicked into the game, so the page has already
// been gestured at by the time an AudioContext is created.

const VOICE_KEY = 'humility-showdown.blip-voice2';

export type BlipVoice = 'wood' | 'low' | 'retro' | 'breath';

/** In the order they appear on the box, with what to call them on the button. */
export const BLIP_VOICES: { id: BlipVoice; label: string; blurb: string }[] = [
  { id: 'wood', label: 'Block', blurb: 'a dry wooden tap, almost no pitch' },
  { id: 'low', label: 'Hum', blurb: 'a soft low tone, rounded off' },
  { id: 'retro', label: 'Retro', blurb: 'the old square wave, an octave down' },
  { id: 'breath', label: 'Breath', blurb: 'filtered air, no tone at all' },
];

function isVoice(v: string | null): v is BlipVoice {
  return v === 'wood' || v === 'low' || v === 'retro' || v === 'breath';
}

// Silent on every load. Steve, 2026-08-25: "turn off the sounds by default
// unless user turns it on actively after reload. it's annoying me."
//
// So the mute state is deliberately NOT persisted, which is the difference
// between a default and a preference: a preference would remember that he
// switched it on last Tuesday and start beeping at him again today. Turning the
// voice on is a per-session act. The chosen voice still persists, because that
// is a real preference: it says which voice he wants when he does turn it on.
let on = false;
// Hum, not Block. Steve, 2026-08-25: "I like the new voices. make hum the
// default. I like that the user can pick actually." The key above was bumped in
// the same motion, because a saved 'wood' would otherwise win on his machine and
// the new default would never be heard.
let voice: BlipVoice = 'low';
try {
  const saved = localStorage.getItem(VOICE_KEY);
  if (isVoice(saved)) voice = saved;
} catch {
  /* private mode, or no storage. The voice just does not persist its setting. */
}

let ctx: AudioContext | null = null;
/** One shared second of mono noise. Rebuilding it per blip is audible as jank. */
let noise: AudioBuffer | null = null;

export function blipMuted(): boolean {
  return !on;
}

export function setBlipMuted(muted: boolean): void {
  // Not written to storage; see the note on the initializer above.
  on = !muted;
}

export function blipVoice(): BlipVoice {
  return voice;
}

export function setBlipVoice(v: BlipVoice): void {
  voice = v;
  try {
    localStorage.setItem(VOICE_KEY, v);
  } catch {
    /* see above */
  }
}

function noiseBuffer(c: AudioContext): AudioBuffer {
  if (noise) return noise;
  const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
  noise = buf;
  return buf;
}

/** One blip. `seed` is a character code, so the pitch wobbles with the text.
 *  `as` overrides the saved voice, which is how the picker previews. */
export function blip(seed: number, as?: BlipVoice): void {
  if (!on && !as) return;
  const v = as ?? voice;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const c = ctx;
    const t = c.currentTime;
    // Five steps inside a narrow band. Wider than this reads as a melody, and a
    // melody is a character trait we did not mean to give anybody.
    const step = Math.abs(seed) % 5;
    const gain = c.createGain();
    gain.connect(c.destination);

    if (v === 'breath') {
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(c);
      src.loop = true;
      const band = c.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 700 + step * 60;
      band.Q.value = 1.4;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.03, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
      src.connect(band).connect(gain);
      src.start(t);
      src.stop(t + 0.07);
      return;
    }

    const osc = c.createOscillator();
    if (v === 'wood') {
      // A tap, not a note: a triangle that drops a fifth in 25ms reads as wood
      // rather than as pitch, which is what stops it turning into a melody.
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200 + step * 10, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.025);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.05, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + 0.055);
      return;
    }

    if (v === 'low') {
      osc.type = 'sine';
      osc.frequency.value = 165 + step * 12;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.07, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + 0.1);
      return;
    }

    // retro: the original square, an octave down and with the fizz filtered off.
    osc.type = 'square';
    osc.frequency.value = 160 + step * 13;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.04, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
    osc.connect(lp).connect(gain);
    osc.start(t);
    osc.stop(t + 0.065);
  } catch {
    /* no audio device, no problem. The game is playable in silence. */
  }
}

// The walk-out fanfare. Steve, 2026-08-25: "need some fanfare pre-fight midi
// 8-bit music while the fight card is up."
//
// Square waves and nothing else, the way a cartridge would have done it: a
// three-note call, an answer, a run up the triad, and a held tonic. Two voices,
// lead and bass, because a third one starts to sound like a score rather than a
// title card. It runs about 1.8 seconds, which is the length of the countdown it
// plays under.
//
// [hz, start in seconds, length in seconds]
const FANFARE: [number, number, number][] = [
  [523.25, 0.0, 0.11],
  [523.25, 0.14, 0.11],
  [523.25, 0.28, 0.11],
  [659.25, 0.44, 0.3],
  [523.25, 0.78, 0.11],
  [659.25, 0.92, 0.11],
  [783.99, 1.06, 0.11],
  [1046.5, 1.22, 0.52],
];
const FANFARE_BASS: [number, number, number][] = [
  [130.81, 0.0, 0.4],
  [130.81, 0.44, 0.3],
  [196.0, 0.78, 0.4],
  [130.81, 1.22, 0.6],
];

/** Plays once, on the Start button. That press is the gesture the autoplay
 *  policy wants, so the context is allowed to open here. Muted by default like
 *  every other sound in the build; the splash carries its own speaker toggle so
 *  the fanfare is reachable without walking back to the corner. */
export function fanfare(): void {
  if (!on) return;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const c = ctx;
    const t0 = c.currentTime + 0.05;
    // One filter for the whole piece. A raw square is all fizz on small
    // speakers, and the fizz is the part that sounds cheap rather than retro.
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2600;
    lp.connect(c.destination);
    const play = (hz: number, at: number, len: number, level: number) => {
      const osc = c.createOscillator();
      osc.type = 'square';
      osc.frequency.value = hz;
      const g = c.createGain();
      const t = t0 + at;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(level, t + 0.012);
      g.gain.setValueAtTime(level, t + len * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      osc.connect(g).connect(lp);
      osc.start(t);
      osc.stop(t + len + 0.02);
    };
    FANFARE.forEach(([hz, at, len]) => play(hz, at, len, 0.055));
    FANFARE_BASS.forEach(([hz, at, len]) => play(hz, at, len, 0.04));
  } catch {
    /* see above */
  }
}
