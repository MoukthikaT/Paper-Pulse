import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Activity, PlayCircle, TrendingUp, TrendingDown, 
  Award, BarChart3, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { sounds } from '../utils/soundEffects';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const StrategyLabPage = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState('TCS');
  const [strategy, setStrategy] = useState('ai_momentum');
  const [initialCapital, setInitialCapital] = useState(100000);
  const [fastPeriod, setFastPeriod] = useState(3);
  const [slowPeriod, setSlowPeriod] = useState(7);
  const [momentumThreshold, setMomentumThreshold] = useState(1.5);
  const [breakoutDays, setBreakoutDays] = useState(5);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/stocks`).then(res => setStocks(res.data.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedStock]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/stocks/${selectedStock}/history?limit=60`);
      setHistoricalData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const backtestResults = useMemo(() => {
    if (!historicalData || historicalData.length < 5) return null;

    const prices = [...historicalData];
    let cash = Number(initialCapital) || 100000;
    let shares = 0;
    let tradesCount = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let lastBuyPrice = 0;
    let bestTrade = 0;
    let worstTrade = 0;
    let peakEquity = cash;
    let maxDrawdown = 0;

    // Benchmark: Buy & Hold
    const bPriceStart = prices[0].close;
    const bShares = Math.floor(cash / bPriceStart);
    const bCashRem = cash - (bShares * bPriceStart);

    const equityCurve = [];

    prices.forEach((item, index) => {
      const price = item.close;
      const date = item.date;

      if (strategy === 'ai_momentum') {
        const lookback = Math.max(2, fastPeriod);
        if (index >= lookback) {
          const prev = prices[index - lookback].close;
          const momentum = (price - prev) / prev;
          const thresh = (momentumThreshold || 1.5) / 100;

          if (momentum > thresh && cash >= price * 5) {
            const buyQty = Math.min(Math.floor(cash / price), 10);
            if (buyQty > 0) {
              cash -= buyQty * price;
              shares += buyQty;
              lastBuyPrice = price;
              tradesCount++;
            }
          } else if (momentum < -thresh && shares > 0) {
            const pl = (price - lastBuyPrice) * shares;
            if (pl > 0) winningTrades++;
            else losingTrades++;

            if (pl > bestTrade) bestTrade = pl;
            if (pl < worstTrade) worstTrade = pl;

            cash += shares * price;
            shares = 0;
            tradesCount++;
          }
        }
      } else if (strategy === 'sma_crossover') {
        const fast = Math.max(2, fastPeriod);
        const slow = Math.max(fast + 1, slowPeriod);
        if (index >= slow) {
          const smaFast = prices.slice(index - fast + 1, index + 1).reduce((a, b) => a + b.close, 0) / fast;
          const smaSlow = prices.slice(index - slow + 1, index + 1).reduce((a, b) => a + b.close, 0) / slow;

          if (smaFast > smaSlow && cash >= price * 5) {
            const buyQty = Math.min(Math.floor(cash / price), 10);
            if (buyQty > 0) {
              cash -= buyQty * price;
              shares += buyQty;
              lastBuyPrice = price;
              tradesCount++;
            }
          } else if (smaFast < smaSlow && shares > 0) {
            const pl = (price - lastBuyPrice) * shares;
            if (pl > 0) winningTrades++;
            else losingTrades++;

            if (pl > bestTrade) bestTrade = pl;
            if (pl < worstTrade) worstTrade = pl;

            cash += shares * price;
            shares = 0;
            tradesCount++;
          }
        }
      } else if (strategy === 'custom_breakout') {
        const days = Math.max(3, breakoutDays);
        if (index >= days) {
          const highN = Math.max(...prices.slice(index - days, index).map(p => p.close));
          const lowN = Math.min(...prices.slice(index - days, index).map(p => p.close));

          if (price >= highN && cash >= price * 5) {
            const buyQty = Math.min(Math.floor(cash / price), 10);
            if (buyQty > 0) {
              cash -= buyQty * price;
              shares += buyQty;
              lastBuyPrice = price;
              tradesCount++;
            }
          } else if (price <= lowN && shares > 0) {
            const pl = (price - lastBuyPrice) * shares;
            if (pl > 0) winningTrades++;
            else losingTrades++;

            if (pl > bestTrade) bestTrade = pl;
            if (pl < worstTrade) worstTrade = pl;

            cash += shares * price;
            shares = 0;
            tradesCount++;
          }
        }
      }

      const totalEquity = Math.round(cash + shares * price);
      const benchmarkEquity = Math.round(bCashRem + bShares * price);

      if (totalEquity > peakEquity) peakEquity = totalEquity;
      const dd = ((peakEquity - totalEquity) / peakEquity) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;

      equityCurve.push({
        date,
        strategyEquity: totalEquity,
        benchmarkEquity
      });
    });

    const finalPrice = prices[prices.length - 1].close;
    const finalEquity = Math.round(cash + shares * finalPrice);
    const returnPct = Number((((finalEquity - initialCapital) / initialCapital) * 100).toFixed(2));

    const finalBenchmarkEquity = Math.round(bCashRem + bShares * finalPrice);
    const benchmarkReturnPct = Number((((finalBenchmarkEquity - initialCapital) / initialCapital) * 100).toFixed(2));

    const totalRealized = winningTrades + losingTrades;
    const winRate = totalRealized > 0 ? Math.round((winningTrades / totalRealized) * 100) : (returnPct > 0 ? 100 : 0);

    return {
      finalEquity,
      returnPct,
      finalBenchmarkEquity,
      benchmarkReturnPct,
      tradesCount,
      winningTrades,
      losingTrades,
      winRate,
      bestTrade: Math.round(bestTrade),
      worstTrade: Math.round(worstTrade),
      maxDrawdown: Number(maxDrawdown.toFixed(2)),
      equityCurve
    };
  }, [historicalData, strategy, initialCapital, fastPeriod, slowPeriod, momentumThreshold, breakoutDays]);

  return (
    <div style={{ paddingBottom: '3rem', width: '100%' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Strategy Lab & Algorithmic Backtester</h1>
            <span className="badge-buy" style={{ fontSize: '0.72rem' }}>VS BUY & HOLD BENCHMARK</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
            Simulate algorithmic trading models against historical datasets and benchmark vs passive index holding
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select 
            className="input-field mono-font" 
            value={selectedStock} 
            onChange={(e) => setSelectedStock(e.target.value)}
            style={{ fontWeight: 700 }}
          >
            {stocks.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="input-field" 
            value={strategy} 
            onChange={(e) => { setStrategy(e.target.value); sounds.playTick(); }}
          >
            <option value="ai_momentum">AI Momentum Strategy</option>
            <option value="sma_crossover">SMA Trend Crossover</option>
            <option value="custom_breakout">N-Day High Breakout</option>
          </select>
        </div>
      </div>

      {/* Parameter Tuning Strip */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'rgba(255,255,255,0.02)' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Strategy Hyperparameters:</span>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {strategy === 'ai_momentum' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span>Lookback: <strong>{fastPeriod} Days</strong></span>
              <input type="range" min="2" max="10" step="1" value={fastPeriod} onChange={e => setFastPeriod(Number(e.target.value))} style={{ accentColor: 'var(--accent-pink)', width: '80px' }} />
              <span style={{ marginLeft: '0.5rem' }}>Threshold: <strong>{momentumThreshold}%</strong></span>
              <input type="range" min="0.5" max="3" step="0.5" value={momentumThreshold} onChange={e => setMomentumThreshold(Number(e.target.value))} style={{ accentColor: 'var(--accent-cyan)', width: '80px' }} />
            </div>
          )}

          {strategy === 'sma_crossover' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span>Fast SMA: <strong>{fastPeriod}D</strong></span>
              <input type="range" min="2" max="7" step="1" value={fastPeriod} onChange={e => setFastPeriod(Number(e.target.value))} style={{ accentColor: 'var(--accent-pink)', width: '80px' }} />
              <span style={{ marginLeft: '0.5rem' }}>Slow SMA: <strong>{slowPeriod}D</strong></span>
              <input type="range" min="8" max="25" step="1" value={slowPeriod} onChange={e => setSlowPeriod(Number(e.target.value))} style={{ accentColor: 'var(--accent-cyan)', width: '80px' }} />
            </div>
          )}

          {strategy === 'custom_breakout' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span>High/Low Window: <strong>{breakoutDays} Days</strong></span>
              <input type="range" min="3" max="15" step="1" value={breakoutDays} onChange={e => setBreakoutDays(Number(e.target.value))} style={{ accentColor: 'var(--accent-green)', width: '90px' }} />
            </div>
          )}
        </div>
      </div>

      {backtestResults && (
        <div>
          {/* Strategy vs Benchmark Comparison Strip */}
          <div className="stats-grid">
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-pink)' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Strategy Net Return</span>
              <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: backtestResults.returnPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {backtestResults.returnPct >= 0 ? '+' : ''}{backtestResults.returnPct}%
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Final Value: ₹{backtestResults.finalEquity.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Buy & Hold Benchmark</span>
              <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: backtestResults.benchmarkReturnPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {backtestResults.benchmarkReturnPct >= 0 ? '+' : ''}{backtestResults.benchmarkReturnPct}%
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Final Value: ₹{backtestResults.finalBenchmarkEquity.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Win Rate / Trades</span>
              <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--accent-pink)' }}>
                {backtestResults.winRate}% Win Rate
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {backtestResults.tradesCount} Simulated Orders ({backtestResults.winningTrades} Win / {backtestResults.losingTrades} Loss)
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Max Drawdown</span>
              <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--accent-red)' }}>
                -{backtestResults.maxDrawdown}%
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Peak-to-trough decline
              </span>
            </div>
          </div>

          {/* Equity Curves Chart */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                  Equity Curve: Strategy vs Buy & Hold
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Visual comparison over 60 historical sessions (Base capital: ₹{initialCapital.toLocaleString('en-IN')})
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-pink)' }}>
                  <span style={{ width: '12px', height: '3px', background: 'var(--accent-pink)' }} /> Strategy
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-cyan)' }}>
                  <span style={{ width: '12px', height: '3px', background: 'var(--accent-cyan)' }} /> Buy & Hold
                </span>
              </div>
            </div>

            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={backtestResults.equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={v => `₹${Math.round(v/1000)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.8rem' }}
                    formatter={(val, name) => [`₹${Number(val).toLocaleString('en-IN')}`, name === 'strategyEquity' ? 'Strategy' : 'Buy & Hold']}
                  />
                  <Line type="monotone" dataKey="strategyEquity" stroke="var(--accent-pink)" strokeWidth={2.4} dot={false} />
                  <Line type="monotone" dataKey="benchmarkEquity" stroke="var(--accent-cyan)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strategy Interpretation & Educational Rationale */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.65rem', borderRadius: '50%', background: 'rgba(236,72,153,0.15)', color: 'var(--accent-pink)', flexShrink: 0 }}>
              <Activity size={22} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', fontWeight: 700 }}>
                Historical Strategy Interpretation
              </h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                The <strong>{strategy === 'ai_momentum' ? 'AI Momentum Model' : (strategy === 'sma_crossover' ? 'SMA Crossover' : 'Breakout Rule')}</strong> produced a return of <strong>{backtestResults.returnPct >= 0 ? '+' : ''}{backtestResults.returnPct}%</strong> with a max historical drawdown of <strong>{backtestResults.maxDrawdown}%</strong>.
                {backtestResults.returnPct > backtestResults.benchmarkReturnPct 
                  ? ' The active algorithmic strategy outperformed passive Buy & Hold during this historical sample.' 
                  : ' Passive Buy & Hold produced higher returns during this specific period due to persistent secular trends.'}
              </p>
              <div style={{ marginTop: '0.5rem', fontSize: '0.74rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Note: Historical simulations do not guarantee future performance. Market conditions change across economic regimes.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyLabPage;
