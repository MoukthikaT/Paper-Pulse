import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Briefcase, RefreshCw, 
  PieChart as PieIcon, ShieldCheck, 
  ArrowRight, X, Zap 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { sounds } from '../utils/soundEffects';
import { API_BASE } from '../config/api';
const COLORS = ['#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState({ totalValue: 0, totalReturn: 0, holdings: [] });
  const [walletBalance, setWalletBalance] = useState(100000);
  const [loading, setLoading] = useState(true);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const navigate = useNavigate();

  const fetchPortfolioData = useCallback(async () => {
    setLoading(true);
    try {
      const [portRes, wallRes] = await Promise.all([
        axios.get(`${API_BASE}/portfolio`),
        axios.get(`${API_BASE}/wallet`)
      ]);

      setPortfolio({
        holdings: portRes.data.data?.holdings || [],
        totalValue: portRes.data.data?.totalValue || 0,
        totalReturn: portRes.data.data?.totalReturn || 0
      });
      setWalletBalance(wallRes.data.data?.balance || 100000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const totalPortfolioWealth = (portfolio.totalValue || 0) + (walletBalance || 0);
  const cashAllocationPct = totalPortfolioWealth > 0 ? Math.round((walletBalance / totalPortfolioWealth) * 100) : 100;

  // Pie chart data
  const pieData = portfolio.holdings.map(h => ({
    name: h.symbol,
    value: h.currentValue || h.investedAmount || 1000
  }));

  if (walletBalance > 0) {
    pieData.push({
      name: 'Virtual Cash',
      value: walletBalance
    });
  }

  // Health Metrics
  const largestHolding = portfolio.holdings.reduce((max, h) => {
    const val = h.currentValue || h.investedAmount || 0;
    return val > max ? val : max;
  }, 0);
  const largestHoldingPct = totalPortfolioWealth > 0 ? Math.round((largestHolding / totalPortfolioWealth) * 100) : 0;

  const diversificationRating = portfolio.holdings.length >= 4 
    ? { text: 'High Diversification', color: 'var(--accent-green)', advice: 'Your capital is spread across multiple sectors, limiting single-stock risk.' }
    : (portfolio.holdings.length >= 2 
      ? { text: 'Moderate Diversification', color: 'var(--accent-cyan)', advice: 'Good foundational spread. Consider testing cross-sector non-correlated assets.' }
      : { text: 'High Concentration', color: 'var(--accent-amber)', advice: 'High single-asset reliance. Practice allocating into other sectors to protect your simulated wallet.' });

  return (
    <div style={{ paddingBottom: '3rem', width: '100%' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Portfolio Analytics & Asset Allocation</h1>
            <span className="badge-buy" style={{ fontSize: '0.72rem' }}>ACTIVE ASSETS</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
            Live holdings valuation, sector diversification telemetry & portfolio health diagnostic
          </p>
        </div>

        <button 
          className="btn-outline" 
          onClick={fetchPortfolioData}
          style={{ fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} /> Sync Ledger
        </button>
      </div>

      {/* Top 3 High Level KPI Cards */}
      <div className="stats-grid">
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Net Portfolio Valuation</span>
          <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0' }}>
            ₹{totalPortfolioWealth.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Cash (₹{walletBalance.toLocaleString('en-IN')}) + Equities (₹{(portfolio.totalValue || 0).toLocaleString('en-IN')})
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Total Return (Simulated)</span>
          <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: portfolio.totalReturn >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {portfolio.totalReturn >= 0 ? '+' : ''}₹{(portfolio.totalReturn || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Realized gains and open paper positions
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Active Positions</span>
          <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--accent-pink)' }}>
            {portfolio.holdings.length} Equities
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Across curated Indian NSE companies
          </span>
        </div>
      </div>

      {/* Asset Allocation Chart & Portfolio Health Diagnostics */}
      <div className="dashboard-main-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Allocation Pie Chart */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <PieIcon size={16} color="var(--accent-pink)" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Asset Allocation Breakdown</h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>By Capital Value</span>
          </div>

          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.8rem' }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Allocation']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            {pieData.map((entry, idx) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Health Diagnostic Panel */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldCheck size={18} color="var(--accent-cyan)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Portfolio Health & Risk Telemetry</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Diversification</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: diversificationRating.color, marginTop: '0.15rem' }}>
                {diversificationRating.text}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cash Buffer</span>
              <div className="mono-font" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                {cashAllocationPct}% Capital
              </div>
            </div>

            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Largest Holding</span>
              <div className="mono-font" style={{ fontSize: '0.95rem', fontWeight: 700, color: largestHoldingPct > 40 ? 'var(--accent-amber)' : 'var(--text-primary)', marginTop: '0.15rem' }}>
                {largestHoldingPct}% Weight
              </div>
            </div>

            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total Positions</span>
              <div className="mono-font" style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.15rem' }}>
                {portfolio.holdings.length} Equities
              </div>
            </div>
          </div>

          <div style={{ padding: '0.75rem 0.95rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '0.6rem', border: '1px solid rgba(6, 182, 212, 0.25)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Educational Insight: </strong>
            {diversificationRating.advice}
          </div>
        </div>
      </div>

      {/* Detailed Holdings Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '1.15rem', fontWeight: 700 }}>
          Detailed Holdings Roster ({portfolio.holdings.length})
        </h3>

        <div className="table-responsive">
          <table>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Stock</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Shares</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Avg Price</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Total Invested</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Current Valuation</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Unrealized P/L</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Loading active holdings telemetry...</span>
                    </div>
                  </td>
                </tr>
              ) : portfolio.holdings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Your simulated portfolio is empty. Place your first paper order in the Trade Terminal!
                  </td>
                </tr>
              ) : (
                portfolio.holdings.map((h, i) => {
                  const pl = (h.currentValue || 0) - (h.investedAmount || 0);
                  const isPos = pl >= 0;
                  return (
                    <tr 
                      key={i} 
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                      onClick={() => setSelectedHolding(h)}
                    >
                      <td style={{ fontWeight: 800, color: 'var(--accent-pink)', fontSize: '0.92rem' }}>
                        {h.symbol}
                      </td>
                      <td className="mono-font">{h.quantity}</td>
                      <td className="mono-font">₹{h.averagePurchasePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="mono-font">₹{(h.investedAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="mono-font">₹{(h.currentValue || h.investedAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="mono-font" style={{ color: isPos ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                        {isPos ? '+' : ''}₹{pl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        <button 
                          className="btn-outline" 
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.76rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/trade?symbol=${h.symbol}`);
                          }}
                        >
                          Trade <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Position Detail Drawer Modal */}
      <AnimatePresence>
        {selectedHolding && (
          <div className="modal-overlay" onClick={() => setSelectedHolding(null)}>
            <motion.div 
              className="drawer-right"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              style={{ padding: '1.75rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Position Telemetry</span>
                  <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>{selectedHolding.symbol}</h2>
                </div>
                <button onClick={() => setSelectedHolding(null)} style={{ color: 'var(--text-secondary)' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Shares Owned</span>
                  <div className="mono-font" style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                    {selectedHolding.quantity}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Avg Purchase Price</span>
                  <div className="mono-font" style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                    ₹{selectedHolding.averagePurchasePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Current Valuation</span>
                  <div className="mono-font" style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                    ₹{(selectedHolding.currentValue || selectedHolding.investedAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  onClick={() => {
                    const sym = selectedHolding.symbol;
                    setSelectedHolding(null);
                    navigate(`/trade?symbol=${sym}`);
                  }}
                  style={{ marginTop: 'auto' }}
                >
                  <Zap size={16} /> Open in Paper Trading Terminal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioPage;
