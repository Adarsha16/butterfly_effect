"use client";
import React from 'react';
import { useSimulation } from '@/app/contexts/SimulationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function TraditionalView() {
  const { data, currentIndex, currentTick, isLoadingData } = useSimulation();
  const visibleData = data.slice(0, currentIndex + 1);

  if (isLoadingData) return <div className="p-4 border-r border-[#333] bg-[#0a0a0a] h-full col-span-4 text-stone-500 font-mono text-sm uppercase">Initializing Data Feed...</div>;
  if (!currentTick) return <div className="p-4 border-r border-[#333] bg-[#0a0a0a] h-full col-span-4 text-stone-500 font-mono text-sm uppercase">Awaiting Tick Data...</div>;

  const isOversold = currentTick.traditional.signal.includes('Buy');
  const isOverbought = currentTick.traditional.signal.includes('Sell');

  return (
    <div className="p-4 border-r border-[#333] bg-[#0a0a0a] h-full flex flex-col gap-4 col-span-4 font-mono">
      <h2 className="text-sm font-bold text-stone-300 uppercase tracking-widest border-b border-[#333] pb-2">Traditional Indicators</h2>
      
      {/* Price vs MA */}
      <div className="flex-1 min-h-[250px] bg-[#111] p-3 border border-[#333]">
        <h3 className="text-xs text-stone-500 mb-2 uppercase">Price / 50-Day MA</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="2 4" stroke="#222" />
            <XAxis dataKey="date" stroke="#555" tick={{fontSize: 10, fill: '#888'}} tickMargin={10} minTickGap={30} />
            <YAxis domain={['auto', 'auto']} stroke="#555" tick={{fontSize: 10, fill: '#888'}} width={40} />
            <Tooltip 
              contentStyle={{backgroundColor: '#000', borderColor: '#444', fontFamily: 'monospace', fontSize: '11px', color: '#ccc'}} 
              itemStyle={{color: '#ccc'}}
            />
            <Line type="monotone" dataKey="price" stroke="#a8a29e" dot={false} strokeWidth={1.5} name="Price" isAnimationActive={false} />
            <Line type="monotone" dataKey="traditional.moving_avg" stroke="#d97706" dot={false} strokeWidth={1.5} name="Moving Avg" isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RSI */}
      <div className="h-[200px] bg-[#111] p-3 border border-[#333]">
        <h3 className="text-xs text-stone-500 mb-2 uppercase">Relative Strength Index (14)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="2 4" stroke="#222" />
            <XAxis dataKey="date" stroke="#555" tick={{fontSize: 10, fill: '#888'}} tickMargin={10} minTickGap={30} />
            <YAxis domain={[0, 100]} stroke="#555" tick={{fontSize: 10, fill: '#888'}} width={30} />
            <Tooltip 
              contentStyle={{backgroundColor: '#000', borderColor: '#444', fontFamily: 'monospace', fontSize: '11px', color: '#ccc'}}
            />
            <ReferenceLine y={70} stroke="#991b1b" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#065f46" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="traditional.rsi" stroke="#0ea5e9" dot={false} strokeWidth={1.5} name="RSI" isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status Box */}
      <div className="p-3 bg-[#111] border border-[#333] flex justify-between items-center">
        <p className="text-xs text-stone-500 uppercase">Trad. Signal</p>
        <p className={`text-sm font-bold uppercase ${isOversold ? 'text-emerald-500' : isOverbought ? 'text-red-500' : 'text-stone-300'}`}>
          [{currentTick.traditional.signal}]
        </p>
      </div>
    </div>
  );
}
