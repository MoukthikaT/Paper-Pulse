import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, BookOpen, CheckCircle2, ChevronRight, Play, 
  HelpCircle, Sparkles, Shield, Activity, BarChart2, Star, Zap 
} from 'lucide-react';
import FinQuestQuiz from '../components/FinQuestQuiz';
import { sounds } from '../utils/soundEffects';

const LESSONS = [
  {
    id: 1,
    number: '01',
    title: 'Market Foundations & Order Types',
    duration: '4 mins',
    level: 'Beginner',
    summary: 'How equities trade, bid/ask spreads, market orders vs limit orders, and virtual paper trading settlement mechanics.',
    content: `
### What is the Stock Market?
The stock market is an auction network where buyers and sellers exchange shares of publicly listed companies. In India, primary trading occurs on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE).

#### Key Mechanics:
* **Market Order:** An order executed immediately at the best available current market spot price.
* **Limit Order:** An order executed only at a specified price or better.
* **Paper Trading:** A risk-free simulated environment using real or historical price feeds to practice execution discipline without risking actual capital.
    `,
    quizQuestion: {
      question: 'What is the primary benefit of paper trading before risking real money?',
      options: ['Guaranteed 100% profits', 'Practice strategy discipline and execution risk-free', 'Skip government trading taxes', 'Trade outside of market hours'],
      correctIndex: 1
    }
  },
  {
    id: 2,
    number: '02',
    title: 'Reading Price Charts & Moving Averages',
    duration: '5 mins',
    level: 'Beginner',
    summary: 'Deconstruct candlestick bars, historical trends, and interpret 7-day vs 20-day Simple Moving Averages (SMA).',
    content: `
### Understanding Price Action & Trends
Price charts visualize the continuous balance of supply and demand over time.

#### Moving Averages:
* **SMA (Simple Moving Average):** Calculates the average closing price over a set period (e.g. 20 days).
* **Golden Crossover:** When a fast moving average (e.g. 7-day) crosses above a slower average (e.g. 20-day), signaling bullish upward momentum.
* **Trend Confirmation:** Trading in the direction of the 20-day SMA filters out false choppy signals.
    `,
    quizQuestion: {
      question: 'What does a stock trading above its 20-day SMA typically suggest?',
      options: ['Severe bankruptcy risk', 'Bullish short-to-medium term trend support', 'The market is closed', 'Zero trading volume'],
      correctIndex: 1
    }
  },
  {
    id: 3,
    number: '03',
    title: 'Fundamental Valuation: P/E, ROE & EPS',
    duration: '6 mins',
    level: 'Intermediate',
    summary: 'Evaluating company valuations, price-to-earnings ratios, return on equity, and intrinsic financial health.',
    content: `
### Essential Fundamental Ratios
Fundamentals answer: *"What is the business actually worth?"*

* **P/E (Price-to-Earnings):** Market price divided by annual earnings per share. High P/E may indicate high growth expectations or overvaluation.
* **ROE (Return on Equity):** Measures how efficiently management generates profit from shareholders' equity. (Above 15% is strong).
* **EPS (Earnings Per Share):** Net profit divided by outstanding shares.
    `,
    quizQuestion: {
      question: 'If Company A has a P/E of 25 and EPS of ₹10, what is its current stock price?',
      options: ['₹2.50', '₹250', '₹25', '₹2,500'],
      correctIndex: 1
    }
  },
  {
    id: 4,
    number: '04',
    title: 'Technical Indicators: RSI & Bollinger Bands',
    duration: '5 mins',
    level: 'Intermediate',
    summary: 'Mastering momentum oscillators, Relative Strength Index (RSI 14), overbought (>70) and oversold (<30) zones.',
    content: `
### Momentum Oscillators
Technical indicators quantify price velocity and volatility extremes.

* **RSI (Relative Strength Index):** Oscillates between 0 and 100.
  * **RSI > 70:** Overbought territory (potential exhaustion/pullback).
  * **RSI < 30:** Oversold territory (potential bounce).
* **Bollinger Bands:** 2 standard deviations above and below the 20-day SMA, capturing 95% of normal price distribution.
    `,
    quizQuestion: {
      question: 'An RSI reading of 78 on a stock indicates which market condition?',
      options: ['Oversold condition', 'Overbought condition', 'Zero volatility', 'Company dividend payment'],
      correctIndex: 1
    }
  },
  {
    id: 5,
    number: '05',
    title: 'Risk Management & The 2% Golden Rule',
    duration: '6 mins',
    level: 'Advanced',
    summary: 'Capital preservation mathematics, calculating exact position sizes, stop-loss triggers, and risk-to-reward ratios.',
    content: `
### The 2% Capital Preservation Rule
Professional fund managers never risk more than 1% to 2% of total portfolio equity on any single trade.

$$\\text{Position Size (Shares)} = \\frac{\\text{Total Portfolio Capital} \\times 2\\%}{\\text{Entry Price} - \\text{Stop-Loss Price}}$$

#### Why This Matters:
Even a string of 5 consecutive losses will only draw down your portfolio by ~9.6%, keeping you in the game to compound.
    `,
    quizQuestion: {
      question: 'On a ₹1,00,000 portfolio, what is the maximum recommended capital to risk on one trade under the 2% rule?',
      options: ['₹20,000', '₹2,000', '₹500', '₹50,000'],
      correctIndex: 1
    }
  },
  {
    id: 6,
    number: '06',
    title: 'Algorithmic Strategy Backtesting',
    duration: '5 mins',
    level: 'Advanced',
    summary: 'Testing trading systems against historical datasets, win rates, maximum drawdown, and benchmarking against Buy & Hold.',
    content: `
### Evaluating Quantitative Strategies
Backtesting simulates how a systematic rule-based strategy would have performed historically.

* **Win Rate:** Percentage of profitable closed positions.
* **Max Drawdown:** The largest peak-to-trough drop in portfolio value during the backtest period.
* **Benchmark Comparison:** A strategy must be compared against passive index holding to determine if active trading generated excess alpha.
    `,
    quizQuestion: {
      question: 'What is Maximum Drawdown in strategy backtesting?',
      options: ['The total profit made in a month', 'The largest peak-to-trough decline in portfolio capital', 'The number of winning trades', 'The tax rate applied to trades'],
      correctIndex: 1
    }
  },
  {
    id: 7,
    number: '07',
    title: 'Trading Psychology & Thesis Journaling',
    duration: '4 mins',
    level: 'Mastery',
    summary: 'Overcoming FOMO and revenge trading, logging pre-trade hypotheses, and conducting disciplined post-trade reflections.',
    content: `
### Developing Cognitive Discipline
The greatest edge in trading is emotional discipline.

* **Cognitive Biases:** Beware of confirmation bias (only reading news confirming your trade) and loss aversion (holding losing trades too long).
* **The Trade Journal:** Write down *why* you are entering before clicking execute. Review after closing to build continuous improvement.
    `,
    quizQuestion: {
      question: 'Why should a trader record their trade thesis in a journal prior to execution?',
      options: ['To prove they never make mistakes', 'To enforce objective discipline and review cognitive decisions post-trade', 'To share on social media', 'To increase brokerage fees'],
      correctIndex: 1
    }
  }
];

