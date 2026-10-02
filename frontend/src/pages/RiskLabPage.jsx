import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Shield, Calculator, ShieldCheck, AlertTriangle, 
  TrendingUp, TrendingDown, HelpCircle, ArrowRight, Activity 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { API_BASE } from '../config/api';

const RiskLabPage = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState('TCS');
  const [entryPrice, setEntryPrice] = useState(2270);
  const [portfolioCapital, setPortfolioCapital] = useState(100000);
  const [riskPercent, setRiskPercent] = useState(2); // 2% rule
  const [stopLossPercent, setStopLossPercent] = useState(3); // 3% stop loss
  const [targetProfitPercent, setTargetProfitPercent] = useState(6); // 6% profit target

  useEffect(() => {
    axios.get(`${API_BASE}/stocks`).then(res => setStocks(res.data.data || [])).catch(console.error);
    axios.get(`${API_BASE}/wallet`).then(res => setPortfolioCapital(res.data.data?.balance || 100000)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedStock) {
      axios.get(`${API_BASE}/stocks/${selectedStock}`).then(res => {
        setEntryPrice(res.data.data?.price || 1000);
      }).catch(console.error);
    }
  }, [selectedStock]);

  // Calculations
  const maxLossCapital = Math.round(portfolioCapital * (riskPercent / 100));
  const stopLossPrice = Math.round(entryPrice * (1 - stopLossPercent / 100) * 100) / 100;
  const targetProfitPrice = Math.round(entryPrice * (1 + targetProfitPercent / 100) * 100) / 100;
  const riskPerShare = Math.max(1, entryPrice - stopLossPrice);
  const rewardPerShare = targetProfitPrice - entryPrice;
  const recommendedShares = Math.max(1, Math.floor(maxLossCapital / riskPerShare));
  const totalPositionCost = Math.round(recommendedShares * entryPrice);
  const riskRewardRatio = (rewardPerShare / Math.max(0.1, riskPerShare)).toFixed(2);

  // What-If Scenarios
  const scenarioMinus5 = { price: entryPrice * 0.95, pl: Math.round(recommendedShares * (entryPrice * 0.95 - entryPrice)), portImpact: (((recommendedShares * (entryPrice * 0.95 - entryPrice)) / portfolioCapital) * 100).toFixed(2) };
  const scenarioMinus10 = { price: entryPrice * 0.90, pl: Math.round(recommendedShares * (entryPrice * 0.90 - entryPrice)), portImpact: (((recommendedShares * (entryPrice * 0.90 - entryPrice)) / portfolioCapital) * 100).toFixed(2) };
  const scenarioPlus5 = { price: entryPrice * 1.05, pl: Math.round(recommendedShares * (entryPrice * 1.05 - entryPrice)), portImpact: (((recommendedShares * (entryPrice * 1.05 - entryPrice)) / portfolioCapital) * 100).toFixed(2) };
  const scenarioPlus10 = { price: entryPrice * 1.10, pl: Math.round(recommendedShares * (entryPrice * 1.10 - entryPrice)), portImpact: (((recommendedShares * (entryPrice * 1.10 - entryPrice)) / portfolioCapital) * 100).toFixed(2) };

  return (
    <div style={{ paddingBottom: '3rem', width: '100%' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Risk Lab & Wall Street Position Sizer</h1>
            <span className="badge-buy" style={{ fontSize: '0.72rem' }}>CAPITAL PRESERVATION</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
            Calculate mathematical position sizing, risk/reward ratios & stress test portfolio impact
          </p>
        </div>

        <select 
          className="input-field mono-font" 
          value={selectedStock} 
          onChange={(e) => setSelectedStock(e.target.value)}
          style={{ fontWeight: 700 }}
        >
          {stocks.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Main Calculator Grid */}
      <div className="dashboard-main-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Left Column: Interactive Sliders & Inputs */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={18} color="var(--accent-pink)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Position Sizing Parameters</h3>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Virtual Portfolio Capital: <strong>₹{portfolioCapital.toLocaleString('en-IN')}</strong>
            </label>
            <input 
              type="number" 
              className="input-field mono-font" 
              value={portfolioCapital} 
              onChange={(e) => setPortfolioCapital(Number(e.target.value) || 10000)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Max Risk per Trade:</span>
              <strong className="mono-font">{riskPercent}% (₹{maxLossCapital.toLocaleString('en-IN')})</strong>
            </div>
            <input 
              type="range" min="0.5" max="5" step="0.5"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-pink)' }}
            />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              Wall Street standard: 1% to 2% max portfolio risk per single trade
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Stop-Loss Threshold:</span>
              <strong className="mono-font">{stopLossPercent}% (₹{stopLossPrice.toLocaleString('en-IN')})</strong>
            </div>
            <input 
              type="range" min="1" max="10" step="0.5"
              value={stopLossPercent}
              onChange={(e) => setStopLossPercent(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-red)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Take-Profit Target:</span>
              <strong className="mono-font">{targetProfitPercent}% (₹{targetProfitPrice.toLocaleString('en-IN')})</strong>
            </div>
            <input 
              type="range" min="2" max="20" step="1"
              value={targetProfitPercent}
              onChange={(e) => setTargetProfitPercent(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-green)' }}
            />
          </div>
        </div>

        {/* Right Column: Calculated Sizing Output & Risk/Reward */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--accent-cyan-glow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--accent-cyan)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Recommended Order Execution</h3>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.75rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Recommended Position Size
            </span>
            <div className="mono-font" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-green)', margin: '0.2rem 0' }}>
              {recommendedShares} Shares
            </div>
            <span className="mono-font" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Total Order Capital: ₹{totalPositionCost.toLocaleString('en-IN')} ({((totalPositionCost / portfolioCapital) * 100).toFixed(1)}% of Wallet)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="glass-card" style={{ padding: '0.85rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Max Capital at Risk</span>
              <div className="mono-font" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-red)', marginTop: '0.15rem' }}>
                -₹{maxLossCapital.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '0.85rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Potential Reward Target</span>
              <div className="mono-font" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-green)', marginTop: '0.15rem' }}>
                +₹{Math.round(recommendedShares * rewardPerShare).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '0.85rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Risk / Reward Ratio</span>
              <div className="mono-font" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-pink)', marginTop: '0.15rem' }}>
                1 : {riskRewardRatio}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '0.85rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Stop-Loss Level</span>
              <div className="mono-font" style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.15rem' }}>
                ₹{stopLossPrice}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "What-If" Stress Testing Matrix */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '1.15rem', fontWeight: 700 }}>
          "What-If?" Portfolio Stress Testing Scenarios
        </h3>
        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          See how price fluctuations on {selectedStock} with your {recommendedShares} shares position impact your total capital.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-red)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>If price drops 5% (₹{scenarioMinus5.price.toFixed(1)})</span>
            <div className="mono-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-red)', margin: '0.2rem 0' }}>
              {scenarioMinus5.pl} INR
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Portfolio impact: {scenarioMinus5.portImpact}%</span>
          </div>

          <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #b91c1c' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>If price drops 10% (₹{scenarioMinus10.price.toFixed(1)})</span>
            <div className="mono-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#b91c1c', margin: '0.2rem 0' }}>
              {scenarioMinus10.pl} INR
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Portfolio impact: {scenarioMinus10.portImpact}%</span>
          </div>

          <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-green)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>If price rises 5% (₹{scenarioPlus5.price.toFixed(1)})</span>
            <div className="mono-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-green)', margin: '0.2rem 0' }}>
              +{scenarioPlus5.pl} INR
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Portfolio impact: +{scenarioPlus5.portImpact}%</span>
          </div>

          <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #059669' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>If price rises 10% (₹{scenarioPlus10.price.toFixed(1)})</span>
            <div className="mono-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#059669', margin: '0.2rem 0' }}>
              +{scenarioPlus10.pl} INR
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Portfolio impact: +{scenarioPlus10.portImpact}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskLabPage;
