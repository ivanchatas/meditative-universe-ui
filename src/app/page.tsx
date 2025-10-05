"use client";
import React from 'react';
import dynamic from "next/dynamic";

import Header from '../components/Header';
import ControlPanel from '../components/ControlPanel';
import HomeHero from '../components/HomeHero';
import Footer from '../components/Footer';
import { fetchSource } from '../lib/nasaClient';
import SoundEngine from '../components/SoundEngine';
import { motion } from 'framer-motion';

// Dynamically import the VisualizationCanvas component
// The ssr: false option prevents Next.js from rendering this component on the server
const VisualizationCanvas = dynamic(
  () => import('./components/visualizationCanvas'),
  { ssr: false }
);

export default function Home() {
  const [selected, setSelected] = React.useState('APOD');
  const [data, setData] = React.useState<any>(null);
  const [playing, setPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSelect = (s: string) => setSelected(s);

  const handleMeditate = async () => {
    try {
      setIsLoading(true);
      const result = await fetchSource(selected);
      setData(result);
      // let SoundEngine react to `isPlaying` prop instead of calling startSound directly
      setPlaying(true);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error('Meditate failed', err);
    }
  };

  const handleStop = () => {
    setPlaying(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      <Header />
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-4 gap-4">
        {!playing && !data ? (
          <HomeHero onBegin={handleMeditate} />
        ) : (
          <>
            <motion.div className="flex-1 w-full max-w-4xl"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="w-full h-96 md:h-[60vh] rounded-xl shadow-lg overflow-hidden">
                <VisualizationCanvas className="w-full h-full" data={data} />
              </div>
            </motion.div>

            <motion.aside className="w-full md:w-80"
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <ControlPanel
                className="rounded-xl shadow-lg bg-white bg-opacity-10 backdrop-blur-md p-4 h-full"
                onSourceChange={handleSelect}
                isLoading={isLoading}
                onMeditate={playing ? handleStop : handleMeditate}
              />
            </motion.aside>
          </>
        )}
      </main>

      {/* mount audio engine */}
      <SoundEngine data={data} isPlaying={playing} />
      <Footer />
    </div>
  );
}