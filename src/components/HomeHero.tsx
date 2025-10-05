"use client"
import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  onBegin?: () => void;
};

export default function HomeHero({ onBegin }: Props) {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="w-full flex flex-col items-center justify-center py-20">
      <div className="relative w-full max-w-4xl flex flex-col items-center gap-6">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-72 h-72 rounded-full bg-gradient-to-br from-[#0b1220]/30 to-transparent blur-3xl animate-spin-slow" />
        </div>

        <h2 className="text-5xl md:text-6xl font-light text-center accent-gradient" style={{ letterSpacing: '0.12em' }}>
          UNIVERSAL MEDITATION
        </h2>

        <p className="text-lg text-white/80">Listen to the Universe</p>

        <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} onClick={() => onBegin && onBegin()} className="mt-6 px-6 py-3 rounded-full bg-[#3AB8B8] hover:bg-[#A39BFF] text-black font-medium shadow-lg">
          Begin Meditation
        </motion.button>
      </div>
    </motion.section>
  );
}
