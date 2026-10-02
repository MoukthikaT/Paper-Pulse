import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, Mail, Sparkles, ShieldCheck, Zap, Key, Eye, EyeOff, CheckCircle2, TrendingUp } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    sounds.playTick();
    try {
      await login(email, password);
      sounds.playSuccess();
      navigate('/');
    } catch (err) {
      sounds.playError();
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    sounds.playTick();
    setEmail('trader@paperpulse.ai');
    setPassword('PulsePass123!');
  };

  return (
    <div className="grid-bg auth-page-container">
      {/* Left Hero / Branding Section */}
      <motion.div 
        className="auth-branding-section"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="auth-branding-badge">
          <Sparkles size={14} /> Next-Gen AI Trading Platform
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <img 
            src="/logo.png" 
            alt="PaperPulse Logo" 
            style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              boxShadow: '0 0 30px var(--accent-pink-glow)',
              border: '2px solid rgba(236, 72, 153, 0.4)'
            }} 
          />
          <h1 style={{ 
            fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)', 
            fontWeight: 800, 
            margin: 0, 
            background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            letterSpacing: '-1.5px',
            lineHeight: 1
          }}>
            PaperPulse
          </h1>
        </div>

        <p style={{ 
          fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)', 
          color: 'var(--text-secondary)', 
          maxWidth: '480px', 
          lineHeight: 1.6, 
          marginBottom: '2rem' 
        }}>
          Master financial markets with AI-driven signals, algorithmic backtesting, and interactive decision scenarios with zero capital risk.
        </p>

        {/* Feature Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '440px', marginBottom: '2rem' }}>
          <div className="auth-feature-pill">
            <div style={{ padding: '0.4rem', background: 'rgba(16,185,129,0.15)', borderRadius: '50%', color: 'var(--accent-green)', display: 'flex' }}>
              <Zap size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>AI Signals & Auto-Pilot Engine</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Automated algorithmic market scanning</div>
            </div>
          </div>

          <div className="auth-feature-pill">
            <div style={{ padding: '0.4rem', background: 'rgba(236,72,153,0.15)', borderRadius: '50%', color: 'var(--accent-pink)', display: 'flex' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>FinQuest Financial Literacy</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Gamified quizzes & virtual cash rewards</div>
            </div>
          </div>

          <div className="auth-feature-pill">
            <div style={{ padding: '0.4rem', background: 'rgba(6,182,212,0.15)', borderRadius: '50%', color: 'var(--accent-cyan)', display: 'flex' }}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Institutional 2% Risk Engine</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Strict position sizing & zero real financial risk</div>
            </div>
          </div>
        </div>

        {/* Stat Bar */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', maxWidth: '440px' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)' }}>₹1,00,000</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Virtual Starting Balance</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>5 Stocks</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>NSE Historical Feeds</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-pink)' }}>100% Free</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Educational Access</div>
          </div>
        </div>
      </motion.div>

      {/* Right Form Section */}
      <div className="auth-form-section">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        >
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
              Sign in to your simulated trading station
            </p>
          </div>
          
          {error && (
            <div className="auth-error-alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>
                Email Address
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon-left">
                  <Mail size={16} />
                </span>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>
                Password
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon-left">
                  <Lock size={16} />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="input-field" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-input-btn-right"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }} 
              whileTap={{ scale: 0.99 }} 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ marginTop: '0.35rem', width: '100%', height: '46px', fontSize: '0.95rem' }}
            >
              <LogIn size={17} />
              {loading ? 'Authenticating...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="auth-demo-box">
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Testing the simulator?
            </span>
            <button
              type="button"
              className="btn-outline"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem 0.75rem', gap: '0.4rem', borderColor: 'rgba(6, 182, 212, 0.4)', color: 'var(--accent-cyan)' }}
              onClick={handleQuickDemoFill}
            >
              <Key size={14} /> Auto-Fill Demo Credentials
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
