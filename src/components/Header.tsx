import React from 'react';
import { ArrowLeft, Bookmark, Home, Search } from 'lucide-react';
import logo from '../assets/impactey-logo.png';
import { motion } from 'framer-motion';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {currentPage !== 'home' && (
              <button
                onClick={() => onNavigate('home')}
                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <img src={logo} alt="Impactey Logo" className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200" />
              <h1 className="text-xl font-bold text-slate-800">Impactey</h1>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('home')}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('watchlist')}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 'watchlist'
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;