import React, { useState } from 'react';
import { ArrowLeft, Bookmark, Home, Search, Briefcase, GitCompare, Sparkles, Lightbulb, Database, Menu, X } from 'lucide-react';
import logo from '../assets/impactey-logo.png';
import { motion } from 'framer-motion';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, description: 'Explore companies' },
    { id: 'portfolio', label: 'Portfolio Tracker', icon: Briefcase, description: 'Track your portfolio ESG performance' },
    { id: 'explore-compare', label: 'Explore & Compare', icon: Database, description: 'Discover ESG leaders and compare sustainability performance' },
    { id: 'ai', label: 'Impactey AI', icon: Sparkles, description: 'AI-powered ESG insights' },
    { id: 'insights', label: 'Insights', icon: Lightbulb, description: 'Learn about ESG principles and best practices' },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark, description: 'Your saved companies' },
  ];

  const handleNavigation = (pageId: string) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            {currentPage !== 'home' && (
              <button
                onClick={() => onNavigate('home')}
                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors lg:hidden"
                aria-label="Go back to home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onNavigate('home')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate('home');
                }
              }}
              aria-label="Go to Impactey home"
            >
              <img 
                src={logo} 
                alt="Impactey Logo" 
                className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200" 
              />
              <h1 className="text-xl font-bold text-slate-800 font-sans">Impactey</h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'text-emerald-600 bg-emerald-50 shadow-sm'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:shadow-sm'
                  }`}
                  aria-label={item.description}
                  title={item.description}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-sans">{item.label}</span>

                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-gray-200 bg-white"
          >
            <nav className="py-4" role="navigation" aria-label="Mobile navigation">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`relative w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-emerald-600 bg-emerald-50 border-l-4 border-emerald-600'
                          : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      aria-label={item.description}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="block font-sans text-base">{item.label}</span>
                        <span className="block text-xs text-slate-500 font-sans">{item.description}</span>
                      </div>

                    </button>
                  );
                })}
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;