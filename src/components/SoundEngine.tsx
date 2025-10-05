"use client";
import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import * as Tone from 'tone';

type SoundData = {
  brightness?: number; // 0..1
  temperature?: number; // normalized
  solarWind?: number; // 0..1
  exoplanetCount?: number; // integer
  intensity?: number; // general 0..1
};

type Props = {
  data?: SoundData;
  isPlaying?: boolean;
};

export type SoundEngineHandle = {
  startMeditation: () => Promise<void>;
  stopMeditation: () => void;
};

const SoundEngine = forwardRef<SoundEngineHandle, Props>(({ data, isPlaying }, ref) => {
  // synths and effects
  const padRef: { current?: any } = { current: null };
  const reverbRef: { current?: any } = { current: null };
  const seqRef: { current?: any } = { current: null };

  // map incoming data to sound parameters
  function mapData(d: SoundData = {}) {
    const intensity = typeof d.intensity === 'number' ? d.intensity : (d.brightness ?? 0.5);
    const brightness = typeof d.brightness === 'number' ? d.brightness : 0.5;
    const temp = typeof d.temperature === 'number' ? d.temperature : 0.5;
    const solarWind = typeof d.solarWind === 'number' ? d.solarWind : 0.2;
    const exo = Math.max(1, Math.round(d.exoplanetCount || 1));

    // frequency base: map brightness/temperature to frequency in a calm range
    const baseFreq = 220 + brightness * 440 + (temp - 0.5) * 100;
    const reverbWet = Math.min(0.95, 0.2 + solarWind * 0.8);
    const noteDensity = Math.min(8, Math.max(1, Math.round(1 + exo / 5)));

    return { baseFreq, reverbWet, noteDensity, intensity };
  }

  async function startMeditation() {
    await Tone.start();

    // pad synth
    padRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 3.5, decay: 1.5, sustain: 0.7, release: 6 }
    }).toDestination();

    // reverb
    reverbRef.current = new Tone.Reverb({ decay: 6, preDelay: 0.2 }).toDestination();
    // route pad through reverb
    padRef.current.connect(reverbRef.current);

  // sequence / arpeggio generator - use singleton Transport
  Tone.Transport.bpm.value = 40;

    // initial play: trigger a slow evolving chord
    const { baseFreq, reverbWet } = mapData(data);
    reverbRef.current.wet.value = reverbWet;

    // kick off a few sustained notes
    const now = Tone.now();
    padRef.current.triggerAttackRelease([baseFreq, baseFreq * 1.26, baseFreq * 1.5], 8, now);
  }

  function stopMeditation() {
    if (padRef.current) {
      padRef.current.releaseAll?.();
      padRef.current.disconnect();
      padRef.current.dispose?.();
      padRef.current = null;
    }
    if (reverbRef.current) {
      reverbRef.current.dispose?.();
      reverbRef.current = null;
    }
    Tone.Transport.stop();
  }

  // expose methods
  useImperativeHandle(ref, () => ({ startMeditation, stopMeditation: stopMeditation }));

  // react to data changes
  useEffect(() => {
    if (!padRef.current) return;
    const { baseFreq, reverbWet } = mapData(data);
    // gently sweep oscillator frequency
    try {
      padRef.current.voices?.forEach((v: any) => v.oscillator.frequency.rampTo(baseFreq, 2));
    } catch (e) {
      // fallback: trigger a soft chord
      padRef.current.triggerAttackRelease([baseFreq, baseFreq * 1.26, baseFreq * 1.5], 4, Tone.now());
    }
    if (reverbRef.current) reverbRef.current.wet.rampTo(reverbWet, 2);
  }, [data]);

  // react to play/stop
  useEffect(() => {
    if (isPlaying) {
      startMeditation().catch((e) => console.error('Tone start failed', e));
    } else {
      stopMeditation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  return null; // no visible UI; audio engine only
});

export default SoundEngine;
