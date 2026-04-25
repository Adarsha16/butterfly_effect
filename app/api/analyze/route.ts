import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const currentTick = payload.currentTick;
    const historicalContext = payload.historicalContext || [];

    if (!currentTick) {
      return NextResponse.json({ summary: "No data tick provided." }, { status: 400 });
    }

    // Process historical context
    let historySummary = "No historical context available.";
    if (historicalContext.length > 0) {
      const startPrice = historicalContext[0].price;
      const endPrice = currentTick.price;
      const priceChange = (((endPrice - startPrice) / startPrice) * 100).toFixed(2);

      const ewis = historicalContext.map((t: any) => t.chaos.early_warning_index ?? 0);
      const probs = historicalContext.map((t: any) => t.chaos.instability_probability ?? 0);
      const avgEwi = (ewis.reduce((a: number, b: number) => a + b, 0) / ewis.length).toFixed(1);
      const maxEwi = Math.max(...ewis).toFixed(0);
      const avgProb = (probs.reduce((a: number, b: number) => a + b, 0) / probs.length).toFixed(1);
      const maxProb = Math.max(...probs).toFixed(0);
      const marketStress = historicalContext.map((t: any) => t.chaos.market_stress ?? 0);
      const avgMarketStress = (marketStress.reduce((a: number, b: number) => a + b, 0) / marketStress.length).toFixed(1);
      const curveStress = historicalContext.map((t: any) => t.chaos.curve_stress ?? 0);
      const avgCurveStress = (curveStress.reduce((a: number, b: number) => a + b, 0) / curveStress.length).toFixed(1);

      historySummary = `Over the last ${historicalContext.length} days:
- Price has shifted by ${priceChange}%
    - Average Early Warning Index was ${avgEwi} (peaking at ${maxEwi})
    - Average Crash Probability was ${avgProb}% (peaking at ${maxProb}%)
    - Average Cross-Market Stress was ${avgMarketStress}
    - Average Curve Stress was ${avgCurveStress}`;
    }

    const prompt = `You are an institutional quantitative risk AI. Analyze this market state for the S&P 500.

CURRENT STATE (Date: ${currentTick.date}):
- RSI: ${currentTick.traditional.rsi}
- Moving Avg: ${currentTick.traditional.moving_avg}
- Signal: "${currentTick.traditional.signal}"
- Lyapunov proxy: ${currentTick.chaos.lyapunov}
- Early Warning Index: ${currentTick.chaos.early_warning_index} (critical >= 70)
- Instability Probability: ${currentTick.chaos.instability_probability}%
- Estimated Lead Time: ${currentTick.chaos.lead_time_days} days
- Cross-Market Stress: ${currentTick.chaos.market_stress}
- VIX Stress: ${currentTick.chaos.vix_stress}
- Credit Stress: ${currentTick.chaos.credit_stress}
- Curve Stress: ${currentTick.chaos.curve_stress}
- Breadth Stress: ${currentTick.chaos.breadth_stress}
- Macro Stress: ${currentTick.chaos.macro_stress}
- Health Score: ${currentTick.chaos.health_score}

30-DAY CONTEXT:
${historySummary}

Write a 3-sentence urgent executive brief resolving the conflict. Synthesize the historical trend with the current state to sound convincing and predictive. Be direct, professional, and slightly dramatic. If Early Warning Index >= 70 or Instability Probability >= 65%, issue an explicit near-term crash warning and reference lead time.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || "No response generated.";

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error("AI Analysis error:", error);
    return NextResponse.json({ summary: "SYSTEM ERROR: Unable to reach AI core." }, { status: 500 });
  }
}
