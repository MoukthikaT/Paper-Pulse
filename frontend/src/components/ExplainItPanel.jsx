import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, BookOpen, Sparkles, Award, Calculator, 
  Send, Bot, Lightbulb, ChevronRight, HelpCircle, Layers, 
  RotateCcw, ArrowRight, CheckCircle2, AlertTriangle, Cpu 
} from 'lucide-react';
import axios from 'axios';
import { sounds } from '../utils/soundEffects';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const CATEGORIES = [
  { id: 'ALL', label: 'All Terms' },
  { id: 'VALUATION', label: 'Valuation (P/E, Market Cap)' },
  { id: 'PROFITABILITY', label: 'Profitability (ROE, EPS, Profit)' },
  { id: 'RISK', label: 'Risk & Leverage (D/E, 52W Range)' },
  { id: 'TECHNICALS', label: 'Technicals (RSI, Bollinger, SMA)' }
];

const ExplainItPanel = ({ onClose, onStartQuiz, onOpenAIChat }) => {
  const [activeTab, setActiveTab] = useState('academy'); // 'academy', 'sandbox', 'flashcards', 'ai-copilot'
  const [terms, setTerms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Flashcards mode state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Sandbox Live Calculators state
  const [calcType, setCalcType] = useState('pe'); // 'pe', 'roe', 'eps', 'mcap', 'de'
  const [calcInputs, setCalcInputs] = useState({
    price: 2270,
    eps: 85,
    netIncome: 1200,
    equity: 6000,
    shares: 100,
    debt: 1500
  });

  // AI Copilot direct tab
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiAsking, setAiAsking] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/explanations`)
      .then(res => {
        setTerms(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleAskAI = async (queryText) => {
    const q = queryText || aiQuestion;
    if (!q.trim()) return;
    setAiAsking(true);
    setAiAnswer(null);
    sounds.playTick();

    try {
      const res = await axios.post(`${API_BASE}/explanations/chat`, { query: q });
      sounds.playSuccess();
      setAiAnswer(res.data.data);
    } catch (err) {
      sounds.playError();
      setAiAnswer({
        answer: 'Failed to fetch AI explanation. Please verify server connectivity.'
      });
    } finally {
      setAiAsking(false);
    }
  };

  // Categorize terms dynamically
  const getTermCategory = (term) => {
    const name = term.term.toUpperCase();
    if (name.includes('P/E') || name.includes('MARKET CAP') || name.includes('DIVIDEND')) return 'VALUATION';
    if (name.includes('ROE') || name.includes('EPS') || name.includes('PROFIT') || name.includes('REVENUE')) return 'PROFITABILITY';
    if (name.includes('DEBT') || name.includes('52-WEEK') || name.includes('RISK')) return 'RISK';
    return 'TECHNICALS';
  };

  const filteredTerms = terms.filter(t => {
    const cat = getTermCategory(t);
    const matchesCategory = selectedCategory === 'ALL' || cat === selectedCategory;
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                          t.definition.toLowerCase().includes(search.toLowerCase()) ||
                          (t.importance && t.importance.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculator computations
  const calculatedMetrics = {
    pe: (calcInputs.price / Math.max(0.1, calcInputs.eps)).toFixed(2),
    roe: ((calcInputs.netIncome / Math.max(1, calcInputs.equity)) * 100).toFixed(2),
    eps: (calcInputs.netIncome / Math.max(1, calcInputs.shares)).toFixed(2),
    mcap: (calcInputs.price * calcInputs.shares).toLocaleString('en-IN'),
    de: (calcInputs.debt / Math.max(1, calcInputs.equity)).toFixed(2)
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="mobile-drawer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div 
        className="glass-panel explain-panel-container"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      >
        {/* Top Header */}
        <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.45rem', background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))', borderRadius: '0.6rem' }}>
              <BookOpen size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Finance Academy & Sandbox</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Interactive Metrics, Calculators & Flashcards</span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', padding: '0.3rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.25)' }}>
          {[
            { id: 'academy', label: 'Glossary', icon: <BookOpen size={13} /> },
            { id: 'sandbox', label: 'Calculator', icon: <Calculator size={13} /> },
            { id: 'flashcards', label: 'Flashcards', icon: <Layers size={13} /> },
            { id: 'ai-copilot', label: 'Ask AI', icon: <Bot size={13} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); sounds.playTick(); }}
              style={{
                padding: '0.65rem 0.25rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-pink)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-pink)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                background: activeTab === tab.id ? 'rgba(236,72,153,0.08)' : 'transparent'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ========================================================
            TAB 1: GLOSSARY ACADEMY
        ======================================================== */}
        {activeTab === 'academy' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Search & Category Filter */}
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ position: 'relative', marginBottom: '0.6rem' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search metrics (P/E, ROE, EPS, Market Cap)..." 
                  style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.82rem' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    className={`pill-tag ${selectedCategory === c.id ? 'active' : ''}`}
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', flexShrink: 0 }}
                    onClick={() => { setSelectedCategory(c.id); sounds.playTick(); }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Concepts */}
            <div style={{ padding: '1rem 1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                  Loading academy definitions...
                </div>
              ) : filteredTerms.length > 0 ? (
                filteredTerms.map((t, idx) => (
                  <motion.div 
                    key={t.term}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="glass-card"
                    style={{ padding: '1.1rem', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ color: 'var(--accent-pink)', margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{t.term}</h4>
                      <button 
                        className="pill-tag"
                        style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => {
                          setActiveTab('ai-copilot');
                          setAiQuestion(`Explain ${t.term} with formulas, valuation benchmarks, and simulated examples`);
                          handleAskAI(`Explain ${t.term} with formulas, valuation benchmarks, and simulated examples`);
                        }}
                      >
                        <Bot size={12} color="var(--accent-cyan)" /> Deep Dive
                      </button>
                    </div>

                    <p style={{ fontSize: '0.84rem', margin: 0, lineHeight: 1.5, color: 'var(--text-primary)' }}>
                      {t.definition}
                    </p>

                    {t.importance && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '0.55rem 0.75rem', borderRadius: '0.45rem', lineHeight: 1.45 }}>
                        <strong style={{ color: 'var(--accent-cyan)' }}>Why it matters:</strong> {t.importance}
                      </div>
                    )}

                    {t.example && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)', fontStyle: 'italic', lineHeight: 1.4 }}>
                        💡 <strong>Real-World Example:</strong> {t.example}
                      </div>
                    )}

                    {t.caution && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--accent-amber)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '0.45rem 0.65rem', borderRadius: '0.4rem', lineHeight: 1.4 }}>
                        ⚠️ <strong>Pro-Tip:</strong> {t.caution}
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2.5rem 0', fontSize: '0.85rem' }}>
                  No terms found matching "{search}".
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: INTERACTIVE METRIC SANDBOX / CALCULATOR
        ======================================================== */}
        {activeTab === 'sandbox' && (
          <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem' }}>Interactive Metric Sandbox</h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Adjust variables in real-time to observe how financial ratios change dynamically.
              </p>
            </div>

            {/* Metric Selector Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'pe', label: 'P/E Ratio' },
                { id: 'roe', label: 'ROE %' },
                { id: 'eps', label: 'EPS' },
                { id: 'mcap', label: 'Market Cap' },
                { id: 'de', label: 'Debt/Equity' }
              ].map(item => (
                <button
                  key={item.id}
                  className={`pill-tag mono-font ${calcType === item.id ? 'active' : ''}`}
                  style={{ fontSize: '0.76rem', padding: '0.3rem 0.65rem' }}
                  onClick={() => { setCalcType(item.id); sounds.playTick(); }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Live Interactive Calculation Panel */}
            <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--accent-pink-glow)' }}>
              {calcType === 'pe' && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Formula: Stock Price ÷ EPS</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0.5rem 0 1rem 0' }}>
                    <h2 className="mono-font" style={{ margin: 0, fontSize: '2.2rem', color: 'var(--accent-pink)' }}>
                      {calculatedMetrics.pe}x
                    </h2>
                    <span className="badge-buy" style={{ fontSize: '0.75rem' }}>
                      {Number(calculatedMetrics.pe) < 18 ? 'Value Zone (<18x)' : (Number(calculatedMetrics.pe) < 30 ? 'Fair Growth (18-30x)' : 'High Premium (>30x)')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        <span>Share Price (INR):</span>
                        <strong className="mono-font">₹{calcInputs.price}</strong>
                      </div>
                      <input 
                        type="range" min="100" max="5000" step="50"
                        value={calcInputs.price} 
                        onChange={(e) => setCalcInputs({ ...calcInputs, price: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-pink)' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        <span>Earnings Per Share (EPS):</span>
                        <strong className="mono-font">₹{calcInputs.eps}</strong>
                      </div>
                      <input 
                        type="range" min="5" max="250" step="5"
                        value={calcInputs.eps} 
                        onChange={(e) => setCalcInputs({ ...calcInputs, eps: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {calcType === 'roe' && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Formula: (Net Income ÷ Shareholder Equity) × 100</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0.5rem 0 1rem 0' }}>
                    <h2 className="mono-font" style={{ margin: 0, fontSize: '2.2rem', color: 'var(--accent-green)' }}>
                      {calculatedMetrics.roe}%
                    </h2>
                    <span className="badge-buy" style={{ fontSize: '0.75rem' }}>
                      {Number(calculatedMetrics.roe) >= 15 ? '✨ High Quality (≥15%)' : 'Moderate (<15%)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        <span>Net Profit (Cr):</span>
                        <strong className="mono-font">₹{calcInputs.netIncome} Cr</strong>
                      </div>
                      <input 
                        type="range" min="100" max="10000" step="100"
                        value={calcInputs.netIncome} 
                        onChange={(e) => setCalcInputs({ ...calcInputs, netIncome: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-green)' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        <span>Shareholder Equity (Cr):</span>
                        <strong className="mono-font">₹{calcInputs.equity} Cr</strong>
                      </div>
                      <input 
                        type="range" min="500" max="30000" step="500"
                        value={calcInputs.equity} 
                        onChange={(e) => setCalcInputs({ ...calcInputs, equity: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-pink)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {calcType === 'de' && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Formula: Total Liabilities ÷ Total Equity</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0.5rem 0 1rem 0' }}>
                    <h2 className="mono-font" style={{ margin: 0, fontSize: '2.2rem', color: Number(calculatedMetrics.de) > 1.5 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
                      {calculatedMetrics.de}x
                    </h2>
                    <span className={Number(calculatedMetrics.de) <= 1 ? 'badge-buy' : 'badge-sell'} style={{ fontSize: '0.75rem' }}>
                      {Number(calculatedMetrics.de) <= 1 ? 'Safe Solvency (≤1.0)' : 'High Leverage (>1.0)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        <span>Total Debt (Cr):</span>
                        <strong className="mono-font">₹{calcInputs.debt} Cr</strong>
                      </div>
                      <input 
                        type="range" min="0" max="15000" step="250"
                        value={calcInputs.debt} 
                        onChange={(e) => setCalcInputs({ ...calcInputs, debt: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-red)' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        <span>Shareholders Equity (Cr):</span>
                        <strong className="mono-font">₹{calcInputs.equity} Cr</strong>
                      </div>
                      <input 
                        type="range" min="500" max="30000" step="500"
                        value={calcInputs.equity} 
                        onChange={(e) => setCalcInputs({ ...calcInputs, equity: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {calcType === 'eps' && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Formula: Net Income ÷ Total Outstanding Shares</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0.5rem 0 1rem 0' }}>
                    <h2 className="mono-font" style={{ margin: 0, fontSize: '2.2rem', color: 'var(--accent-pink)' }}>
                      ₹{calculatedMetrics.eps}
                    </h2>
                    <span className="badge-buy" style={{ fontSize: '0.75rem' }}>Earnings Per Share</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        <span>Net Profit (Cr):</span>
                        <strong className="mono-font">₹{calcInputs.netIncome} Cr</strong>
                      </div>
                      <input 
                        type="range" min="100" max="10000" step="100"
                        value={calcInputs.netIncome} 
                        onChange={(e) => setCalcInputs({ ...calcInputs, netIncome: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-pink)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {calcType === 'mcap' && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Formula: Stock Price × Outstanding Shares</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0.5rem 0 1rem 0' }}>
                    <h2 className="mono-font" style={{ margin: 0, fontSize: '1.8rem', color: 'var(--accent-cyan)' }}>
                      ₹{calculatedMetrics.mcap} Cr
                    </h2>
                    <span className="badge-buy" style={{ fontSize: '0.75rem' }}>Total Enterprise Value</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: INTERACTIVE FLASHCARDS MODE
        ======================================================== */}
        {activeTab === 'flashcards' && (
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {terms.length > 0 && (
              <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Flashcard {flashcardIndex + 1} of {terms.length}</span>
                  <span style={{ color: 'var(--accent-pink)' }}>Click card to flip</span>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setIsFlipped(prev => !prev); sounds.playTick(); }}
                  className="glass-panel"
                  style={{
                    width: '100%',
                    minHeight: '260px',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid var(--accent-pink-glow)',
                    boxShadow: '0 12px 30px var(--accent-pink-glow)',
                    background: isFlipped ? 'var(--bg-surface-elevated)' : 'var(--glass-bg)'
                  }}
                >
                  {!isFlipped ? (
                    <div>
                      <span className="pill-tag" style={{ fontSize: '0.72rem', marginBottom: '0.75rem', display: 'inline-block' }}>Concept</span>
                      <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-pink)', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
                        {terms[flashcardIndex]?.term}
                      </h2>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                        (Tap anywhere to reveal definition & formula)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 700, textTransform: 'uppercase' }}>Definition</span>
                      <p style={{ fontSize: '0.9rem', lineHeight: 1.5, margin: '0.5rem 0 0.75rem 0' }}>
                        {terms[flashcardIndex]?.definition}
                      </p>
                      {terms[flashcardIndex]?.example && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          Ex: {terms[flashcardIndex]?.example}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                  <button 
                    className="btn-outline" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      setFlashcardIndex(prev => (prev > 0 ? prev - 1 : terms.length - 1));
                      setIsFlipped(false);
                      sounds.playTick();
                    }}
                  >
                    Previous
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      setFlashcardIndex(prev => (prev < terms.length - 1 ? prev + 1 : 0));
                      setIsFlipped(false);
                      sounds.playTick();
                    }}
                  >
                    Next Card <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: AI COPILOT DIRECT CHAT
        ======================================================== */}
        {activeTab === 'ai-copilot' && (
          <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ask AI anything about financial terms or strategies..."
                style={{ flex: 1, fontSize: '0.84rem' }}
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAskAI(); }}
              />
              <button 
                className="btn-primary" 
                style={{ padding: '0 1rem' }}
                onClick={() => handleAskAI()}
                disabled={aiAsking || !aiQuestion.trim()}
              >
                <Send size={15} />
              </button>
            </div>

            {aiAsking && (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                AI is compiling structured financial telemetry...
              </div>
            )}

            {aiAnswer && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card" 
                style={{ padding: '1.1rem', border: '1px solid var(--glass-border)', lineHeight: 1.55, fontSize: '0.84rem', whiteSpace: 'pre-line' }}
              >
                {aiAnswer.answer}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ExplainItPanel;
