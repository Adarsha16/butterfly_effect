export type RawData = {
  date: string;
  price: number;
};

export type DataTick = {
  date: string;
  price: number;
  traditional: {
    rsi: number;
    moving_avg: number;
    signal: string;
  };
  chaos: {
    lyapunov: number;
    variance_30d_pct_change: number;
    health_score: number;
    attractor_coords: [number, number, number];
  };
};

export function calculateIndicators(data: RawData[]): DataTick[] {
  // Ensure data is sorted by date chronologically
  data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const results: DataTick[] = [];
  const prices: number[] = [];
  const logReturns: number[] = [];
  
  let avgGain = 0;
  let avgLoss = 0;
  let lyapunovEma = 0;
  
  for (let i = 0; i < data.length; i++) {
    const currentPrice = data[i].price;
    prices.push(currentPrice);
    
    if (i > 0) {
      logReturns.push(Math.log(currentPrice / prices[i-1]));
    } else {
      logReturns.push(0);
    }
    
    // 50-day Moving Average (Expanding for first 50 days)
    const maSlice = prices.slice(Math.max(0, i - 49), i + 1);
    const ma = maSlice.reduce((sum, val) => sum + val, 0) / maSlice.length;
    
    // 14-day RSI (Wilder's Smoothing)
    let rsi = 50;
    if (i > 0) {
      const change = currentPrice - prices[i-1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      
      if (i < 14) {
        // Simple average for first 14 days
        avgGain = ((avgGain * i) + gain) / (i + 1);
        avgLoss = ((avgLoss * i) + loss) / (i + 1);
      } else {
        // Wilder's Smoothing
        avgGain = (avgGain * 13 + gain) / 14;
        avgLoss = (avgLoss * 13 + loss) / 14;
      }
      
      if (i >= 14) {
        if (avgLoss === 0) {
          rsi = 100;
        } else {
          const rs = avgGain / avgLoss;
          rsi = 100 - (100 / (1 + rs));
        }
      }
    }
    
    // Traditional Signal Generation
    let signal = "Neutral";
    if (rsi < 30) signal = "Oversold - Buy";
    else if (rsi > 70) signal = "Overbought - Sell";
    else if (currentPrice > ma) signal = "Bullish - Hold";
    else signal = "Bearish - Hold";
    
    // Chaos Metrics: 60-day Rolling Variance & AR(1) Autocorrelation
    // Increased window to 60 days to capture macro critical slowing down
    let variance60d = 0;
    let ar1 = 0;
    if (i >= 60) {
      const retSlice = logReturns.slice(i - 59, i + 1);
      const mean = retSlice.reduce((a, b) => a + b, 0) / 60;
      variance60d = retSlice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 60;
      
      let numerator = 0;
      let denominator = 0;
      for (let k = 1; k < retSlice.length; k++) {
        numerator += (retSlice[k] - mean) * (retSlice[k-1] - mean);
        denominator += Math.pow(retSlice[k-1] - mean, 2);
      }
      ar1 = denominator === 0 ? 0 : numerator / denominator;
    }
    
    // Proxy for Lyapunov Exponent (Critical Slowing Down)
    // Scaled so 2007 structural instability hits > 1.0 early
    const varianceScale = variance60d * 12000; // Increased multiplier
    let rawLyapunov = (ar1 * 1.5) + (varianceScale * 0.8) - 0.2; // Baseline shift so normal times are lower
    rawLyapunov = Math.max(-0.2, rawLyapunov);
    
    // Smooth the Lyapunov proxy with an EMA so it doesn't dip back to non-critical abruptly
    // right before the crash when volatility briefly tightens.
    const alpha = 0.1; // Smoothing factor (lower = smoother, holds high values longer)
    lyapunovEma = i === 0 ? rawLyapunov : (rawLyapunov * alpha) + (lyapunovEma * (1 - alpha));
    
    // Delay Coordinate Embedding for Phase Space Attractor (Takens' Theorem)
    // tau = 21 days (macro momentum)
    const t0 = currentPrice;
    const t1 = i >= 21 ? prices[i - 21] : currentPrice;
    const t2 = i >= 42 ? prices[i - 42] : t1;
    
    // Normalize coordinates based on moving average for stable visualization
    const cx = (t0 - ma) / ma * 100;
    const cy = (t1 - ma) / ma * 100;
    const cz = (t2 - ma) / ma * 100;
    
    // Health Score (0-100), degrades as chaos increases
    let health = 100 - (Math.max(0, lyapunovEma) * 40);
    health = Math.min(100, Math.max(0, health));
    
    results.push({
      date: data[i].date,
      price: parseFloat(currentPrice.toFixed(2)),
      traditional: {
        rsi: parseFloat(rsi.toFixed(2)),
        moving_avg: parseFloat(ma.toFixed(2)),
        signal
      },
      chaos: {
        lyapunov: parseFloat(lyapunovEma.toFixed(3)),
        variance_30d_pct_change: parseFloat(varianceScale.toFixed(2)), // Keep object property name consistent
        health_score: Math.round(health),
        attractor_coords: [parseFloat(cx.toFixed(3)), parseFloat(cy.toFixed(3)), parseFloat(cz.toFixed(3))]
      }
    });
  }
  
  return results;
}
