import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Database, Cpu, Activity, ShieldCheck, 
  Sparkles, Layers, ArrowRight, CheckCircle2, AlertTriangle, Lightbulb 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const PIPELINE_STEPS = [
  {
    step: 1,
    title: 'Historical Dataset Ingestion',
    icon: Database,
    color: '#38bdf8',
    summary: 'Daily OHLCV records for top Indian equities (TCS, INFY, HDFC, SBI, TATAPOWER) are cleansed and normalized.',
    telemetry: '5 Curated Historical CSV Series'
  },
  {
    step: 2,
    title: 'Feature Engineering Engine',
    icon: Cpu,
    color: '#8b5cf6',
    summary: 'Transforms raw price bars into 24+ mathematical features: SMA 5/10/20, RSI 14, MACD Histogram, Volume Ratios, and Returns.',
    telemetry: '24 Multi-Timeframe Features'
  },
  {
    step: 3,
    title: 'Machine Learning Classification',
    icon: Activity,
    color: '#ec4899',
    summary: 'Trained Supervised Classifier predicts next-day price probability (UP vs DOWN) with model calibration.',
    telemetry: 'RandomForestClassifier & Scalers'
  },
  {
    step: 4,
    title: 'Trend Confirmation & Signal Mapping',
    icon: ShieldCheck,
    color: '#10b981',
    summary: 'Applies 20-day SMA trend filters to prevent false signals. If ML predicts UP but price is below SMA20, signal defaults safely to HOLD.',
    telemetry: 'Rule-Based Safety Safeguard'
  },
  {
    step: 5,
    title: 'Explainability & Paper Execution',
    icon: Sparkles,
    color: '#06b6d4',
    summary: 'Deconstructs model probabilities into factor contributions and executes simulated trade on the virtual ledger.',
    telemetry: 'Zero Real-Money Risk'
  }
];

const AIPipelineModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content"
          style={{ maxWidth: '720px', padding: '1.75rem', background: 'var(--bg-surface)' }}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={20} color="var(--accent-pink)" />
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>How PaperPulse AI Works</h2>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                End-to-end Machine Learning inference & algorithmic paper trading pipeline
              </p>
            </div>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>
              <X size={20} />
            </button>
          </div>

          {/* Pipeline Steps Sequence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {PIPELINE_STEPS.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={item.step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="glass-card"
                  style={{
                    padding: '0.9rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderLeft: `4px solid ${item.color}`
                  }}
                >
                  <div style={{ padding: '0.55rem', borderRadius: '50%', background: `${item.color}22`, color: item.color, flexShrink: 0 }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {item.step}. {item.title}
                      </strong>
                      <span className="mono-font" style={{ fontSize: '0.72rem', color: item.color, background: `${item.color}15`, padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                        {item.telemetry}
                      </span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {item.summary}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Technical Integrity Callout */}
          <div style={{ padding: '0.85rem 1.1rem', background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)', borderRadius: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Lightbulb size={20} color="var(--accent-pink)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Academic & Hackathon Note:</strong> Predictions are generated from Python FastAPI ML microservice scripts reading historical datasets. Confidence represents internal model probability, not guarantee of real-world profit.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AIPipelineModal;
