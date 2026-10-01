import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, Sparkles, Shield, TrendingUp, BookOpen, 
  Target, Activity, ArrowRight, CheckCircle2, ChevronRight, Cpu 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/soundEffects';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    sounds.playTick();
    if (user) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'var(--bg-color)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      {/* Landing Topbar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="PaperPulse Logo" style={{ width: '34px', height: '34px', borderRadius: '50%', boxShadow: '0 0 16px var(--accent-pink-glow)' }} />
          <span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.4px' }}>PaperPulse</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user ? (
            <Link to="/" className="btn-primary" style={{ fontSize: '0.85rem' }}>
              Launch Simulator <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-outline" style={{ fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ fontSize: '0.85rem' }}>
                Get Started Free <ChevronRight size={15} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '3.5rem 1.5rem 2.5rem 1.5rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.85rem', background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '999px', fontSize: '0.78rem', color: 'var(--accent-pink)', marginBottom: '1.25rem', fontWeight: 600 }}>
            <Sparkles size={14} /> AI-POWERED PAPER TRADING & FINANCIAL INTELLIGENCE
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Learn the Market.<br />
            <span style={{ background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Trade Without the Risk.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto 2rem auto' }}>
            PaperPulse combines AI-assisted market analytics, explainable signals, strategy backtesting, and a 7-module financial curriculum in one interactive decision simulator.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={handleCTA} className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
              Enter Paper Trading <ArrowRight size={16} />
            </button>
            <button onClick={() => { sounds.playTick(); navigate('/register'); }} className="btn-outline" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
              Explore AI & Strategy Lab
            </button>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: '1100px', margin: '2rem auto 4rem auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-pink)' }}>
            <div style={{ padding: '0.65rem', borderRadius: '50%', background: 'rgba(236,72,153,0.15)', color: 'var(--accent-pink)', display: 'inline-flex', marginBottom: '0.75rem' }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 700 }}>Explainable AI Signals</h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Understand the exact machine learning weights behind every BUY, SELL, or HOLD recommendation with transparent factor contribution bars.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
            <div style={{ padding: '0.65rem', borderRadius: '50%', background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)', display: 'inline-flex', marginBottom: '0.75rem' }}>
              <Target size={22} />
            </div>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 700 }}>Decision Lab & AI vs You</h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Analyze blinded historical market snapshots with hidden future candles. Test your trading intuition and compare accuracy head-to-head with AI.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-green)' }}>
            <div style={{ padding: '0.65rem', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)', display: 'inline-flex', marginBottom: '0.75rem' }}>
              <Activity size={22} />
            </div>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 700 }}>Strategy Lab Backtesting</h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Simulate algorithmic momentum and moving average strategies directly benchmarked against passive Buy & Hold with win rate and drawdown telemetry.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-amber)' }}>
            <div style={{ padding: '0.65rem', borderRadius: '50%', background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)', display: 'inline-flex', marginBottom: '0.75rem' }}>
              <Shield size={22} />
            </div>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 700 }}>2% Risk Management Studio</h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Calculate institutional position sizes, stop-loss protection levels, and stress test your portfolio against simulated market shocks.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #38bdf8' }}>
            <div style={{ padding: '0.65rem', borderRadius: '50%', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', display: 'inline-flex', marginBottom: '0.75rem' }}>
              <BookOpen size={22} />
            </div>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 700 }}>Trade Journal & Reflections</h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Document your pre-trade hypotheses and evaluate cognitive biases through disciplined post-trade reflections on the simulated ledger.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ padding: '0.65rem', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', display: 'inline-flex', marginBottom: '0.75rem' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 700 }}>7-Module Financial Academy</h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Step through structured modules from market fundamentals to quantitative strategy design, integrated with gamified FinQuest quizzes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
        <p style={{ margin: 0 }}>
          Educational simulator • Virtual money only • Not financial advice • Historical datasets
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
