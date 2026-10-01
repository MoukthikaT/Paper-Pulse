import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, LayoutDashboard, TrendingUp, Zap, Briefcase, 
  BookOpen, Scale, Activity, Shield, Target, PlayCircle, 
  Bot, Award, Settings, ArrowRight, X, Command 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const COMMANDS = [
  { id: 'dash', title: 'Dashboard Overview', category: 'Navigation', icon: LayoutDashboard, path: '/' },
  { id: 'markets', title: 'Market Heatmap & Screener', category: 'Navigation', icon: TrendingUp, path: '/markets' },
  { id: 'trade', title: 'Paper Trading Terminal', category: 'Navigation', icon: Zap, path: '/trade' },
  { id: 'portfolio', title: 'Portfolio & Holdings', category: 'Navigation', icon: Briefcase, path: '/portfolio' },
  { id: 'journal', title: 'Trade Journal & Reflection', category: 'Navigation', icon: BookOpen, path: '/journal' },
  { id: 'compare', title: 'Compare Stocks (Head-to-Head)', category: 'Navigation', icon: Scale, path: '/compare' },
  { id: 'strategy', title: 'Strategy Lab (Backtester)', category: 'Navigation', icon: Activity, path: '/strategy-lab' },
  { id: 'risk', title: 'Risk Lab (2% Position Sizer)', category: 'Navigation', icon: Shield, path: '/risk-lab' },
  { id: 'decision', title: 'Decision Lab (AI vs You)', category: 'Navigation', icon: Target, path: '/decision-lab' },
  { id: 'replay', title: 'Market Replay Simulator', category: 'Navigation', icon: PlayCircle, path: '/market-replay' },
  { id: 'learn', title: 'Learn Financial Path & Quizzes', category: 'Navigation', icon: Award, path: '/learn' },
  { id: 'settings', title: 'Settings & Reset Simulator', category: 'Navigation', icon: Settings, path: '/settings' },
  
  // Stocks
  { id: 'stk-tcs', title: 'TCS — Tata Consultancy Services', category: 'Stocks', icon: TrendingUp, action: 'select-stock', symbol: 'TCS' },
  { id: 'stk-infy', title: 'INFY — Infosys Limited', category: 'Stocks', icon: TrendingUp, action: 'select-stock', symbol: 'INFY' },
  { id: 'stk-hdfc', title: 'HDFC — HDFC Bank', category: 'Stocks', icon: TrendingUp, action: 'select-stock', symbol: 'HDFC' },
  { id: 'stk-sbi', title: 'SBI — State Bank of India', category: 'Stocks', icon: TrendingUp, action: 'select-stock', symbol: 'SBI' },
  { id: 'stk-tata', title: 'TATAPOWER — Tata Power', category: 'Stocks', icon: TrendingUp, action: 'select-stock', symbol: 'TATAPOWER' },

  // Glossary
  { id: 'term-pe', title: 'Explain: P/E Ratio (Price-to-Earnings)', category: 'Glossary', icon: BookOpen, action: 'explain', term: 'P/E Ratio' },
  { id: 'term-rsi', title: 'Explain: RSI (Relative Strength Index)', category: 'Glossary', icon: BookOpen, action: 'explain', term: 'RSI' },
  { id: 'term-sma', title: 'Explain: SMA (Simple Moving Average)', category: 'Glossary', icon: BookOpen, action: 'explain', term: 'SMA' },
  { id: 'term-sl', title: 'Explain: Stop-Loss & Position Sizing', category: 'Glossary', icon: Shield, action: 'explain', term: 'Stop Loss' },
  { id: 'term-macd', title: 'Explain: MACD Momentum Oscillator', category: 'Glossary', icon: Activity, action: 'explain', term: 'MACD' }
];

const CommandPalette = ({ isOpen, onClose, onSelectStock, onOpenExplain, onOpenAIChat }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredCommands = COMMANDS.filter(cmd => {
    if (!query) return true;
    const q = query.toLowerCase();
    return cmd.title.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q) || (cmd.symbol && cmd.symbol.toLowerCase().includes(q));
  });

  const handleSelect = (cmd) => {
    sounds.playTick();
    onClose();
    if (cmd.path) {
      navigate(cmd.path);
    } else if (cmd.action === 'select-stock' && onSelectStock) {
      onSelectStock(cmd.symbol);
      navigate(`/trade?symbol=${cmd.symbol}`);
    } else if (cmd.action === 'explain' && onOpenExplain) {
      onOpenExplain(cmd.term);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content"
          style={{ maxWidth: '580px', padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', background: 'var(--bg-surface)' }}
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--glass-border)', gap: '0.75rem' }}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              ref={inputRef}
              type="text"
              placeholder="Type a command, stock symbol (TCS, INFY), or term... (Esc to close)"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
              ESC
            </span>
          </div>

          {/* Results List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '0.5rem' }}>
            {filteredCommands.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No commands matching "{query}"
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={cmd.id}
                    className={`command-palette-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--accent-pink)' : '3px solid transparent'
                    }}
                  >
                    <div style={{ padding: '0.35rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={isSelected ? 'var(--accent-pink)' : 'var(--text-secondary)'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                        {cmd.title}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {cmd.category}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px' }}>↑↓</kbd> Navigate</span>
              <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px' }}>↵</kbd> Select</span>
            </div>
            <span>PaperPulse Quick Launch</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
