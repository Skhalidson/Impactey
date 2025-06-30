import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CompanyPage from './components/CompanyPage';
import WatchlistPage from './components/WatchlistPage';
import PortfolioPage from './components/PortfolioPage';
import ComparePage from './components/ComparePage';
import AIPage from './components/AIPage';
import AlertsPage from './components/AlertsPage';
import ESGExplorer from './components/ESGExplorer';
import DataStatusPage from './components/DataStatusPage';
import InstrumentDetailPage from './components/InstrumentDetailPage';
import ErrorBoundary from './components/ErrorBoundary';
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
    setCurrentPage(page);
    if (companyId) {
      setCurrentCompanyId(companyId);
    }
    if (ticker) {
      setCurrentTicker(ticker);
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
        if (currentCompanyId) {
          const company = findCompanyById(currentCompanyId);
          if (company) {
            return (
              <CompanyPage
                company={company}
                isBookmarked={bookmarkedCompanies.includes(company.id)}
                onBookmark={handleBookmark}
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
      
      case 'ai':
        return <AIPage onNavigate={handleNavigate} />;
      
      case 'alerts':
        return <AlertsPage onNavigate={handleNavigate} />;
      
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
          return (
            <ErrorBoundary>
              <InstrumentDetailPage
                ticker={currentTicker}
                onBack={() => setCurrentPage('home')}
              />
            </ErrorBoundary>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      {renderCurrentPage()}
    </div>
  );
}

export default App;