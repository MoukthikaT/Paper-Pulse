import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowRightLeft, TrendingUp, CheckCircle, Award, Sparkles, Scale, Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { sounds } from '../utils/soundEffects';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const CompareStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [stockA, setStockA] = useState('TCS');
  const [stockB, setStockB] = useState('INFY');
  const [comparisonData, setComparisonData] = useState(null);
  const [historyA, setHistoryA] = useState([]);
  const [historyB, setHistoryB] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/stocks`).then(res => setStocks(res.data.data || [])).catch(console.error);
    handleCompare();
  }, []);

  const handleCompare = () => {
    if (stockA === stockB) {
      alert("Please select two distinct stocks to compare.");
      return;
    }
    sounds.playTick();
    setLoading(true);

    Promise.all([
      axios.get(`${API_BASE}/stocks/compare?symbols=${stockA},${stockB}`),
      axios.get(`${API_BASE}/stocks/${stockA}/history?limit=30`),
      axios.get(`${API_BASE}/stocks/${stockB}/history?limit=30`)
    ])
    .then(([compRes, histARes, histBRes]) => {
      setComparisonData(compRes.data.data);
      setHistoryA(histARes.data.data || []);
      setHistoryB(histBRes.data.data || []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  // Normalized rebased-to-100 chart data for fair relative comparison
  const baseA = historyA.length > 0 ? historyA[0].close : 1;
  const baseB = historyB.length > 0 ? historyB[0].close : 1;

  const normalizedHistory = historyA.map((item, idx) => {
    const itemB = historyB[idx] || {};
    const normA = Math.round(((item.close / baseA) * 100) * 100) / 100;
    const normB = itemB.close ? Math.round(((itemB.close / baseB) * 100) * 100) / 100 : null;
    return {
      date: item.date,
      [stockA]: normA,
      [stockB]: normB,
      [`${stockA}_raw`]: item.close,
      [`${stockB}_raw`]: itemB.close || null
    };
  });

  return (
    <div style={{ paddingBottom: '3rem', width: '100%' }}>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Head-to-Head Asset Comparison</h1>
            <span className="badge-buy" style={{ fontSize: '0.72rem' }}>NORMALIZED REBASE 100</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
            Direct fundamental metrics comparison, AI signal correlation & relative performance indexed to 100
          </p>
        </div>
      </div>
      
      {/* Selector Form Card */}
      <div className="glass-panel compare-form-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, width: '100%' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            Primary Asset (A)
          </label>
          <select 
            className="input-field mono-font" 
            style={{ width: '100%', fontWeight: 700 }} 
            value={stockA} 
            onChange={(e) => setStockA(e.target.value)}
          >
            {stocks.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.5rem' }}>
          <div style={{ padding: '0.6rem', background: 'rgba(236,72,153,0.15)', borderRadius: '50%' }}>
            <ArrowRightLeft size={18} color="var(--accent-pink)" />
          </div>
        </div>

        <div style={{ flex: 1, width: '100%' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            Benchmark Asset (B)
          </label>
          <select 
            className="input-field mono-font" 
            style={{ width: '100%', fontWeight: 700 }} 
            value={stockB} 
            onChange={(e) => setStockB(e.target.value)}
          >
            {stocks.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleCompare} 
          disabled={loading} 
          style={{ height: '42px', padding: '0 1.75rem', minWidth: '130px' }}
        >
          {loading ? 'Analyzing...' : 'Compare Assets'}
        </button>
      </div>

      {/* Normalized Rebased-to-100 Performance Chart */}
      {normalizedHistory.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Scale size={18} color="var(--accent-pink)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Normalized Relative Performance (Base = 100)</h3>
              </div>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Rebasing starting prices to 100 allows equitable percentage performance comparison regardless of absolute share price differences.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>● {stockA}</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>● {stockB}</span>
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={normalizedHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={25} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.82rem' }}
                  formatter={(value, name) => [`${value} (Base 100)`, name]}
                />
                <Line type="monotone" dataKey={stockA} stroke="var(--accent-pink)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey={stockB} stroke="var(--accent-cyan)" strokeWidth={2.5} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Side by Side Comparative Metric Cards */}
      {comparisonData && (
        <div className="compare-grid">
          {comparisonData.map((data, idx) => {
            const isStockA = idx === 0;
            const accentColor = isStockA ? 'var(--accent-pink)' : 'var(--accent-cyan)';
            const isBuy = data.analysis?.signal === 'BUY';
            const isSell = data.analysis?.signal === 'SELL';

            return (
              <div 
                key={data.symbol}
                className="glass-panel" 
                style={{ padding: '1.5rem', borderTop: `4px solid ${accentColor}` }}
              >
                <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Asset #{idx + 1}
                    </span>
                    <h3 style={{ fontSize: '1.6rem', margin: '0.1rem 0', color: accentColor, fontWeight: 800 }}>
                      {data.symbol}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h2 className="mono-font" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700 }}>
                      ₹{data.currentPrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || data.currentPrice}
                    </h2>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Spot Market Price</span>
                  </div>
                </div>

                {/* Metrics list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>P/E Ratio</span>
                    <span className="mono-font" style={{ fontWeight: 600 }}>{data.metrics?.peRatio || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ROE (Return on Equity)</span>
                    <span className="mono-font" style={{ fontWeight: 600 }}>{data.metrics?.roe || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>EPS (Earnings Per Share)</span>
                    <span className="mono-font" style={{ fontWeight: 600 }}>₹{data.metrics?.eps || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Market Capitalization</span>
                    <span className="mono-font" style={{ fontWeight: 600 }}>₹{data.metrics?.marketCap || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Dividend Yield</span>
                    <span className="mono-font" style={{ fontWeight: 600 }}>{data.metrics?.dividendYield || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Debt-to-Equity</span>
                    <span className="mono-font" style={{ fontWeight: 600 }}>{data.metrics?.debtToEquity || '0.45'}</span>
                  </div>
                </div>

                {/* AI Signal Box */}
                <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Trend: <strong style={{ color: data.analysis?.trend === 'Positive' ? 'var(--accent-green)' : (data.analysis?.trend === 'Negative' ? 'var(--accent-red)' : 'var(--text-primary)') }}>{data.analysis?.trend || 'Stable'}</strong>
                    </span>
                    <span className={isBuy ? 'badge-buy' : (isSell ? 'badge-sell' : 'badge-hold')}>
                      {data.analysis?.signal || 'HOLD'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Educational Takeaway (Objective analysis) */}
      {comparisonData && (
        <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.5rem', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <Info size={20} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Comparative Takeaway: </strong>
            {stockA} and {stockB} exhibit distinct valuation multiples and price trajectories. Review their respective P/E ratios in relation to recent momentum rather than selecting a single arbitrary winner.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompareStocks;
