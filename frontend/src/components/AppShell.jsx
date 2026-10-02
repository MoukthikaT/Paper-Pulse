import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, TrendingUp, Zap, Briefcase, BookOpen, 
  Scale, Activity, Shield, Target, PlayCircle, Award, 
  Settings, Bot, Search, Volume2, VolumeX, 
  LogOut, Menu, X, PlusCircle, HelpCircle, Sparkles, 
  Cpu, Palette, ChevronDown, Check, Wallet 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEME_CONFIGS } from '../context/ThemeContext';
import { sounds } from '../utils/soundEffects';
import CommandPalette from './CommandPalette';
import DemoTourModal from './DemoTourModal';
import AIPipelineModal from './AIPipelineModal';
import ExplainItPanel from './ExplainItPanel';
import FinQuestQuiz from './FinQuestQuiz';
import AIChatModal from './AIChatModal';
import AIChatLauncher from './AIChatLauncher';
import WalletTopupModal from './WalletTopupModal';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/markets', label: 'Markets', icon: TrendingUp },
  { path: '/trade', label: 'Paper Trade', icon: Zap },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { path: '/journal', label: 'Trade Journal', icon: BookOpen },
  { path: '/compare', label: 'Compare', icon: Scale },
  { path: '/strategy-lab', label: 'Strategy Lab', icon: Activity },
  { path: '/risk-lab', label: 'Risk Lab', icon: Shield },
  { path: '/decision-lab', label: 'Decision Lab', icon: Target },
  { path: '/market-replay', label: 'Market Replay', icon: PlayCircle },
  { path: '/learn', label: 'Learn & Quiz', icon: Award },
  { path: '/settings', label: 'Settings', icon: Settings }
];

