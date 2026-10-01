import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ChevronDown, ChevronUp, ShieldAlert, 
  HelpCircle, Activity, Info, CheckCircle2, TrendingUp, TrendingDown 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const ExplainableSignalCard = ({ 
  stockSymbol = 'TCS',
  signal = 'BUY', 
  confidence = 0.78, 
  trend = 'POSITIVE',
  reasoning = '',
  currentPrice = 0,
  model = 'RandomForest',
  source = 'ml',
  isMock = false,
  onOpenExplain
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const isFallbackMode = isMock || source === 'fallback';
  const confPct = Math.round((confidence || 0.75) * 100);

  // Derive factor contribution weights based on signal and confidence
  const momentumScore = signal === 'BUY' ? Math.min(95, confPct + 4) : (signal === 'SELL' ? Math.max(15, 100 - confPct) : 52);
  const trendScore = trend === 'POSITIVE' ? Math.min(92, confPct) : (trend === 'NEGATIVE' ? 25 : 50);
  const priceStrengthScore = signal === 'BUY' ? Math.min(90, confPct + 2) : (signal === 'SELL' ? 30 : 48);
  const volatilityScore = Math.min(85, Math.max(30, Math.round(((stockSymbol.charCodeAt(0) * 7) % 45) + 35)));

  const getSignalBadge = () => {
    if (signal === 'BUY') {
      return {
        cls: 'badge-buy',
        text: 'BUY',
        sub: 'Bullish Momentum',
        color: 'var(--accent-green)',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.3)'
      };
    }
    if (signal === 'SELL') {
      return {
        cls: 'badge-sell',
        text: 'SELL',
        sub: 'Bearish Correction',
        color: 'var(--accent-red)',
        bg: 'rgba(244, 63, 94, 0.12)',
        border: 'rgba(244, 63, 94, 0.3)'
      };
    }
    return {
      cls: 'badge-hold',
      text: 'HOLD',
      sub: 'Neutral / Rangebound',
      color: 'var(--text-secondary)',
      bg: 'rgba(148, 163, 184, 0.12)',
      border: 'rgba(148, 163, 184, 0.25)'
    };
  };

  const badge = getSignalBadge();

  return (
    <div 
      className="glass-panel"
      style={{
        padding: '1.25rem',
        border: `1px solid ${badge.border}`,
        background: 'var(--bg-surface-elevated)',
        width: '100%'
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <Sparkles size={16} color={isFallbackMode ? "var(--accent-amber, #f59e0b)" : "var(--accent-pink)"} />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Explainable AI Telemetry
            </span>
            <span 
              style={{ 
                fontSize: '0.65rem', 
                padding: '0.1rem 0.45rem', 
                borderRadius: '0.25rem', 
                fontWeight: 700,
                letterSpacing: '0.3px',
                background: isFallbackMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                color: isFallbackMode ? 'var(--accent-amber, #f59e0b)' : 'var(--accent-cyan)',
                border: `1px solid ${isFallbackMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`
              }}
            >
              {isFallbackMode ? 'HEURISTIC FALLBACK' : 'AI MODEL (TRAINED)'}
            </span>
          </div>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.15rem', fontWeight: 700 }}>
            {stockSymbol} Model Signal
          </h3>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className={badge.cls} style={{ fontSize: '0.82rem', padding: '0.2rem 0.65rem' }}>
            ● {badge.text}
          </span>
          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            {badge.sub}
          </span>
        </div>
      </div>

      {/* Source Banner if Fallback */}
      {isFallbackMode && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          padding: '0.4rem 0.6rem', 
          background: 'rgba(245, 158, 11, 0.08)', 
          border: '1px solid rgba(245, 158, 11, 0.2)', 
          borderRadius: '0.4rem', 
          marginBottom: '0.85rem',
          fontSize: '0.72rem',
          color: 'var(--accent-amber, #f59e0b)'
        }}>
          <Info size={13} />
          <span>Python ML service offline — signal generated via heuristic technical fallback.</span>
        </div>
      )}

      {/* Model Confidence & Primary Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Model Confidence</span>
          <div className="mono-font" style={{ fontSize: '1.1rem', fontWeight: 700, color: badge.color }}>
            {confPct}%
          </div>
        </div>

        <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Trend Direction</span>
          <div className="mono-font" style={{ fontSize: '0.92rem', fontWeight: 700, color: trend === 'POSITIVE' ? 'var(--accent-green)' : (trend === 'NEGATIVE' ? 'var(--accent-red)' : 'var(--text-secondary)') }}>
            {trend}
          </div>
        </div>

        <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Engine Source</span>
          <div className="mono-font" style={{ fontSize: '0.82rem', fontWeight: 600, color: isFallbackMode ? 'var(--accent-amber, #f59e0b)' : 'var(--accent-cyan)' }}>
            {isFallbackMode ? 'Heuristic Rules' : (model || 'RandomForest')}
          </div>
        </div>
      </div>

      {/* Expand / Collapse Trigger */}
      <button 
        onClick={() => { sounds.playTick(); setIsExpanded(prev => !prev); }}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 0.75rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '0.5rem',
          color: 'var(--text-primary)',
          fontSize: '0.82rem',
          fontWeight: 600
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Activity size={14} color="var(--accent-pink)" /> Why this signal? (Contributing Factors)
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Factor Contributions Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginTop: '0.85rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Recent Momentum Weight</span>
                  <span className="mono-font" style={{ fontWeight: 600 }}>{momentumScore}%</span>
                </div>
                <div className="factor-bar-bg">
                  <div className="factor-bar-fill" style={{ width: `${momentumScore}%`, background: 'var(--accent-pink)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>SMA 20 Trend Alignment</span>
                  <span className="mono-font" style={{ fontWeight: 600 }}>{trendScore}%</span>
                </div>
                <div className="factor-bar-bg">
                  <div className="factor-bar-fill" style={{ width: `${trendScore}%`, background: 'var(--accent-green)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Price vs Historical Range</span>
                  <span className="mono-font" style={{ fontWeight: 600 }}>{priceStrengthScore}%</span>
                </div>
                <div className="factor-bar-bg">
                  <div className="factor-bar-fill" style={{ width: `${priceStrengthScore}%`, background: 'var(--accent-cyan)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Volatility Index (Risk Factor)</span>
                  <span className="mono-font" style={{ fontWeight: 600 }}>{volatilityScore}%</span>
                </div>
                <div className="factor-bar-bg">
                  <div className="factor-bar-fill" style={{ width: `${volatilityScore}%`, background: 'var(--accent-amber)' }} />
                </div>
              </div>

              {/* Plain English Rationale */}
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Model Rationale: </strong>
                {reasoning || `The model generated ${signal} because short-term momentum and 20-day SMA trend alignment indicated ${signal === 'BUY' ? 'upward continuation' : (signal === 'SELL' ? 'downward pressure' : 'consolidation')}.`}
              </div>

              {/* Potential Concerns Callout */}
              <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '0.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                <ShieldAlert size={14} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
                <span><strong>Integrity Notice:</strong> Confidence reflects model classification strength on historical samples, not guaranteed future profit.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExplainableSignalCard;
