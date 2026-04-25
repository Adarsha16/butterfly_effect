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
  const attractorColor = trailing30Data.map(d => d.chaos.early_warning_index);

  // Health Gauge logic
  const health = currentTick.chaos.health_score;
  const isCritical = currentTick.chaos.early_warning_index >= 70 || currentTick.chaos.instability_probability >= 65;

  return (
    <div className="p-4 border-r border-[#333] bg-[#0a0a0a] h-full flex flex-col gap-4 col-span-4 font-mono">
      <h2 className="text-sm font-bold text-stone-300 uppercase tracking-widest border-b border-[#333] pb-2 flex justify-between items-center">
        <span>Chaos Engine</span>
        {isCritical && <span className="text-[10px] bg-amber-900/40 text-amber-500 px-2 py-0.5 border border-amber-700/50">CRITICAL STATE</span>}
      </h2>

      {/* 3D Attractor */}
      <div className="flex-1 min-h-[250px] bg-[#111] border border-[#333] overflow-hidden relative p-3">
        <div className="absolute top-3 left-3 z-10">
          <h3 className="text-xs text-stone-300 uppercase font-bold">Phase Space Attractor [30D]</h3>
          <p className="text-[10px] text-stone-500 mt-1 uppercase">
            {isCritical ? (
              <span className="text-amber-500 font-bold">⚠️ WIDE DISPERSION: High systemic stress (BAD)</span>
            ) : (
              <span className="text-emerald-500 font-bold">✓ TIGHT CLUSTERS: Stable equilibrium (GOOD)</span>
            )}
          </p>
        </div>
        <div className="w-full h-full flex items-center justify-center pt-8">
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
                  color: attractorColor,
                  colorscale: 'Portland',
                  cmin: 0,
                  cmax: 100,
                },
                line: {
                  color: '#444',
                  width: 1,
                },
              },
            ]}
            layout={{
              autosize: true,
              margin: { l: 0, r: 0, b: 0, t: 0 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              scene: {
                xaxis: { title: { text: 'P(t)', font: { color: '#888', size: 10 } }, showbackground: false, showgrid: true, gridcolor: '#333', zeroline: false, showticklabels: true, tickfont: { color: '#888', size: 10 } },
                yaxis: { title: { text: 'P(t-21)', font: { color: '#888', size: 10 } }, showbackground: false, showgrid: true, gridcolor: '#333', zeroline: false, showticklabels: true, tickfont: { color: '#888', size: 10 } },
                zaxis: { title: { text: 'P(t-42)', font: { color: '#888', size: 10 } }, showbackground: false, showgrid: true, gridcolor: '#333', zeroline: false, showticklabels: true, tickfont: { color: '#888', size: 10 } },
                camera: { eye: { x: 1.8, y: 1.8, z: 0.8 } }
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
          <p className="text-[10px] text-stone-600 uppercase mt-1">
            EWI {currentTick.chaos.early_warning_index} | Crash Prob {currentTick.chaos.instability_probability}%
          </p>
          <p className="text-[10px] text-stone-600 uppercase mt-1">
            Mkt {currentTick.chaos.market_stress} | Curve {currentTick.chaos.curve_stress} | Breadth {currentTick.chaos.breadth_stress}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className={`text-2xl font-bold ${isCritical ? 'text-amber-500' : 'text-stone-300'}`}>
              {health}
            </span>
            <span className="text-stone-600 text-xs ml-1">/ 100</span>
            <p className="text-[10px] text-stone-500 mt-1 uppercase">
              Lead Time: {currentTick.chaos.lead_time_days}d
            </p>
          </div>
        </div>
      </div>

      {/* Predictive Chaos Chart */}
      <div className="h-[200px] bg-[#111] border border-[#333] p-3 relative">
        <h3 className="text-xs text-stone-500 mb-2 uppercase">Early Warning / Crash Probability / Market Stress</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="2 4" stroke="#222" />
            <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 10, fill: '#888' }} tickMargin={10} minTickGap={30} />
            <YAxis yAxisId="left" domain={[0, 100]} stroke="#d97706" tick={{ fontSize: 10, fill: '#888' }} width={30} />
            <YAxis yAxisId="right" domain={[0, 100]} orientation="right" stroke="#0284c7" tick={{ fontSize: 10, fill: '#888' }} width={30} />
            <Tooltip
              contentStyle={{ backgroundColor: '#000', borderColor: '#444', fontFamily: 'monospace', fontSize: '11px', color: '#ccc' }}
            />
            <ReferenceLine yAxisId="left" y={70} stroke="#d97706" strokeDasharray="3 3" />
            <Line yAxisId="left" type="monotone" dataKey="chaos.early_warning_index" stroke="#d97706" dot={false} strokeWidth={1.5} name="Early Warning Index" isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="chaos.instability_probability" stroke="#0284c7" dot={false} strokeWidth={1.5} name="Crash Probability %" isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="chaos.market_stress" stroke="#f43f5e" dot={false} strokeWidth={1.2} strokeDasharray="4 3" name="Market Stress" isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
