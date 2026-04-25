"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Papa from 'papaparse';
import { calculateIndicators, DataTick } from '@/utils/financeMath';

type SimulationContextType = {
  data: DataTick[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  reset: () => void;
  currentTick: DataTick | null;
  loadCustomData: (csvString: string) => void;
  isLoadingData: boolean;
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<DataTick[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 4x, etc
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    setIsLoadingData(true);
    fetch('/api/yahoo')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsLoadingData(false);
      })
      .catch((err) => {
        console.error("Failed to load Yahoo Finance data", err);
        setIsLoadingData(false);
      });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && data.length > 0) {
      // Base speed is 1000ms. If speed is 2x, interval is 500ms.
      const intervalMs = Math.max(50, 1000 / playbackSpeed);
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= data.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, data.length, playbackSpeed]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const reset = () => {
    setCurrentIndex(0);
  };

  const loadCustomData = (csvString: string) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data.map((row: any) => {
          const dateStr = row['Date'] || row['date'] || row['Time'] || row['time'];
          const priceStr = row['Close'] || row['close'] || row['Price'] || row['price'];
          
          let date = new Date().toISOString().split('T')[0];
          if (dateStr) {
             const parsedDate = new Date(dateStr);
             if (!isNaN(parsedDate.getTime())) {
               date = parsedDate.toISOString().split('T')[0];
             }
          }
          const price = parseFloat(priceStr);

          return {
            date,
            price: isNaN(price) ? 0 : price
          };
        }).filter(item => item.price > 0);

        if (rawData.length > 0) {
          const computedData = calculateIndicators(rawData);
          setData(computedData);
          setCurrentIndex(0);
        } else {
          alert("Could not parse valid Date/Close columns from CSV.");
        }
      }
    });
  };

  const currentTick = data.length > 0 ? data[currentIndex] : null;

  return (
    <SimulationContext.Provider value={{ data, currentIndex, setCurrentIndex, isPlaying, togglePlay, playbackSpeed, setPlaybackSpeed, reset, currentTick, loadCustomData, isLoadingData }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error("useSimulation must be used within a SimulationProvider");
  return context;
};
