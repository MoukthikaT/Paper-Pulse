import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, TrendingUp, Award, BarChart3, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { sounds } from '../utils/soundEffects';

const StrategyBacktester = ({ stockSymbol = 'TCS', historicalData = [] }) => {
  const [strategy, setStrategy] = useState('ai_momentum'); // ai_momentum, buy_hold, sma_crossover
  const [initialCapital, setInitialCapital] = useState(100000);
  const [isSimulated, setIsSimulated] = useState(false);

  const backtestResults = useMemo(() => {
    if (!historicalData || historicalData.length < 5) return null;

    const prices = [...historicalData];
    let cash = initialCapital;
    let shares = 0;
    let tradesCount = 0;
    let winningTrades = 0;
    let lastBuyPrice = 0;
    const equityCurve = [];

    prices.forEach((item, index) => {
      const price = item.close;
      const date = item.date;

      if (strategy === 'buy_hold') {
        if (index === 0) {
          shares = Math.floor(cash / price);
          cash -= shares * price;
          tradesCount = 1;
        }
      } else if (strategy === 'ai_momentum') {
        // AI Momentum strategy: buy on positive momentum, sell on dip
        if (index >= 3) {
          const prev3 = prices[index - 3].close;
          const prev1 = prices[index - 1].close;
          const momentum = (price - prev3) / prev3;

          if (momentum > 0.015 && cash >= price * 5) {
            // BUY signal
            const buyQty = Math.min(Math.floor(cash / price), 10);
            if (buyQty > 0) {
              cash -= buyQty * price;
              shares += buyQty;
              lastBuyPrice = price;
              tradesCount++;
            }
          } else if (momentum < -0.015 && shares > 0) {
            // SELL signal
            if (price > lastBuyPrice) winningTrades++;
            cash += shares * price;
            shares = 0;
            tradesCount++;
          }
        }
      } else if (strategy === 'sma_crossover') {
        // Fast SMA (3) vs Slow SMA (7)
        if (index >= 7) {
          const sma3 = (prices[index].close + prices[index - 1].close + prices[index - 2].close) / 3;
          const sma7 = prices.slice(index - 6, index + 1).reduce((a, b) => a + b.close, 0) / 7;

          if (sma3 > sma7 && cash >= price * 5) {
            const buyQty = Math.min(Math.floor(cash / price), 10);
            if (buyQty > 0) {
              cash -= buyQty * price;
              shares += buyQty;
              lastBuyPrice = price;
              tradesCount++;
            }
          } else if (sma3 < sma7 && shares > 0) {
            if (price > lastBuyPrice) winningTrades++;
            cash += shares * price;
            shares = 0;
            tradesCount++;
          }
        }
      }

      const totalEquity = Math.round(cash + shares * price);
      equityCurve.push({
        date,
        equity: totalEquity,
        price
      });
    });

    // Close any open position on final day for net benchmark
    const finalPrice = prices[prices.length - 1].close;
    const finalTotalEquity = Math.round(cash + shares * finalPrice);
    const returnPct = Number((((finalTotalEquity - initialCapital) / initialCapital) * 100).toFixed(2));
    const winRate = tradesCount > 1 ? Math.round((winningTrades / Math.max(1, Math.floor(tradesCount / 2))) * 100) : (returnPct > 0 ? 100 : 0);

    return {
      finalEquity: finalTotalEquity,
      returnPct,
      tradesCount,
      winRate: Math.min(100, Math.max(0, winRate)),
      equityCurve
    };
  }, [historicalData, strategy, initialCapital]);

  const handleRunSimulation = () => {
    sounds.playTick();
    setIsSimulated(true);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent-pink)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Scenario Backtester ("What-If" Simulator)</h3>
          </div>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Simulate how algorithmic strategies would have performed on {stockSymbol}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select 
            className="input-field" 
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
            value={strategy} 
            onChange={(e) => { setStrategy(e.target.value); handleRunSimulation(); }}
          >
            <option value="ai_momentum">AI Momentum ML Engine</option>
            <option value="sma_crossover">SMA Trend Crossover</option>
            <option value="buy_hold">Passive Buy & Hold</option>
          </select>

          <button 
            className="btn-primary" 
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
            onClick={handleRunSimulation}
          >
            <PlayCircle size={15} /> Run Simulation
          </button>
        </div>
      </div>

      {backtestResults && (
        <div>
          {/* Performance KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Simulated Return</span>
              <h3 className="mono-font" style={{ margin: '0.2rem 0 0 0', fontSize: '1.15rem', color: backtestResults.returnPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {backtestResults.returnPct >= 0 ? '+' : ''}{backtestResults.returnPct}%
              </h3>
            </div>
            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Final Valuation</span>
              <h3 className="mono-font" style={{ margin: '0.2rem 0 0 0', fontSize: '1.15rem' }}>
                ₹{backtestResults.finalEquity.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Estimated Win Rate</span>
              <h3 className="mono-font" style={{ margin: '0.2rem 0 0 0', fontSize: '1.15rem', color: 'var(--accent-pink)' }}>
                {backtestResults.winRate}%
              </h3>
            </div>
            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Simulated Signals</span>
              <h3 className="mono-font" style={{ margin: '0.2rem 0 0 0', fontSize: '1.15rem' }}>
                {backtestResults.tradesCount}
              </h3>
            </div>
          </div>

          {/* Equity Curve Chart */}
          <div style={{ height: '180px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={backtestResults.equityCurve} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.8rem' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Portfolio Valuation']}
                />
                <Line type="monotone" dataKey="equity" stroke="var(--accent-pink)" strokeWidth={2.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyBacktester;
