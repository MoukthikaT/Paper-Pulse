import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle2, XCircle, Sparkles, X, ChevronRight, RotateCcw, Coins } from 'lucide-react';
import axios from 'axios';
import { sounds } from '../utils/soundEffects';
import { launchConfetti } from '../utils/confetti';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What does a high Price-to-Earnings (P/E) Ratio typically indicate?",
    options: [
      "The stock is completely worthless and should be avoided",
      "Investors anticipate higher future growth or the stock is trading at a premium",
      "The company has zero debt on its balance sheet",
      "The stock pays guaranteed fixed monthly dividends"
    ],
    correctIndex: 1,
    explanation: "A high P/E ratio indicates that the market expects future earnings expansion and is willing to pay a higher multiple per rupee of current profit.",
    term: "P/E Ratio"
  },
  {
    id: 2,
    question: "What does Return on Equity (ROE) measure?",
    options: [
      "How efficiently a company generates profits from shareholder equity capital",
      "The total amount of debt owed to commercial banks",
      "The daily trading volume on the National Stock Exchange",
      "The percentage of revenue paid to employees"
    ],
    correctIndex: 0,
    explanation: "ROE measures financial profitability by revealing how much net profit a company generates for each rupee invested by equity shareholders.",
    term: "ROE"
  },
  {
    id: 3,
    question: "If RSI (Relative Strength Index) rises above 70, the asset is considered:",
    options: [
      "Oversold (undervalued buying zone)",
      "Overbought (potential pullback / consolidation risk)",
      "Delisted from the market",
      "Guaranteed to double within 24 hours"
    ],
    correctIndex: 1,
    explanation: "RSI readings above 70 indicate extreme upward momentum where the asset may be overbought and due for consolidation or profit-taking.",
    term: "RSI Indicator"
  },
  {
    id: 4,
    question: "What is the primary formula for Market Capitalization?",
    options: [
      "Annual Net Profit × 100",
      "Total Company Debt ÷ Cash Reserves",
      "Current Stock Price × Total Number of Outstanding Shares",
      "Gross Revenue − Operating Expenses"
    ],
    correctIndex: 2,
    explanation: "Market Cap = Share Price × Total Outstanding Shares. It defines the total market valuation of a publicly traded enterprise.",
    term: "Market Capitalization"
  },
  {
    id: 5,
    question: "Why should you never base an investment solely on Dividend Yield alone?",
    options: [
      "Dividends are illegal in paper trading",
      "High yield can be an artificial trap caused by a plummeting stock price or unsustainable payout",
      "Companies with dividends never report earnings",
      "Taxes on simulated dividends are 90%"
    ],
    correctIndex: 1,
    explanation: "A high dividend yield can be a 'value trap' if the company's underlying fundamentals or share price are collapsing rapidly.",
    term: "Dividend Yield"
  }
];

