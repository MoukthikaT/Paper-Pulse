import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppShell from './components/AppShell';

// Eager load core dashboard
import Dashboard from './pages/Dashboard';

// Lazy-loaded page components for optimal bundle splitting
const Markets = lazy(() => import('./pages/Markets'));
const TradePage = lazy(() => import('./pages/TradePage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const TradeJournalPage = lazy(() => import('./pages/TradeJournalPage'));
const CompareStocks = lazy(() => import('./pages/CompareStocks'));
const StrategyLabPage = lazy(() => import('./pages/StrategyLabPage'));
const RiskLabPage = lazy(() => import('./pages/RiskLabPage'));
const DecisionLabPage = lazy(() => import('./pages/DecisionLabPage'));
const MarketReplayPage = lazy(() => import('./pages/MarketReplayPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

import './index.css';

const RouteLoadingSpinner = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
    <div 
      style={{ 
        width: '32px', 
        height: '32px', 
        border: '3px solid rgba(255,255,255,0.08)', 
        borderTopColor: 'var(--accent-pink)', 
        borderRadius: '50%', 
        animation: 'spin 0.8s linear infinite' 
      }} 
    />
    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', letterSpacing: '0.4px' }}>Loading PaperPulse workspace...</span>
  </div>
);

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/welcome" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const ShellWrapper = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(100000);

  const fetchWallet = () => {
    axios.get(`${API_BASE}/wallet`)
      .then(res => setWalletBalance(res.data.data?.balance || 100000))
      .catch(() => {});
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <AppShell walletBalance={walletBalance} onWalletUpdate={fetchWallet}>
      {children}
    </AppShell>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<RouteLoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              {/* Authenticated Simulator Routes wrapped in AppShell */}
              <Route path="/" element={<ProtectedRoute><ShellWrapper><Dashboard /></ShellWrapper></ProtectedRoute>} />
              <Route path="/markets" element={<ProtectedRoute><ShellWrapper><Markets /></ShellWrapper></ProtectedRoute>} />
              <Route path="/trade" element={<ProtectedRoute><ShellWrapper><TradePage /></ShellWrapper></ProtectedRoute>} />
              <Route path="/portfolio" element={<ProtectedRoute><ShellWrapper><PortfolioPage /></ShellWrapper></ProtectedRoute>} />
              <Route path="/journal" element={<ProtectedRoute><ShellWrapper><TradeJournalPage /></ShellWrapper></ProtectedRoute>} />
              <Route path="/compare" element={<ProtectedRoute><ShellWrapper><CompareStocks /></ShellWrapper></ProtectedRoute>} />
              <Route path="/strategy-lab" element={<ProtectedRoute><ShellWrapper><StrategyLabPage /></ShellWrapper></ProtectedRoute>} />
              <Route path="/risk-lab" element={<ProtectedRoute><ShellWrapper><RiskLabPage /></ShellWrapper></ProtectedRoute>} />
              <Route path="/decision-lab" element={<ProtectedRoute><ShellWrapper><DecisionLabPage /></ShellWrapper></ProtectedRoute>} />
              <Route path="/market-replay" element={<ProtectedRoute><ShellWrapper><MarketReplayPage /></ShellWrapper></ProtectedRoute>} />
              <Route path="/learn" element={<ProtectedRoute><ShellWrapper><LearnPage /></ShellWrapper></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><ShellWrapper><SettingsPage /></ShellWrapper></ProtectedRoute>} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
