import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Wallet, Briefcase, TrendingUp, TrendingDown, 
  Bot, Download, RefreshCw, Activity, X
} from 'lucide-react';
import StockChart from '../components/StockChart';
import TradeInterface from '../components/TradeInterface';
import ExplainableSignalCard from '../components/ExplainableSignalCard';
import TradePreviewModal from '../components/TradePreviewModal';
import AutoPilotModal from '../components/AutoPilotModal';
import MarketHeatmap from '../components/MarketHeatmap';
import StrategyBacktester from '../components/StrategyBacktester';
import { sounds } from '../utils/soundEffects';
import { API_BASE } from '../config/api';

const Dashboard = () => {
  const [wallet, setWallet] = useState({ balance: 100000 });
  const [portfolio, setPortfolio] = useState({ totalValue: 0, totalReturn: 0, holdings: [] });
  const [stocks, setStocks] = useState([]);
  const [tickerData, setTickerData] = useState([]);
  const [selectedStock, setSelectedStock] = useState('TCS');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeHistory, setTradeHistory] = useState([]);

  // Modals & Sub-actions
  const [showAutoPilotModal, setShowAutoPilotModal] = useState(false);
  const [previewTrade, setPreviewTrade] = useState(null);
  const [tradeActionLoading, setTradeActionLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const fetchUserData = React.useCallback(() => {
    axios.get(`${API_BASE}/wallet`)
      .then(res => setWallet({ balance: res.data.data.balance }))
      .catch(console.error);

    axios.get(`${API_BASE}/portfolio`)
      .then(res => {
        setPortfolio({
          holdings: res.data.data.holdings || [],
          totalValue: res.data.data.totalValue || 0,
          totalReturn: res.data.data.totalReturn || 0
        });
      })
      .catch(console.error);

    axios.get(`${API_BASE}/trades`)
      .then(res => setTradeHistory(res.data.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Fetch available stocks
    axios.get(`${API_BASE}/stocks`).then(res => {
      const symbols = res.data.data || [];
      setStocks(symbols);

      Promise.all(symbols.map(sym => 
        Promise.all([
          axios.get(`${API_BASE}/stocks/${sym}`),
          axios.get(`${API_BASE}/ml/predict/${sym}`),
          axios.get(`${API_BASE}/stocks/${sym}/history?limit=2`)
        ]).then(([priceRes, mlRes, histRes]) => {
          const price = priceRes.data.data.price;
          const hist = histRes.data.data || [];
          let changePct = 0;
          if (hist.length >= 2) {
            const prev = hist[0].close;
            changePct = ((price - prev) / prev) * 100;
          }
          return {
            symbol: sym,
            price: price,
            signal: mlRes.data.data.prediction,
            confidence: mlRes.data.data.confidence,
            trend: mlRes.data.data.trend,
            changePct
          };
        }).catch(() => ({ symbol: sym, price: 1000, signal: 'HOLD', confidence: 0.75, changePct: 0 }))
      )).then(results => {
        setTickerData(results);
      });
    }).catch(console.error);

    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (selectedStock) {
      setLoading(true);
      
      Promise.all([
        axios.get(`${API_BASE}/stocks/${selectedStock}/history?limit=60`),
        axios.get(`${API_BASE}/ml/predict/${selectedStock}`),
        axios.get(`${API_BASE}/stocks/${selectedStock}`)
      ])
      .then(([historyRes, mlRes, priceRes]) => {
        setStockData({
          symbol: selectedStock,
          currentPrice: priceRes.data.data.price,
          history: historyRes.data.data,
          analysis: {
            trend: mlRes.data.data.trend,
            signal: mlRes.data.data.prediction,
            confidence: mlRes.data.data.confidence,
            model: mlRes.data.data.model,
            source: mlRes.data.data.source,
            isMock: mlRes.data.data.isMock,
            reasoning: mlRes.data.data.reasons?.join(' ') || ''
          }
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [selectedStock]);

  const handleExecuteConfirmedTrade = async (confirmedDetails) => {
    setTradeActionLoading(true);
    try {
      await axios.post(`${API_BASE}/trades/execute`, {
        symbol: confirmedDetails.symbol,
        action: confirmedDetails.action,
        quantity: Number(confirmedDetails.quantity),
        price: Number(confirmedDetails.price),
        signal: confirmedDetails.signal,
        journalNotes: confirmedDetails.journalNotes || '',
        strategyTag: confirmedDetails.strategyTag || 'AI Signal',
        confidenceLevel: Number(confirmedDetails.confidenceLevel) || 3,
        expectedOutcome: confirmedDetails.expectedOutcome || 'Bullish',
        aiConfidence: Number(confirmedDetails.aiConfidence) || 0,
        aiSignal: confirmedDetails.signal || ''
      });

      if (confirmedDetails.action === 'BUY') {
        sounds.playBuy();
      } else {
        sounds.playSell();
      }

      setPreviewTrade(null);
      fetchUserData();
    } catch (err) {
      sounds.playError();
      alert(err.response?.data?.message || 'Trade execution failed.');
    } finally {
      setTradeActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    sounds.playTick();
    if (tradeHistory.length === 0) {
      alert('No trade history available to export yet.');
      return;
    }

    const headers = ['Trade ID', 'Date', 'Symbol', 'Action', 'Quantity', 'Price (INR)', 'P/L (INR)', 'Signal', 'Strategy', 'Notes'];
    const csvRows = [
      headers.join(','),
      ...tradeHistory.map(t => [
        t._id || 'TRD',
        new Date(t.timestamp).toISOString(),
        t.symbol,
        t.action,
        t.quantity,
        t.price,
        t.profitLoss != null ? t.profitLoss : 0,
        t.signal || t.action,
        `"${(t.strategyTag || 'Discretionary').replace(/"/g, '""')}"`,
        `"${(t.journalNotes || '').replace(/"/g, '""')}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PaperPulse_Trade_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Signal aggregations for Market Overview
  const buySignalsCount = tickerData.filter(t => t.signal === 'BUY').length;
  const holdSignalsCount = tickerData.filter(t => t.signal === 'HOLD').length;
  const sellSignalsCount = tickerData.filter(t => t.signal === 'SELL').length;

  const totalPortfolioWorth = (wallet.balance || 0) + (portfolio.totalValue || 0);
  const totalReturnPct = wallet.balance ? (((totalPortfolioWorth - 100000) / 100000) * 100).toFixed(2) : '0.00';

  return (
    <div style={{ paddingBottom: '3rem', width: '100%' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Executive Trading Command Center</h1>
            <span className="badge-buy" style={{ fontSize: '0.72rem' }}>● AI ENGINE ONLINE</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
            Explainable AI signals, risk-managed simulated paper execution & performance analytics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-glow" 
            onClick={() => setShowAutoPilotModal(true)}
            style={{ fontSize: '0.84rem', gap: '0.45rem' }}
          >
            <Bot size={16} /> AI Auto-Pilot Bot
          </button>
        </div>
      </div>

      {/* Top 5 KPI Strip */}
      <div className="stats-grid">
        {/* Virtual Cash */}
        <div className="glass-panel" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Virtual Cash</span>
            <Wallet size={16} color="var(--accent-pink)" />
          </div>
          <div className="mono-font" style={{ fontSize: '1.45rem', fontWeight: 700 }}>
            ₹{wallet.balance?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Available buying power
          </span>
        </div>

        {/* Portfolio Value */}
        <div className="glass-panel" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Holdings Valuation</span>
            <Briefcase size={16} color="var(--accent-cyan)" />
          </div>
          <div className="mono-font" style={{ fontSize: '1.45rem', fontWeight: 700 }}>
            ₹{(portfolio.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {portfolio.holdings.length} Active simulated positions
          </span>
        </div>

        {/* Net Portfolio Net Worth */}
        <div className="glass-panel" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Net Portfolio Worth</span>
            <Activity size={16} color="var(--accent-primary)" />
          </div>
          <div className="mono-font" style={{ fontSize: '1.45rem', fontWeight: 700 }}>
            ₹{totalPortfolioWorth.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.72rem', color: Number(totalReturnPct) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {Number(totalReturnPct) >= 0 ? '+' : ''}{totalReturnPct}% all-time return
          </span>
        </div>

        {/* Unrealized Live P/L */}
        <div className="glass-panel" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Total Realized & Open P/L</span>
            {portfolio.totalReturn >= 0 ? <TrendingUp size={16} color="var(--accent-green)" /> : <TrendingDown size={16} color="var(--accent-red)" />}
          </div>
          <div className="mono-font" style={{ fontSize: '1.45rem', fontWeight: 700, color: portfolio.totalReturn >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {portfolio.totalReturn >= 0 ? '+' : ''}₹{(portfolio.totalReturn || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Aggregated performance
          </span>
        </div>
      </div>

      {/* Market Overview Strip (Benchmarks + AI Signal Distribution) */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '0.85rem 1.25rem', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem',
          background: 'rgba(255,255,255,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>NIFTY 50 (Sim)</span>
            <div className="mono-font" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              24,820 <span style={{ fontSize: '0.76rem' }}>+0.84%</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SENSEX (Sim)</span>
            <div className="mono-font" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              81,350 <span style={{ fontSize: '0.76rem' }}>+0.71%</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tracked Equities</span>
            <div className="mono-font" style={{ fontSize: '0.92rem', fontWeight: 700 }}>
              {stocks.length} Assets
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Signals:</span>
          <span className="badge-buy" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>{buySignalsCount} BUY</span>
          <span className="badge-hold" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>{holdSignalsCount} HOLD</span>
          <span className="badge-sell" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>{sellSignalsCount} SELL</span>
        </div>
      </div>

      {/* Marquee Ticker */}
      {tickerData.length > 0 && (
        <div style={{ marginBottom: '1.5rem', width: '100%' }}>
          <div className="marquee-container" style={{ padding: '0.2rem 0' }}>
            <div className="marquee-content">
              {[...tickerData, ...tickerData, ...tickerData].map((t, i) => {
                const isPos = (t.changePct || 0) >= 0;
                return (
                  <div 
                    key={i} 
                    className="glass-panel" 
                    onClick={() => { setSelectedStock(t.symbol); sounds.playTick(); }}
                    style={{ 
                      cursor: 'pointer',
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.15rem', 
                      padding: '0.6rem 0.95rem', 
                      minWidth: '160px', 
                      margin: '0 0.45rem', 
                      flexShrink: 0, 
                      borderLeft: selectedStock === t.symbol ? '4px solid var(--accent-pink)' : '4px solid rgba(255,255,255,0.08)',
                      background: selectedStock === t.symbol ? 'rgba(236, 72, 153, 0.12)' : 'var(--glass-bg)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.88rem' }}>{t.symbol}</strong>
                      <span className={t.signal === 'BUY' ? 'badge-buy' : (t.signal === 'SELL' ? 'badge-sell' : 'badge-hold')} style={{ fontSize: '0.68rem', padding: '0.05rem 0.4rem' }}>
                        {t.signal}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span className="mono-font" style={{ fontSize: '0.98rem', fontWeight: 700 }}>
                        ₹{t.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                      <span className="mono-font" style={{ fontSize: '0.72rem', color: isPos ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {isPos ? '+' : ''}{(t.changePct || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Stock Workspace & Execution Terminal Grid */}
      <div className="dashboard-main-grid">
        {/* Left Side: Chart Centerpiece */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{selectedStock} Technical Analytics</h3>
                <span className="pill-tag mono-font" style={{ fontSize: '0.7rem' }}>NSE HISTORICAL</span>
              </div>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Multi-indicator technical telemetry & moving average trend confirmation
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                className="input-field mono-font" 
                value={selectedStock} 
                onChange={(e) => { setSelectedStock(e.target.value); sounds.playTick(); }} 
                style={{ minWidth: '130px', fontWeight: 600 }}
              >
                {stocks.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="skeleton" style={{ width: '100%', height: '100%' }} />
            </div>
          ) : (
            <StockChart data={stockData?.history || []} />
          )}

          {/* Explainable AI Signal Component */}
          {stockData && (
            <ExplainableSignalCard 
              stockSymbol={selectedStock}
              signal={stockData.analysis?.signal || 'HOLD'}
              confidence={stockData.analysis?.confidence || 0.75}
              trend={stockData.analysis?.trend || 'NEUTRAL'}
              reasoning={stockData.analysis?.reasoning || ''}
              model={stockData.analysis?.model}
              source={stockData.analysis?.source}
              isMock={stockData.analysis?.isMock}
              currentPrice={stockData.currentPrice}
            />
          )}
        </div>

        {/* Right Side: Paper Trading Execution Ticket */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {stockData && (
            <TradeInterface 
              stockData={stockData} 
              walletBalance={wallet.balance} 
              onTrade={fetchUserData}
              onOpenPreview={(ticket) => setPreviewTrade(ticket)}
            />
          )}
        </div>
      </div>

      {/* Market Screener & Heatmap */}
      <div style={{ marginTop: '1.5rem' }}>
        <MarketHeatmap 
          stocksData={tickerData} 
          onSelectStock={(sym) => setSelectedStock(sym)}
        />
      </div>

      {/* Scenario Backtester Playground */}
      <div style={{ marginTop: '1.5rem' }}>
        <StrategyBacktester 
          stockSymbol={selectedStock} 
          historicalData={stockData?.history || []} 
        />
      </div>

      {/* Portfolio Holdings & Recent Trade Ledger Grid */}
      <div className="dashboard-tables-grid" style={{ marginTop: '1.5rem' }}>
        {/* Active Holdings Table */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Active Portfolio Holdings</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{portfolio.holdings.length} Positions</span>
            </div>
            <button 
              className="btn-outline" 
              onClick={fetchUserData}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            >
              <RefreshCw size={13} /> Sync
            </button>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Stock</th>
                  <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Qty</th>
                  <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Avg Price</th>
                  <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>P/L</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem 0.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No active simulated holdings. Execute a BUY order above to start compounding!
                    </td>
                  </tr>
                ) : (
                  portfolio.holdings.map((h, i) => {
                    const pl = (h.currentValue || 0) - (h.investedAmount || 0);
                    const plColor = pl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
                    return (
                      <tr 
                        key={i} 
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                        onClick={() => setSelectedPosition(h)}
                      >
                        <td style={{ fontWeight: 700, color: 'var(--accent-pink)' }}>{h.symbol}</td>
                        <td className="mono-font">{h.quantity}</td>
                        <td className="mono-font">₹{h.averagePurchasePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td className="mono-font" style={{ color: plColor, fontWeight: 700 }}>
                          {pl >= 0 ? '+' : ''}₹{pl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trade Ledger Table */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Simulated Trade Ledger</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{tradeHistory.length} Executions</span>
            </div>
            <button 
              className="btn-outline" 
              onClick={handleExportCSV}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.35rem' }}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>

          <div className="table-responsive" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Date</th>
                  <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Stock</th>
                  <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Action</th>
                  <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Qty</th>
                  <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>Price</th>
                  <th style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>P/L</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem 0.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No trades logged yet. Run an Auto-Pilot cycle or execute manual trades above.
                    </td>
                  </tr>
                ) : (
                  tradeHistory.slice(0, 15).map((t, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {new Date(t.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-pink)' }}>
                        {t.symbol}
                      </td>
                      <td>
                        <span className={t.action === 'BUY' ? 'badge-buy' : (t.action === 'SELL' ? 'badge-sell' : 'badge-hold')} style={{ fontSize: '0.7rem', padding: '0.05rem 0.4rem' }}>
                          {t.action}
                        </span>
                      </td>
                      <td className="mono-font">{t.quantity}</td>
                      <td className="mono-font">₹{t.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || t.price}</td>
                      <td className="mono-font" style={{ color: t.action === 'SELL' && t.profitLoss != null ? (t.profitLoss >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--text-primary)', fontWeight: 600 }}>
                        {t.action === 'SELL' && t.profitLoss != null ? `${t.profitLoss >= 0 ? '+' : ''}₹${t.profitLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '--'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Position Details Drawer Modal */}
      <AnimatePresence>
        {selectedPosition && (
          <div className="modal-overlay" onClick={() => setSelectedPosition(null)}>
            <motion.div 
              className="drawer-right"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              style={{ padding: '1.75rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Position Details</span>
                  <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>{selectedPosition.symbol}</h2>
                </div>
                <button onClick={() => setSelectedPosition(null)} style={{ color: 'var(--text-secondary)' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Quantity Owned</span>
                  <div className="mono-font" style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                    {selectedPosition.quantity} Shares
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Average Purchase Price</span>
                  <div className="mono-font" style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                    ₹{selectedPosition.averagePurchasePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Total Capital Invested</span>
                  <div className="mono-font" style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                    ₹{selectedPosition.investedAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trade Preview Modal */}
      <TradePreviewModal 
        isOpen={Boolean(previewTrade)}
        onClose={() => setPreviewTrade(null)}
        tradeDetails={previewTrade}
        walletBalance={wallet.balance}
        loading={tradeActionLoading}
        onConfirm={handleExecuteConfirmedTrade}
      />

      {/* AutoPilot Modal */}
      <AutoPilotModal 
        isOpen={showAutoPilotModal} 
        onClose={() => setShowAutoPilotModal(false)} 
        stocks={stocks} 
        onTradeExecuted={fetchUserData} 
      />
    </div>
  );
};

export default Dashboard;
