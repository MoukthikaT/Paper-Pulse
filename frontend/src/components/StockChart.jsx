import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { BarChart2, TrendingUp, Sliders, Layers } from 'lucide-react';

const StockChart = ({ data = [] }) => {
  const [chartMode, setChartMode] = useState('area'); // 'area', 'bar', 'combo'
  const [timeframe, setTimeframe] = useState('30D'); // '7D', '14D', '30D', 'ALL'
  const [showSMA, setShowSMA] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  // Compute Technical Indicators: SMA 7, SMA 20, Bollinger Bands, and RSI
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filtered = [...data];
    if (timeframe === '7D') filtered = filtered.slice(-7);
    else if (timeframe === '14D') filtered = filtered.slice(-14);
    else if (timeframe === '30D') filtered = filtered.slice(-30);

    return filtered.map((item, index, arr) => {
      // SMA 7
      let sma7 = null;
      if (index >= 6) {
        const slice = arr.slice(index - 6, index + 1);
        sma7 = Math.round((slice.reduce((acc, curr) => acc + curr.close, 0) / 7) * 100) / 100;
      }

      // SMA 20 & Bollinger Bands (Standard deviation 2)
      let sma20 = null;
      let upperBand = null;
      let lowerBand = null;
      if (index >= 19) {
        const slice20 = arr.slice(index - 19, index + 1);
        const mean = slice20.reduce((acc, curr) => acc + curr.close, 0) / 20;
        sma20 = Math.round(mean * 100) / 100;
        const variance = slice20.reduce((acc, curr) => acc + Math.pow(curr.close - mean, 2), 0) / 20;
        const stdDev = Math.sqrt(variance);
        upperBand = Math.round((mean + 2 * stdDev) * 100) / 100;
        lowerBand = Math.round((mean - 2 * stdDev) * 100) / 100;
      }

      // Simple RSI calculation over 14 periods
      let rsi = 50;
      if (index >= 14) {
        let gains = 0;
        let losses = 0;
        for (let i = index - 13; i <= index; i++) {
          const diff = arr[i].close - arr[i - 1].close;
          if (diff >= 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        if (avgLoss === 0) rsi = 100;
        else {
          const rs = avgGain / avgLoss;
          rsi = Math.round((100 - (100 / (1 + rs))) * 10) / 10;
        }
      }

      // Candlestick / Bar spread
      const isUp = item.close >= (item.open || item.close);
      const candleColor = isUp ? 'var(--accent-green)' : 'var(--accent-red)';

      return {
        ...item,
        sma7,
        sma20,
        upperBand,
        lowerBand,
        rsi,
        candleColor,
        open: item.open || item.close,
        high: item.high || Math.max(item.close, item.open || item.close),
        low: item.low || Math.min(item.close, item.open || item.close),
      };
    });
  }, [data, timeframe]);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        No historical market data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      {/* Chart Control Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.85rem' }}>
        {/* Timeframes */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['7D', '14D', '30D', 'ALL'].map(tf => (
            <button
              key={tf}
              className={`pill-tag mono-font ${timeframe === tf ? 'active' : ''}`}
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.74rem' }}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* View mode & Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '0.4rem', padding: '0.15rem' }}>
            <button
              className={`pill-tag ${chartMode === 'area' ? 'active' : ''}`}
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', border: 'none', background: chartMode === 'area' ? 'var(--accent-pink)' : 'transparent' }}
              onClick={() => setChartMode('area')}
            >
              Area
            </button>
            <button
              className={`pill-tag ${chartMode === 'bar' ? 'active' : ''}`}
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', border: 'none', background: chartMode === 'bar' ? 'var(--accent-pink)' : 'transparent' }}
              onClick={() => setChartMode('bar')}
            >
              Bars / OHLC
            </button>
          </div>

          <button
            className={`pill-tag ${showSMA ? 'active' : ''}`}
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
            onClick={() => setShowSMA(prev => !prev)}
            title="Toggle 7-Day & 20-Day Simple Moving Averages"
          >
            SMA (7/20)
          </button>

          <button
            className={`pill-tag ${showBollinger ? 'active' : ''}`}
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
            onClick={() => setShowBollinger(prev => !prev)}
            title="Toggle Bollinger Bands"
          >
            Bollinger
          </button>

          <button
            className={`pill-tag ${showRSI ? 'active' : ''}`}
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
            onClick={() => setShowRSI(prev => !prev)}
            title="Toggle RSI Oscillator"
          >
            RSI (14)
          </button>
        </div>
      </div>

      {/* Main Price Chart */}
      <div style={{ width: '100%', minWidth: 0, height: showRSI ? 220 : 280, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'area' ? (
            <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-pink)" stopOpacity={0.55}/>
                  <stop offset="95%" stopColor="var(--accent-pink)" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={25}
              />
              <YAxis 
                stroke="var(--text-secondary)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '8px',
                  backdropFilter: 'blur(12px)',
                  fontSize: '0.82rem'
                }}
                itemStyle={{ color: 'var(--accent-pink)', fontWeight: 600 }}
                formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, name === 'close' ? 'Price' : name]}
              />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke="var(--accent-pink)" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorClose)" 
              />
              {showSMA && <Line type="monotone" dataKey="sma7" stroke="var(--accent-cyan)" strokeWidth={1.8} dot={false} name="SMA 7" />}
              {showSMA && <Line type="monotone" dataKey="sma20" stroke="var(--accent-amber)" strokeWidth={1.8} dot={false} strokeDasharray="4 4" name="SMA 20" />}
              {showBollinger && <Line type="monotone" dataKey="upperBand" stroke="rgba(255,255,255,0.3)" strokeWidth={1} dot={false} strokeDasharray="2 2" name="Upper Band" />}
              {showBollinger && <Line type="monotone" dataKey="lowerBand" stroke="rgba(255,255,255,0.3)" strokeWidth={1} dot={false} strokeDasharray="2 2" name="Lower Band" />}
            </AreaChart>
          ) : (
            <BarChart data={processedData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={25} />
              <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Math.round(v)}`} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.82rem' }}
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Close Price']}
              />
              <Bar dataKey="close" fill="var(--accent-pink)" radius={[3, 3, 0, 0]} />
              {showSMA && <Line type="monotone" dataKey="sma7" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} name="SMA 7" />}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* RSI Sub-Indicator Oscillator */}
      {showRSI && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)', height: 110, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
            <span>Relative Strength Index (RSI 14)</span>
            <span className="mono-font" style={{ color: 'var(--accent-cyan)' }}>
              Current: {processedData[processedData.length - 1]?.rsi || 50}
            </span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="var(--chart-grid)" vertical={false} />
              <YAxis domain={[0, 100]} ticks={[30, 50, 70]} stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} tickLine={false} axisLine={false} />
              <ReferenceLine y={70} stroke="var(--accent-red)" strokeDasharray="3 3" label={{ value: 'Overbought (70)', fill: 'var(--accent-red)', fontSize: 9, position: 'insideTopRight' }} />
              <ReferenceLine y={30} stroke="var(--accent-green)" strokeDasharray="3 3" label={{ value: 'Oversold (30)', fill: 'var(--accent-green)', fontSize: 9, position: 'insideBottomRight' }} />
              <Line type="monotone" dataKey="rsi" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StockChart;
