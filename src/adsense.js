import React from 'react';

// Google AdSense Integration
export const ADSENSE_CLIENT_ID = 'ca-pub-6910845899935311'; // Replace with your AdSense Publisher ID

// Initialize Google AdSense
export const initAdSense = () => {
  if (typeof window !== 'undefined') {
    // Load AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
};

// AdSense Auto Ads component
export const AutoAds = () => {
  if (typeof window !== 'undefined') {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: ADSENSE_CLIENT_ID,
        enable_page_level_ads: true
      });
    } catch (err) {
      console.error('AdSense Auto Ads error:', err);
    }
  }
  return null;
};

// Display Ad Component
export const DisplayAd = ({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style = { display: 'block' }
}) => {
  if (typeof window === 'undefined') return null;

  return React.createElement('ins', {
    className: 'adsbygoogle',
    style: style,
    'data-ad-client': ADSENSE_CLIENT_ID,
    'data-ad-slot': adSlot,
    'data-ad-format': adFormat,
    'data-full-width-responsive': fullWidthResponsive.toString()
  });
};

// Initialize ads after component mount
export const pushAd = () => {
  try {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  } catch (err) {
    console.error('AdSense push error:', err);
  }
};

// Responsive Banner Ad (320x50 mobile, 728x90 desktop)
export const ResponsiveBannerAd = ({ adSlot }) => React.createElement(DisplayAd, {
  adSlot: adSlot,
  adFormat: 'auto',
  style: { display: 'block', textAlign: 'center' }
});

// Square Ad (300x250)
export const SquareAd = ({ adSlot }) => React.createElement(DisplayAd, {
  adSlot: adSlot,
  adFormat: 'rectangle',
  style: { display: 'inline-block', width: '300px', height: '250px' }
});

// Sidebar Ad (160x600 skyscraper)
export const SidebarAd = ({ adSlot }) => React.createElement(DisplayAd, {
  adSlot: adSlot,
  adFormat: 'vertical',
  style: { display: 'inline-block', width: '160px', height: '600px' }
});

// Large Rectangle Ad (336x280)
export const LargeRectangleAd = ({ adSlot }) => React.createElement(DisplayAd, {
  adSlot: adSlot,
  adFormat: 'rectangle',
  style: { display: 'inline-block', width: '336px', height: '280px' }
});
