import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const AIChatLauncher = ({ onClick }) => {
  return (
    <motion.button
      onClick={() => { sounds.playTick(); onClick(); }}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.94 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 900,
        padding: '0.75rem 1.15rem',
        borderRadius: '999px',
        background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 8px 30px var(--accent-pink-glow)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '0.85rem'
      }}
      aria-label="Open AI Financial Copilot Chat"
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Bot size={19} />
        <span 
          style={{ 
            position: 'absolute', 
            top: -2, 
            right: -2, 
            width: '7px', 
            height: '7px', 
            borderRadius: '50%', 
            background: 'var(--accent-green)',
            boxShadow: '0 0 8px var(--accent-green)'
          }} 
        />
      </div>
      <span>AI Copilot</span>
    </motion.button>
  );
};

export default AIChatLauncher;
