import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CompanyPage from './components/CompanyPage';
import WatchlistPage from './components/WatchlistPage';
import PortfolioPage from './components/PortfolioPage';
import ComparePage from './components/ComparePage';
import AIPage from './components/AIPage';
import InsightsPage from './components/InsightsPage';
import ESGExplorer from './components/ESGExplorer';
import ExploreComparePage from './components/ExploreComparePage';
import DataStatusPage from './components/DataStatusPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import { findCompanyById } from './data/companies';
import { Company } from './types/index';
import { TickerData, tickerService } from './services/tickerService';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [currentTicker, setCurrentTicker] = useState<TickerData | null>(null);
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState<string[]>([]);

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('impactey-bookmarks');
    if (savedBookmarks) {
      setBookmarkedCompanies(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem('impactey-bookmarks', JSON.stringify(bookmarkedCompanies));
  }, [bookmarkedCompanies]);

  const handleNavigate = (page: string, companyId?: string, ticker?: TickerData) => {
    // Clear previous state when navigating
    setCurrentTicker(null);
    setCurrentCompanyId(null);
    
    setCurrentPage(page);
    
    if (ticker) {
      setCurrentTicker(ticker);
    } else if (companyId) {
      setCurrentCompanyId(companyId);
    }
  };

  const handleInstrumentNavigate = (ticker: TickerData) => {
    setCurrentTicker(ticker);
    setCurrentPage('instrument');
  };

  const handleBookmark = (companyId: string) => {
    setBookmarkedCompanies(prev => {
      if (prev.includes(companyId)) {
        return prev.filter(id => id !== companyId);
      } else {
        return [...prev, companyId];
      }
    });
  };

  const handleRemoveBookmark = (companyId: string) => {
    setBookmarkedCompanies(prev => prev.filter(id => id !== companyId));
  };

  const getSavedCompanies = (): Company[] => {
    return bookmarkedCompanies
      .map(id => findCompanyById(id))
      .filter((company): company is Company => company !== undefined);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'company':
        if (currentTicker) {
          return (
            <CompanyPage
              ticker={currentTicker.symbol}
              onNavigate={handleNavigate}
              returnPath="home"
            />
          );
        }
        if (currentCompanyId) {
          const company = findCompanyById(currentCompanyId);
          if (company) {
            return (
              <CompanyPage
                ticker={company.ticker}
                onNavigate={handleNavigate}
                returnPath="explore-compare"
              />
            );
          }
        }
        // If no company found, redirect to home
        setCurrentPage('home');
        return <HomePage onNavigate={handleNavigate} />;
      
      case 'portfolio':
        return <PortfolioPage onNavigate={handleNavigate} />;
      
      case 'compare':
        return <ComparePage onNavigate={handleNavigate} />;
      
      case 'explore-compare':
        return <ExploreComparePage onNavigate={handleNavigate} />;
      
      case 'ai':
        return <AIPage onNavigate={handleNavigate} />;
      
      case 'insights':
        return <InsightsPage onNavigate={handleNavigate} />;
      
      case 'explorer':
        return <ESGExplorer />;
      
      case 'watchlist':
        return (
          <WatchlistPage
            savedCompanies={getSavedCompanies()}
            onNavigate={handleNavigate}
            onRemoveBookmark={handleRemoveBookmark}
          />
        );
      
      case 'data-status':
        return <DataStatusPage />;
      
      case 'instrument':
        if (currentTicker) {
          // Redirect instrument page to company page for unified experience
          return (
            <CompanyPage
              ticker={currentTicker.symbol}
              onNavigate={handleNavigate}
              returnPath="home"
            />
          );
        }
        // If no ticker, redirect to home
        setCurrentPage('home');
        return <HomePage onNavigate={handleNavigate} onInstrumentSelect={handleInstrumentNavigate} />;
      
      case 'home':
      default:
        return <HomePage onNavigate={handleNavigate} onInstrumentSelect={handleInstrumentNavigate} />;
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "easeInOut",
    duration: 0.3
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage + (currentTicker?.symbol || currentCompanyId || '')}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {renderCurrentPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;