const AppShell = ({ children, walletBalance = 100000, onWalletUpdate }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme, soundEnabled, toggleSound } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Modals & Drawers
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showDemoTour, setShowDemoTour] = useState(false);
  const [showAIPipeline, setShowAIPipeline] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [explainTerm, setExplainTerm] = useState(null);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  // Keyboard shortcut for Command Palette: Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenExplain = (term = null) => {
    setExplainTerm(term);
    setShowExplain(true);
    sounds.playTick();
  };

  return (
    <div className="grid-bg app-layout">
      {/* Desktop & Tablet Sidebar */}
      <motion.aside 
        initial={{ x: -260, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="sidebar glass-panel desktop-sidebar"
      >
        {/* Brand Logo */}
        <Link 
          to="/" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.25rem', marginBottom: '1.25rem', textDecoration: 'none' }}
          onClick={() => sounds.playTick()}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/logo.png" 
              alt="PaperPulse Logo" 
              style={{ width: '32px', height: '32px', borderRadius: '50%', boxShadow: '0 0 16px var(--accent-pink-glow)' }} 
            />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800, letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
              PaperPulse
            </h2>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AI Paper Trading
            </span>
          </div>
        </Link>

        {/* Quick Search Button in Sidebar */}
        <button
          onClick={() => { setShowCommandPalette(true); sounds.playTick(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.55rem 0.85rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--glass-border)',
            borderRadius: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.78rem',
            marginBottom: '1rem',
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Search size={14} /> Quick Search...
          </span>
          <kbd style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '3px' }}>
            Ctrl+K
          </kbd>
        </button>

        {/* Primary Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', flex: 1, paddingRight: '0.2rem' }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => sounds.playTick()}
              >
                <Icon size={17} color={isActive ? 'var(--accent-pink)' : 'var(--text-secondary)'} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button 
            onClick={() => { setShowAIChat(true); sounds.playTick(); }}
            className="nav-link"
            style={{ width: '100%', textAlign: 'left', background: 'none' }}
          >
            <Bot size={17} color="var(--accent-pink)" />
            <span>AI Copilot</span>
          </button>
        </nav>

        {/* Sidebar Footer — User & Quick Balance */}
        <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Virtual Wallet Quick Pill */}
          <div 
            onClick={() => { setShowWalletModal(true); sounds.playTick(); }}
            style={{ 
              padding: '0.55rem 0.75rem', 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '0.5rem', 
              border: '1px solid var(--glass-border)',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
            title="Click to Top-Up Virtual Capital"
          >
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Virtual Cash</span>
              <div className="mono-font" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                ₹{walletBalance?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <PlusCircle size={15} color="var(--accent-cyan)" />
          </div>

          {/* User Profile / Logout */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Trader'}
                </p>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Demo Account</span>
              </div>
            </div>

            <button 
              onClick={() => { sounds.playTick(); logout(); navigate('/login'); }}
              style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Topbar */}
      <header className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" alt="PaperPulse Logo" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.3px' }}>PaperPulse</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button onClick={() => { setShowCommandPalette(true); sounds.playTick(); }} style={{ padding: '0.45rem', color: 'var(--text-secondary)' }}>
            <Search size={18} />
          </button>
          <button onClick={() => { setShowAIChat(true); sounds.playTick(); }} style={{ padding: '0.45rem', color: 'var(--accent-pink)' }}>
            <Bot size={19} />
          </button>
          <button onClick={() => setMobileMenuOpen(true)} style={{ padding: '0.45rem', color: 'var(--text-primary)' }}>
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              className="mobile-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              className="glass-panel"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '280px',
                height: '100vh',
                zIndex: 1100,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 0,
                padding: '1.25rem',
                background: 'var(--bg-surface)'
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src="/logo.png" alt="PaperPulse Logo" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>PaperPulse</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>
                  <X size={20} />
                </button>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1rem', overflowY: 'auto' }}>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <button onClick={() => { logout(); navigate('/login'); }} className="btn-outline" style={{ width: '100%' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Workspace */}
      <main className="main-content">
        {/* Top Operational Telemetry Bar */}
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.65rem', background: 'rgba(255,255,255,0.04)', borderRadius: '999px', border: '1px solid var(--glass-border)', fontSize: '0.74rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }} />
              <span className="mono-font" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                SIMULATED • NSE HISTORICAL
              </span>
            </div>

            <button 
              onClick={() => { setShowAIPipeline(true); sounds.playTick(); }}
              className="pill-tag"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Cpu size={13} color="var(--accent-pink)" /> How AI Works
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Quick Wallet Topup Button */}
            <button
              onClick={() => { setShowWalletModal(true); sounds.playTick(); }}
              className="btn-outline mono-font"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: 'var(--accent-green)', borderColor: 'rgba(16,185,129,0.3)', gap: '0.35rem' }}
              title="Topup Virtual Capital"
            >
              <Wallet size={14} />
              <span>₹{walletBalance?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </button>

            {/* 30-Second Judge Walkthrough Trigger */}
            <button 
              onClick={() => { setShowDemoTour(true); sounds.playSuccess(); }}
              className="btn-glow"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              <Sparkles size={14} /> 30s Demo Tour
            </button>

            {/* Theme Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setThemeDropdownOpen(prev => !prev)}
                className="btn-outline"
                style={{ padding: '0.35rem 0.65rem', gap: '0.35rem', fontSize: '0.78rem' }}
                title="Change Interface Theme"
              >
                <Palette size={14} color="var(--accent-pink)" />
                <span className="hide-on-mobile">{THEME_CONFIGS[theme]?.badge || 'Theme'}</span>
                <ChevronDown size={13} />
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
                        gap: '0.25rem',
                        background: 'var(--bg-surface)'
                      }}
                    >
                      {Object.entries(THEME_CONFIGS).map(([key, cfg]) => {
                        const isSelected = theme === key;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              sounds.playTick();
                              setTheme(key);
                              setThemeDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.5rem 0.7rem',
                              borderRadius: '0.45rem',
                              background: isSelected ? 'rgba(236,72,153,0.15)' : 'transparent',
                              color: isSelected ? 'var(--accent-pink)' : 'var(--text-primary)',
                              fontSize: '0.8rem',
                              fontWeight: isSelected ? 600 : 400,
                              textAlign: 'left',
                              border: 'none',
                              cursor: 'pointer'
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

            {/* Sound Toggle */}
            <button 
              onClick={toggleSound}
              className="btn-outline"
              style={{ padding: '0.4rem', borderRadius: '50%', width: '32px', height: '32px' }}
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? <Volume2 size={15} color="var(--accent-pink)" /> : <VolumeX size={15} color="var(--text-secondary)" />}
            </button>

            {/* Glossary Trigger */}
            <button 
              onClick={() => handleOpenExplain()}
              className="btn-outline"
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }}
            >
              <HelpCircle size={14} color="var(--accent-green)" /> Glossary
            </button>
          </div>
        </header>

        {/* Page Inner Content */}
        {children}

        {/* Permanent Subtle Educational Disclaimer */}
        <footer style={{ marginTop: '3.5rem', padding: '1.25rem 0.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
          <p style={{ margin: 0 }}>
            <strong>PaperPulse:</strong> Educational simulator • Virtual money only • Not financial advice • Historical datasets
          </p>
        </footer>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <Link to="/" className={`mobile-bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </Link>
        <Link to="/markets" className={`mobile-bottom-nav-item ${location.pathname === '/markets' ? 'active' : ''}`}>
          <TrendingUp size={18} />
          <span>Markets</span>
        </Link>
        <Link to="/trade" className={`mobile-bottom-nav-item ${location.pathname === '/trade' ? 'active' : ''}`}>
          <Zap size={18} />
          <span>Trade</span>
        </Link>
        <Link to="/portfolio" className={`mobile-bottom-nav-item ${location.pathname === '/portfolio' ? 'active' : ''}`}>
          <Briefcase size={18} />
          <span>Portfolio</span>
        </Link>
        <button 
          onClick={() => setShowAIChat(true)} 
          className="mobile-bottom-nav-item"
          style={{ background: 'none', border: 'none' }}
        >
          <Bot size={18} color="var(--accent-pink)" />
          <span>AI Copilot</span>
        </button>
      </nav>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette 
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenExplain={(term) => handleOpenExplain(term)}
        onOpenAIChat={() => setShowAIChat(true)}
      />

      {/* Demo Tour Walkthrough */}
      <DemoTourModal 
        isOpen={showDemoTour}
        onClose={() => setShowDemoTour(false)}
      />

      {/* AI Pipeline Architecture Modal */}
      <AIPipelineModal 
        isOpen={showAIPipeline}
        onClose={() => setShowAIPipeline(false)}
      />

      {/* Glossary & Terms Modal */}
      {showExplain && (
        <ExplainItPanel 
          selectedTermParam={explainTerm}
          onClose={() => { setShowExplain(false); setExplainTerm(null); }} 
          onStartQuiz={() => setShowQuiz(true)} 
          onOpenAIChat={() => setShowAIChat(true)} 
        />
      )}

      {/* FinQuest Quiz Modal */}
      <FinQuestQuiz 
        isOpen={showQuiz} 
        onClose={() => setShowQuiz(false)} 
        onRewardClaimed={onWalletUpdate}
      />

      {/* Virtual Wallet Topup Modal */}
      <WalletTopupModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
        onTopupSuccess={onWalletUpdate}
      />

      {/* AI Copilot Chat Modal */}
      <AIChatModal 
        isOpen={showAIChat} 
        onClose={() => setShowAIChat(false)} 
      />

      {/* Floating AI Copilot Chat Trigger */}
      <AIChatLauncher onClick={() => setShowAIChat(true)} />
    </div>
  );
};

export default AppShell;
