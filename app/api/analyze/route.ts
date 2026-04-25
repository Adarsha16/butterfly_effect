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
      
      const lyapunovs = historicalContext.map((t: any) => t.chaos.lyapunov);
      const avgLyapunov = (lyapunovs.reduce((a: number, b: number) => a + b, 0) / lyapunovs.length).toFixed(3);
      const maxLyapunov = Math.max(...lyapunovs).toFixed(3);

      historySummary = `Over the last ${historicalContext.length} days:
- Price has shifted by ${priceChange}%
- The average Lyapunov proxy was ${avgLyapunov} (Peaking at ${maxLyapunov})`;
    }

    const prompt = `You are an institutional quantitative risk AI. Analyze this market state for the S&P 500.

CURRENT STATE (Date: ${currentTick.date}):
- RSI: ${currentTick.traditional.rsi}
- Moving Avg: ${currentTick.traditional.moving_avg}
- Signal: "${currentTick.traditional.signal}"
- Lyapunov proxy: ${currentTick.chaos.lyapunov} (Critical > 1.0)
- Health Score: ${currentTick.chaos.health_score}

30-DAY CONTEXT:
${historySummary}

Write a 3-sentence urgent executive brief resolving the conflict. Synthesize the historical trend with the current state to sound convincing and predictive. Be direct, professional, and slightly dramatic. If the Lyapunov proxy is near or above 1.0, warn of an imminent structural crash.`;

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
