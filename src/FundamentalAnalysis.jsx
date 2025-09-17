import React, { useState, useEffect } from 'react';
import { trackStockSymbolSearch, trackButtonClick } from './analytics';
import './FundamentalAnalysis.css';

const FundamentalAnalysis = () => {
  const [companyData, setCompanyData] = useState(null);
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');
  const [symbolInput, setSymbolInput] = useState('AAPL');
  const [showDropdown, setShowDropdown] = useState(false);
  const [symbolError, setSymbolError] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Generate sample fundamental data
  const generateSampleFundamentals = (symbol) => {
    const stockInfo = popularStocks.find(stock => stock.symbol === symbol) || 
                     { symbol: symbol, name: `${symbol} Corporation` };
    
    // Generate realistic but random fundamental data
    const randomBetween = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));
    
    return {
      companyName: stockInfo.name,
      symbol: stockInfo.symbol,
      sector: ["Technology", "Healthcare", "Finance", "Consumer Goods", "Energy"][Math.floor(Math.random() * 5)],
      industry: ["Software", "Biotechnology", "Banking", "Retail", "Oil & Gas"][Math.floor(Math.random() * 5)],
      marketCap: randomBetween(10, 300), // in billions
      fundamentals: {
        eps: randomBetween(1.5, 8.5), // Earnings Per Share
        pe: randomBetween(12, 35), // Price to Earnings Ratio
        roe: randomBetween(8, 25), // Return on Equity (%)
        debtToCapital: randomBetween(15, 45), // Debt to Capital (%)
        interestCoverage: randomBetween(3, 20), // Interest Coverage Ratio
        evToEbitda: randomBetween(8, 25), // Enterprise Value to EBITDA
        operatingMargin: randomBetween(10, 35), // Operating Margin (%)
        quickRatio: randomBetween(0.8, 3.0), // Quick Ratio
        currentRatio: randomBetween(1.2, 4.0), // Current Ratio
        bookValue: randomBetween(15, 45), // Book Value per Share
        priceToBook: randomBetween(1.5, 6.0), // Price to Book Ratio
        dividendYield: randomBetween(0, 4.5), // Dividend Yield (%)
        payoutRatio: randomBetween(15, 60), // Payout Ratio (%)
        assetTurnover: randomBetween(0.4, 1.5), // Asset Turnover
        grossMargin: randomBetween(25, 75), // Gross Margin (%)
        netMargin: randomBetween(5, 25), // Net Margin (%)
        revenueGrowth: randomBetween(-5, 25), // Revenue Growth (%)
        earningsGrowth: randomBetween(-10, 30), // Earnings Growth (%)
        cashFlow: randomBetween(2, 12), // Free Cash Flow per Share
        totalDebt: randomBetween(5, 50), // Total Debt (billions)
        cash: randomBetween(10, 80), // Cash and Equivalents (billions)
      }
    };
  };

  // Load company data
  const loadCompanyData = async () => {
    if (!validateAndSetSymbol(symbolInput)) {
      return;
    }

    trackStockSymbolSearch(symbolInput, 'fundamental_analysis');
    trackButtonClick('load_fundamental_data');
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate symbol validation - in real implementation, this would be an API call
      const upperSymbol = symbolInput.toUpperCase();
      const isKnownSymbol = popularStocks.some(stock => stock.symbol === upperSymbol);
      
      // Simulate a 20% chance of "symbol not found" for unknown symbols
      if (!isKnownSymbol && Math.random() < 0.3) {
        throw new Error(`Symbol "${upperSymbol}" not found. Please verify the symbol and try again.`);
      }
      
      const data = generateSampleFundamentals(upperSymbol);
      setCompanyData(data);
      
      // Clear any previous symbol errors if data loads successfully
      setSymbolError('');
      
    } catch (err) {
      setSymbolError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const data = generateSampleFundamentals(currentSymbol);
    setCompanyData(data);
  }, []);

  const getIndicatorStatus = (metric, value) => {
    const thresholds = {
      eps: { good: 3, excellent: 5 },
      pe: { good: 25, excellent: 15, reverse: true },
      roe: { good: 15, excellent: 20 },
      debtToCapital: { good: 30, excellent: 20, reverse: true },
      interestCoverage: { good: 5, excellent: 10 },
      evToEbitda: { good: 20, excellent: 12, reverse: true },
      operatingMargin: { good: 15, excellent: 25 },
      quickRatio: { good: 1, excellent: 1.5 },
      currentRatio: { good: 1.5, excellent: 2 },
      priceToBook: { good: 3, excellent: 1.5, reverse: true },
      dividendYield: { good: 2, excellent: 4 },
      grossMargin: { good: 40, excellent: 60 },
      netMargin: { good: 10, excellent: 20 }
    };

    if (!thresholds[metric]) return 'neutral';

    const threshold = thresholds[metric];
    const isReverse = threshold.reverse;

    if (isReverse) {
      if (value <= threshold.excellent) return 'excellent';
      if (value <= threshold.good) return 'good';
      return 'poor';
    } else {
      if (value >= threshold.excellent) return 'excellent';
      if (value >= threshold.good) return 'good';
      return 'poor';
    }
  };

  const fundamentalMetrics = [
    {
      key: 'eps',
      name: 'Earnings Per Share (EPS)',
      description: 'Company\'s net earnings divided by outstanding shares. Higher EPS indicates better profitability per share.',
      interpretation: {
        good: 'Strong earnings generation',
        poor: 'Weak earnings per share',
        excellent: 'Outstanding earnings performance'
      },
      unit: '$'
    },
    {
      key: 'pe',
      name: 'Price-to-Earnings Ratio (P/E)',
      description: 'Stock price divided by earnings per share. Lower P/E may indicate undervaluation, but context matters.',
      interpretation: {
        good: 'Reasonably valued',
        poor: 'Potentially overvalued',
        excellent: 'Potentially undervalued'
      },
      unit: 'x'
    },
    {
      key: 'roe',
      name: 'Return on Equity (ROE)',
      description: 'Net income divided by shareholder equity. Measures how efficiently a company uses shareholder investments.',
      interpretation: {
        good: 'Efficient use of equity',
        poor: 'Inefficient capital utilization',
        excellent: 'Exceptional returns on equity'
      },
      unit: '%'
    },
    {
      key: 'debtToCapital',
      name: 'Debt-to-Capital Ratio',
      description: 'Total debt divided by total capital. Lower ratios indicate less financial risk.',
      interpretation: {
        good: 'Manageable debt levels',
        poor: 'High debt burden',
        excellent: 'Conservative debt management'
      },
      unit: '%'
    },
    {
      key: 'interestCoverage',
      name: 'Interest Coverage Ratio',
      description: 'EBIT divided by interest expenses. Higher ratios indicate better ability to pay debt obligations.',
      interpretation: {
        good: 'Can service debt comfortably',
        poor: 'Difficulty covering interest',
        excellent: 'Strong debt servicing ability'
      },
      unit: 'x'
    },
    {
      key: 'evToEbitda',
      name: 'EV/EBITDA Ratio',
      description: 'Enterprise value divided by earnings before interest, taxes, depreciation, and amortization. Lower values may indicate better value.',
      interpretation: {
        good: 'Fair valuation',
        poor: 'Potentially expensive',
        excellent: 'Attractive valuation'
      },
      unit: 'x'
    },
    {
      key: 'operatingMargin',
      name: 'Operating Margin',
      description: 'Operating income divided by revenue. Higher margins indicate better operational efficiency.',
      interpretation: {
        good: 'Solid operational efficiency',
        poor: 'Low operational profitability',
        excellent: 'Superior operational performance'
      },
      unit: '%'
    },
    {
      key: 'quickRatio',
      name: 'Quick Ratio',
      description: 'Liquid assets divided by current liabilities. Measures ability to pay short-term obligations without selling inventory.',
      interpretation: {
        good: 'Adequate liquidity',
        poor: 'Potential liquidity issues',
        excellent: 'Strong liquidity position'
      },
      unit: 'x'
    },
    {
      key: 'currentRatio',
      name: 'Current Ratio',
      description: 'Current assets divided by current liabilities. Measures short-term financial health.',
      interpretation: {
        good: 'Healthy short-term finances',
        poor: 'Potential short-term issues',
        excellent: 'Strong short-term position'
      },
      unit: 'x'
    },
    {
      key: 'priceToBook',
      name: 'Price-to-Book Ratio (P/B)',
      description: 'Stock price divided by book value per share. Lower ratios may indicate undervaluation.',
      interpretation: {
        good: 'Reasonable book value multiple',
        poor: 'High premium to book value',
        excellent: 'Trading near or below book value'
      },
      unit: 'x'
    },
    {
      key: 'dividendYield',
      name: 'Dividend Yield',
      description: 'Annual dividends per share divided by stock price. Higher yields provide more income.',
      interpretation: {
        good: 'Decent income generation',
        poor: 'Low dividend income',
        excellent: 'Strong dividend income'
      },
      unit: '%'
    },
    {
      key: 'grossMargin',
      name: 'Gross Margin',
      description: 'Gross profit divided by revenue. Higher margins indicate better pricing power and cost control.',
      interpretation: {
        good: 'Solid profit margins',
        poor: 'Thin profit margins',
        excellent: 'Superior profit margins'
      },
      unit: '%'
    },
    {
      key: 'netMargin',
      name: 'Net Margin',
      description: 'Net income divided by revenue. Higher margins indicate better overall profitability.',
      interpretation: {
        good: 'Healthy bottom line',
        poor: 'Weak profitability',
        excellent: 'Strong bottom line performance'
      },
      unit: '%'
    }
  ];

  if (!companyData) {
    return <div className="loading">Loading fundamental analysis...</div>;
  }

  return (
    <div className="fundamental-analysis">
      <div className="page-header compact">
        <h1>Fundamental Analysis</h1>
        <p>Company financial health, valuation metrics, and investment quality assessment</p>
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
        
        <button onClick={loadCompanyData} disabled={loading}>
          {loading ? 'Loading...' : 'Load Company Data'}
        </button>
      </div>

      {companyData && (
        <div className="company-overview">
          <h2>{companyData.companyName} ({companyData.symbol})</h2>
          <div className="company-details">
            <div className="detail-item">
              <span className="label">Sector:</span>
              <span className="value">{companyData.sector}</span>
            </div>
            <div className="detail-item">
              <span className="label">Industry:</span>
              <span className="value">{companyData.industry}</span>
            </div>
            <div className="detail-item">
              <span className="label">Market Cap:</span>
              <span className="value">${companyData.marketCap}B</span>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading">
          Loading company data and calculating financial metrics...
        </div>
      )}

      {symbolError && !loading && (
        <div className="error">
          {symbolError}
        </div>
      )}

      {companyData && !loading && (
        <>
          <div className="fundamentals-grid">
        {fundamentalMetrics.map(metric => {
          const value = companyData.fundamentals[metric.key];
          const status = getIndicatorStatus(metric.key, value);
          
          return (
            <div key={metric.key} className={`fundamental-card ${status}`}>
              <div className="metric-header">
                <h3>{metric.name}</h3>
                <div className={`metric-value ${status}`}>
                  {typeof value === 'number' ? value.toFixed(2) : value}{metric.unit}
                </div>
              </div>
              
              <div className="metric-description">
                <p><strong>What it means:</strong> {metric.description}</p>
              </div>
              
              <div className="metric-interpretation">
                <div className={`status-indicator ${status}`}>
                  <span className="status-text">
                    {status === 'excellent' && 'Excellent'}
                    {status === 'good' && 'Good'}
                    {status === 'poor' && 'Needs Attention'}
                    {status === 'neutral' && 'Neutral'}
                  </span>
                </div>
                <p className="interpretation-text">
                  {metric.interpretation[status] || 'Metric within normal range'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fundamental-summary">
        <h2>Fundamental Analysis Summary</h2>
        <div className="summary-grid">
          <div className="summary-section">
            <h3>Profitability</h3>
            <div className="summary-metrics">
              <div className="summary-item">
                <span>ROE:</span>
                <span className={getIndicatorStatus('roe', companyData.fundamentals.roe)}>
                  {companyData.fundamentals.roe}%
                </span>
              </div>
              <div className="summary-item">
                <span>Operating Margin:</span>
                <span className={getIndicatorStatus('operatingMargin', companyData.fundamentals.operatingMargin)}>
                  {companyData.fundamentals.operatingMargin}%
                </span>
              </div>
              <div className="summary-item">
                <span>Net Margin:</span>
                <span className={getIndicatorStatus('netMargin', companyData.fundamentals.netMargin)}>
                  {companyData.fundamentals.netMargin}%
                </span>
              </div>
            </div>
          </div>

          <div className="summary-section">
                        <h3>Valuation</h3>
            <div className="summary-metrics">
              <div className="summary-item">
                <span>P/E Ratio:</span>
                <span className={getIndicatorStatus('pe', companyData.fundamentals.pe)}>
                  {companyData.fundamentals.pe}x
                </span>
              </div>
              <div className="summary-item">
                <span>P/B Ratio:</span>
                <span className={getIndicatorStatus('priceToBook', companyData.fundamentals.priceToBook)}>
                  {companyData.fundamentals.priceToBook}x
                </span>
              </div>
              <div className="summary-item">
                <span>EV/EBITDA:</span>
                <span className={getIndicatorStatus('evToEbitda', companyData.fundamentals.evToEbitda)}>
                  {companyData.fundamentals.evToEbitda}x
                </span>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <h3>Liquidity</h3>
            <div className="summary-metrics">
              <div className="summary-item">
                <span>Current Ratio:</span>
                <span className={getIndicatorStatus('currentRatio', companyData.fundamentals.currentRatio)}>
                  {companyData.fundamentals.currentRatio}x
                </span>
              </div>
              <div className="summary-item">
                <span>Quick Ratio:</span>
                <span className={getIndicatorStatus('quickRatio', companyData.fundamentals.quickRatio)}>
                  {companyData.fundamentals.quickRatio}x
                </span>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <h3>Financial Health</h3>
            <div className="summary-metrics">
              <div className="summary-item">
                <span>Debt/Capital:</span>
                <span className={getIndicatorStatus('debtToCapital', companyData.fundamentals.debtToCapital)}>
                  {companyData.fundamentals.debtToCapital}%
                </span>
              </div>
              <div className="summary-item">
                <span>Quick Ratio:</span>
                <span className={getIndicatorStatus('quickRatio', companyData.fundamentals.quickRatio)}>
                  {companyData.fundamentals.quickRatio}x
                </span>
              </div>
              <div className="summary-item">
                <span>Interest Coverage:</span>
                <span className={getIndicatorStatus('interestCoverage', companyData.fundamentals.interestCoverage)}>
                  {companyData.fundamentals.interestCoverage}x
                </span>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <h3>Growth & Returns</h3>
            <div className="summary-metrics">
              <div className="summary-item">
                <span>Revenue Growth:</span>
                <span className="good">{companyData.fundamentals.revenueGrowth}%</span>
              </div>
              <div className="summary-item">
                <span>Earnings Growth:</span>
                <span className="good">{companyData.fundamentals.earningsGrowth}%</span>
              </div>
              <div className="summary-item">
                <span>Dividend Yield:</span>
                <span className={getIndicatorStatus('dividendYield', companyData.fundamentals.dividendYield)}>
                  {companyData.fundamentals.dividendYield}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="key-insights">
        <h2>Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h3>Strengths</h3>
            <ul>
              <li>Strong operating margins indicate efficient operations</li>
              <li>Healthy interest coverage ratio shows good debt management</li>
              <li>Positive earnings and revenue growth trends</li>
              <li>Solid return on equity demonstrates effective capital utilization</li>
            </ul>
          </div>
          
          <div className="insight-card">
            <h3>Areas to Watch</h3>
            <ul>
              <li>Monitor debt levels relative to industry peers</li>
              <li>Track margin sustainability in competitive environment</li>
              <li>Watch for changes in growth rates</li>
              <li>Consider valuation multiples versus market conditions</li>
            </ul>
          </div>
        </div>
          </div>

          <div className="analysis-tips">
            <h3>Key Insights for Fundamental Analysis</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <h4>Profitability Ratios</h4>
                <p>Focus on ROE, profit margins, and EPS growth. These indicate how effectively the company generates profit.</p>
              </div>
              <div className="tip-card">
                <h4>Financial Health</h4>
                <p>Check debt ratios and liquidity ratios. A company should have manageable debt and sufficient cash flow.</p>
              </div>
              <div className="tip-card">
                <h4>Valuation Metrics</h4>
                <p>Compare P/E and P/B ratios to industry averages. Lower ratios might indicate undervaluation.</p>
              </div>
              <div className="tip-card">
                <h4>Growth & Efficiency</h4>
                <p>Look for consistent revenue and earnings growth. Asset turnover shows how efficiently assets generate sales.</p>
              </div>
            </div>

            <h4>Analysis Tips:</h4>
            <ul>
              <li>Compare metrics to industry peers and historical averages</li>
              <li>Look for consistent trends rather than single data points</li>
              <li>Consider the business cycle and market conditions</li>
              <li>Watch for changes in growth rates</li>
              <li>Consider valuation multiples versus market conditions</li>
            </ul>
          </div>
        </>
      )}

      <div className="disclaimer">
        <h3>Important Disclaimer</h3>
        <p>
          This analysis is for educational purposes only and should not be considered as investment advice. 
          Always conduct your own research and consider consulting with a financial advisor before making 
          investment decisions. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
};

export default FundamentalAnalysis;
