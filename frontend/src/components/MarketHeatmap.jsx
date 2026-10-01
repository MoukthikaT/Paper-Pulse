import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, Zap } from 'lucide-react';

const MarketHeatmap = ({ stocksData = [], onSelectStock, onQuickTrade }) => {
  if (!stocksData || stocksData.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Market Performance Heatmap & Screener</h3>
          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time multi-asset matrix with AI sentiment telemetry
          </p>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {stocksData.length} Tracked Assets
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
        {stocksData.map((item) => {
          const isPositive = (item.changePct || 0) >= 0;
          const isBuy = item.signal === 'BUY';
          const isSell = item.signal === 'SELL';

          return (
            <motion.div
              key={item.symbol}
              whileHover={{ scale: 1.02, y: -3 }}
              className="glass-card"
              style={{
                padding: '1rem',
                borderLeft: `4px solid ${isBuy ? 'var(--accent-green)' : (isSell ? 'var(--accent-red)' : 'var(--text-muted)')}`,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => onSelectStock && onSelectStock(item.symbol)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{item.symbol}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {item.name || 'NSE Equity'}
                  </span>
                </div>
                <span className={isBuy ? 'badge-buy' : (isSell ? 'badge-sell' : 'badge-hold')} style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                  {item.signal || 'HOLD'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.65rem' }}>
                <h3 className="mono-font" style={{ margin: 0, fontSize: '1.2rem' }}>
                  ₹{item.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </h3>
                <span 
                  className="mono-font"
                  style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.15rem'
                  }}
                >
                  {isPositive ? '+' : ''}{(item.changePct || 0).toFixed(2)}%
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>P/E: <strong>{item.peRatio || '24.2'}</strong></span>
                <span style={{ color: 'var(--accent-pink)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                  Analyze <ArrowUpRight size={13} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketHeatmap;
