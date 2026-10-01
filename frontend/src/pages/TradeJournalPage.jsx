import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  BookOpen, Star, Sparkles, CheckCircle2, AlertCircle, 
  RefreshCw, TrendingUp, TrendingDown, Edit3, Save, X, Tag 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;
const STRATEGIES = ['Momentum', 'Trend', 'Fundamental', 'AI Signal', 'Experiment', 'Discretionary'];

const TradeJournalPage = () => {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({ totalLogged: 0, strategyBreakdown: {}, winRate: 0 });
  const [loading, setLoading] = useState(true);
  const [editingTrade, setEditingTrade] = useState(null);
  const [reflectionText, setReflectionText] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [filterStrategy, setFilterStrategy] = useState('ALL');

  useEffect(() => {
    fetchJournal();
  }, []);

  const fetchJournal = async () => {
    setLoading(true);
    try {
      const [journalRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/journal`),
        axios.get(`${API_BASE}/journal/stats`)
      ]);

      setTrades(journalRes.data.data || []);
      setStats(statsRes.data.data || { totalLogged: 0, strategyBreakdown: {}, winRate: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReflectionModal = (trade) => {
    setEditingTrade(trade);
    setReflectionText(trade.reflectionNotes || '');
    sounds.playTick();
  };

  const handleSaveReflection = async () => {
    if (!editingTrade) return;
    setSavingReflection(true);
    try {
      await axios.put(`${API_BASE}/journal/${editingTrade._id}`, {
        reflectionNotes: reflectionText,
        strategyTag: editingTrade.strategyTag,
        confidenceLevel: editingTrade.confidenceLevel,
        expectedOutcome: editingTrade.expectedOutcome
      });

      sounds.playSuccess();
      setEditingTrade(null);
      fetchJournal();
    } catch (err) {
      sounds.playError();
      alert('Failed to save reflection notes.');
    } finally {
      setSavingReflection(false);
    }
  };

  const filteredTrades = trades.filter(t => {
    if (filterStrategy === 'ALL') return true;
    return (t.strategyTag || 'Discretionary') === filterStrategy;
  });

  return (
    <div style={{ paddingBottom: '3rem', width: '100%' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Trade Journal & Strategy Reflection</h1>
            <span className="badge-buy" style={{ fontSize: '0.72rem' }}>LEARNING LOOP</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
            Document your trading thesis, evaluate cognitive biases, and reflect on post-trade execution results
          </p>
        </div>

        <button 
          className="btn-outline" 
          onClick={fetchJournal}
          style={{ fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} /> Refresh Journal
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="stats-grid">
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Total Journaled Trades</span>
          <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0' }}>
            {stats.totalLogged} Entries
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Manual & AI simulated executions
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Realized Win Rate</span>
          <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: stats.winRate >= 50 ? 'var(--accent-green)' : 'var(--accent-pink)' }}>
            {stats.winRate}% Win Rate
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            On realized paper positions
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Primary Strategy</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--accent-cyan)' }}>
            {Object.keys(stats.strategyBreakdown || {})[0] || 'AI Signal'}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Most frequent playbook tag
          </span>
        </div>
      </div>

      {/* Strategy Tag Filter Bar */}
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', margin: '1.25rem 0' }}>
        <button
          className={`pill-tag ${filterStrategy === 'ALL' ? 'active' : ''}`}
          onClick={() => { setFilterStrategy('ALL'); sounds.playTick(); }}
        >
          All Strategies ({trades.length})
        </button>
        {STRATEGIES.map(strat => (
          <button
            key={strat}
            className={`pill-tag ${filterStrategy === strat ? 'active' : ''}`}
            onClick={() => { setFilterStrategy(strat); sounds.playTick(); }}
          >
            {strat} ({stats.strategyBreakdown?.[strat] || 0})
          </button>
        ))}
      </div>

      {/* Journal Records Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading trade journal...
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <BookOpen size={36} color="var(--accent-pink)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>No Journal Entries Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.4rem 0 1.25rem 0' }}>
              When you execute paper trades with notes and strategy tags, they will appear here for post-trade analysis.
            </p>
          </div>
        ) : (
          filteredTrades.map((t) => {
            const isSell = t.action === 'SELL';
            const pl = t.profitLoss != null ? t.profitLoss : 0;
            const hasPL = isSell && pl !== 0;

            return (
              <motion.div 
                key={t._id}
                className="glass-panel"
                style={{ padding: '1.25rem' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className={t.action === 'BUY' ? 'badge-buy' : 'badge-sell'} style={{ fontSize: '0.76rem' }}>
                      {t.action}
                    </span>
                    <strong style={{ fontSize: '1.15rem' }}>{t.symbol}</strong>
                    <span className="mono-font" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {t.quantity} Shares @ ₹{t.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="pill-tag mono-font" style={{ fontSize: '0.72rem' }}>
                      <Tag size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {t.strategyTag || 'Discretionary'}
                    </span>

                    {/* Confidence Stars */}
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={13} 
                          color={star <= (t.confidenceLevel || 3) ? 'var(--accent-amber)' : 'rgba(255,255,255,0.2)'} 
                          fill={star <= (t.confidenceLevel || 3) ? 'var(--accent-amber)' : 'none'} 
                        />
                      ))}
                    </div>

                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      {new Date(t.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Thesis Section */}
                <div style={{ padding: '0.75rem 0.95rem', background: 'rgba(0,0,0,0.25)', borderRadius: '0.5rem', marginBottom: '0.75rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Trade Thesis & Reasoning:
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Target: {t.expectedOutcome || 'Bullish'}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: t.journalNotes ? 'var(--text-primary)' : 'var(--text-secondary)', fontStyle: t.journalNotes ? 'normal' : 'italic' }}>
                    {t.journalNotes || 'No initial thesis note recorded at execution.'}
                  </p>
                </div>

                {/* Reflection Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {t.reflectionNotes ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--accent-pink)' }}>Post-Trade Reflection: </strong>
                        {t.reflectionNotes}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No reflection recorded yet. Did your thesis hold up?
                      </span>
                    )}
                  </div>

                  <button 
                    className="btn-outline" 
                    onClick={() => handleOpenReflectionModal(t)}
                    style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem' }}
                  >
                    <Edit3 size={13} /> {t.reflectionNotes ? 'Edit Reflection' : 'Add Reflection'}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Reflection Edit Modal */}
      <AnimatePresence>
        {editingTrade && (
          <div className="modal-overlay" onClick={() => setEditingTrade(null)}>
            <motion.div 
              className="modal-content"
              style={{ maxWidth: '520px', padding: '1.5rem', background: 'var(--bg-surface)' }}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Trade Reflection & Learning Review
                  </span>
                  <h3 style={{ margin: '0.1rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>
                    {editingTrade.action} {editingTrade.symbol} ({new Date(editingTrade.timestamp).toLocaleDateString()})
                  </h3>
                </div>
                <button onClick={() => setEditingTrade(null)} style={{ color: 'var(--text-secondary)' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  What actually happened? What can you learn from this outcome?
                </label>
                <textarea
                  className="input-field"
                  placeholder="e.g. My momentum thesis was validated by the price breakout, but I exited 2 days early. Next time I will trail stop-loss."
                  rows={4}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn-outline" onClick={() => setEditingTrade(null)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveReflection}
                  disabled={savingReflection}
                >
                  <Save size={15} /> {savingReflection ? 'Saving...' : 'Save Reflection'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TradeJournalPage;
