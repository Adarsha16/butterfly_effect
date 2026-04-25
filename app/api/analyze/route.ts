import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const tick = await req.json();

    const prompt = `You are an institutional risk AI. Analyze this market state vector for the S&P 500. 
The traditional signals say: RSI is ${tick.traditional.rsi}, Moving Avg is ${tick.traditional.moving_avg}, Signal is "${tick.traditional.signal}".
The Chaos metrics say: Lyapunov exponent is ${tick.chaos.lyapunov}, Variance is ${tick.chaos.variance_30d_pct_change}%, Health Score is ${tick.chaos.health_score}.
Write a 3-sentence urgent executive brief resolving the conflict. Be direct, professional, and slightly dramatic. If Lyapunov > 1.0, warn of an imminent crash.`;

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
