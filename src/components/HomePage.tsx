import React, { useState } from 'react';
import { Search, TrendingUp, Shield, Leaf, Users, ChevronDown, ChevronUp, ChevronRight, Target, BarChart3, AlertTriangle } from 'lucide-react';
import { searchCompanies, companies } from '../data/companies';
import { Company } from '../types/index';
import { useTickerStats, useTickerSearch } from '../hooks/useTickerService';
import { TickerData, tickerService } from '../services/tickerService';
import DataStatusBanner from './DataStatusBanner';
import { motion } from 'framer-motion';

interface HomePageProps {
  onNavigate: (page: string, companyId?: string, ticker?: TickerData) => void;
  onInstrumentSelect?: (ticker: TickerData) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onInstrumentSelect }) => {
  // State for the all companies display toggle
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  
  // State for enhanced Market Instruments search
  const [liveSearchQuery, setLiveSearchQuery] = useState('');
  const [showLiveSearch, setShowLiveSearch] = useState(false);
  
  // Live ticker data and search functionality
  const { 
    totalStocks, 
    totalETFs, 
    mainstreamStocks, 
    mainstreamETFs, 
    mainstreamInstruments,
    exchanges,
    isLoading, 
    error 
  } = useTickerStats();
  const { search: searchLiveTickers, results: liveResults, isSearching, searchError } = useTickerSearch();

  // Enhanced search handler with debouncing logic
  const handleLiveSearch = (query: string) => {
    setLiveSearchQuery(query);
    if (query.trim().length > 0) {
      searchLiveTickers(query, 50);
      setShowLiveSearch(true);
    } else {
      setShowLiveSearch(false);
    }
  };

  // Handle selection of a ticker from search results
  const handleLiveTickerSelect = (ticker: TickerData) => {
    // Always navigate to the unified company page
    onNavigate('company', undefined, ticker);
  };

  // Handle direct navigation to popular instruments
  const handleDirectTickerNavigation = (symbol: string) => {
    try {
      // First try to get the exact ticker from the service
      const exactTicker = tickerService.getTickerBySymbol(symbol);
      
      if (exactTicker && tickerService.searchTickers(symbol, 1).length > 0) {
        // Found exact match and it's a mainstream security, navigate directly
        handleLiveTickerSelect(exactTicker);
      } else {
        // Fallback: search for the ticker and show results
        searchLiveTickers(symbol, 10);
        setLiveSearchQuery(symbol);
        setShowLiveSearch(true);
        
        // Auto-select first result if found after a brief delay
        setTimeout(() => {
          if (liveResults.length > 0) {
            const bestMatch = liveResults.find(ticker => 
              ticker.symbol.toUpperCase() === symbol.toUpperCase()
            ) || liveResults[0];
            handleLiveTickerSelect(bestMatch);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error navigating to ticker:', error);
      // Final fallback to search behavior
      handleLiveSearch(symbol);
    }
  };

  // Alphabetically sorted companies for display
  const sortedCompanies = [...companies].sort((a, b) => a.name.localeCompare(b.name));
  const featuredCompanies = sortedCompanies.slice(0, 6);
  const allCompanies = sortedCompanies;

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10
      }
    }
  };

  const searchVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 15,
        delay: 0.4
      }
    }
  };

  const tagVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 12
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(16, 185, 129, 0.2)",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20
      }
    }
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -8,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        
        {/* Data Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <DataStatusBanner />
        </motion.div>
        
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Updated Hero Headlines */}
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight"
            variants={itemVariants}
          >
            Your Personal 
            <span className="text-emerald-600"> ESG Investment Companion</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Track, compare, and optimise your ESG investments — with real-time insights, portfolio impact tracking, 
            company controversies, and AI-powered clarity. Built for confident, sustainable investing.
          </motion.p>

          {/* Updated Persona-based taglines */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mb-12"
            variants={itemVariants}
          >
            <motion.div 
              className="bg-white px-4 py-2 rounded-full shadow-md border border-emerald-100"
              whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(16, 185, 129, 0.15)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-sm font-medium text-emerald-700">Retail Investors:</span>
              <span className="text-sm text-slate-600 ml-2">"Invest sustainably with confidence and clarity."</span>
            </motion.div>
            <motion.div 
              className="bg-white px-4 py-2 rounded-full shadow-md border border-blue-100"
              whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-sm font-medium text-blue-700">Advisors:</span>
              <span className="text-sm text-slate-600 ml-2">"Give every client a portfolio that aligns with their values."</span>
            </motion.div>
          </motion.div>

          {/* Enhanced Market Instruments Search Section */}
          <motion.div 
            className="mb-16"
            variants={searchVariants}
          >
            <motion.div 
              className="text-center mb-6"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Search All Market Instruments
              </h2>
              {isLoading ? (
                <p className="text-slate-600">
                  <span className="animate-pulse">Loading market data...</span>
                </p>
              ) : error && totalStocks === 0 && totalETFs === 0 ? (
                <p className="text-red-600">
                  Unable to load instruments—please try again later
                </p>
              ) : (
                <p className="text-slate-600">
                  Search through {mainstreamInstruments.toLocaleString()} verified stocks and ETFs from global exchanges
                  {error && (
                    <span className="text-amber-600 text-sm block mt-1">
                      ⚠️ Some data may be incomplete
                    </span>
                  )}
                </p>
              )}
            </motion.div>

            <div className="relative max-w-3xl mx-auto">
              <motion.div 
                className="relative"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15)" 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search any stock or ETF (e.g., AAPL, Tesla, QQQ, VANGUARD, MICROSOFT...)"
                  value={liveSearchQuery}
                  onChange={(e) => handleLiveSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all duration-200 hover:shadow-lg"
                  disabled={isLoading || (!!error && totalStocks === 0 && totalETFs === 0)}
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                  </div>
                )}
              </motion.div>

              {/* Enhanced Search Results Dropdown */}
              {showLiveSearch && (
                <motion.div 
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                    <div className="text-sm text-slate-600">
                      {searchError ? (
                        <span className="text-red-600">{searchError}</span>
                      ) : liveResults.length > 0 ? (
                        `Found ${liveResults.length} results ${liveResults.length === 50 ? '(showing top 50)' : ''}`
                      ) : isSearching ? (
                        'Searching...'
                      ) : (
                        'No matches found'
                      )}
                    </div>
                  </div>
                  
                  {searchError ? (
                    <div className="p-6 text-center">
                      <div className="text-red-500 mb-2">⚠️</div>
                      <div className="text-sm text-red-600 mb-3">{searchError}</div>
                      <button
                        onClick={() => handleLiveSearch(liveSearchQuery)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Try again
                      </button>
                    </div>
                  ) : liveResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {liveResults.map((ticker, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleLiveTickerSelect(ticker)}
                          className="w-full px-4 py-3 text-left hover:bg-emerald-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-1">
                              <span className="font-semibold text-slate-900">{ticker.symbol}</span>
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                ticker.type === 'stock' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {ticker.type.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 truncate">{ticker.name}</p>
                            <p className="text-xs text-slate-500">
                              {ticker.exchangeShortName} • ${ticker.price?.toFixed(2) || 'N/A'}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    !isSearching && liveSearchQuery && (
                      <div className="p-4 text-center text-slate-500">
                        <div className="mb-2">No mainstream securities found for "{liveSearchQuery}"</div>
                        <div className="text-xs">Showing only major exchange listings (NYSE, NASDAQ, etc.) with price ≥ $1.00</div>
                      </div>
                    )
                  )}
                </motion.div>
              )}

              {/* Quick Search Examples - Enhanced with animations */}
              {!showLiveSearch && !liveSearchQuery && (
                <motion.div 
                  className="mt-4 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <p className="text-sm text-slate-500 mb-3">Popular instruments:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'SPY', 'QQQ', 'VTI'].map((example, index) => (
                      <motion.button
                        key={example}
                        onClick={() => handleDirectTickerNavigation(example)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-emerald-100 hover:text-emerald-700 transition-colors shadow-sm"
                        variants={tagVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        transition={{ delay: 0.7 + index * 0.05 }}
                      >
                        {example}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Feature Cards */}
          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
          >
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Target className="w-6 h-6 text-emerald-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Portfolio Tracker</h3>
              <p className="text-slate-600">Track ESG performance across your entire portfolio with real-time monitoring and alerts</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto"
                whileHover={{ rotate: -5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Side-by-Side Comparison</h3>
              <p className="text-slate-600">Compare ESG metrics across companies, funds, and ETFs to make informed decisions</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <AlertTriangle className="w-6 h-6 text-purple-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Real-time ESG Insights</h3>
              <p className="text-slate-600">Get notified of ESG controversies and score changes with AI-powered analysis</p>
            </motion.div>
          </motion.div>

          {/* Why Impactey Section */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-8 mb-16 text-left"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              className="text-3xl font-bold text-slate-800 mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.4, duration: 0.4 }}
            >
              Why Impactey?
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.6, duration: 0.5 }}
              >
                <h3 className="text-xl font-semibold text-slate-800 mb-4">For Retail Investors</h3>
                <ul className="space-y-3 text-slate-600">
                  <motion.li 
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.7, duration: 0.3 }}
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Build ESG-aligned portfolios with confidence using data-driven insights</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.8, duration: 0.3 }}
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Avoid greenwashing with transparent, verified ESG scores and metrics</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.9, duration: 0.3 }}
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor portfolio sustainability impact with real-time tracking</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 2.0, duration: 0.3 }}
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Make informed decisions with AI-powered investment recommendations</span>
                  </motion.li>
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.6, duration: 0.5 }}
              >
                <h3 className="text-xl font-semibold text-slate-800 mb-4">For Advisors & Wealth Managers</h3>
                <ul className="space-y-3 text-slate-600">
                  <motion.li 
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.7, duration: 0.3 }}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Help clients align investments with their sustainability goals</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.8, duration: 0.3 }}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Generate comprehensive ESG reports for client presentations</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.9, duration: 0.3 }}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Access deep market exploration tools for ESG fund selection</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 2.0, duration: 0.3 }}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Provide trustworthy ESG analysis to enhance client relationships</span>
                  </motion.li>
                </ul>
              </motion.div>
            </div>
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 2.1, duration: 0.4 }}
            >
              <p className="text-lg text-slate-700 font-medium">
                Empowering real-world investment decisions with transparent ESG clarity
              </p>
            </motion.div>
          </motion.div>

          {/* Market Coverage Stats */}
          {!isLoading && !error && mainstreamInstruments > 10000 && (
            <motion.div 
              className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 mb-16"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              <motion.h2 
                className="text-2xl font-bold text-slate-800 mb-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                Global Market Coverage
              </motion.h2>
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <div className="text-3xl font-bold text-blue-600 mb-2">{mainstreamStocks.toLocaleString()}</div>
                  <div className="text-slate-600">Verified Stocks</div>
                  <div className="text-sm text-slate-500 mt-1">Major exchanges • Price ≥ $1.00</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <div className="text-3xl font-bold text-green-600 mb-2">{mainstreamETFs.toLocaleString()}</div>
                  <div className="text-slate-600">Mainstream ETFs</div>
                  <div className="text-sm text-slate-500 mt-1">No leveraged or exotic products</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <div className="text-3xl font-bold text-purple-600 mb-2">{exchanges.mainstreamStocks + exchanges.mainstreamETFs}+</div>
                  <div className="text-slate-600">Major Exchanges</div>
                  <div className="text-sm text-slate-500 mt-1">NYSE, NASDAQ, LSE, XETRA, more</div>
                </motion.div>
              </div>
              <motion.div 
                className="text-center mt-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.0, duration: 0.4 }}
              >
                <p className="text-slate-600">
                  🛡️ Only investable securities from recognized exchanges • No OTC, Pink Sheets, or synthetic products
                </p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;