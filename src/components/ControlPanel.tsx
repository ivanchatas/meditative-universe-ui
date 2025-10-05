"use client"
import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  className?: string;
  onSourceChange?: (source: string) => void;
  onMeditate?: () => void;
  isLoading?: boolean;
};

const SOURCES = [
  'APOD',
  'EPIC',
  'DONKI',
  'NEO',
  'Exoplanet Archive',
  'Mars Rover',
];

export default function ControlPanel({ className = '', onSourceChange, onMeditate, isLoading = false }: Props) {
  const [selected, setSelected] = React.useState<string>(SOURCES[0]);

  const handleSelect = (s: string) => {
    setSelected(s);
    onSourceChange && onSourceChange(s);
  };

  return (
    <aside className={`${className} relative`}>
      <div className="rounded-xl bg-white/6 backdrop-blur-md border border-white/8 p-4 h-full flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-3">Select a Cosmic Source</h2>

          <div className="hidden md:block">
            <div className="grid grid-cols-1 gap-2">
              {SOURCES.map((s) => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleSelect(s)}
                  className={`text-left px-3 py-2 rounded-lg transition-colors duration-200 ${selected === s ? 'bg-indigo-600/40 text-white shadow-inner' : 'bg-white/10 text-white/90 hover:bg-white/20'}`}>
                  {s}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <label className="block text-xs mb-2 text-white/80">Source</label>
            <select value={selected} onChange={(e) => handleSelect(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/6 text-white">
              {SOURCES.map((s) => (
                <option key={s} value={s} className="bg-neutral-900 text-white">{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onMeditate && onMeditate()}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                Fetching
              </span>
            ) : (
              'Meditate'
            )}
          </motion.button>

          <div className="mt-3 text-xs opacity-80">
            Choose a NASA dataset to sonify and visualize. The system will map data intensity to motion and sound.
          </div>
        </div>
      </div>
    </aside>
  );
}
