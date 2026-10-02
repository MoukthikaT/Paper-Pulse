import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Zap, ShieldCheck, Calculator, ArrowRight 
} from 'lucide-react';
import StockChart from '../components/StockChart';
import TradeInterface from '../components/TradeInterface';
import ExplainableSignalCard from '../components/ExplainableSignalCard';
import TradePreviewModal from '../components/TradePreviewModal';
import { sounds } from '../utils/soundEffects';
import { API_BASE } from '../config/api';

const TradePage = () => {
  const [searchParams] = useSearchParams();
  const initialStock = searchParams.get('symbol') || 'TCS';

  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(initialStock);
  const [stockData, setStockData] = useState(null);
  const [wallet, setWallet] = useState({ balance: 100000 });
  const [loading, setLoading] = useState(true);
  const [stockTrades, setStockTrades] = useState([]);

  // Risk Position Sizing
  const [showRiskCalc, setShowRiskCalc] = useState(true);
  const [riskPercent, setRiskPercent] = useState(2);
  const [stopLossPercent, setStopLossPercent] = useState(3);

  // Trade Preview Modal
  const [previewTrade, setPreviewTrade] = useState(null);
  const [executingTrade, setExecutingTrade] = useState(false);
  const [appliedQuantity, setAppliedQuantity] = useState(null);

  const fetchUserData = React.useCallback(() => {
    axios.get(`${API_BASE}/wallet`)
      .then(res => setWallet({ balance: res.data.data.balance }))
      .catch(console.error);
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE}/stocks`).then(res => setStocks(res.data.data || [])).catch(console.error);
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (selectedStock) {
      setLoading(true);
      Promise.all([
        axios.get(`${API_BASE}/stocks/${selectedStock}/history?limit=60`),
        axios.get(`${API_BASE}/ml/predict/${selectedStock}`),
        axios.get(`${API_BASE}/stocks/${selectedStock}`),
        axios.get(`${API_BASE}/trades/${selectedStock}`)
      ])
      .then(([histRes, mlRes, priceRes, tradesRes]) => {
        setStockData({
          symbol: selectedStock,
          currentPrice: priceRes.data.data.price,
          history: histRes.data.data || [],
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
        setStockTrades(tradesRes.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [selectedStock]);

  const handleExecuteConfirmedTrade = async (confirmedDetails) => {
    setExecutingTrade(true);
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

      // Refresh recent orders for stock
      const tradesRes = await axios.get(`${API_BASE}/trades/${selectedStock}`);
      setStockTrades(tradesRes.data.data || []);
    } catch (err) {
      sounds.playError();
      alert(err.response?.data?.message || 'Trade execution failed.');
    } finally {
      setExecutingTrade(false);
    }
  };

  // Position Sizing calculations
  const currentPrice = stockData?.currentPrice || 1000;
  const maxRiskCapital = (wallet.balance * (riskPercent / 100));
  const riskPerShare = (currentPrice * (stopLossPercent / 100));
  const recommendedQuantity = Math.max(1, Math.floor(maxRiskCapital / Math.max(1, riskPerShare)));

  return (
    <div style={{ paddingBottom: '3rem', width: '100%' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Dedicated Paper Trading Terminal</h1>
            <span className="badge-buy" style={{ fontSize: '0.72rem' }}>SIMULATED LEDGER</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
            Analyze multi-indicator telemetry, compute 2% risk position sizes & execute paper orders
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select 
            className="input-field mono-font" 
            value={selectedStock} 
            onChange={(e) => { setSelectedStock(e.target.value); sounds.playTick(); }}
            style={{ fontSize: '0.9rem', fontWeight: 700 }}
          >
            {stocks.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* 2% Wall Street Risk Position Sizing Tool */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--accent-cyan)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>2% Capital Risk Management Tool</h3>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Protects your virtual portfolio from excessive drawdown
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Capital at Risk: <strong>{riskPercent}% (₹{maxRiskCapital.toLocaleString('en-IN')})</strong>
            </label>
            <input 
              type="range" min="1" max="5" step="0.5"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-pink)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Stop-Loss Target: <strong>{stopLossPercent}% (₹{riskPerShare.toFixed(1)}/share)</strong>
            </label>
            <input 
              type="range" min="1" max="10" step="0.5"
              value={stopLossPercent}
              onChange={(e) => setStopLossPercent(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
          </div>

          <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Recommended Max Order</span>
            <div className="mono-font" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              {recommendedQuantity} Shares (₹{(recommendedQuantity * currentPrice).toLocaleString('en-IN')})
            </div>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', alignSelf: 'center', color: 'var(--accent-cyan)' }}
              onClick={() => {
                sounds.playTick();
                setAppliedQuantity(recommendedQuantity);
              }}
            >
              Apply to Order Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="dashboard-main-grid">
        {/* Left Column: Chart & Explainable Signal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{selectedStock} Price Action</h3>
                <span className="mono-font" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Spot Quote: ₹{currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {loading ? (
              <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="skeleton" style={{ width: '100%', height: '100%' }} />
              </div>
            ) : (
              <StockChart data={stockData?.history || []} />
            )}
          </div>

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

        {/* Right Column: Execution Terminal & Stock History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {stockData && (
            <TradeInterface 
              stockData={stockData}
              walletBalance={wallet.balance}
              suggestedQuantity={appliedQuantity}
              onTrade={() => {
                fetchUserData();
                axios.get(`${API_BASE}/trades/${selectedStock}`).then(res => setStockTrades(res.data.data || []));
              }}
              onOpenPreview={(ticket) => setPreviewTrade(ticket)}
            />
          )}

          {/* Recent Orders for this specific Stock */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.05rem', fontWeight: 700 }}>
              Recent Orders ({selectedStock})
            </h3>
            <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>Date</th>
                    <th style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>Action</th>
                    <th style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>Qty</th>
                    <th style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {stockTrades.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '1.5rem 0.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        No orders recorded for {selectedStock} yet.
                      </td>
                    </tr>
                  ) : (
                    stockTrades.slice(0, 5).map((t, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          {new Date(t.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </td>
                        <td>
                          <span className={t.action === 'BUY' ? 'badge-buy' : 'badge-sell'} style={{ fontSize: '0.68rem', padding: '0.05rem 0.35rem' }}>
                            {t.action}
                          </span>
                        </td>
                        <td className="mono-font" style={{ fontSize: '0.82rem' }}>{t.quantity}</td>
                        <td className="mono-font" style={{ fontSize: '0.82rem' }}>₹{t.price}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Preview Modal */}
      <TradePreviewModal 
        isOpen={Boolean(previewTrade)}
        onClose={() => setPreviewTrade(null)}
        tradeDetails={previewTrade}
        walletBalance={wallet.balance}
        loading={executingTrade}
        onConfirm={handleExecuteConfirmedTrade}
      />
    </div>
  );
};

export default TradePage;
