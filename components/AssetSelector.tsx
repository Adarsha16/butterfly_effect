"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { useSimulation } from '@/app/contexts/SimulationContext';

const PRESETS = [
  { label: "Historical Crash of 2008", ticker: "^GSPC", period1: "2006-01-01", period2: "2008-12-31" },
  { label: "Bitcoin (BTC)", ticker: "BTC-USD" },
  { label: "Gold", ticker: "GC=F" },
  { label: "S&P 500 (Recent)", ticker: "^GSPC" },
];

export default function AssetSelector() {
  const { loadYahooData, isLoadingData } = useSimulation();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(PRESETS[0].label);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 1) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/yahoo/search?q=${encodeURIComponent(text)}`);
          const data = await res.json();
          setSuggestions(data);
        } catch (e) {
          console.error(e);
        }
      }, 300);
      setIsOpen(true);
    } else {
      setSuggestions([]);
    }
  };

  const selectAsset = (ticker: string, label: string, period1?: string, period2?: string) => {
    setQuery("");
    setIsOpen(false);
    setActivePreset(label);
    loadYahooData(ticker, period1, period2);
  };

  return (
    <div className="relative z-50 flex items-center ml-4" ref={containerRef}>
      <div className={`relative flex items-center bg-[#222] border ${isOpen ? 'border-amber-500' : 'border-[#444]'} rounded-sm transition-colors`}>
        <div className="pl-2 pr-1 text-stone-500">
          <Search size={14} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={activePreset}
          className="bg-transparent border-none outline-none text-xs text-stone-200 placeholder-stone-400 py-1.5 w-48 font-mono"
        />
        <div className="px-2 cursor-pointer text-stone-500 hover:text-amber-500 border-l border-[#444] pl-2" onClick={() => setIsOpen(!isOpen)}>
          <ChevronDown size={14} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a1a] border border-[#444] shadow-xl rounded-sm overflow-hidden z-50 font-mono">
          <div className="max-h-64 overflow-y-auto">
            {suggestions.length > 0 && (
              <div className="p-1">
                <div className="text-[10px] uppercase font-bold text-stone-500 px-2 py-1 bg-[#111]">Search Results</div>
                {suggestions.map((s, i) => (
                  <div
                    key={`s-${i}`}
                    onClick={() => selectAsset(s.symbol, s.name)}
                    className="flex flex-col px-2 py-1.5 hover:bg-[#333] cursor-pointer text-xs group"
                  >
                    <span className="font-bold text-amber-500 group-hover:text-amber-400">{s.symbol}</span>
                    <span className="text-stone-400 truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-1 border-t border-[#333]">
              <div className="text-[10px] uppercase font-bold text-stone-500 px-2 py-1 bg-[#111]">Presets</div>
              {PRESETS.map((p, i) => (
                <div
                  key={`p-${i}`}
                  onClick={() => selectAsset(p.ticker, p.label, p.period1, p.period2)}
                  className="flex items-center justify-between px-2 py-1.5 hover:bg-[#333] cursor-pointer text-xs"
                >
                  <span className="text-stone-300">{p.label}</span>
                  {activePreset === p.label && <Check size={12} className="text-amber-500" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
