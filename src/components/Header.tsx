"use client"
import React from 'react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <header className="w-full flex items-center justify-between p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-semibold">Meditative Universe</h1>
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20">
          {isDark ? 'Dark' : 'Light'}
        </button>
      </div>
    </header>
  );
}
