import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, X, Sparkles, Volume2, VolumeX, Copy, Check, 
  RotateCcw, MessageSquare, Lightbulb, ArrowRight, User 
} from 'lucide-react';
import axios from 'axios';
import { sounds } from '../utils/soundEffects';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const SUGGESTED_PROMPTS = [
  "What is P/E Ratio and why does it matter?",
  "How do I interpret RSI overbought (>70)?",
  "Explain Bollinger Bands breakout strategy",
  "What is the difference between EPS and ROE?",
  "How does the AI Auto-Pilot Bot manage risk?",
  "What is a Stop-Loss order in paper trading?"
];

const AIChatModal = ({ isOpen, onClose, initialQuery = null }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 **Hello! I'm your PaperPulse AI Market Copilot.**\n\nAsk me about any financial terms, technical indicators (RSI, Bollinger Bands, SMA), trading strategies, or paper trading mechanics!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      followUps: ["What is P/E Ratio?", "How does RSI work?", "Explain Auto-Pilot Bot"]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    sounds.playTick();
    const userMsgId = Date.now();
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/explanations/chat`, { query });
      const data = res.data.data;
      sounds.playSuccess();

      const aiMsgId = Date.now() + 1;
      const aiMessage = {
        id: aiMsgId,
        sender: 'ai',
        topic: data.topic,
        text: data.answer,
        category: data.category,
        followUps: data.suggestedFollowUps || [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);

      if (ttsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.answer.replace(/[*#`]/g, ''));
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      sounds.playError();
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `⚠️ **Error connecting to AI Copilot:** ${err.response?.data?.message || 'Please check your connection and try again.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    sounds.playTick();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    sounds.playTick();
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "✨ Conversation cleared. What financial concept would you like to explore next?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUps: ["What is P/E Ratio?", "Explain Bollinger Bands", "What is ROE?"]
      }
    ]);
  };

  const renderFormattedText = (text) => {
    // Basic Markdown parser for bolding, bullet points, and code formatting
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formattedLine = line;

      // Bold **text**
      const boldParts = formattedLine.split(/(\*\*.*?\*\*)/g);
      const elements = boldParts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={pIdx} className="mono-font" style={{ background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px', color: 'var(--accent-pink)' }}>{part.slice(1, -1)}</code>;
        }
        return part;
      });

      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={idx} style={{ paddingLeft: '0.75rem', margin: '0.2rem 0' }}>• {elements}</div>;
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '0.45rem' }} />;
      }
      return <div key={idx} style={{ margin: '0.2rem 0' }}>{elements}</div>;
    });
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content glass-panel"
          style={{ 
            maxWidth: '680px', 
            height: '85vh', 
            maxHeight: '750px',
            display: 'flex', 
            flexDirection: 'column', 
            padding: 0,
            overflow: 'hidden'
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ 
                padding: '0.5rem', 
                background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))', 
                borderRadius: '0.6rem',
                boxShadow: '0 0 15px var(--accent-pink-glow)'
              }}>
                <Bot size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>PaperPulse AI Copilot</h3>
                  <span className="badge-buy" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>API ONLINE</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Intelligent Financial Term Explainer & Technical Mentor
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button 
                onClick={() => setTtsEnabled(prev => !prev)}
                className="btn-outline" 
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                title={ttsEnabled ? 'Mute Speech Synthesis' : 'Enable Speech Synthesis'}
              >
                {ttsEnabled ? <Volume2 size={15} color="var(--accent-green)" /> : <VolumeX size={15} color="var(--text-muted)" />}
                <span>{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
              </button>
              <button 
                onClick={handleClearHistory}
                className="btn-outline" 
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                title="Clear Chat History"
              >
                <RotateCcw size={14} />
              </button>
              <button onClick={onClose} style={{ color: 'var(--text-secondary)', padding: '0.4rem' }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAi ? 'flex-start' : 'flex-end',
                    maxWidth: '92%',
                    alignSelf: isAi ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {isAi ? <Bot size={13} color="var(--accent-pink)" /> : <User size={13} color="var(--accent-cyan)" />}
                    <span>{isAi ? 'AI Copilot' : 'You'}</span>
                    <span>• {msg.time}</span>
                  </div>

                  <div 
                    className="glass-panel"
                    style={{
                      padding: '0.9rem 1.1rem',
                      borderRadius: isAi ? '0.2rem 1rem 1rem 1rem' : '1rem 0.2rem 1rem 1rem',
                      background: isAi ? 'var(--glass-bg-card)' : 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(6,182,212,0.25))',
                      border: `1px solid ${isAi ? 'var(--glass-border)' : 'rgba(236,72,153,0.4)'}`,
                      fontSize: '0.86rem',
                      lineHeight: 1.5,
                      color: 'var(--text-primary)',
                      position: 'relative'
                    }}
                  >
                    {renderFormattedText(msg.text)}

                    {isAi && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.4rem' }}>
                        <button 
                          onClick={() => handleCopy(msg.text, msg.id)} 
                          style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          {copiedId === msg.id ? <Check size={12} color="var(--accent-green)" /> : <Copy size={12} />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Follow-up Prompts */}
                  {isAi && msg.followUps && msg.followUps.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                      {msg.followUps.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          className="pill-tag"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => handleSendMessage(prompt)}
                        >
                          <Lightbulb size={11} color="var(--accent-amber)" />
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.82rem', padding: '0.5rem' }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-pink)', animation: 'pulseGlow 1s infinite' }} />
                <span>AI Copilot is analyzing financial telemetry...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts Bar */}
          <div style={{ padding: '0.5rem 1.25rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.25)', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', gap: '0.45rem' }}>
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                className="btn-outline"
                style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', flexShrink: 0 }}
                onClick={() => handleSendMessage(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.4)', display: 'flex', gap: '0.6rem' }}
          >
            <input 
              type="text" 
              className="input-field" 
              style={{ flex: 1, fontSize: '0.88rem' }}
              placeholder="Ask anything about financial terms, indicators, ratios (e.g. 'What is ROE?')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !inputQuery.trim()}
              style={{ padding: '0 1.25rem', height: '42px' }}
            >
              <Send size={16} />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AIChatModal;
