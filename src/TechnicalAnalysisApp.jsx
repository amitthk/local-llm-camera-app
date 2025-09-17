import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import TechnicalAnalysis from './TechnicalAnalysis';
import TechnicalAnalysisTutorial from './TechnicalAnalysisTutorial';
import FundamentalAnalysis from './FundamentalAnalysis';
import { trackPageView, trackButtonClick } from './analytics.js';
import { ResponsiveBannerAd, SquareAd } from './adsense.js';
import './TechnicalAnalysisApp.css';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', isHome: true },
    { path: '/technical', label: 'Technical Analysis' },
    { path: '/fundamental', label: 'Fundamental Analysis' }
  ];

  // Track page views when location changes
  useEffect(() => {
    const currentPage = navItems.find(item => item.path === location.pathname);
    if (currentPage) {
      trackPageView(location.pathname, currentPage.label);
    }
  }, [location]);

  const handleNavClick = (label) => {
    trackButtonClick(`navigation_${label.toLowerCase().replace(' ', '_')}`);
  };

  const handleLogoClick = () => {
    trackButtonClick('logo_home_click');
  };

  return (
    <nav className="main-navigation">
      <Link to="/" className="nav-logo" onClick={handleLogoClick}>
        <img src="/src/images/stridecal_logo_48.png" alt="Stridecal Logo" className="logo-icon" />
        <span className="logo-text">Stridecal Investment Analysis</span>
      </Link>
      <div className="nav-links">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''} ${item.isHome ? 'home-link' : ''}`}
            onClick={() => handleNavClick(item.label)}
          >
            {item.isHome && <span className="home-icon"></span>}
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

const TechnicalAnalysisApp = () => {
  return (
    <Router>
      <div className="technical-analysis-app">
        <Navigation />

        <div className="app-layout">
          <main className="app-content">
            <Routes>
              <Route path="/" element={<TechnicalAnalysisTutorial />} />
              <Route path="/technical" element={<TechnicalAnalysis />} />
              <Route path="/fundamental" element={<FundamentalAnalysis />} />
            </Routes>
          </main>

          {/* Right Sidebar with Ads */}
          <aside className="app-sidebar">
            <div className="sidebar-ad-container">
              <SquareAd adSlot="1234567890" />
            </div>
            <div className="sidebar-ad-container">
              <SquareAd adSlot="0987654321" />
            </div>
          </aside>
        </div>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Technical Analysis</h3>
              <ul>
                <li>Interactive charts with real-time indicators</li>
                <li>MACD, RSI, Bollinger Bands, and more</li>
                <li>Trend analysis and momentum indicators</li>
                <li>Support and resistance identification</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Fundamental Analysis</h3>
              <ul>
                <li>Company financial health metrics</li>
                <li>Earnings per share and P/E ratios</li>
                <li>Debt analysis and liquidity ratios</li>
                <li>Profitability and efficiency metrics</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Learning Resources</h3>
              <ul>
                <li>Comprehensive tutorial sections</li>
                <li>Real-world examples and explanations</li>
                <li>Trading strategies and best practices</li>
                <li>Risk management guidelines</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Important Disclaimer</h3>
              <p>
                This platform is for educational purposes only. 
                Not financial advice. Always conduct your own research 
                and consider consulting with a financial advisor before 
                making investment decisions.
              </p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 Technical Analysis Learning Platform. Built with React, Plotly.js & React Router</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default TechnicalAnalysisApp;
