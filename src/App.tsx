import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CompanyPage from './components/CompanyPage';
import WatchlistPage from './components/WatchlistPage';
import { findCompanyById } from './data/companies';
import { Company } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState<string[]>([]);

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('impactly-bookmarks');
    if (savedBookmarks) {
      setBookmarkedCompanies(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem('impactly-bookmarks', JSON.stringify(bookmarkedCompanies));
  }, [bookmarkedCompanies]);

  const handleNavigate = (page: string, companyId?: string) => {
    setCurrentPage(page);
    if (companyId) {
      setCurrentCompanyId(companyId);
    }
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
      
      case 'watchlist':
        return (
          <WatchlistPage
            savedCompanies={getSavedCompanies()}
            onNavigate={handleNavigate}
            onRemoveBookmark={handleRemoveBookmark}
          />
        );
      
      case 'home':
      default:
        return <HomePage onNavigate={handleNavigate} />;
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