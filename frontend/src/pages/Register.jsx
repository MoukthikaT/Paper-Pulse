import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
          Receive ₹1,00,000 in virtual capital upon signup. Master technical charts, AI signals, and portfolio risk free from market anxiety.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            <div style={{ padding: '0.35rem', background: 'rgba(16,185,129,0.15)', borderRadius: '50%' }}>
              <Zap size={14} color="var(--accent-green)" />
            </div>
            <span>Instant ₹1,00,000 Virtual Capital Allocation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            <div style={{ padding: '0.35rem', background: 'rgba(236,72,153,0.15)', borderRadius: '50%' }}>
              <Sparkles size={14} color="var(--accent-pink)" />
            </div>
            <span>Multi-Theme Futuristic Trading Terminal</span>
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
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.65rem', textAlign: 'center', fontWeight: 800 }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 0, fontSize: '0.85rem' }}>
              Start your simulated market journey today
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
                <User size={14} /> Full Name
              </label>
              <input 
                type="text" 
                className="input-field" 
                style={{ width: '100%' }}
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                <Mail size={14} /> Email Address
              </label>
              <input 
                type="email" 
                className="input-field" 
                style={{ width: '100%' }}
                placeholder="alex@example.com"
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
              <UserPlus size={16} />
              {loading ? 'Creating Account...' : 'Get Started'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
