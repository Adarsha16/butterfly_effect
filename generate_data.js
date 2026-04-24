const fs = require('fs');
const path = require('path');

const data = [];

let price = 1500;
let ma = 1480;
let lyapunov = 0.01;
let variance = 2;
let health = 95;

for (let i = 0; i < 100; i++) {
  const date = new Date(2007, 0, 1);
  date.setDate(date.getDate() + (i * 6)); // roughly 600 days -> 100 ticks

  // Add some randomness
  price += (Math.random() - 0.45) * 15; 
  ma += (price - ma) * 0.1;
  
  // Traditional signals
  let rsi = 50 + (Math.random() * 20 - 10);
  let signal = "Hold";
  if (i > 80) {
    rsi = 35 + (Math.random() * 10 - 5); // oversold
  }
  
  // Chaos metrics
  if (i > 70) {
    lyapunov += 0.05 + Math.random() * 0.05;
    variance += 2 + Math.random() * 5;
    health -= 3 + Math.random() * 2;
  } else {
    lyapunov += (Math.random() - 0.5) * 0.01;
  }

  // Generate attractor coordinates (lorenz-like or spiral)
  const t = i * 0.1;
  const cx = Math.sin(t) * (1 + lyapunov);
  const cy = Math.cos(t) * (1 + lyapunov);
  const cz = Math.sin(t * 0.5) * variance * 0.1;

  data.push({
    date: date.toISOString().split('T')[0],
    price: parseFloat(price.toFixed(2)),
    traditional: {
      rsi: parseFloat(rsi.toFixed(2)),
      moving_avg: parseFloat(ma.toFixed(2)),
      signal: i > 80 ? "Oversold - Buy" : "Bullish - Hold"
    },
    chaos: {
      lyapunov: parseFloat(Math.max(0, lyapunov).toFixed(3)),
      variance_30d_pct_change: parseFloat(variance.toFixed(2)),
      health_score: Math.max(0, parseInt(health)),
      attractor_coords: [parseFloat(cx.toFixed(3)), parseFloat(cy.toFixed(3)), parseFloat(cz.toFixed(3))]
    }
  });
}

const dir = path.join(__dirname, 'public');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

fs.writeFileSync(path.join(dir, 'data.json'), JSON.stringify(data, null, 2));
console.log('Mock data generated successfully in public/data.json');
