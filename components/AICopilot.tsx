"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSimulation } from '@/app/contexts/SimulationContext';

export default function AICopilot() {
  const { currentTick, currentIndex, isPlaying } = useSimulation();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const lastAnalyzedIndex = useRef(-1);

  // Trigger analysis every 10 ticks, or if lyapunov > 1.0 (once per threshold crossing)
  useEffect(() => {
    if (!currentTick) return;

    const isCritical = currentTick.chaos.lyapunov > 1.0;
    const shouldTrigger = (currentIndex > 0 && currentIndex % 10 === 0) || (isCritical && lastAnalyzedIndex.current !== currentIndex);

    if (shouldTrigger && lastAnalyzedIndex.current !== currentIndex) {
      lastAnalyzedIndex.current = currentIndex;
      
      const fetchAnalysis = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentTick)
          });
          const data = await res.json();
          setAnalysis(data.summary);
        } catch (e) {
          console.error(e);
          setAnalysis("ERROR: Failed to synthesize risk state. AI Core Offline.");
        } finally {
          setLoading(false);
        }
      };

      fetchAnalysis();
    }
  }, [currentIndex, currentTick]);

  // Typewriter effect
  useEffect(() => {
    if (analysis) {
      let i = 0;
      setDisplayedText("");
      const timer = setInterval(() => {
        setDisplayedText(prev => prev + analysis.charAt(i));
        i++;
        if (i >= analysis.length) clearInterval(timer);
      }, 30);
      return () => clearInterval(timer);
    }
  }, [analysis]);

  return (
    <div className="h-full flex flex-col gap-4 col-span-2">
      <h2 className="text-lg font-semibold animate-pulse text-indigo-400 flex items-center gap-2">
        <span className="text-red-500">🚨</span> AI Risk Synthesis <span className="text-red-500">🚨</span>
      </h2>

      <div className="flex-1 bg-slate-950/80 border border-indigo-900/50 rounded-xl p-4 font-mono text-sm overflow-y-auto shadow-[0_0_15px_rgba(79,70,229,0.1)] relative">
        <div className="absolute top-2 right-2 flex gap-1">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-slate-700'}`}></div>
        </div>
        
        {loading ? (
          <div className="text-indigo-400 flex items-center gap-2 mt-4">
            <span className="animate-spin">🌀</span> Synthesizing telemetry...
          </div>
        ) : analysis ? (
          <div className="text-slate-300 leading-relaxed mt-2">
            {displayedText}
            {!loading && displayedText.length === analysis.length && (
              <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse translate-y-1" />
            )}
          </div>
        ) : (
          <div className="text-slate-600 mt-4 italic">
            Awaiting sufficient telemetry data...
          </div>
        )}
      </div>

      <div className="mt-auto">
        <button 
          onClick={() => setShowPayload(!showPayload)}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded transition border border-slate-700 hover:border-slate-600"
        >
          {showPayload ? 'Hide Payload' : '[View Payload]'}
        </button>
        
        {showPayload && currentTick && (
          <div className="mt-2 p-2 bg-black rounded text-[10px] text-emerald-400 font-mono overflow-x-auto h-[150px] overflow-y-auto border border-emerald-900/30">
            <pre>{JSON.stringify(currentTick, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
