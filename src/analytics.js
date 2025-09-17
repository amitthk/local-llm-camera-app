// Google Analytics 4 (GA4) Integration
export const GA_TRACKING_ID = 'G-CQHPGNMRE1'; // Replace with your GA4 Measurement ID

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined') {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (page_path, page_title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path,
      page_title,
    });
  }
};

// Track custom events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track user interactions
export const trackStockSymbolSearch = (symbol) => {
  trackEvent('search', 'stock_symbol', symbol);
};

export const trackAnalysisView = (analysisType) => {
  trackEvent('view', 'analysis', analysisType);
};

export const trackButtonClick = (buttonName) => {
  trackEvent('click', 'button', buttonName);
};

export const trackTechnicalIndicator = (indicator) => {
  trackEvent('view', 'technical_indicator', indicator);
};

export const trackFundamentalMetric = (metric) => {
  trackEvent('view', 'fundamental_metric', metric);
};
