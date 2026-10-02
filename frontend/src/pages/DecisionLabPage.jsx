import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Target, Award, Sparkles, TrendingUp, TrendingDown, 
  HelpCircle, RefreshCw, CheckCircle2, XCircle, ArrowRight, 
  ShieldCheck, Cpu, Play, BarChart2 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { sounds } from '../utils/soundEffects';
import { launchConfetti } from '../utils/confetti';
import { API_BASE } from '../config/api';

const DecisionLabPage = () => {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [revealedResult, setRevealedResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [stats, setStats] = useState({ totalDecisions: 0, userAccuracy: 0, aiAccuracy: 0, avgSimulatedReturn: 0, recentHistory: [] });

  useEffect(() => {
    loadNewChallenge();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/decision-lab/stats`);
      setStats(res.data.data || { totalDecisions: 0, userAccuracy: 0, aiAccuracy: 0, avgSimulatedReturn: 0, recentHistory: [] });
    } catch (err) {
      console.error(err);
    }
  };

  const loadNewChallenge = async () => {
    setLoading(true);
    setSelectedDecision(null);
    setRevealedResult(null);
    try {
      const res = await axios.get(`${API_BASE}/decision-lab/challenge`);
      setChallenge(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseDecision = (choice) => {
    sounds.playTick();
    setSelectedDecision(choice);
  };

  const handleSubmitDecision = async () => {
    if (!selectedDecision || !challenge) return;
    setEvaluating(true);
    sounds.playTick();

    const outcome = challenge.outcomeSecret;

    try {
      const res = await axios.post(`${API_BASE}/decision-lab/submit`, {
        symbol: challenge.symbol,
        snapshotDate: challenge.snapshotDate,
        snapshotPrice: challenge.snapshotPrice,
        userDecision: selectedDecision,
        aiDecision: outcome.aiDecision,
        actualReturnPct: outcome.actualReturnPct
      });

      const evaluationData = res.data.data;
      setRevealedResult(evaluationData);

      if (evaluationData.userCorrect) {
        sounds.playSuccess();
        launchConfetti(2000);
      } else {
        sounds.playError();
      }

      fetchStats();
    } catch (err) {
      sounds.playError();
      alert('Failed to evaluate decision.');
    } finally {
      setEvaluating(false);
    }
  };

  // Build chart dataset with distinguished future unmasked trajectory
  const chartData = React.useMemo(() => {
    if (!challenge) return [];
    const points = challenge.visibleHistory.map(h => ({
      date: h.date,
      historyPrice: h.close,
      futurePrice: null
    }));
    if (revealedResult && challenge.outcomeSecret?.futureHistory) {
      // Connect last known point to future unmasked points
      const lastVis = points[points.length - 1];
      if (lastVis) {
        lastVis.futurePrice = lastVis.historyPrice;
      }
      challenge.outcomeSecret.futureHistory.forEach(h => {
        points.push({
          date: h.date,
          historyPrice: null,
          futurePrice: h.close
        });
      });
    }
    return points;
  }, [challenge, revealedResult]);

  return (
    <div style={{ paddingBottom: '3rem', width: '100%' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Decision Lab & AI vs You</h1>
            <span className="badge-buy" style={{ fontSize: '0.72rem' }}>SIGNATURE FEATURE</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
            Analyze blinded historical market snapshots, make directional calls, and test your skills head-to-head with AI
          </p>
        </div>

        <button 
          className="btn-primary" 
          onClick={loadNewChallenge}
          style={{ fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} /> New Market Snapshot
        </button>
      </div>

      {/* AI vs You Scorecard */}
      <div className="stats-grid">
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Your Decision Accuracy</span>
          <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: stats.userAccuracy >= 50 ? 'var(--accent-green)' : 'var(--accent-pink)' }}>
            {stats.userAccuracy}% Accuracy
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Based on {stats.totalDecisions} Blind Tests
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>AI Model Accuracy</span>
          <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--accent-cyan)' }}>
            {stats.aiAccuracy}% Accuracy
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Trained RandomForest Engine
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Avg Simulated Return</span>
          <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: stats.avgSimulatedReturn >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {stats.avgSimulatedReturn >= 0 ? '+' : ''}{stats.avgSimulatedReturn}%
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Next 10-session historical spread
          </span>
        </div>
      </div>

      {/* Decision Arena */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        {loading || !challenge ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: '100%', height: '100%' }} />
          </div>
        ) : (
          <div>
            {/* Snapshot Meta Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Blind Historical Market Snapshot
                </span>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                  What would you do? — {challenge.symbol}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Snapshot Date</span>
                  <div className="mono-font" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    {challenge.snapshotDate}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Spot Price</span>
                  <div className="mono-font" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-pink)' }}>
                    ₹{challenge.snapshotPrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Snapshot Telemetry Badges */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div className="glass-card" style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Trend: </span>
                <strong style={{ color: challenge.indicators.trend === 'Upward' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {challenge.indicators.trend}
                </strong>
              </div>
              <div className="glass-card" style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>RSI (14): </span>
                <strong className="mono-font">{challenge.indicators.rsi}</strong>
              </div>
              <div className="glass-card" style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Volume: </span>
                <strong>{challenge.indicators.volume}</strong>
              </div>
              <div className="glass-card" style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>P/E Ratio: </span>
                <strong className="mono-font">{challenge.indicators.peRatio}x</strong>
              </div>
            </div>

            {/* Price Chart */}
            <div style={{ height: '250px', width: '100%', marginBottom: '1.25rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={v => `₹${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.8rem' }}
                    formatter={(v, name) => [`₹${v}`, name === 'historyPrice' ? 'Known Price' : 'Unmasked Future Price']}
                  />
                  {challenge.snapshotDate && (
                    <ReferenceLine x={challenge.snapshotDate} stroke="var(--accent-amber)" strokeDasharray="3 3" label={{ value: 'Snapshot', fill: 'var(--accent-amber)', fontSize: 10, position: 'insideTopLeft' }} />
                  )}
                  <Line type="monotone" dataKey="historyPrice" stroke="var(--accent-pink)" strokeWidth={2.5} dot={false} name="Known Price" />
                  {revealedResult && (
                    <Line type="monotone" dataKey="futurePrice" stroke="var(--accent-cyan)" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3, fill: 'var(--accent-cyan)' }} name="Unmasked Future" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Decision Controls or Revealed Outcome */}
            {!revealedResult ? (
              <div>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>
                  Future data is hidden. What decision would you make on this day?
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <button
                    className={selectedDecision === 'BUY' ? 'btn-success' : 'btn-outline'}
                    onClick={() => handleChooseDecision('BUY')}
                    style={{ padding: '0.85rem' }}
                  >
                    BUY (Bullish)
                  </button>
                  <button
                    className={selectedDecision === 'HOLD' ? 'btn-glow' : 'btn-outline'}
                    onClick={() => handleChooseDecision('HOLD')}
                    style={{ padding: '0.85rem' }}
                  >
                    HOLD (Wait)
                  </button>
                  <button
                    className={selectedDecision === 'SELL' ? 'btn-danger' : 'btn-outline'}
                    onClick={() => handleChooseDecision('SELL')}
                    style={{ padding: '0.85rem' }}
                  >
                    SELL (Bearish)
                  </button>
                </div>

                <button
                  className="btn-primary"
                  onClick={handleSubmitDecision}
                  disabled={!selectedDecision || evaluating}
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  {evaluating ? 'Unmasking Market...' : 'Reveal Future & Evaluate Decision'}
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '1.25rem', background: revealedResult.userCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)', border: `1px solid ${revealedResult.userCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`, borderRadius: '0.75rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  {revealedResult.userCorrect ? <CheckCircle2 size={22} color="var(--accent-green)" /> : <XCircle size={22} color="var(--accent-red)" />}
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    {revealedResult.userCorrect ? 'Decision Correct!' : 'Challenging Market Outcome'}
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="glass-card" style={{ padding: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Your Decision</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                      {revealedResult.userDecision} ({revealedResult.userCorrect ? 'Correct' : 'Missed'})
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>AI Model Prediction</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {revealedResult.aiDecision} ({revealedResult.aiCorrect ? 'Correct' : 'Missed'})
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Next 10-Day Movement</span>
                    <div className="mono-font" style={{ fontSize: '1.1rem', fontWeight: 700, color: revealedResult.actualReturnPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {revealedResult.actualReturnPct >= 0 ? '+' : ''}{revealedResult.actualReturnPct}%
                    </div>
                  </div>
                </div>

                <p style={{ margin: '0 0 1rem 0', fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {revealedResult.summary}
                </p>

                <button 
                  className="btn-primary" 
                  onClick={loadNewChallenge}
                  style={{ fontSize: '0.85rem' }}
                >
                  <Play size={14} /> Try Next Market Challenge
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionLabPage;
