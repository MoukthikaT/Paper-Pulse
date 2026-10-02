import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, Sparkles, ShieldCheck, Zap, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      await register(name, email, password);
      sounds.playSuccess();
      navigate('/');
    } catch (err) {
      sounds.playError();
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
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
          <Sparkles size={14} /> Instant Virtual Capital
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
          Join thousands of simulated traders mastering price action, risk controls, and automated algorithmic strategies with real historical datasets.
        </p>

        {/* Feature Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '440px', marginBottom: '2rem' }}>
          <div className="auth-feature-pill">
            <div style={{ padding: '0.4rem', background: 'rgba(16,185,129,0.15)', borderRadius: '50%', color: 'var(--accent-green)', display: 'flex' }}>
              <Zap size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>₹1,00,000 Starting Wallet</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Instantly credited to your sandbox portfolio</div>
            </div>
          </div>

          <div className="auth-feature-pill">
            <div style={{ padding: '0.4rem', background: 'rgba(236,72,153,0.15)', borderRadius: '50%', color: 'var(--accent-pink)', display: 'flex' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Custom Fintech Themes</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Cyber Neon, Bloomberg Terminal, Tokyo Sapphire & Light</div>
            </div>
          </div>

          <div className="auth-feature-pill">
            <div style={{ padding: '0.4rem', background: 'rgba(6,182,212,0.15)', borderRadius: '50%', color: 'var(--accent-cyan)', display: 'flex' }}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>No Real Money Required</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Safe, risk-free educational environment</div>
            </div>
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
            <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.75rem', fontWeight: 800 }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
              Start your simulated market journey today
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
                Full Name
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon-left">
                  <User size={16} />
                </span>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  placeholder="alex@example.com"
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
              <UserPlus size={17} />
              {loading ? 'Creating Account...' : 'Get Started Free'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
