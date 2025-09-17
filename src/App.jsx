import React, { useEffect } from 'react'
import TechnicalAnalysisApp from './TechnicalAnalysisApp.jsx'
import { initGA } from './analytics.js'
import { initAdSense, AutoAds } from './adsense.js'

export default function App() {
  useEffect(() => {
    // Initialize Google Analytics
    initGA();
    
    // Initialize Google AdSense
    initAdSense();
  }, []);

  return (
    <>
      <AutoAds />
      <TechnicalAnalysisApp />
    </>
  )
}