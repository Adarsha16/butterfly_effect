"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Data types based on data.json
export type DataTick = {
  date: string;
  price: number;
  traditional: {
    rsi: number;
    moving_avg: number;
    signal: string;
  };
  chaos: {
    lyapunov: number;
    variance_30d_pct_change: number;
    health_score: number;
    attractor_coords: [number, number, number];
  };
};

type SimulationContextType = {
  data: DataTick[];
  currentIndex: number;
  isPlaying: boolean;
  togglePlay: () => void;
  fastForward: () => void;
  reset: () => void;
  currentTick: DataTick | null;
  speedMs: number;
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<DataTick[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1000);

  useEffect(() => {
    // Fetch data.json
    fetch('/data.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load data.json", err));
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && data.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= data.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, data.length, speedMs]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const fastForward = () => setSpeedMs(prev => prev === 1000 ? 250 : 1000);
  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const currentTick = data.length > 0 ? data[currentIndex] : null;

  return (
    <SimulationContext.Provider value={{ data, currentIndex, isPlaying, togglePlay, fastForward, reset, currentTick, speedMs }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error("useSimulation must be used within a SimulationProvider");
  return context;
};
