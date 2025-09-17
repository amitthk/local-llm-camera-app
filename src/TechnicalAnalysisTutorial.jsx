import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { trackEvent } from './analytics';
import './TechnicalAnalysisTutorial.css';

const TechnicalAnalysisTutorial = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [stockData, setStockData] = useState(null);
  const [indicators, setIndicators] = useState({});

  React.useEffect(() => {
    trackEvent('page_view', {
      page_title: 'Technical Analysis Tutorial',
      page_location: window.location.href
    });
  }, []);

  // Educational content sections
  const sections = {
    introduction: {
      title: "Introduction to Technical Analysis",
      content: (
        <div className="tutorial-content">
          <h3>What is Technical Analysis?</h3>
          <p>Technical analysis is the study of past market data, primarily price and volume, to forecast future price direction. It's based on three key principles:</p>
          
          <div className="principle-box">
            <h4>1. Market Action Discounts Everything</h4>
            <p>All relevant information (fundamental, economic, political) is already reflected in the stock price.</p>
          </div>
          
          <div className="principle-box">
            <h4>2. Price Moves in Trends</h4>
            <p>Stock prices tend to move in identifiable trends that persist over time.</p>
          </div>
          
          <div className="principle-box">
            <h4>3. History Tends to Repeat Itself</h4>
            <p>Market psychology is predictable, and similar patterns tend to repeat.</p>
          </div>
          
          <h3>Types of Analysis</h3>
          <div className="analysis-types">
            <div className="type-card">
              <h4>Chart Patterns</h4>
              <p>Visual patterns formed by price movements that help predict future direction.</p>
            </div>
            <div className="type-card">
              <h4>Technical Indicators</h4>
              <p>Mathematical calculations based on price and volume data.</p>
            </div>
            <div className="type-card">
              <h4>Support & Resistance</h4>
              <p>Key price levels where buying or selling pressure is concentrated.</p>
            </div>
          </div>
        </div>
      )
    },
    
    trendlines: {
      title: "Understanding Trend Lines",
      content: (
        <div className="tutorial-content">
          <h3>What are Trend Lines?</h3>
          <p>Trend lines are straight lines that connect two or more price points and extend into the future to act as lines of support or resistance.</p>
          
          <div className="trend-types">
            <div className="trend-card uptrend">
              <h4>Uptrend</h4>
              <p><strong>Definition:</strong> Series of higher highs and higher lows</p>
              <p><strong>How to draw:</strong> Connect two or more significant lows</p>
              <p><strong>Signal:</strong> Bullish market sentiment</p>
              <p><strong>Trading:</strong> Buy on dips to the trend line</p>
            </div>
            
            <div className="trend-card downtrend">
              <h4>Downtrend</h4>
              <p><strong>Definition:</strong> Series of lower highs and lower lows</p>
              <p><strong>How to draw:</strong> Connect two or more significant highs</p>
              <p><strong>Signal:</strong> Bearish market sentiment</p>
              <p><strong>Trading:</strong> Sell on rallies to the trend line</p>
            </div>
            
            <div className="trend-card sideways">
              <h4>Sideways Trend</h4>
              <p><strong>Definition:</strong> Price moves within horizontal boundaries</p>
              <p><strong>How to draw:</strong> Connect similar highs and lows</p>
              <p><strong>Signal:</strong> Market consolidation</p>
              <p><strong>Trading:</strong> Buy at support, sell at resistance</p>
            </div>
          </div>
          
          <div className="tip-box">
            <h4>Pro Tips</h4>
            <ul>
              <li>More touches make the trend line more reliable</li>
              <li>Steeper trend lines are more likely to break</li>
              <li>Volume should confirm trend line breaks</li>
              <li>Use multiple timeframes for better analysis</li>
            </ul>
          </div>
        </div>
      )
    },
    
    fundamental_intro: {
      title: "Fundamental Analysis Basics",
      content: (
        <div className="tutorial-content">
          <h3>What is Fundamental Analysis?</h3>
          <p>Fundamental analysis evaluates a company's intrinsic value by examining economic, financial, and qualitative factors that could affect its stock price.</p>
          
          <div className="principle-box">
            <h4>Core Philosophy</h4>
            <p>Every stock has an intrinsic value based on the company's financial health, business model, and growth prospects. Market prices may deviate from this value, creating investment opportunities.</p>
          </div>
          
          <h3>Fundamental vs Technical Analysis</h3>
          <div className="analysis-comparison">
            <div className="comparison-card fundamental">
              <h4>Fundamental Analysis</h4>
              <ul>
                <li><strong>Focus:</strong> Company's intrinsic value</li>
                <li><strong>Time Horizon:</strong> Long-term (months to years)</li>
                <li><strong>Data Used:</strong> Financial statements, earnings, ratios</li>
                <li><strong>Goal:</strong> Determine if stock is over/undervalued</li>
                <li><strong>Best For:</strong> Value investing, long-term growth</li>
              </ul>
            </div>
            <div className="comparison-card technical">
              <h4>Technical Analysis</h4>
              <ul>
                <li><strong>Focus:</strong> Price patterns and trends</li>
                <li><strong>Time Horizon:</strong> Short to medium-term</li>
                <li><strong>Data Used:</strong> Price charts, volume, indicators</li>
                <li><strong>Goal:</strong> Predict future price movements</li>
                <li><strong>Best For:</strong> Trading, timing entries/exits</li>
              </ul>
            </div>
          </div>
          
          <h3>Types of Fundamental Analysis</h3>
          <div className="analysis-types">
            <div className="type-card">
              <h4>Qualitative Analysis</h4>
              <p>Business model, management quality, competitive advantages, industry trends</p>
            </div>
            <div className="type-card">
              <h4>Quantitative Analysis</h4>
              <p>Financial ratios, earnings growth, revenue trends, balance sheet strength</p>
            </div>
            <div className="type-card">
              <h4>Macroeconomic Analysis</h4>
              <p>Economic conditions, interest rates, industry cycles, market sentiment</p>
            </div>
          </div>
        </div>
      )
    },
    
    financial_ratios: {
      title: "Key Financial Ratios",
      content: (
        <div className="tutorial-content">
          <h3>Essential Financial Ratios for Stock Analysis</h3>
          <p>Financial ratios help investors evaluate a company's performance, financial health, and valuation relative to peers and historical performance.</p>
          
          <div className="ratio-category">
            <h4>Profitability Ratios</h4>
            <div className="ratio-grid">
              <div className="ratio-card">
                <h5>Return on Equity (ROE)</h5>
                <div className="formula">ROE = Net Income / Shareholders' Equity</div>
                <p><strong>Good Range:</strong> 15-20%+</p>
                <p><strong>Meaning:</strong> How efficiently a company uses shareholder money to generate profit</p>
                <div className="interpretation">
                  <span className="good">High ROE:</span> Efficient management, strong profitability<br/>
                  <span className="bad">Low ROE:</span> Poor capital utilization, weak performance
                </div>
              </div>
              
              <div className="ratio-card">
                <h5>Net Profit Margin</h5>
                <div className="formula">Net Margin = Net Income / Revenue × 100</div>
                <p><strong>Good Range:</strong> 10%+ (varies by industry)</p>
                <p><strong>Meaning:</strong> How much profit a company makes for every dollar of revenue</p>
                <div className="interpretation">
                  <span className="good">High Margin:</span> Efficient operations, pricing power<br/>
                  <span className="bad">Low Margin:</span> Competitive pressure, high costs
                </div>
              </div>
            </div>
          </div>
          
          <div className="ratio-category">
            <h4>Valuation Ratios</h4>
            <div className="ratio-grid">
              <div className="ratio-card">
                <h5>Price-to-Earnings (P/E)</h5>
                <div className="formula">P/E = Stock Price / Earnings Per Share</div>
                <p><strong>Typical Range:</strong> 10-25 (varies by industry and growth)</p>
                <p><strong>Meaning:</strong> How much investors pay for each dollar of earnings</p>
                <div className="interpretation">
                  <span className="good">Low P/E:</span> Potentially undervalued, value opportunity<br/>
                  <span className="bad">High P/E:</span> Potentially overvalued, high growth expectations
                </div>
              </div>
              
              <div className="ratio-card">
                <h5>Price-to-Book (P/B)</h5>
                <div className="formula">P/B = Stock Price / Book Value Per Share</div>
                <p><strong>Good Range:</strong> 1-3 (lower generally better)</p>
                <p><strong>Meaning:</strong> How much investors pay relative to company's net worth</p>
                <div className="interpretation">
                  <span className="good">Low P/B:</span> Trading near asset value, potential bargain<br/>
                  <span className="neutral">High P/B:</span> Premium valuation, growth expectations
                </div>
              </div>
            </div>
          </div>
          
          <div className="ratio-tips">
            <h4>Ratio Analysis Tips</h4>
            <ul>
              <li><strong>Compare to Industry:</strong> Ratios vary significantly between industries</li>
              <li><strong>Look at Trends:</strong> Track ratios over 3-5 years to see improvement/deterioration</li>
              <li><strong>Use Multiple Ratios:</strong> No single ratio tells the complete story</li>
              <li><strong>Consider Business Cycle:</strong> Some ratios fluctuate with economic cycles</li>
              <li><strong>Quality Matters:</strong> High-quality companies can sustain premium valuations</li>
            </ul>
          </div>
        </div>
      )
    },
    
    valuation_methods: {
      title: "Valuation Methods",
      content: (
        <div className="tutorial-content">
          <h3>Stock Valuation Techniques</h3>
          <p>Valuation is the process of determining what a company is worth. Different methods provide different perspectives on a stock's fair value.</p>
          
          <div className="valuation-method">
            <h4>Discounted Cash Flow (DCF) Analysis</h4>
            <p>The gold standard of valuation - estimates the present value of future cash flows.</p>
            
            <div className="dcf-steps">
              <div className="dcf-step">
                <h5>Step 1: Project Free Cash Flows</h5>
                <div className="formula">Free Cash Flow = Operating Cash Flow - Capital Expenditures</div>
                <p>Project FCF for 5-10 years based on revenue growth, margins, and capex needs</p>
              </div>
              
              <div className="dcf-step">
                <h5>Step 2: Estimate Terminal Value</h5>
                <div className="formula">Terminal Value = FCF(final year) × (1 + growth) / (discount rate - growth)</div>
                <p>Value of cash flows beyond the projection period (typically 60-80% of total value)</p>
              </div>
              
              <div className="dcf-step">
                <h5>Step 3: Discount to Present Value</h5>
                <div className="formula">PV = Future Cash Flow / (1 + discount rate)^years</div>
                <p>Use Weighted Average Cost of Capital (WACC) as discount rate</p>
              </div>
            </div>
          </div>
          
          <div className="valuation-synthesis">
            <h4>Valuation Synthesis</h4>
            
            <div className="synthesis-approach">
              <h5>Football Field Valuation</h5>
              <p>Combine multiple valuation methods to create a range of fair values</p>
              
              <div className="valuation-range">
                <div className="method-range">
                  <span className="method">DCF Analysis:</span>
                  <span className="range">$45 - $55</span>
                </div>
                <div className="method-range">
                  <span className="method">Comparable Companies:</span>
                  <span className="range">$48 - $52</span>
                </div>
                <div className="method-range">
                  <span className="method">Precedent Transactions:</span>
                  <span className="range">$50 - $60</span>
                </div>
                <div className="consensus-range">
                  <span className="method"><strong>Consensus Range:</strong></span>
                  <span className="range"><strong>$48 - $55</strong></span>
                </div>
              </div>
            </div>
            
            <div className="valuation-decision">
              <h5>Investment Decision Framework</h5>
              <div className="decision-grid">
                <div className="decision-card buy">
                  <h6>BUY (Current Price &lt; Low End)</h6>
                  <p>Significant upside potential, attractive risk/reward</p>
                </div>
                <div className="decision-card hold">
                  <h6>HOLD (Within Range)</h6>
                  <p>Fair valuation, limited upside, monitor developments</p>
                </div>
                <div className="decision-card sell">
                  <h6>SELL (Current Price &gt; High End)</h6>
                  <p>Overvalued, limited upside, consider taking profits</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="valuation-tips">
            <h4>Valuation Best Practices</h4>
            <ul>
              <li><strong>Use Multiple Methods:</strong> No single method is perfect</li>
              <li><strong>Stress Test Assumptions:</strong> See how sensitive valuations are to key inputs</li>
              <li><strong>Consider Quality:</strong> High-quality companies deserve premium valuations</li>
              <li><strong>Update Regularly:</strong> Valuations change as new information emerges</li>
              <li><strong>Margin of Safety:</strong> Buy below fair value to account for uncertainty</li>
            </ul>
          </div>
        </div>
      )
    }
  };

  // Generate sample data
  const generateSampleData = () => {
    const periods = 100;
    const data = [];
    let price = 150 + Math.random() * 100;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periods);
    
    for (let i = 0; i < periods; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
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
  };

  // Initialize with sample data
  useEffect(() => {
    const data = generateSampleData();
    setStockData(data);
  }, []);

  const handleSectionClick = (section) => {
    setActiveSection(section);
    trackEvent('section_click', {
      section_name: section
    });
  };

  return (
    <div className="tutorial-container">
      <div className="page-header compact">
        <h1>Master Investment Analysis</h1>
        <p>Complete guide to technical and fundamental analysis with live examples and practical strategies</p>
      </div>

      <div className="tutorial-navigation">
        {Object.keys(sections).map((sectionKey) => (
          <button
            key={sectionKey}
            className={`nav-button ${activeSection === sectionKey ? 'active' : ''}`}
            onClick={() => handleSectionClick(sectionKey)}
          >
            {sections[sectionKey].title}
          </button>
        ))}
      </div>

      <div className="tutorial-content-container">
        <div className="content-section">
          <h2>{sections[activeSection].title}</h2>
          {sections[activeSection].content}
        </div>

        {stockData && activeSection !== 'introduction' && (
          <div className="live-demo">
            <h3>Live Demo</h3>
            <Plot
              data={[
                {
                  x: stockData.map(d => d.date),
                  open: stockData.map(d => d.open),
                  high: stockData.map(d => d.high),
                  low: stockData.map(d => d.low),
                  close: stockData.map(d => d.close),
                  type: 'candlestick',
                  name: 'Sample Stock',
                  increasing: { line: { color: '#00CC00' } },
                  decreasing: { line: { color: '#CC0000' } }
                }
              ]}
              layout={{
                title: 'Sample Stock Data - Apply What You Learn!',
                xaxis: { title: 'Date' },
                yaxis: { title: 'Price ($)' },
                height: 400
              }}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      <div className="tutorial-footer">
        <div className="next-steps">
          <h3>Next Steps</h3>
          <div className="steps-grid">
            <div className="step-card">
              <h4>Practice</h4>
              <p>Apply these concepts to real market data</p>
            </div>
            <div className="step-card">
              <h4>Combine Indicators</h4>
              <p>Use multiple indicators for confirmation</p>
            </div>
            <div className="step-card">
              <h4>Risk Management</h4>
              <p>Always use proper position sizing and stops</p>
            </div>
            <div className="step-card">
              <h4>Keep Learning</h4>
              <p>Markets evolve, so should your knowledge</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysisTutorial;