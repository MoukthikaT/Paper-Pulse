const Explanation = require('../models/Explanation');
const explanationsData = require('../data/explanationsData.json');
const { isDbConnected } = require('../config/db');

class ExplanationService {
  /**
   * Helper to normalize term string into a comparable slug
   */
  _toSlug(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Fetch all educational explanations
   */
  async getAllExplanations() {
    if (isDbConnected()) {
      try {
        const dbList = await Explanation.find({}).lean();
        if (dbList && dbList.length > 0) {
          return dbList.map(({ _id, __v, ...item }) => item);
        }
      } catch (err) {
        console.warn(`[ExplanationService] MongoDB query failed (${err.message}). Using local JSON dataset.`);
      }
    }
    return explanationsData;
  }

  /**
   * Fetch explanation for a specific term (by exact term name or slug)
   */
  async getExplanationByTerm(termQuery) {
    if (!termQuery) return null;

    const querySlug = this._toSlug(termQuery);

    if (isDbConnected()) {
      try {
        const dbResult = await Explanation.findOne({
          $or: [
            { slug: querySlug },
            { term: { $regex: new RegExp(`^${termQuery}$`, 'i') } }
          ]
        }).lean();

        if (dbResult) {
          const { _id, __v, ...cleanResult } = dbResult;
          return cleanResult;
        }
      } catch (err) {
        console.warn(`[ExplanationService] MongoDB search failed (${err.message}). Searching local JSON dataset.`);
      }
    }

    // Search local JSON dataset
    const found = explanationsData.find(
      (item) => item.slug === querySlug || this._toSlug(item.term) === querySlug || item.term.toLowerCase() === termQuery.toLowerCase()
    );

    return found || null;
  }

  /**
   * Process natural language query with intelligent financial knowledge engine
   */
  async processAIChatQuery(query, context = {}) {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw new Error('Query string is required');
    }

    const cleanQuery = query.trim().toLowerCase();
    const allTerms = await this.getAllExplanations();

    // 1. Direct Term Match
    const matchedTerm = allTerms.find(t => 
      cleanQuery.includes(t.term.toLowerCase()) || 
      (t.slug && cleanQuery.includes(t.slug.toLowerCase()))
    );

    if (matchedTerm && (cleanQuery.includes('what is') || cleanQuery.includes('explain') || cleanQuery.includes('define') || cleanQuery.length < 30)) {
      return {
        query,
        topic: matchedTerm.term,
        answer: `**${matchedTerm.term}**\n\n📌 **Definition:** ${matchedTerm.definition}\n\n🔍 **What it indicates:** ${matchedTerm.whatItIndicates || matchedTerm.definition}\n\n💡 **Why it matters:** ${matchedTerm.whyItMatters || 'Helps in quantitative analysis and informed paper trading.'}\n\n📊 **Example:** ${matchedTerm.example || 'e.g. Calculated based on historical price data.'}\n\n⚠️ **Caution:** ${matchedTerm.caution || 'Do not evaluate this single metric in isolation.'}`,
        confidence: 0.98,
        category: 'FOUNDATIONAL_METRIC',
        suggestedFollowUps: [
          `How to calculate ${matchedTerm.term}?`,
          `Compare ${matchedTerm.term} with other indicators`,
          'Take a quiz on this metric'
        ]
      };
    }

    // 2. Technical Indicators Knowledge Base
    const technicalKnowledge = {
      'rsi': {
        name: 'RSI (Relative Strength Index)',
        summary: 'RSI is a momentum oscillator measuring the speed and magnitude of recent price changes on a scale from 0 to 100.',
        rules: '• **Above 70 (Overbought):** Asset may be overvalued; watch for pullback.\n• **Below 30 (Oversold):** Asset may be undervalued; watch for bullish reversal.\n• **50 Midline:** Trend direction indicator.',
        formula: 'RSI = 100 - (100 / (1 + (Average Gain / Average Loss)))',
        example: 'In PaperPulse, if TCS RSI hits 78, our AI signal engine may shift from BUY to HOLD/SELL to protect gains.',
        caution: 'In strong trending bull runs, RSI can stay overbought for extended periods.'
      },
      'bollinger': {
        name: 'Bollinger Bands',
        summary: 'Bollinger Bands consist of a middle 20-day Simple Moving Average (SMA) and two outer standard deviation bands (±2 standard deviations).',
        rules: '• **Band Squeeze:** Low volatility period usually preceding a breakout.\n• **Upper Band Touch:** Potential overextension / resistance.\n• **Lower Band Touch:** Potential support / oversold bounce.',
        formula: 'Upper Band = SMA20 + (2 × σ), Lower Band = SMA20 - (2 × σ)',
        example: 'When price pierces below the lower band and returns inside, it provides an algorithmic mean-reversion buy trigger.',
        caution: 'Prices can ride the bands during powerful trends.'
      },
      'sma': {
        name: 'SMA (Simple Moving Average)',
        summary: 'A Simple Moving Average calculates the arithmetic mean of closing prices over a specific period (e.g. 7-day or 20-day).',
        rules: '• **Golden Cross:** Fast SMA (e.g. 7-day) crosses ABOVE Slow SMA (e.g. 20-day) = Bullish trend signal.\n• **Death Cross:** Fast SMA crosses BELOW Slow SMA = Bearish trend signal.',
        formula: 'SMA = (Price_1 + Price_2 + ... + Price_n) / n',
        example: 'In our Strategy Backtester, SMA Trend Crossover dynamically triggers BUY when SMA7 > SMA20.',
        caution: 'Moving averages are lagging indicators and may produce false signals in sideways/choppy markets.'
      },
      'stop-loss': {
        name: 'Stop-Loss & Take-Profit',
        summary: 'A Stop-Loss is an automated safety order placed to limit maximum loss on a trade. Take-Profit locks in gains once the target is reached.',
        rules: '• **1:2 Risk/Reward Ratio:** Risk ₹1 to earn ₹2.\n• **Trailing Stop:** Moves upward alongside profitable price advances.',
        formula: 'Max Risk per trade = 1% - 2% of total virtual capital.',
        example: 'If buying TCS at ₹2,270, placing a 3% Stop-Loss at ₹2,201.90 ensures you never lose more than ₹68.10 per share.',
        caution: 'Placing stop-loss too close to current price may trigger premature exit due to normal market noise.'
      },
      'signal': {
        name: 'AI Buy/Sell/Hold Signals',
        summary: 'PaperPulse AI signals combine historical trend telemetry, statistical momentum, and machine learning models.',
        rules: '• **BUY:** Upward momentum with high statistical confidence (≥65%).\n• **SELL:** Negative momentum or breakdown below key moving averages.\n• **HOLD:** Low conviction or sideways consolidation.',
        formula: 'Confidence Score = f(Momentum, SMA Spread, Volume Trend)',
        example: 'When the AI Auto-Pilot Bot is active, it only triggers orders when confidence meets your risk profile threshold.',
        caution: 'Signals are educational models and should always be paired with prudent risk management.'
      }
    };

    for (const [key, data] of Object.entries(technicalKnowledge)) {
      if (cleanQuery.includes(key) || cleanQuery.includes(data.name.toLowerCase())) {
        return {
          query,
          topic: data.name,
          answer: `**${data.name}**\n\n📌 **Overview:** ${data.summary}\n\n🎯 **Key Rules & Strategy:**\n${data.rules}\n\n📐 **Formula:** \`${data.formula}\`\n\n💡 **Simulated Example:** ${data.example}\n\n⚠️ **Pro-Tip:** ${data.caution}`,
          confidence: 0.95,
          category: 'TECHNICAL_INDICATOR',
          suggestedFollowUps: [
            'How to configure this in the Stock Chart?',
            'What is the ideal timeframe for this indicator?',
            'Explain another technical concept'
          ]
        };
      }
    }

    // 3. Conversational / General Guidance
    if (cleanQuery.includes('hello') || cleanQuery.includes('hi') || cleanQuery.includes('who are you') || cleanQuery.includes('help')) {
      return {
        query,
        topic: 'PaperPulse AI Copilot',
        answer: `👋 **Welcome to the PaperPulse AI Copilot!**\n\nI am your interactive market mentor. You can ask me anything about:\n\n• **Financial Terms:** P/E Ratio, ROE, EPS, Market Cap, Dividend Yield, D/E Ratio.\n• **Technical Indicators:** RSI, Bollinger Bands, SMA Crossovers, Candlestick patterns.\n• **Trading Mechanics:** Auto-Pilot Bot settings, Stop-Loss strategies, Win-Rate optimization.\n• **Market Questions:** "What is the difference between P/E and EPS?", "How does RSI overbought work?"\n\nTry asking a question or click one of the suggested prompts below!`,
        confidence: 1.0,
        category: 'GREETING',
        suggestedFollowUps: [
          'What is P/E Ratio?',
          'How does RSI (14) work?',
          'How does the AI Auto-Pilot bot execute trades?'
        ]
      };
    }

    // 4. Fallback Intelligent Heuristic Synthesizer
    return {
      query,
      topic: query.toUpperCase(),
      answer: `🤖 **AI Market Analysis for: "${query}"**\n\nIn simulated paper trading, evaluating market metrics requires understanding both fundamental valuation and technical momentum.\n\n• **Key Perspective:** When studying financial assets, compare relative valuation multiples (like P/E and ROE) against historical sector peers.\n• **Actionable Insight:** Combine indicator confirmation (e.g. RSI oscillator and 20-day SMA) before executing automated or manual paper trades.\n• **Risk Rule:** Never allocate more than 25% of your virtual wallet to a single trade.\n\n*Would you like a detailed breakdown of a specific financial metric or indicator?*`,
      confidence: 0.85,
      category: 'GENERAL_FINANCIAL_CONCEPT',
      suggestedFollowUps: [
        'Explain P/E Ratio in detail',
        'How to use Bollinger Bands?',
        'Take the FinQuest quiz to earn rewards'
      ]
    };
  }

  /**
   * Seed explanations into MongoDB if connected and empty
   */
  async seedExplanationsIfEmpty() {
    if (!isDbConnected()) return;
    try {
      const count = await Explanation.countDocuments();
      if (count === 0) {
        await Explanation.insertMany(explanationsData);
        console.log('[ExplanationService] Seeded financial term explanations into MongoDB.');
      }
    } catch (err) {
      console.warn(`[ExplanationService] Could not seed explanations: ${err.message}`);
    }
  }
}

module.exports = new ExplanationService();

