import React, { useState } from 'react';
import { ArrowLeft, Bookmark, Home, Search, Briefcase, GitCompare, Sparkles, Lightbulb, Database, Menu, X } from 'lucide-react';
import logo from '../assets/impactey-logo.png';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Updated tab order for desktop view
  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, description: 'Explore companies' },
    { id: 'portfolio', label: 'Portfolio Tracker', icon: Briefcase, description: 'Track your portfolio ESG performance' },
    { id: 'ai', label: 'Impactey AI', icon: Sparkles, description: 'AI-powered ESG insights' },
    { id: 'explore-compare', label: 'Explore & Compare', icon: Database, description: 'Discover ESG leaders and compare sustainability performance' },
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
      className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4 flex-shrink-0">
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
              <motion.img 
                src={logo} 
                alt="Impactey Logo" 
                className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
              <h1 className="text-xl font-bold text-slate-800 font-sans">Impactey</h1>
            </div>
          </div>
          
          {/* Desktop Navigation - All 6 tabs inline */}
          <nav className="hidden lg:flex items-center justify-center flex-1 px-8" role="navigation" aria-label="Main navigation">
            <div className="flex items-center space-x-1 bg-gray-50 rounded-xl p-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'text-emerald-700 bg-white shadow-md border border-emerald-100 font-semibold'
                        : 'text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm'
                    }`}
                    aria-label={item.description}
                    title={item.description}
                    whileHover={!isActive ? { 
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 400, damping: 25 }
                    } : undefined}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      animate={isActive ? { 
                        rotate: [0, 10, -10, 0],
                        transition: { duration: 0.5, ease: "easeInOut" }
                      } : {}}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    <span className="font-sans">{item.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-1/2 w-8 h-0.5 bg-emerald-500 rounded-full"
                        initial={{ scale: 0, x: "-50%" }}
                        animate={{ scale: 1, x: "-50%" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* Desktop Right Section - Empty for balance */}
          <div className="hidden lg:flex items-center flex-shrink-0 w-32 justify-end">
            {/* Future: User profile, settings, etc. */}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden border-t border-gray-200 bg-white"
            >
              <nav className="py-4" role="navigation" aria-label="Mobile navigation">
                <div className="space-y-1">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`relative w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg font-medium transition-all duration-200 ${
                          isActive
                            ? 'text-emerald-700 bg-emerald-50 border-l-4 border-emerald-600 font-semibold'
                            : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        aria-label={item.description}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          animate={isActive ? { 
                            scale: [1, 1.2, 1],
                            transition: { duration: 0.4, ease: "easeInOut" }
                          } : {}}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                        </motion.div>
                        <div className="flex-1">
                          <span className="block font-sans text-base">{item.label}</span>
                          <span className="block text-xs text-slate-500 font-sans">{item.description}</span>
                        </div>
                        {isActive && (
                          <motion.div
                            className="w-2 h-2 bg-emerald-500 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;