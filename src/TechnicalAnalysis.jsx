import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { trackStockSymbolSearch, trackButtonClick, trackTechnicalIndicator } from './analytics.js';
import { SquareAd } from './adsense.js';
import './TechnicalAnalysis.css';

const TechnicalAnalysis = () => {
  const [stockData, setStockData] = useState(null);
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('3mo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [indicators, setIndicators] = useState({});
  const [symbolInput, setSymbolInput] = useState('AAPL');
  const [showDropdown, setShowDropdown] = useState(false);
  const [symbolError, setSymbolError] = useState('');

  // Popular stock symbols for dropdown
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'PG', name: 'Procter & Gamble' },
    { symbol: 'UNH', name: 'UnitedHealth Group' },
    { symbol: 'HD', name: 'Home Depot Inc.' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    { symbol: 'BAC', name: 'Bank of America' },
    { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
    { symbol: 'DIS', name: 'Walt Disney Company' }
  ];

  // Valid stock symbol validation
  const isValidSymbol = (symbol) => {
    // Basic validation: 1-5 characters, letters only, optionally with dots
    const symbolRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;
    return symbolRegex.test(symbol.toUpperCase());
  };

  // Handle symbol input changes
  const handleSymbolInputChange = (value) => {
    setSymbolInput(value.toUpperCase());
    setSymbolError('');
    setShowDropdown(true);
  };

  // Handle symbol selection
  const handleSymbolSelect = (symbol) => {
    setSymbolInput(symbol);
    setCurrentSymbol(symbol);
    setShowDropdown(false);
    setSymbolError('');
  };

  // Handle symbol validation and update
  const validateAndSetSymbol = (symbol) => {
    const upperSymbol = symbol.toUpperCase();
    if (!upperSymbol) {
      setSymbolError('Please enter a stock symbol');
      return false;
    }
    
    if (!isValidSymbol(upperSymbol)) {
      setSymbolError(`"${upperSymbol}" is not a valid stock symbol format. Please use 1-5 letters (e.g., AAPL, BRK.B)`);
      return false;
    }
    
    // Check if it's a known symbol or warn about custom symbol
    const isKnownSymbol = popularStocks.some(stock => stock.symbol === upperSymbol);
    if (!isKnownSymbol) {
      setSymbolError(`Warning: "${upperSymbol}" is not in our list of popular stocks. Data may not be available.`);
    }
    
    setCurrentSymbol(upperSymbol);
    setSymbolInput(upperSymbol);
    setShowDropdown(false);
    return true;
  };

  // Filter stocks based on input
  const filteredStocks = popularStocks.filter(stock => 
    stock.symbol.includes(symbolInput.toUpperCase()) || 
    stock.name.toLowerCase().includes(symbolInput.toLowerCase())
  );

  // Technical Analysis Calculations
  const calculateSMA = useCallback((data, period) => {
    return data.map((_, index) => {
      if (index < period - 1) return null;
      const sum = data.slice(index - period + 1, index + 1)
        .reduce((acc, val) => acc + val.close, 0);
      return sum / period;
    });
  }, []);

  const calculateEMA = useCallback((data, period) => {
    const multiplier = 2 / (period + 1);
    const ema = [];
    
    // First EMA value is SMA
    const firstSMA = data.slice(0, period).reduce((sum, val) => sum + val.close, 0) / period;
    ema.push(firstSMA);
    
    for (let i = period; i < data.length; i++) {
      const emaValue = (data[i].close - ema[i - period]) * multiplier + ema[i - period];
      ema.push(emaValue);
    }
    
    return Array(period - 1).fill(null).concat(ema);
  }, []);

  const calculateEMAFromArray = useCallback((data, period) => {
    const multiplier = 2 / (period + 1);
    const ema = [];
    
    ema.push(data.slice(0, period).reduce((sum, val) => sum + val, 0) / period);
    
    for (let i = period; i < data.length; i++) {
      const emaValue = (data[i] - ema[i - period]) * multiplier + ema[i - period];
      ema.push(emaValue);
    }
    
    return Array(period - 1).fill(null).concat(ema);
  }, []);

  const calculateMACD = useCallback((data) => {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    
    const macd = ema12.map((val, i) => {
      if (val === null || ema26[i] === null) return null;
      return val - ema26[i];
    });
    
    const validMacd = macd.filter(val => val !== null);
    const signalLine = calculateEMAFromArray(validMacd, 9);
    
    const signal = Array(macd.length - validMacd.length).fill(null).concat(signalLine);
    const histogram = macd.map((val, i) => {
      if (val === null || signal[i] === null) return null;
      return val - signal[i];
    });
    
    return { macd, signal, histogram };
  }, [calculateEMA, calculateEMAFromArray]);

  const calculateRSI = useCallback((data, period = 14) => {
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }
    
    const rsi = [];
    
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((sum, val) => sum + val, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((sum, val) => sum + val, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    
    return Array(period).fill(null).concat(rsi);
  }, []);

  const calculateStochastic = useCallback((data, kPeriod = 14, dPeriod = 3) => {
    const k = [];
    
    for (let i = kPeriod - 1; i < data.length; i++) {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const high = Math.max(...slice.map(d => d.high));
      const low = Math.min(...slice.map(d => d.low));
      const close = data[i].close;
      
      k.push(((close - low) / (high - low)) * 100);
    }
    
    const kWithNulls = Array(kPeriod - 1).fill(null).concat(k);
    
    const calculateSMAFromArray = (data, period) => {
      return data.map((_, index) => {
        if (index < period - 1) return null;
        const sum = data.slice(index - period + 1, index + 1).reduce((acc, val) => acc + val, 0);
        return sum / period;
      }).filter(val => val !== null);
    };
    
    const d = calculateSMAFromArray(k, dPeriod);
    const dWithNulls = Array(kPeriod - 1 + dPeriod - 1).fill(null).concat(d);
    
    return { k: kWithNulls, d: dWithNulls };
  }, []);

  const calculateBollingerBands = useCallback((data, period = 20, multiplier = 2) => {
    const sma = calculateSMA(data, period);
    const bands = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        bands.push({ upper: null, middle: null, lower: null });
        continue;
      }
      
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val.close - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      bands.push({
        upper: mean + (stdDev * multiplier),
        middle: mean,
        lower: mean - (stdDev * multiplier)
      });
    }
    
    return bands;
  }, [calculateSMA]);

  const calculateFibonacci = useCallback((data) => {
    const prices = data.map(d => d.close);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const range = high - low;
    
    return {
      '0%': high,
      '23.6%': high - (range * 0.236),
      '38.2%': high - (range * 0.382),
      '50%': high - (range * 0.5),
      '61.8%': high - (range * 0.618),
      '78.6%': high - (range * 0.786),
      '100%': low
    };
  }, []);

  // Generate sample data for demonstration
  const generateSampleData = useCallback(() => {
    const periods = 100;
    const data = [];
    let price = 150 + Math.random() * 100;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periods);
    
    for (let i = 0; i < periods; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate realistic OHLC data with some trend and volatility
      const volatility = 0.02;
      const trend = 0.001;
      const randomChange = (Math.random() - 0.5) * volatility;
      
      price = price * (1 + trend + randomChange);
      
      const open = price * (1 + (Math.random() - 0.5) * 0.01);
      const high = Math.max(open, price) * (1 + Math.random() * 0.02);
      const low = Math.min(open, price) * (1 - Math.random() * 0.02);
      const close = price;
      const volume = Math.floor(Math.random() * 10000000 + 1000000);
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: volume
      });
    }
    
    return data;
  }, []);

  // Calculate all indicators
  const calculateAllIndicators = useCallback((data) => {
    const sma20 = calculateSMA(data, 20);
    const sma50 = calculateSMA(data, 50);
    const macd = calculateMACD(data);
    const rsi = calculateRSI(data);
    const stochastic = calculateStochastic(data);
    const bollinger = calculateBollingerBands(data);
    const fibonacci = calculateFibonacci(data);

    return {
      sma20,
      sma50,
      macd,
      rsi,
      stochastic,
      bollinger,
      fibonacci
    };
  }, [calculateSMA, calculateMACD, calculateRSI, calculateStochastic, calculateBollingerBands, calculateFibonacci]);

  // Load data function
  const loadData = async () => {
    // Validate symbol first
    if (!validateAndSetSymbol(symbolInput)) {
      return;
    }

    // Track symbol search
    trackStockSymbolSearch(symbolInput);
    trackButtonClick('load_technical_data');

    setLoading(true);
    setError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate symbol validation - in real implementation, this would be an API call
      const upperSymbol = symbolInput.toUpperCase();
      const isKnownSymbol = popularStocks.some(stock => stock.symbol === upperSymbol);
      
      // Simulate a 20% chance of "symbol not found" for unknown symbols
      if (!isKnownSymbol && Math.random() < 0.3) {
        throw new Error(`Symbol "${upperSymbol}" not found. Please verify the symbol and try again.`);
      }
      
      const data = generateSampleData();
      setStockData(data);
      
      const calculatedIndicators = calculateAllIndicators(data);
      setIndicators(calculatedIndicators);
      
      // Clear any previous symbol errors if data loads successfully
      setSymbolError('');
      
    } catch (err) {
      setError('Error loading data: ' + err.message);
      setSymbolError(err.message.includes('not found') ? err.message : '');
    } finally {
      setLoading(false);
    }
  };

  const useSampleData = () => {
    trackButtonClick('use_sample_data');
    const data = generateSampleData();
    setStockData(data);
    
    const calculatedIndicators = calculateAllIndicators(data);
    setIndicators(calculatedIndicators);
  };

  // Analysis functions
  const getTrendAnalysis = () => {
    if (!stockData || !indicators.sma20 || !indicators.sma50) return null;
    
    const currentPrice = stockData[stockData.length - 1].close;
    const currentSMA20 = indicators.sma20[indicators.sma20.length - 1];
    const currentSMA50 = indicators.sma50[indicators.sma50.length - 1];
    
    let signal = '';
    let signalClass = '';
    
    if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
      signal = 'BULLISH TREND - Price above both SMAs, SMA20 > SMA50';
      signalClass = 'bullish';
    } else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50) {
      signal = 'BEARISH TREND - Price below both SMAs, SMA20 < SMA50';
      signalClass = 'bearish';
    } else {
      signal = 'MIXED SIGNALS - Trend is unclear';
      signalClass = 'neutral';
    }
    
    return {
      signal,
      signalClass,
      currentPrice: currentPrice.toFixed(2),
      currentSMA20: currentSMA20.toFixed(2),
      currentSMA50: currentSMA50.toFixed(2)
    };
  };

  const getMACDAnalysis = () => {
    if (!indicators.macd) return null;
    
    const { macd, signal } = indicators.macd;
    const currentMACD = macd[macd.length - 1];
    const currentSignal = signal[signal.length - 1];
    const prevMACD = macd[macd.length - 2];
    const prevSignal = signal[signal.length - 2];
    
    let signalText = '';
    let signalClass = '';
    
    if (currentMACD > currentSignal && prevMACD <= prevSignal) {
      signalText = 'BUY SIGNAL - MACD crossed above signal line';
      signalClass = 'bullish';
    } else if (currentMACD < currentSignal && prevMACD >= prevSignal) {
      signalText = 'SELL SIGNAL - MACD crossed below signal line';
      signalClass = 'bearish';
    } else if (Math.abs(currentMACD - currentSignal) < 0.1) {
      signalText = 'CONVERGENCE - Lines converging, potential exit signal';
      signalClass = 'neutral';
    } else {
      signalText = 'HOLD - No clear signal';
      signalClass = 'neutral';
    }
    
    return {
      signalText,
      signalClass,
      currentMACD: currentMACD?.toFixed(4) || 'N/A',
      currentSignal: currentSignal?.toFixed(4) || 'N/A'
    };
  };

  const getRSIAnalysis = () => {
    if (!indicators.rsi) return null;
    
    const currentRSI = indicators.rsi[indicators.rsi.length - 1];
    
    let signalText = '';
    let signalClass = '';
    
    if (currentRSI > 70) {
      signalText = 'OVERBOUGHT - Potential sell signal';
      signalClass = 'overbought';
    } else if (currentRSI < 30) {
      signalText = 'OVERSOLD - Potential buy signal';
      signalClass = 'oversold';
    } else if (currentRSI > 50) {
      signalText = 'BULLISH TREND - RSI above 50';
      signalClass = 'bullish';
    } else {
      signalText = 'BEARISH TREND - RSI below 50';
      signalClass = 'bearish';
    }
    
    return {
      signalText,
      signalClass,
      currentRSI: currentRSI?.toFixed(2) || 'N/A'
    };
  };

  // Initialize with sample data
  useEffect(() => {
    useSampleData();
  }, []);

  if (loading) {
    return (
      <div className="technical-analysis">
        <div className="loading">
          Loading market data and calculating indicators...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="technical-analysis">
        <div className="error">{error}</div>
      </div>
    );
  }

  const trendAnalysis = getTrendAnalysis();
  const macdAnalysis = getMACDAnalysis();
  const rsiAnalysis = getRSIAnalysis();

  return (
    <div className="technical-analysis">
      <div className="page-header compact">
        <h1>Technical Analysis</h1>
        <p>Live market data with interactive chart indicators and real-time analysis</p>
      </div>

      <div className="controls">
        <div className="symbol-input-container">
          <label htmlFor="symbol">Stock Symbol:</label>
          <div className="typeahead-container">
            <input
              type="text"
              id="symbol"
              value={symbolInput}
              onChange={(e) => handleSymbolInputChange(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  validateAndSetSymbol(symbolInput);
                  setShowDropdown(false);
                } else if (e.key === 'Escape') {
                  setShowDropdown(false);
                }
              }}
              placeholder="Enter symbol (e.g., AAPL)"
              className={`symbol-input ${symbolError ? 'error' : ''}`}
            />
            {showDropdown && (
              <div className="dropdown-menu">
                {filteredStocks.length > 0 ? (
                  filteredStocks.slice(0, 10).map((stock) => (
                    <div
                      key={stock.symbol}
                      className="dropdown-item"
                      onMouseDown={() => handleSymbolSelect(stock.symbol)}
                    >
                      <strong>{stock.symbol}</strong> - {stock.name}
                    </div>
                  ))
                ) : symbolInput.length > 0 ? (
                  <div className="dropdown-item no-results">
                    No matching symbols found. Press Enter to use "{symbolInput.toUpperCase()}"
                  </div>
                ) : (
                  <div className="dropdown-item">
                    Start typing to search symbols...
                  </div>
                )}
              </div>
            )}
          </div>
          {symbolError && (
            <div className={`symbol-error ${symbolError.startsWith('Warning') ? 'warning' : 'error'}`}>
              {symbolError}
            </div>
          )}
        </div>
        
        <label htmlFor="period">Period:</label>
        <select 
          id="period" 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="1mo">1 Month</option>
          <option value="3mo">3 Months</option>
          <option value="6mo">6 Months</option>
          <option value="1y">1 Year</option>
        </select>
        
        <button onClick={loadData} disabled={loading}>
          {loading ? 'Loading...' : 'Load Data & Calculate'}
        </button>
        <button onClick={useSampleData}>Use Sample Data</button>
      </div>

      {stockData && (
        <div className="results">
          {/* Trend Lines Section */}
          <div className="section">
            <h2>1. Trend Lines</h2>
            <div className="formula-box">
              <strong>Concept:</strong> Trend lines connect significant highs or lows to identify price direction and potential support/resistance levels.
              <br /><br />
              <strong>How to draw:</strong>
              <ul>
                <li><strong>Uptrend:</strong> Connect two or more significant lows</li>
                <li><strong>Downtrend:</strong> Connect two or more significant highs</li>
                <li><strong>Sideways:</strong> Price moves within horizontal boundaries</li>
              </ul>
            </div>
            
            <Plot
              data={[
                {
                  x: stockData.map(d => d.date),
                  open: stockData.map(d => d.open),
                  high: stockData.map(d => d.high),
                  low: stockData.map(d => d.low),
                  close: stockData.map(d => d.close),
                  type: 'candlestick',
                  name: currentSymbol,
                  increasing: { line: { color: '#00CC00' } },
                  decreasing: { line: { color: '#CC0000' } }
                },
                {
                  x: stockData.map(d => d.date),
                  y: indicators.sma20,
                  name: 'SMA 20',
                  line: { color: 'blue' },
                  type: 'scatter',
                  mode: 'lines'
                },
                {
                  x: stockData.map(d => d.date),
                  y: indicators.sma50,
                  name: 'SMA 50',
                  line: { color: 'red' },
                  type: 'scatter',
                  mode: 'lines'
                }
              ]}
              layout={{
                title: `${currentSymbol} - Price with Trend Lines`,
                xaxis: { title: 'Date' },
                yaxis: { title: 'Price ($)' },
                showlegend: true,
                height: 400
              }}
              style={{ width: '100%' }}
            />
            
            {trendAnalysis && (
              <div className="signal-box">
                <h4>Trend Analysis:</h4>
                <p><span className={trendAnalysis.signalClass}>{trendAnalysis.signal}</span></p>
                <p>Current Price: ${trendAnalysis.currentPrice}</p>
                <p>SMA 20: ${trendAnalysis.currentSMA20}</p>
                <p>SMA 50: ${trendAnalysis.currentSMA50}</p>
              </div>
            )}
          </div>

          {/* MACD Section */}
          <div className="section">
            <h2>3. MACD (Moving Average Convergence Divergence)</h2>
            <div className="formula-box">
              <strong>MACD Line:</strong> EMA(12) - EMA(26)<br />
              <strong>Signal Line:</strong> EMA(9) of MACD Line<br />
              <strong>Histogram:</strong> MACD Line - Signal Line<br /><br />
              <strong>Signals:</strong>
              <ul>
                <li><span className="bullish">BUY:</span> MACD crosses above Signal line</li>
                <li><span className="bearish">SELL:</span> MACD crosses below Signal line</li>
                <li><span className="neutral">EXIT:</span> Lines converge and volume fades</li>
              </ul>
            </div>
            
            <Plot
              data={[
                {
                  x: stockData.map(d => d.date),
                  y: indicators.macd?.macd,
                  name: 'MACD',
                  line: { color: 'blue' },
                  type: 'scatter',
                  mode: 'lines'
                },
                {
                  x: stockData.map(d => d.date),
                  y: indicators.macd?.signal,
                  name: 'Signal',
                  line: { color: 'red' },
                  type: 'scatter',
                  mode: 'lines'
                },
                {
                  x: stockData.map(d => d.date),
                  y: indicators.macd?.histogram,
                  name: 'Histogram',
                  type: 'bar',
                  marker: { color: 'gray' }
                }
              ]}
              layout={{
                title: `${currentSymbol} - MACD`,
                xaxis: { title: 'Date' },
                yaxis: { title: 'MACD Value' },
                showlegend: true,
                height: 300
              }}
              style={{ width: '100%' }}
            />
            
            {macdAnalysis && (
              <div className="signal-box">
                <h4>MACD Analysis:</h4>
                <p><span className={macdAnalysis.signalClass}>{macdAnalysis.signalText}</span></p>
                <p>MACD: {macdAnalysis.currentMACD}</p>
                <p>Signal: {macdAnalysis.currentSignal}</p>
              </div>
            )}
          </div>

          {/* RSI Section */}
          <div className="section">
            <h2>4. RSI (Relative Strength Index)</h2>
            <div className="formula-box">
              <strong>Formula:</strong> RSI = 100 - (100 / (1 + RS))<br />
              <strong>Where RS:</strong> Average Gain / Average Loss (over 14 periods)<br /><br />
              <strong>Interpretation:</strong>
              <ul>
                <li><span className="overbought">Overbought:</span> RSI &gt; 70</li>
                <li><span className="oversold">Oversold:</span> RSI &lt; 30</li>
                <li><span className="bullish">Bullish Trend:</span> RSI &gt; 50</li>
                <li><span className="bearish">Bearish Trend:</span> RSI &lt; 50</li>
              </ul>
            </div>
            
            <Plot
              data={[
                {
                  x: stockData.map(d => d.date),
                  y: indicators.rsi,
                  name: 'RSI',
                  line: { color: 'purple' },
                  type: 'scatter',
                  mode: 'lines'
                },
                {
                  x: stockData.map(d => d.date),
                  y: Array(stockData.length).fill(70),
                  name: 'Overbought (70)',
                  line: { color: 'red', dash: 'dash' },
                  type: 'scatter',
                  mode: 'lines'
                },
                {
                  x: stockData.map(d => d.date),
                  y: Array(stockData.length).fill(30),
                  name: 'Oversold (30)',
                  line: { color: 'green', dash: 'dash' },
                  type: 'scatter',
                  mode: 'lines'
                }
              ]}
              layout={{
                title: `${currentSymbol} - RSI`,
                xaxis: { title: 'Date' },
                yaxis: { title: 'RSI Value', range: [0, 100] },
                showlegend: true,
                height: 300
              }}
              style={{ width: '100%' }}
            />
            
            {rsiAnalysis && (
              <div className="signal-box">
                <h4>RSI Analysis:</h4>
                <p><span className={rsiAnalysis.signalClass}>{rsiAnalysis.signalText}</span></p>
                <p>Current RSI: {rsiAnalysis.currentRSI}</p>
              </div>
            )}
          </div>

          {/* Bollinger Bands Section */}
          <div className="section">
            <h2>6. Bollinger Bands</h2>
            <div className="formula-box">
              <strong>Middle Band:</strong> SMA(20)<br />
              <strong>Upper Band:</strong> SMA(20) + (2 × Standard Deviation)<br />
              <strong>Lower Band:</strong> SMA(20) - (2 × Standard Deviation)<br /><br />
              <strong>Interpretation:</strong>
              <ul>
                <li><strong>Wide Bands:</strong> High volatility</li>
                <li><strong>Narrow Bands:</strong> Low volatility (potential breakout)</li>
                <li><strong>Band Squeeze:</strong> Volatility contraction before expansion</li>
              </ul>
            </div>
            
            <Plot
              data={[
                {
                  x: stockData.map(d => d.date),
                  open: stockData.map(d => d.open),
                  high: stockData.map(d => d.high),
                  low: stockData.map(d => d.low),
                  close: stockData.map(d => d.close),
                  type: 'candlestick',
                  name: currentSymbol,
                  increasing: { line: { color: '#00CC00' } },
                  decreasing: { line: { color: '#CC0000' } }
                },
                {
                  x: stockData.map(d => d.date),
                  y: indicators.bollinger?.map(b => b.upper),
                  name: 'Upper Band',
                  line: { color: 'red' },
                  type: 'scatter',
                  mode: 'lines'
                },
                {
                  x: stockData.map(d => d.date),
                  y: indicators.bollinger?.map(b => b.middle),
                  name: 'Middle Band (SMA 20)',
                  line: { color: 'blue' },
                  type: 'scatter',
                  mode: 'lines'
                },
                {
                  x: stockData.map(d => d.date),
                  y: indicators.bollinger?.map(b => b.lower),
                  name: 'Lower Band',
                  line: { color: 'green' },
                  type: 'scatter',
                  mode: 'lines'
                }
              ]}
              layout={{
                title: `${currentSymbol} - Bollinger Bands`,
                xaxis: { title: 'Date' },
                yaxis: { title: 'Price ($)' },
                showlegend: true,
                height: 400
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* Market Summary */}
          <div className="section">
            <h2>Technical Analysis Summary</h2>
            <div className="market-summary">
              <div className="summary-item">
                <h4>Trend Analysis</h4>
                {trendAnalysis && (
                  <>
                    <span className={`indicator-value ${trendAnalysis.signalClass}`}>
                      {trendAnalysis.signal.split(' - ')[0]}
                    </span>
                    <div className="indicator-explanation">
                      <p><strong>Current Trend:</strong> {trendAnalysis.signal}</p>
                      <p><strong>What it means:</strong> Moving averages help identify trend direction. When price is above both short-term (SMA20) and long-term (SMA50) averages, and SMA20 &gt; SMA50, it indicates a bullish trend.</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="summary-item">
                <h4>MACD Signal</h4>
                {macdAnalysis && (
                  <>
                    <span className={`indicator-value ${macdAnalysis.signalClass}`}>
                      {macdAnalysis.signalText.split(' - ')[0]}
                    </span>
                    <div className="indicator-explanation">
                      <p><strong>Current Signal:</strong> {macdAnalysis.signalText}</p>
                      <p><strong>What it means:</strong> MACD crossovers indicate momentum changes. When MACD line crosses above signal line, it suggests bullish momentum. When it crosses below, it suggests bearish momentum.</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="summary-item">
                <h4>RSI Status</h4>
                {rsiAnalysis && (
                  <>
                    <span className={`indicator-value ${rsiAnalysis.signalClass}`}>
                      RSI: {rsiAnalysis.currentRSI}
                    </span>
                    <div className="indicator-explanation">
                      <p><strong>Current Status:</strong> {rsiAnalysis.signalText}</p>
                      <p><strong>What it means:</strong> 
                        • RSI &gt; 70: <strong>Overbought</strong> - Price may be too high, potential sell signal<br/>
                        • RSI &lt; 30: <strong>Oversold</strong> - Price may be too low, potential buy signal<br/>
                        • RSI 30-70: Normal range, follow the trend
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="technical-indicators-guide">
              <h3>Quick Reference Guide</h3>
              <div className="indicators-grid">
                <div className="guide-card">
                  <h4>RSI (Relative Strength Index)</h4>
                  <div className="guide-levels">
                    <div className="level overbought">RSI &gt; 70: Overbought (Consider Selling)</div>
                    <div className="level neutral">RSI 30-70: Normal Range (Follow Trend)</div>
                    <div className="level oversold">RSI &lt; 30: Oversold (Consider Buying)</div>
                  </div>
                  <p><strong>Best for:</strong> Identifying potential reversal points in sideways markets</p>
                </div>
                
                <div className="guide-card">
                  <h4>MACD (Moving Average Convergence Divergence)</h4>
                  <div className="guide-levels">
                    <div className="level bullish">MACD &gt; Signal: Bullish Momentum</div>
                    <div className="level bearish">MACD &lt; Signal: Bearish Momentum</div>
                    <div className="level neutral">Lines Converging: Momentum Weakening</div>
                  </div>
                  <p><strong>Best for:</strong> Identifying momentum changes and trend confirmations</p>
                </div>
                
                <div className="guide-card">
                  <h4>Bollinger Bands</h4>
                  <div className="guide-levels">
                    <div className="level overbought">Price at Upper Band: Potential Resistance</div>
                    <div className="level neutral">Price at Middle Band: Fair Value</div>
                    <div className="level oversold">Price at Lower Band: Potential Support</div>
                  </div>
                  <p><strong>Best for:</strong> Measuring volatility and identifying overbought/oversold conditions</p>
                </div>
                
                <div className="guide-card">
                  <h4>Stochastic Oscillator</h4>
                  <div className="guide-levels">
                    <div className="level overbought">%K &gt; 80: Overbought Zone</div>
                    <div className="level neutral">%K 20-80: Normal Range</div>
                    <div className="level oversold">%K &lt; 20: Oversold Zone</div>
                  </div>
                  <p><strong>Best for:</strong> Timing entries and exits in range-bound markets</p>
                </div>
              </div>
            </div>
            
            <div className="trading-tips">
              <h3>Trading Tips</h3>
              <div className="tips-grid">
                <div className="tip-card">
                  <h4>Confirmation</h4>
                  <p>Never rely on a single indicator. Look for confirmation from multiple indicators before making trading decisions.</p>
                </div>
                <div className="tip-card">
                  <h4>Trend Following</h4>
                  <p>In strong trends, overbought/oversold signals may not work. Use trend-following indicators like MACD and moving averages.</p>
                </div>
                <div className="tip-card">
                  <h4>Timeframes</h4>
                  <p>Check multiple timeframes. What looks bullish on daily charts might be bearish on weekly charts.</p>
                </div>
                <div className="tip-card">
                  <h4>Risk Management</h4>
                  <p>Always use stop losses and position sizing. Technical analysis helps with timing, not risk management.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalAnalysis;
