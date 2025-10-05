import * as Tone from 'tone';

let synth: any = null;
let isStarted = false;

export async function startSound(intensity = 0.5) {
  await Tone.start();
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      volume: -12,
      oscillator: { type: 'sine' },
      envelope: { attack: 2, decay: 1, sustain: 0.6, release: 6 }
    }).toDestination();
  }
  isStarted = true;

  // simple chord progression influenced by intensity
  const root = 220 + intensity * 220;
  const now = Tone.now();
  synth.triggerAttackRelease([root, root * 1.26, root * 1.5], 8, now);
}

export function stopSound() {
  if (synth) {
    synth.releaseAll?.();
  }
  isStarted = false;
}

export function isPlaying() {
  return isStarted;
}
