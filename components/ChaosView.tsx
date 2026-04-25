"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { useSimulation } from '@/app/contexts/SimulationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ChaosView() {
  const { data, currentIndex, currentTick, isLoadingData } = useSimulation();
  
  const visibleData = data.slice(0, currentIndex + 1);
  const trailing30Data = visibleData.slice(Math.max(0, visibleData.length - 30));

  if (isLoadingData) return <div className="p-4 border-r border-[#333] bg-[#0a0a0a] h-full col-span-4 text-stone-500 font-mono text-sm uppercase">Initializing Math Engine...</div>;
  if (!currentTick) return <div className="p-4 border-r border-[#333] bg-[#0a0a0a] h-full col-span-4 text-stone-500 font-mono text-sm uppercase">Awaiting Chaos Metrics...</div>;

  // Prepare 3D Attractor Data
  const attractorX = trailing30Data.map(d => d.chaos.attractor_coords[0]);
  const attractorY = trailing30Data.map(d => d.chaos.attractor_coords[1]);
  const attractorZ = trailing30Data.map(d => d.chaos.attractor_coords[2]);

  // Health Gauge logic
  const health = currentTick.chaos.health_score;
  const isCritical = currentTick.chaos.lyapunov > 1.0;

  return (
    <div className="p-4 border-r border-[#333] bg-[#0a0a0a] h-full flex flex-col gap-4 col-span-4 font-mono">
      <h2 className="text-sm font-bold text-stone-300 uppercase tracking-widest border-b border-[#333] pb-2 flex justify-between items-center">
        <span>Chaos Engine</span>
        {isCritical && <span className="text-[10px] bg-amber-900/40 text-amber-500 px-2 py-0.5 border border-amber-700/50">CRITICAL STATE</span>}
      </h2>

      {/* 3D Attractor */}
      <div className="flex-1 min-h-[250px] bg-[#111] border border-[#333] overflow-hidden relative p-3">
        <h3 className="text-xs text-stone-500 absolute top-3 left-3 z-10 uppercase">Phase Space Attractor [30D delay-coord]</h3>
        <div className="w-full h-full flex items-center justify-center">
          <Plot
            data={[
              {
                x: attractorX,
                y: attractorY,
                z: attractorZ,
                type: 'scatter3d',
                mode: 'lines+markers',
                marker: {
                  size: 3,
                  color: attractorZ,
                  colorscale: 'YlOrRd',
                },
                line: {
                  color: '#d97706',
                  width: 1.5,
                },
              },
            ]}
            layout={{
              autosize: true,
              margin: { l: 0, r: 0, b: 0, t: 0 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              scene: {
                xaxis: { showbackground: false, showgrid: true, gridcolor: '#333', zeroline: false, showticklabels: false },
                yaxis: { showbackground: false, showgrid: true, gridcolor: '#333', zeroline: false, showticklabels: false },
                zaxis: { showbackground: false, showgrid: true, gridcolor: '#333', zeroline: false, showticklabels: false },
                camera: { eye: { x: 1.5, y: 1.5, z: 0.5 } }
              }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>

      {/* Health Score Gauge */}
      <div className={`p-3 border flex items-center justify-between ${isCritical ? 'bg-amber-950/20 border-amber-800' : 'bg-[#111] border-[#333]'}`}>
        <div>
          <h3 className="text-xs text-stone-500 uppercase">System Stability Index</h3>
          <p className="text-[10px] text-stone-600 uppercase mt-1">Structural Health</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className={`text-2xl font-bold ${isCritical ? 'text-amber-500' : 'text-stone-300'}`}>
              {health}
            </span>
            <span className="text-stone-600 text-xs ml-1">/ 100</span>
          </div>
        </div>
      </div>

      {/* Lyapunov / Variance Chart */}
      <div className="h-[200px] bg-[#111] border border-[#333] p-3 relative">
        <h3 className="text-xs text-stone-500 mb-2 uppercase">Lyapunov Proxy / Volatility</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="2 4" stroke="#222" />
            <XAxis dataKey="date" stroke="#555" tick={{fontSize: 10, fill: '#888'}} tickMargin={10} minTickGap={30} />
            <YAxis yAxisId="left" stroke="#d97706" tick={{fontSize: 10, fill: '#888'}} width={30} />
            <YAxis yAxisId="right" orientation="right" stroke="#0284c7" tick={{fontSize: 10, fill: '#888'}} width={30} />
            <Tooltip 
              contentStyle={{backgroundColor: '#000', borderColor: '#444', fontFamily: 'monospace', fontSize: '11px', color: '#ccc'}} 
            />
            <ReferenceLine yAxisId="left" y={1.0} stroke="#d97706" strokeDasharray="3 3" />
            <Line yAxisId="left" type="monotone" dataKey="chaos.lyapunov" stroke="#d97706" dot={false} strokeWidth={1.5} name="Lyapunov Proxy" isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="chaos.variance_30d_pct_change" stroke="#0284c7" dot={false} strokeWidth={1.5} name="Variance (scaled)" isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
