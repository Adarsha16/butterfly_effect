"use client";
import React, { useEffect, useState } from 'react';
import { useSimulation } from '@/app/contexts/SimulationContext';
import { Activity, AlertOctagon, TerminalSquare, Database, Cpu } from 'lucide-react';

export default function QuantCopilot() {
  const { data, currentTick, currentIndex } = useSimulation();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  const isCritical = (currentTick?.chaos?.lyapunov ?? 0) > 1.0;

  const fetchAnalysis = async () => {
    if (!currentTick) return;
    setLoading(true);
    setAnalysis(null);
    setDisplayedText("");
    
    const historicalContext = data.slice(Math.max(0, currentIndex - 30), currentIndex + 1);
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTick, historicalContext })
      });
      const responseData = await res.json();
      setAnalysis(responseData.summary);
    } catch (e) {
      console.error(e);
      setAnalysis("SYS_ERR: Failed to synthesize risk state. Computation Core Offline.");
    } finally {
      setLoading(false);
    }
  };

  // Terminal typewriter effect
  useEffect(() => {
    if (analysis) {
      let i = 0;
      setDisplayedText("");
      const timer = setInterval(() => {
        setDisplayedText(prev => prev + analysis.charAt(i));
        i++;
        if (i >= analysis.length) clearInterval(timer);
      }, 20);
      return () => clearInterval(timer);
    }
  }, [analysis]);

  return (
    <div className="h-full flex flex-col gap-3 col-span-2 font-mono">
      <div className="flex items-center justify-between border-b border-[#333] pb-2">
        <h2 className="text-xs font-bold uppercase text-stone-300 flex items-center gap-2">
          {isCritical ? (
            <AlertOctagon className="w-4 h-4 text-amber-500" />
          ) : (
            <Activity className="w-4 h-4 text-stone-400" />
          )}
          {isCritical ? <span className="text-amber-500 bg-amber-950/50 px-2">CRITICAL THREAT</span> : "Risk Synthesis"}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-500 uppercase">
            STATUS: ONLINE
          </span>
          <div className={`w-2 h-2 ${isCritical ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
        </div>
      </div>

      <div className={`flex-1 overflow-hidden bg-[#111] border ${isCritical ? 'border-amber-700/50' : 'border-[#333]'} p-4 text-sm transition-colors duration-200 flex flex-col`}>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#444] mb-3">
          {loading ? (
            <div className="text-stone-400 flex items-center gap-3 mt-2">
              <Database className="w-4 h-4 animate-pulse" />
              <span className="uppercase text-xs tracking-wider text-amber-600/80">Processing Telemetry...</span>
            </div>
          ) : analysis ? (
            <div className={`leading-relaxed text-xs tracking-wide ${isCritical ? 'text-amber-400' : 'text-stone-300'}`}>
              {displayedText}
              {!loading && displayedText.length === analysis.length && (
                <span className={`inline-block w-2.5 h-4 ml-1 align-middle ${isCritical ? 'bg-amber-500' : 'bg-stone-400'} animate-pulse`} />
              )}
            </div>
          ) : (
            <div className="text-[#555] mt-2 flex items-center gap-2 text-xs uppercase">
              <TerminalSquare className="w-4 h-4" />
              Awaiting manual analyst request...
            </div>
          )}
        </div>
        
        <button 
          onClick={fetchAnalysis}
          disabled={loading || !currentTick}
          className={`w-full py-2 text-xs font-bold uppercase border transition-colors flex items-center justify-center gap-2 ${loading ? 'bg-[#222] text-stone-500 border-[#333] cursor-not-allowed' : 'bg-[#1a1a1a] text-stone-300 border-[#444] hover:bg-[#333] hover:text-amber-400'}`}
        >
          <Cpu className="w-4 h-4" />
          {loading ? 'Synthesizing...' : 'Get Expert Assistance'}
        </button>
      </div>

      <div className="mt-auto">
        <button 
          onClick={() => setShowPayload(!showPayload)}
          className={`w-full py-2 text-[10px] font-bold uppercase border transition-colors ${showPayload ? 'bg-[#222] text-amber-500 border-amber-900/50' : 'bg-[#111] text-stone-400 border-[#333] hover:bg-[#222] hover:text-stone-200'}`}
        >
          {showPayload ? '[- CLOSE SYS_LOGS]' : '[+ VIEW SYS_LOGS]'}
        </button>
        
        {showPayload && currentTick && (
          <div className="mt-2 p-3 bg-[#0a0a0a] text-[10px] text-green-600/80 font-mono overflow-x-auto h-[160px] overflow-y-auto border border-[#222]">
            <pre>
              {JSON.stringify({ 
                currentTick, 
                historicalContextLength: data.slice(Math.max(0, currentIndex - 30), currentIndex + 1).length 
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