const LearnPage = () => {
  const [selectedLesson, setSelectedLesson] = useState(LESSONS[0]);
  const [completedLessons, setCompletedLessons] = useState([1]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  const handleSelectLesson = (lesson) => {
    sounds.playTick();
    setSelectedLesson(lesson);
    setQuizAnswer(null);
    setQuizResult(null);
  };

  const handleCheckQuizAnswer = (idx) => {
    sounds.playTick();
    setQuizAnswer(idx);
    const isCorrect = idx === selectedLesson.quizQuestion.correctIndex;
    setQuizResult(isCorrect);
    if (isCorrect) {
      sounds.playSuccess();
      if (!completedLessons.includes(selectedLesson.id)) {
        setCompletedLessons(prev => [...prev, selectedLesson.id]);
      }
    } else {
      sounds.playError();
    }
  };

  const progressPct = Math.round((completedLessons.length / LESSONS.length) * 100);

  return (
    <div style={{ paddingBottom: '3rem', width: '100%' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Financial Learning Path & Academy</h1>
            <span className="badge-buy" style={{ fontSize: '0.72rem' }}>7-MODULE CURRICULUM</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
            Structured financial education inspired by Zerodha Varsity with interactive knowledge checks
          </p>
        </div>

        <button 
          className="btn-glow" 
          onClick={() => setShowQuizModal(true)}
          style={{ fontSize: '0.84rem' }}
        >
          <Award size={16} /> Open FinQuest Quiz
        </button>
      </div>

      {/* Curriculum Progress Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>
            <strong style={{ fontSize: '0.95rem' }}>Curriculum Progress</strong>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
              {completedLessons.length} of {LESSONS.length} Modules Mastered
            </span>
          </div>
          <span className="mono-font" style={{ fontWeight: 800, color: 'var(--accent-pink)' }}>
            {progressPct}%
          </span>
        </div>
        <div className="factor-bar-bg" style={{ height: '8px' }}>
          <div className="factor-bar-fill" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, var(--accent-pink), var(--accent-cyan))' }} />
        </div>
      </div>

      {/* Main Learning Workspace */}
      <div className="dashboard-main-grid">
        {/* Left Column: Lesson Modules List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {LESSONS.map((lesson) => {
            const isSelected = selectedLesson.id === lesson.id;
            const isDone = completedLessons.includes(lesson.id);
            return (
              <motion.div 
                key={lesson.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleSelectLesson(lesson)}
                className="glass-panel"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  borderLeft: isSelected ? '4px solid var(--accent-pink)' : (isDone ? '4px solid var(--accent-green)' : '4px solid rgba(255,255,255,0.08)'),
                  background: isSelected ? 'rgba(236,72,153,0.12)' : 'var(--glass-bg)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="mono-font" style={{ fontWeight: 800, color: isSelected ? 'var(--accent-pink)' : 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {lesson.number}
                    </span>
                    <strong style={{ fontSize: '0.92rem' }}>{lesson.title}</strong>
                  </div>
                  {isDone && <CheckCircle2 size={16} color="var(--accent-green)" />}
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {lesson.summary}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.45rem', fontSize: '0.7rem' }}>
                  <span className="pill-tag">{lesson.duration}</span>
                  <span className="pill-tag">{lesson.level}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column: Selected Lesson Content & Interactive Question */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="pill-tag mono-font" style={{ fontSize: '0.72rem' }}>
                MODULE {selectedLesson.number} • {selectedLesson.level.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {selectedLesson.duration} Reading Time
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
              {selectedLesson.title}
            </h2>
          </div>

          {/* Lesson Markdown Content */}
          <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-primary)', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
            <div style={{ whiteSpace: 'pre-line' }}>
              {selectedLesson.content}
            </div>
          </div>

          {/* Interactive Knowledge Check Question */}
          <div style={{ marginTop: 'auto', padding: '1.25rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
              <HelpCircle size={17} color="var(--accent-cyan)" />
              <strong style={{ fontSize: '0.88rem' }}>Knowledge Check Challenge:</strong>
            </div>

            <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.84rem' }}>
              {selectedLesson.quizQuestion.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {selectedLesson.quizQuestion.options.map((opt, idx) => {
                const isChosen = quizAnswer === idx;
                const isCorrectOpt = idx === selectedLesson.quizQuestion.correctIndex;
                let btnCls = 'btn-outline';
                if (quizResult !== null) {
                  if (isCorrectOpt) btnCls = 'btn-success';
                  else if (isChosen && !quizResult) btnCls = 'btn-danger';
                }

                return (
                  <button
                    key={idx}
                    className={btnCls}
                    onClick={() => handleCheckQuizAnswer(idx)}
                    style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '0.6rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    <span className="mono-font" style={{ marginRight: '0.5rem', opacity: 0.6 }}>{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizResult !== null && (
              <div style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: quizResult ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                {quizResult ? '✓ Correct! Lesson completed and added to progress.' : '✗ Not quite. Review the lesson notes above and try again!'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FinQuest Quiz Modal */}
      <FinQuestQuiz 
        isOpen={showQuizModal} 
        onClose={() => setShowQuizModal(false)} 
      />
    </div>
  );
};

export default LearnPage;
