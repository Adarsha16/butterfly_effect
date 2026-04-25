"use client";
import React from 'react';
import { useSimulation } from '@/app/contexts/SimulationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function TraditionalView() {
  const { data, currentIndex, currentTick } = useSimulation();
  const visibleData = data.slice(0, currentIndex + 1);

  if (!currentTick) return <div className="p-4 border-r border-slate-800 bg-slate-900/30 h-full col-span-4">Loading...</div>;

  const isOversold = currentTick.traditional.signal.includes('Buy');

  return (
    <div className="p-4 border-r border-slate-800 bg-slate-900/30 h-full flex flex-col gap-4 col-span-4">
      <h2 className="text-lg font-semibold text-slate-200">Traditional View</h2>
      
      {/* Price vs MA */}
      <div className="flex-1 min-h-[250px] bg-slate-950/50 rounded-xl p-4 border border-slate-800 shadow-inner">
        <h3 className="text-sm text-slate-400 mb-2">Price vs Moving Average</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} />
            <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fontSize: 10}} />
            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b'}} />
            <Line type="monotone" dataKey="price" stroke="#3b82f6" dot={false} strokeWidth={2} name="Price" />
            <Line type="monotone" dataKey="traditional.moving_avg" stroke="#f59e0b" dot={false} strokeWidth={2} name="Moving Avg" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RSI */}
      <div className="h-[200px] bg-slate-950/50 rounded-xl p-4 border border-slate-800 shadow-inner">
        <h3 className="text-sm text-slate-400 mb-2">RSI (Relative Strength Index)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} />
            <YAxis domain={[0, 100]} stroke="#64748b" tick={{fontSize: 10}} />
            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b'}} />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="traditional.rsi" stroke="#a855f7" dot={false} strokeWidth={2} name="RSI" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status Box */}
      <div className={`p-4 rounded-xl border transition-colors duration-500 ${isOversold ? 'bg-emerald-900/20 border-emerald-800' : 'bg-slate-800/50 border-slate-700'}`}>
        <p className="text-sm text-slate-400">Traditional Market Sentiment:</p>
        <p className={`text-xl font-bold ${isOversold ? 'text-emerald-400' : 'text-slate-200'}`}>
          {currentTick.traditional.signal}
        </p>
      </div>
    </div>
  );
}
