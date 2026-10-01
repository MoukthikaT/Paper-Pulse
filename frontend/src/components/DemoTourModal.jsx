import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, ChevronRight, ChevronLeft, CheckCircle2, 
  BarChart2, Zap, Target, BookOpen, Activity, ArrowRight, Play 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const TOUR_STOPS = [
  {
    step: 1,
    title: '1. Executive KPI Strip & Markets',
    icon: BarChart2,
    color: '#8b5cf6',
    route: '/',
    description: 'Monitor real-time simulated valuation, cash buying power, live P&L, and multi-asset sparklines in a TradingView-inspired high density interface.'
  },
  {
    step: 2,
    title: '2. Explainable AI Signal ("Why BUY?")',
    icon: Sparkles,
    color: '#ec4899',
    route: '/',
    description: 'Every prediction deconstructs machine learning factors (Momentum, Trend, Volatility, Price Strength) rather than providing a black-box signal.'
  },
  {
    step: 3,
    title: '3. Risk-Managed Paper Execution',
    icon: Zap,
    color: '#06b6d4',
    route: '/trade',
    description: 'Execute simulated orders with a two-step confirmation modal, 2% capital risk protection, and instant virtual ledger settlement.'
  },
  {
    step: 4,
    title: '4. Strategy Lab vs Buy & Hold',
    icon: Activity,
    color: '#10b981',
    route: '/strategy-lab',
    description: 'Backtest AI Momentum, SMA Crossovers, and custom rules directly benchmarked against passive Buy & Hold with win rates and drawdowns.'
  },
  {
    step: 5,
    title: '5. Decision Lab & AI vs You',
    icon: Target,
    color: '#f59e0b',
    route: '/decision-lab',
    description: 'Analyze historical market snapshots with hidden future candles, make your prediction, and compare your accuracy head-to-head with AI.'
  },
  {
    step: 6,
    title: '6. Trade Journal & Thesis Reflection',
    icon: BookOpen,
    color: '#38bdf8',
    route: '/journal',
    description: 'Record trading strategy tags (Momentum, AI Signal, Fundamental), confidence ratings, and review expected vs actual outcomes.'
  }
];

const DemoTourModal = ({ isOpen, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const currentStop = TOUR_STOPS[currentIdx];
  const Icon = currentStop.icon;

  const handleNext = () => {
    sounds.playTick();
    if (currentIdx < TOUR_STOPS.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    sounds.playTick();
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleJumpToFeature = () => {
    sounds.playSuccess();
    onClose();
    navigate(currentStop.route);
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content"
          style={{ maxWidth: '560px', padding: '1.75rem', background: 'var(--bg-surface)' }}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(236,72,153,0.15)', color: 'var(--accent-pink)', fontSize: '0.72rem', fontWeight: 700 }}>
                30-SEC DEMO TOUR
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Step {currentIdx + 1} of {TOUR_STOPS.length}
              </span>
            </div>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>
              <X size={18} />
            </button>
          </div>

          {/* Card Step Content */}
          <motion.div 
            key={currentStop.step}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="glass-card"
            style={{ padding: '1.5rem', marginBottom: '1.25rem', borderLeft: `4px solid ${currentStop.color}` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.65rem', borderRadius: '50%', background: `${currentStop.color}20`, color: currentStop.color }}>
                <Icon size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{currentStop.title}</h3>
                <span className="mono-font" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Route: {currentStop.route}
                </span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {currentStop.description}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className="btn-outline" 
              onClick={handleJumpToFeature}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              <Play size={13} /> Open This Page
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn-outline" 
                onClick={handlePrev} 
                disabled={currentIdx === 0}
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button 
                className="btn-primary" 
                onClick={handleNext}
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
              >
                {currentIdx === TOUR_STOPS.length - 1 ? 'Finish Tour' : 'Next Stop'} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DemoTourModal;
