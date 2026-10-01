import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, Mail, Sparkles, ShieldCheck, Zap, Key } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      {/* Branding Section */}
      <div className="auth-branding-section">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'inline-flex', marginBottom: '1.25rem' }}
        >
          <img 
            src="/logo.png" 
            alt="PaperPulse Logo" 
            style={{ width: 'clamp(70px, 12vw, 96px)', height: 'clamp(70px, 12vw, 96px)', borderRadius: '50%', boxShadow: '0 0 35px var(--accent-pink-glow)' }} 
          />
        </motion.div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 800, margin: '0 0 0.75rem 0', background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
          PaperPulse
        </h1>

        <p style={{ fontSize: 'clamp(0.92rem, 2vw, 1.05rem)', color: 'var(--text-secondary)', maxWidth: '460px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Next-generation AI paper trading simulator with real-time technical indicators, autonomous bots, and gamified financial education.
        </p>

        {/* Feature Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            <div style={{ padding: '0.35rem', background: 'rgba(16,185,129,0.15)', borderRadius: '50%' }}>
              <Zap size={14} color="var(--accent-green)" />
            </div>
            <span>AI Signals & Auto-Pilot Paper Trading</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            <div style={{ padding: '0.35rem', background: 'rgba(236,72,153,0.15)', borderRadius: '50%' }}>
              <Sparkles size={14} color="var(--accent-pink)" />
            </div>
            <span>FinQuest Literacy Quiz with Virtual Wallet Bonuses</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            <div style={{ padding: '0.35rem', background: 'rgba(6,182,212,0.15)', borderRadius: '50%' }}>
              <ShieldCheck size={14} color="var(--accent-cyan)" />
            </div>
            <span>Zero Financial Risk. Strictly Educational.</span>
          </div>
        </div>
      </div>

      {/* Auth Form Section */}
      <div className="auth-form-section">
        <motion.div 
          className="glass-panel auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        >
          <div>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.65rem', textAlign: 'center', fontWeight: 800 }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 0, fontSize: '0.85rem' }}>
              Sign in to your simulated trading station
            </p>
          </div>
          
          {error && (
            <div style={{ color: 'var(--accent-red)', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontSize: '0.82rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                <Mail size={14} /> Email Address
              </label>
              <input 
                type="email" 
                className="input-field" 
                style={{ width: '100%' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                <Lock size={14} /> Password
              </label>
              <input 
                type="password" 
                className="input-field" 
                style={{ width: '100%' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ marginTop: '0.25rem', width: '100%', height: '44px' }}
            >
              <LogIn size={16} />
              {loading ? 'Authenticating...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.85rem' }}>
            <button
              type="button"
              className="btn-outline"
              style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem', gap: '0.35rem', color: 'var(--accent-cyan)' }}
              onClick={handleQuickDemoFill}
            >
              <Key size={13} /> Quick Fill Demo Credentials
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