const FinQuestQuiz = ({ isOpen, onClose, onRewardClaimed }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [claimedReward, setClaimedReward] = useState(false);
  const [claiming, setClaiming] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelectOption = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.correctIndex) {
      sounds.playSuccess();
      setScore(prev => prev + 1);
    } else {
      sounds.playError();
    }
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      if (score >= 3) {
        launchConfetti(3000);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setClaimedReward(false);
  };

  const handleClaimBonus = async () => {
    const bonusAmount = score * 3000; // e.g. up to ₹15,000 bonus
    if (bonusAmount <= 0) return;
    setClaiming(true);
    try {
      await axios.post(`${API_BASE}/wallet/add-funds`, { amount: bonusAmount });
      sounds.playSuccess();
      launchConfetti(2500);
      setClaimedReward(true);
      if (onRewardClaimed) onRewardClaimed();
    } catch (err) {
      sounds.playError();
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content glass-panel"
          style={{ padding: '1.75rem', maxWidth: '560px' }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ padding: '0.5rem', background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(6,182,212,0.2))', borderRadius: '0.6rem' }}>
                <Award size={22} color="var(--accent-pink)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>FinQuest Literacy Arena</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Level up your financial IQ & earn virtual trading bonuses
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
              <X size={20} />
            </button>
          </div>

          {!quizFinished ? (
            <div>
              {/* Progress bar */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <span>Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                  <span className="mono-font" style={{ color: 'var(--accent-green)' }}>Score: {score}/{QUIZ_QUESTIONS.length}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, var(--accent-pink), var(--accent-cyan))',
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </div>
              </div>

              {/* Question */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span className="pill-tag" style={{ display: 'inline-block', marginBottom: '0.6rem', fontSize: '0.75rem' }}>
                  Concept: {currentQ.term}
                </span>
                <h4 style={{ fontSize: '1.1rem', lineHeight: 1.45, fontWeight: 600 }}>
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                {currentQ.options.map((opt, idx) => {
                  let borderStyle = '1px solid var(--glass-border)';
                  let bgStyle = 'rgba(255,255,255,0.03)';
                  let icon = null;

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      borderStyle = '1px solid var(--accent-green)';
                      bgStyle = 'rgba(16, 185, 129, 0.15)';
                      icon = <CheckCircle2 size={18} color="var(--accent-green)" />;
                    } else if (idx === selectedOption) {
                      borderStyle = '1px solid var(--accent-red)';
                      bgStyle = 'rgba(244, 63, 94, 0.15)';
                      icon = <XCircle size={18} color="var(--accent-red)" />;
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!isAnswered ? { scale: 1.01, x: 4 } : {}}
                      whileTap={!isAnswered ? { scale: 0.99 } : {}}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '0.65rem',
                        border: borderStyle,
                        background: bgStyle,
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        cursor: isAnswered ? 'default' : 'pointer'
                      }}
                    >
                      <span>{opt}</span>
                      {icon}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation note when answered */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '0.85rem 1rem',
                    background: selectedOption === currentQ.correctIndex ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.08)',
                    borderRadius: '0.6rem',
                    border: `1px solid ${selectedOption === currentQ.correctIndex ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                    fontSize: '0.84rem',
                    lineHeight: 1.45,
                    marginBottom: '1.25rem'
                  }}
                >
                  <strong>{selectedOption === currentQ.correctIndex ? '✨ Correct! ' : '💡 Key Insight: '}</strong>
                  {currentQ.explanation}
                </motion.div>
              )}

              {/* Action Button */}
              {isAnswered && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={handleNext}
                >
                  {currentIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}
                  <ChevronRight size={16} />
                </motion.button>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(236,72,153,0.15)', borderRadius: '50%', marginBottom: '1rem', boxShadow: '0 0 30px var(--accent-pink-glow)' }}>
                <Sparkles size={36} color="var(--accent-pink)" />
              </div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>FinQuest Completed!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                You scored <strong className="mono-font" style={{ color: 'var(--accent-green)', fontSize: '1.1rem' }}>{score} / {QUIZ_QUESTIONS.length}</strong>
              </p>

              {score > 0 ? (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Coins size={20} color="var(--accent-amber)" />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Earned Virtual Capital Bonus:</span>
                  </div>
                  <h1 className="mono-font" style={{ color: 'var(--accent-green)', fontSize: '2rem', margin: 0 }}>
                    +₹{(score * 3000).toLocaleString('en-IN')}
                  </h1>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0 0' }}>
                    Reward for active financial literacy training
                  </p>

                  {!claimedReward ? (
                    <button
                      className="btn-success"
                      style={{ marginTop: '1rem', width: '100%', height: '42px' }}
                      onClick={handleClaimBonus}
                      disabled={claiming}
                    >
                      {claiming ? 'Depositing into Wallet...' : 'Claim Bonus to Virtual Wallet'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--accent-green)', marginTop: '1rem', fontWeight: 600 }}>
                      <CheckCircle2 size={18} /> Bonus Deposited into Your Wallet!
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                  Review the glossary definitions and give it another try to earn rewards!
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-outline" style={{ flex: 1 }} onClick={handleRestart}>
                  <RotateCcw size={15} /> Retake Quiz
                </button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={onClose}>
                  Continue Trading
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FinQuestQuiz;
