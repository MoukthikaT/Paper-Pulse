import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Volume2, VolumeX, Wallet, Award, BookOpen, User, LogOut, ChevronDown, Check } from 'lucide-react';
import { useTheme, THEMES, THEME_CONFIGS } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/soundEffects';

const Navbar = ({ onOpenWallet, onOpenQuiz, onOpenExplain, walletBalance }) => {
  const { theme, setTheme, soundEnabled, toggleSound } = useTheme();
  const { user, logout } = useAuth();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const currentThemeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS['cyber-neon'];

  const handleSelectTheme = (newTheme) => {
    sounds.playTick();
    setTheme(newTheme);
    setThemeDropdownOpen(false);
  };

  return (
    <header className="app-topbar">
      {/* Left: Quick educational & feature triggers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        <button 
          className="btn-outline" 
          onClick={onOpenQuiz}
          style={{ gap: '0.4rem', fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
        >
          <Award size={15} color="var(--accent-pink)" />
          <span>FinQuest Quiz & Rewards</span>
        </button>

        <button 
          className="btn-outline" 
          onClick={onOpenExplain}
          style={{ gap: '0.4rem', fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
        >
          <BookOpen size={15} color="var(--accent-cyan)" />
          <span>Financial Glossary</span>
        </button>
      </div>

      {/* Right: Controls & Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        {/* Wallet Quick Action */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenWallet}
          className="btn-outline"
          style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            borderColor: 'rgba(16, 185, 129, 0.3)',
            color: 'var(--text-primary)',
            padding: '0.45rem 0.9rem',
            gap: '0.5rem'
          }}
        >
          <Wallet size={16} color="var(--accent-green)" />
          <span className="mono-font" style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '0.88rem' }}>
            ₹{walletBalance?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '1,00,000'}
          </span>
          <span style={{ fontSize: '0.72rem', background: 'var(--accent-green)', color: '#000', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
            +TOPUP
          </span>
        </motion.button>

        {/* Sound Toggle */}
        <button 
          onClick={() => { toggleSound(); sounds.playTick(); }}
          className="btn-outline"
          style={{ padding: '0.5rem', width: '38px', height: '38px', borderRadius: '0.6rem' }}
          title={soundEnabled ? 'Audio FX Enabled (Click to mute)' : 'Audio FX Muted (Click to enable)'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 size={17} color="var(--accent-cyan)" /> : <VolumeX size={17} color="var(--text-muted)" />}
        </button>

        {/* Theme Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setThemeDropdownOpen(prev => !prev)}
            className="btn-outline"
            style={{ padding: '0.45rem 0.8rem', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <Palette size={15} color="var(--accent-pink)" />
            <span>{currentThemeConfig.badge}</span>
            <ChevronDown size={14} />
          </button>

          <AnimatePresence>
            {themeDropdownOpen && (
              <>
                <div 
                  style={{ position: 'fixed', inset: 0, zIndex: 120 }} 
                  onClick={() => setThemeDropdownOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '210px',
                    padding: '0.4rem',
                    zIndex: 130,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  {Object.entries(THEME_CONFIGS).map(([key, cfg]) => {
                    const isSelected = theme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectTheme(key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '0.45rem',
                          background: isSelected ? 'rgba(236,72,153,0.15)' : 'transparent',
                          color: isSelected ? 'var(--accent-pink)' : 'var(--text-primary)',
                          fontSize: '0.82rem',
                          fontWeight: isSelected ? 600 : 400,
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.accent }} />
                          <span>{cfg.name}</span>
                        </div>
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
