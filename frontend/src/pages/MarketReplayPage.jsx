import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  PlayCircle, PauseCircle, SkipForward, RotateCcw, 
  TrendingUp, TrendingDown, Award, Zap, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { sounds } from '../utils/soundEffects';
import { API_BASE } from '../config/api';

const MarketReplayPage = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState('TCS');
  const [fullHistory, setFullHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulation Session State
  const [cash, setCash] = useState(100000);
  const [shares, setShares] = useState(0);
  const [tradesCount, setTradesCount] = useState(0);
  const [winningTrades, setWinningTrades] = useState(0);
  const [lastBuyPrice, setLastBuyPrice] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_BASE}/stocks`).then(res => setStocks(res.data.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    fetchStockData();
  }, [selectedStock]);

  const fetchStockData = async () => {
    setLoading(true);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await axios.get(`${API_BASE}/stocks/${selectedStock}/history?limit=60`);
      const data = res.data.data || [];
      setFullHistory(data);
      setCurrentIndex(Math.min(15, data.length - 1));
      setCash(100000);
      setShares(0);
      setTradesCount(0);
      setWinningTrades(0);
      setLastBuyPrice(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5x, 1x, 2x, 4x

  const handleStepForward = () => {
    if (currentIndex < fullHistory.length - 1) {
      sounds.playTick();
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(200, Math.round(1200 / playbackSpeed));
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev < fullHistory.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, fullHistory.length]);

  const currentCandle = fullHistory[currentIndex] || {};
  const currentPrice = currentCandle.close || 1000;
  const visibleHistory = fullHistory.slice(0, currentIndex + 1);

  const totalValuation = Math.round(cash + shares * currentPrice);
  const sessionReturnPct = (((totalValuation - 100000) / 100000) * 100).toFixed(2);
  const isComplete = fullHistory.length > 0 && currentIndex >= fullHistory.length - 1;

  const handleBuy = () => {
    if (cash >= currentPrice * 5) {
      sounds.playBuy();
      const buyQty = 5;
      setCash(prev => prev - buyQty * currentPrice);
      setShares(prev => prev + buyQty);
      setLastBuyPrice(currentPrice);
      setTradesCount(prev => prev + 1);
    } else {
      sounds.playError();
      alert('Insufficient virtual cash for order.');
    }
  };

  const handleSell = () => {
    if (shares > 0) {
      sounds.playSell();
      if (currentPrice > lastBuyPrice) {
        setWinningTrades(prev => prev + 1);
      }
      setCash(prev => prev + shares * currentPrice);
      setShares(0);
      setTradesCount(prev => prev + 1);
    } else {
      sounds.playError();
      alert('No shares owned to sell.');
    }
  };

  const handleResetSession = () => {
    sounds.playTick();
    setCurrentIndex(15);
    setCash(100000);
    setShares(0);
    setTradesCount(0);
    setWinningTrades(0);
    setLastBuyPrice(0);
    setIsPlaying(false);
  };

  return (
    <div style={{ paddingBottom: '3rem', width: '100%' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Market Replay Simulator</h1>
            <span className="badge-buy" style={{ fontSize: '0.72rem' }}>INTERACTIVE PLAYGROUND</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
            Step through historical price bars one day at a time, make simulated trades, and test strategy instincts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select 
            className="input-field mono-font" 
            value={selectedStock} 
            onChange={(e) => setSelectedStock(e.target.value)}
            style={{ fontWeight: 700 }}
          >
            {stocks.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Session KPI Strip */}
      <div className="stats-grid">
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Replay Net Worth</span>
          <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0' }}>
            ₹{totalValuation.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.72rem', color: Number(sessionReturnPct) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {Number(sessionReturnPct) >= 0 ? '+' : ''}{sessionReturnPct}% Session Return
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Available Cash</span>
          <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--accent-cyan)' }}>
            ₹{Math.round(cash).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {shares} Shares currently held
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Timeline Progress</span>
          <div className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--accent-pink)' }}>
            Day {currentIndex + 1} / {fullHistory.length}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Date: {currentCandle.date || 'Historical'}
          </span>
        </div>
      </div>

      {/* Main Replay Arena */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Playback Controls Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Historical Stepper
            </span>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
              {selectedStock} @ ₹{currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Speed Chips */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '0.4rem', padding: '0.15rem' }}>
              {[0.5, 1, 2, 4].map(s => (
                <button
                  key={s}
                  type="button"
                  className="pill-tag mono-font"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem', border: 'none', background: playbackSpeed === s ? 'var(--accent-pink)' : 'transparent', color: playbackSpeed === s ? '#fff' : 'var(--text-secondary)' }}
                  onClick={() => {
                    sounds.playTick();
                    setPlaybackSpeed(s);
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button 
              className="btn-outline" 
              onClick={() => setIsPlaying(prev => !prev)}
              style={{ fontSize: '0.82rem' }}
            >
              {isPlaying ? <><PauseCircle size={15} color="var(--accent-amber)" /> Pause</> : <><PlayCircle size={15} color="var(--accent-green)" /> Auto Play</>}
            </button>

            <button 
              className="btn-outline" 
              onClick={handleStepForward}
              disabled={isComplete}
              style={{ fontSize: '0.82rem' }}
            >
              <SkipForward size={15} /> +1 Day
            </button>

            <button 
              className="btn-outline" 
              onClick={handleResetSession}
              style={{ fontSize: '0.82rem' }}
              title="Reset Replay"
            >
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>

        {/* Dynamic Replay Chart */}
        <div style={{ height: '260px', width: '100%', marginBottom: '1.25rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visibleHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="replayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={v => `₹${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.8rem' }}
                formatter={v => [`₹${v}`, 'Price']}
              />
              <Area type="monotone" dataKey="close" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#replayGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Action Trade Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <button
            className="btn-success"
            onClick={handleBuy}
            disabled={cash < currentPrice * 5 || isComplete}
            style={{ padding: '0.75rem' }}
          >
            BUY 5 Shares (₹{(5 * currentPrice).toLocaleString('en-IN')})
          </button>
          <button
            className="btn-outline"
            onClick={handleStepForward}
            disabled={isComplete}
            style={{ padding: '0.75rem' }}
          >
            HOLD / Advance +1 Day
          </button>
          <button
            className="btn-danger"
            onClick={handleSell}
            disabled={shares === 0 || isComplete}
            style={{ padding: '0.75rem' }}
          >
            SELL Position ({shares} Shares)
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketReplayPage;
