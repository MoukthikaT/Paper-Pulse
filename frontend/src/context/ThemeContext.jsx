import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  CYBER_NEON: 'cyber-neon',
  MIDNIGHT_TERMINAL: 'midnight-terminal',
  TOKYO_HORIZON: 'tokyo-horizon',
  CLEAN_LUXE: 'clean-luxe'
};

export const THEME_CONFIGS = {
  'cyber-neon': {
    name: 'Cyber Neon',
    accent: '#ec4899',
    badge: '⚡ Cyberpunk',
    isDark: true
  },
  'midnight-terminal': {
    name: 'Bloomberg Terminal',
    accent: '#22c55e',
    badge: '📟 Terminal',
    isDark: true
  },
  'tokyo-horizon': {
    name: 'Tokyo Horizon',
    accent: '#8b5cf6',
    badge: '🌌 Sapphire',
    isDark: true
  },
  'clean-luxe': {
    name: 'Clean Pro Luxe',
    accent: '#0284c7',
    badge: '☀️ Light Luxe',
    isDark: false
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('paperpulse_theme') || THEMES.CYBER_NEON;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('paperpulse_sound');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('paperpulse_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('paperpulse_sound', String(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = () => setSoundEnabled(prev => !prev);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, themeConfigs: THEME_CONFIGS, soundEnabled, toggleSound }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
