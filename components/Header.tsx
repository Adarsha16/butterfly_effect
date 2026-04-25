"use client";
import React from 'react';
import { Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { useSimulation } from '@/app/contexts/SimulationContext';

export default function Header() {
  const { isPlaying, togglePlay, fastForward, reset, speedMs, currentTick } = useSimulation();

  return (
    <header className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Project Name</h1>
        <p className="text-sm text-slate-400">Simulated Real-Time Feed: S&P 500 (2007-2008)</p>
      </div>
      <div className="flex items-center space-x-4">
        {currentTick && (
          <div className="text-sm text-slate-300 mr-4">
            Current Date: <span className="font-bold text-indigo-400">{currentTick.date}</span>
          </div>
        )}
        <button onClick={reset} className="p-2 bg-slate-800 rounded hover:bg-slate-700 transition" aria-label="Reset">
          <RotateCcw size={18} />
        </button>
        <button onClick={togglePlay} className="p-2 bg-indigo-600 rounded hover:bg-indigo-500 transition" aria-label="Play/Pause">
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={fastForward} className={`p-2 rounded transition ${speedMs === 250 ? 'bg-indigo-500' : 'bg-slate-800 hover:bg-slate-700'}`} aria-label="Fast Forward">
          <FastForward size={18} />
        </button>
      </div>
    </header>
  );
}
