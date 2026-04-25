"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { useSimulation } from '@/app/contexts/SimulationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ChaosView() {
  const { data, currentIndex, currentTick } = useSimulation();
  
  const visibleData = data.slice(0, currentIndex + 1);
  const trailing30Data = visibleData.slice(Math.max(0, visibleData.length - 30));

  if (!currentTick) return <div className="p-4 border-r border-slate-800 bg-slate-900/20 h-full col-span-4">Loading...</div>;

  // Prepare 3D Attractor Data
  const attractorX = trailing30Data.map(d => d.chaos.attractor_coords[0]);
  const attractorY = trailing30Data.map(d => d.chaos.attractor_coords[1]);
  const attractorZ = trailing30Data.map(d => d.chaos.attractor_coords[2]);

  // Health Gauge logic
  const health = currentTick.chaos.health_score;
  const isCritical = currentTick.chaos.lyapunov > 1.0;

  return (
    <div className="p-4 border-r border-slate-800 bg-slate-900/20 h-full flex flex-col gap-4 col-span-4">
      <h2 className="text-lg font-semibold text-slate-200 flex justify-between items-center">
        <span>Chaos Engine</span>
        {isCritical && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full animate-pulse border border-red-500/50">CRITICAL STATE</span>}
      </h2>

      {/* 3D Attractor */}
      <div className="flex-1 min-h-[250px] bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden relative shadow-inner">
        <h3 className="text-sm text-slate-400 absolute top-4 left-4 z-10">Phase Space Attractor (30d)</h3>
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
                  size: 4,
                  color: attractorZ,
                  colorscale: 'Viridis',
                },
                line: {
                  color: '#6366f1',
                  width: 2,
                },
              },
            ]}
            layout={{
              autosize: true,
              margin: { l: 0, r: 0, b: 0, t: 0 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              scene: {
                xaxis: { showbackground: false, showgrid: false, zeroline: false, showticklabels: false },
                yaxis: { showbackground: false, showgrid: false, zeroline: false, showticklabels: false },
                zaxis: { showbackground: false, showgrid: false, zeroline: false, showticklabels: false },
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
      <div className={`h-[80px] rounded-xl p-4 border transition-colors duration-500 flex items-center justify-between ${isCritical ? 'bg-red-900/20 border-red-800' : 'bg-slate-800/50 border-slate-700'}`}>
        <div>
          <h3 className="text-sm text-slate-400">Chaos Health Score</h3>
          <p className="text-xs text-slate-500">System Stability</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`text-3xl font-bold transition-all ${isCritical ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-emerald-400'}`}>
              {health}
            </span>
            <span className="text-slate-500 text-sm ml-1">/ 100</span>
          </div>
        </div>
      </div>

      {/* Lyapunov / Variance Chart */}
      <div className="h-[200px] bg-slate-950/50 rounded-xl p-4 border border-slate-800 shadow-inner relative">
        <h3 className="text-sm text-slate-400 mb-2">Lyapunov Exponent & Variance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} />
            <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} />
            <YAxis yAxisId="right" orientation="right" stroke="#eab308" tick={{fontSize: 10}} />
            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b'}} />
            <ReferenceLine yAxisId="left" y={1.0} stroke="#ef4444" strokeDasharray="3 3" label={{position: 'insideTopLeft', value: 'Critical Threshold', fill: '#ef4444', fontSize: 10}} />
            <Line yAxisId="left" type="monotone" dataKey="chaos.lyapunov" stroke="#ef4444" dot={false} strokeWidth={2} name="Lyapunov" />
            <Line yAxisId="right" type="monotone" dataKey="chaos.variance_30d_pct_change" stroke="#eab308" dot={false} strokeWidth={2} name="Variance %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
