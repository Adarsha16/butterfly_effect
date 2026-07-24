# Quant-Terminal v2.1: Tail-Risk Early Warning System 📉🌪️

Quant-Terminal is an advanced quantitative finance dashboard designed to detect systemic market fragility and predict tail-risk events (crashes) before they happen. By combining traditional technical analysis with non-linear dynamics (Chaos Theory) and an AI-powered risk synthesis engine, it provides institutional-grade insights into market stability.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwind-css)

##  Key Features

* **Chaos Math Engine**: Replaces traditional linear models with non-linear dynamics. Calculates Lyapunov exponent proxies, variance regime shifts, and multi-factor stress composites (Credit, Yield Curve, Breadth, Macro, VIX).
* **3D Phase Space Attractor**: Visualizes market memory using Takens' delay embedding theorem. Renders a 3D plot to identify stable equilibriums (tight clusters) vs. systemic stress (wide dispersion).
* **AI Quant Copilot**: Integrates with Google Gemini 2.5 Flash to automatically synthesize 30-day historical context and current data ticks into urgent, executive-level risk briefs.
* **Live & Historical Data Feeds**: Connects directly to Yahoo Finance (`yahoo-finance2`) for live ticker searches, or simulates historical presets like the **Historical Crash of 2008**.
* **Simulation Playback**: Interactive timeline scrubber with variable playback speeds to "watch" crashes unfold in real-time.
* **Custom CSV Upload**: Drop in your own backtest data (Date, Close) to analyze custom assets.

## Tech Stack

* **Framework:** Next.js 16 (App Router), React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4, custom terminal-style UI
* **Charting:** Recharts (2D indicators), Plotly.js (3D Attractor Visualizations)
* **AI / LLM:** Google Gen AI SDK (`@google/genai`)
* **Data Processing:** `yahoo-finance2` (Market data), `papaparse` (CSV ingestion)

## The Mathematics Behind the Engine

The core math engine (`utils/financeMath.ts`) calculates a proprietary **Early Warning Index (EWI)** and **Instability Probability** by weighting exogenous market factors:
1. **Volatility Regime Ratios** (Short vs. Long Variance)
2. **Credit Stress** (High Yield vs. Treasury spreads: HYG/IEF)
3. **Yield Curve Stress** (10Y vs 3M inversion: TNX/IRX)
4. **Market Breadth** (Russell 2000 vs S&P 500 weakness)
5. **Macro Stress** (Copper/Oil ratios & Dollar Index shocks)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/quant-terminal.git
cd quant-terminal
```
### 2. Install dependencies
```bash

npm install
# or yarn install / pnpm install
```
### 3. Set up environment variables

Create a .env.local file in the root directory and add your Google Gemini API key (required for the AI Copilot):
code Env

GEMINI_API_KEY=your_gemini_api_key_here

### 4. Run the development server
code Bash

npm run dev

Open http://localhost:3000 with your browser to see the dashboard.
