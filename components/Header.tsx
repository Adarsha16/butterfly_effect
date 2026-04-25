"use client";
import React, { useRef } from 'react';
import { RotateCcw, Upload, Activity, Play, Pause } from 'lucide-react';
import { useSimulation } from '@/app/contexts/SimulationContext';
import AssetSelector from './AssetSelector';

export default function Header() {
  const { data, currentIndex, setCurrentIndex, isPlaying, togglePlay, playbackSpeed, setPlaybackSpeed, reset, currentTick, loadCustomData, isLoadingData } = useSimulation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      loadCustomData(text);
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(Number(e.target.value));
  };

  const cycleSpeed = () => {
    if (playbackSpeed === 1) setPlaybackSpeed(2);
    else if (playbackSpeed === 2) setPlaybackSpeed(4);
    else if (playbackSpeed === 4) setPlaybackSpeed(10);
    else setPlaybackSpeed(1);
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-3 border-b border-[#333] bg-[#111] font-mono gap-4">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-5 h-5" /> Quant-Terminal v2.1
          </h1>
          <p className="text-xs text-stone-400">Data Feed: {isLoadingData ? 'Loading API...' : `Connected (${data.length} ticks)`}</p>
        </div>
        <AssetSelector />
      </div>

      {/* Timeline Scrubber */}
      <div className="flex-1 max-w-2xl px-4 flex items-center gap-3">
        <button onClick={togglePlay} className="p-1 text-stone-500 hover:text-amber-400 transition-colors" aria-label="Play/Pause" title={isPlaying ? "Pause" : "Auto-Play"}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button onClick={cycleSpeed} className="w-6 text-xs font-bold text-stone-500 hover:text-amber-400 transition-colors" title="Playback Speed">
          {playbackSpeed}x
        </button>
        <span className="text-xs text-stone-500 uppercase font-bold ml-2">Timeline</span>
        <input 
          type="range" 
          min={0} 
          max={data.length > 0 ? data.length - 1 : 0} 
          value={currentIndex}
          onChange={handleScrubberChange}
          className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-amber-500"
          disabled={data.length === 0}
        />
        <button onClick={reset} className="p-1 text-stone-500 hover:text-amber-400 transition-colors" aria-label="Reset" title="Reset to start">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="flex items-center space-x-3">
        {currentTick && (
          <div className="text-sm text-stone-300 mr-2 flex items-center gap-2 border border-[#333] px-3 py-1 bg-black">
            <span>DATE:</span>
            <span className="font-bold text-amber-400">{currentTick.date}</span>
          </div>
        )}
        
        {/* CSV Upload */}
        <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="p-1.5 px-3 flex items-center gap-2 text-xs font-bold uppercase bg-[#222] border border-[#444] text-stone-300 hover:bg-[#333] hover:text-amber-400 transition-colors"
          title="Upload Custom CSV (Date, Close)"
        >
          <Upload size={14} />
          <span>Upload CSV</span>
        </button>
      </div>
    </header>
  );
}
