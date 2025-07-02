import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, BarChart3, TrendingUp, TrendingDown, Minus, X, Plus, GitCompare, Database, Target, AlertTriangle, Loader, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTickerStats, useTickerSearch } from '../hooks/useTickerService';
import { getUnifiedESGData, UnifiedESGData, generateDemoESGData } from '../services/esgDataService';
import { tickerService, TickerData } from '../services/tickerService';
import DataStatusBanner, { DataSourceIndicator } from './DataStatusBanner';
import CacheStatusModal from './CacheStatusModal';
import ESGNewsFeed from './ESGNewsFeed';

interface ExploreComparePageProps {
  onNavigate: (page: string, companyId?: string, ticker?: TickerData) => void;
}

// Enhanced company data for display
interface EnhancedCompanyData extends UnifiedESGData {
  controversiesCount: number;
  isSelected: boolean;
  price?: number;
  marketCap?: number;
  exchange?: string;
}

// Filter state interface
interface FilterState {
  sector: string;
  region: string;
  esgScoreMin: number;
  esgScoreMax: number;
  esgDimension: 'total' | 'environmental' | 'social' | 'governance';
  searchTerm: string;
}

const ExploreComparePage: React.FC<ExploreComparePageProps> = ({ onNavigate }) => {
  // State management
  const [filters, setFilters] = useState<FilterState>({
    sector: '',
    region: '',
    esgScoreMin: 0,
    esgScoreMax: 10,
    esgDimension: 'total',
    searchTerm: ''
  });

  const [companies, setCompanies] = useState<EnhancedCompanyData[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<EnhancedCompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [searchResults, setSearchResults] = useState<EnhancedCompanyData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCacheStatus, setShowCacheStatus] = useState(false);

  const ITEMS_PER_PAGE = 20;

  // Ticker service hooks
  const { 
    mainstreamStocks, 
    mainstreamETFs, 
    mainstreamInstruments,
    isLoading: tickerLoading, 
    error: tickerError 
  } = useTickerStats();

  // Load companies from ticker service with ESG data
  useEffect(() => {
    const loadCompaniesWithESG = async () => {
      if (tickerLoading) return;

      // Start with immediate sample data for popular companies
      const popularTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ', 
                              'WMT', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'ADBE', 'NFLX', 'CRM', 'PFE'];
      
      const immediateCompanies: EnhancedCompanyData[] = popularTickers.map(symbol => {
        const ticker = tickerService.getTickerBySymbol(symbol);
        if (!ticker) return null;
        
        const esgData = generateDemoESGData(symbol, ticker);
        return {
          ...esgData,
          controversiesCount: Math.floor(Math.random() * 3),
          isSelected: false,
          price: ticker.price,
          marketCap: ticker.marketCap,
          exchange: ticker.exchangeShortName
        };
      }).filter(Boolean) as EnhancedCompanyData[];

      // Set immediate data
      setCompanies(immediateCompanies);
      console.log('Loaded', immediateCompanies.length, 'popular companies immediately');

      // Then load more data in the background
      if (mainstreamInstruments > 0) {
        setIsLoading(true);
        setLoadingProgress(0);

        try {
          // Get a diverse sample of mainstream securities
          const allTickers = tickerService.searchTickers('', 200);
          const additionalTickers = allTickers.filter(t => !popularTickers.includes(t.symbol)).slice(0, 30);
          
          console.log('Loading additional', additionalTickers.length, 'companies...');
          
          const additionalCompanies: EnhancedCompanyData[] = additionalTickers.map((ticker, index) => {
            setLoadingProgress(((index + 1) / additionalTickers.length) * 100);
            
            const esgData = generateDemoESGData(ticker.symbol, ticker);
            return {
              ...esgData,
              controversiesCount: Math.floor(Math.random() * 3),
              isSelected: false,
              price: ticker.price,
              marketCap: ticker.marketCap,
              exchange: ticker.exchangeShortName
            };
          });

          // Add to existing companies
          setCompanies(prev => [...prev, ...additionalCompanies]);
          setLoadingProgress(100);
          console.log('Successfully loaded', additionalCompanies.length, 'additional companies');

          // Try to upgrade some companies to live data in the background
          setTimeout(() => {
            enhanceLiveDataInBackground([...immediateCompanies, ...additionalCompanies]);
          }, 2000);

        } catch (error) {
          console.error('Failed to load additional companies:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCompaniesWithESG();
  }, [tickerLoading, mainstreamInstruments]);

  // Background function to upgrade some companies to live data
  const enhanceLiveDataInBackground = async (initialCompanies: EnhancedCompanyData[]) => {
    console.log('Starting background live data enhancement...');
    
    // Try to get live data for a few high-priority companies
    const priorityTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ'];
    
    for (const ticker of priorityTickers) {
      try {
        const liveData = await getUnifiedESGData(ticker);
        if (liveData) {
          setCompanies(prev => prev.map(company => 
            company.symbol === ticker 
              ? { 
                  ...company, 
                  ...liveData,
                  controversiesCount: liveData.prototypeData?.controversies?.length || company.controversiesCount
                }
              : company
          ));
          console.log(`Enhanced ${ticker} with live ESG data`);
        }
      } catch (error) {
        console.warn(`Failed to enhance ${ticker} with live data:`, error);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Handle live search functionality
  const performLiveSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Search for tickers using the ticker service
      const foundTickers = tickerService.searchTickers(searchTerm, 50);
      
      // Convert to enhanced company data with demo ESG scores
      const searchCompanies: EnhancedCompanyData[] = foundTickers.map(ticker => {
        const esgData = generateDemoESGData(ticker.symbol, ticker);
        return {
          ...esgData,
          controversiesCount: Math.floor(Math.random() * 3),
          isSelected: selectedCompanies.some(c => c.symbol === ticker.symbol),
          price: ticker.price,
          marketCap: ticker.marketCap,
          exchange: ticker.exchangeShortName
        };
      });

      setSearchResults(searchCompanies);
      console.log(`Live search for "${searchTerm}" found ${searchCompanies.length} results`);
    } catch (error) {
      console.error('Live search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (filters.searchTerm) {
        performLiveSearch(filters.searchTerm);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimer);
  }, [filters.searchTerm, selectedCompanies]);

  // Determine which companies to display
  const displayCompanies = filters.searchTerm ? searchResults : companies;

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    return displayCompanies.filter(company => {
      const matchesSector = !filters.sector || company.sector === filters.sector;
      
      const score = filters.esgDimension === 'total' ? company.esgScore :
                   filters.esgDimension === 'environmental' ? company.environmentScore :
                   filters.esgDimension === 'social' ? company.socialScore :
                   company.governanceScore;
      
      const matchesScoreRange = score >= filters.esgScoreMin && score <= filters.esgScoreMax;

      return matchesSector && matchesScoreRange;
    }).sort((a, b) => {
      const scoreA = filters.esgDimension === 'total' ? a.esgScore :
                    filters.esgDimension === 'environmental' ? a.environmentScore :
                    filters.esgDimension === 'social' ? a.socialScore :
                    a.governanceScore;
      
      const scoreB = filters.esgDimension === 'total' ? b.esgScore :
                    filters.esgDimension === 'environmental' ? b.environmentScore :
                    filters.esgDimension === 'social' ? b.socialScore :
                    b.governanceScore;

      return scoreB - scoreA; // Sort highest to lowest
    });
  }, [displayCompanies, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get unique sectors for filter dropdown
  const uniqueSectors = useMemo(() => {
    const sectors = [...new Set(companies.map(c => c.sector))].filter(Boolean).sort();
    return sectors;
  }, [companies]);

  // Helper functions
  const getScoreColor = (score: number): string => {
    if (score >= 7.5) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-blue-600 bg-blue-50';
    if (score >= 4.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadgeColor = (score: number): string => {
    if (score >= 7.5) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 6) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 4.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const handleCompanySelect = (company: EnhancedCompanyData) => {
    if (company.isSelected) {
      // Remove from selection
      setSelectedCompanies(prev => prev.filter(c => c.symbol !== company.symbol));
      setCompanies(prev => prev.map(c => 
        c.symbol === company.symbol ? { ...c, isSelected: false } : c
      ));
    } else if (selectedCompanies.length < 5) {
      // Add to selection (max 5)
      const updatedCompany = { ...company, isSelected: true };
      setSelectedCompanies(prev => [...prev, updatedCompany]);
      setCompanies(prev => prev.map(c => 
        c.symbol === company.symbol ? { ...c, isSelected: true } : c
      ));
    }
  };

  const removeFromComparison = (symbol: string) => {
    setSelectedCompanies(prev => prev.filter(c => c.symbol !== symbol));
    setCompanies(prev => prev.map(c => 
      c.symbol === symbol ? { ...c, isSelected: false } : c
    ));
  };

  const getDimensionScore = (company: EnhancedCompanyData, dimension: string): number => {
    switch (dimension) {
      case 'environmental': return company.environmentScore;
      case 'social': return company.socialScore;
      case 'governance': return company.governanceScore;
      default: return company.esgScore;
    }
  };

  const generateComparisonInsight = (): string => {
    if (selectedCompanies.length < 2) return '';

    const sorted = [...selectedCompanies].sort((a, b) => b.esgScore - a.esgScore);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    const envWinner = [...selectedCompanies].sort((a, b) => b.environmentScore - a.environmentScore)[0];
    const socWinner = [...selectedCompanies].sort((a, b) => b.socialScore - a.socialScore)[0];
    const govWinner = [...selectedCompanies].sort((a, b) => b.governanceScore - a.governanceScore)[0];

    return `${best.companyName} leads with the highest overall ESG score (${best.esgScore.toFixed(1)}), while ${worst.companyName} has room for improvement (${worst.esgScore.toFixed(1)}). ${envWinner.companyName} excels in environmental practices, ${socWinner.companyName} in social responsibility, and ${govWinner.companyName} in governance.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Data Status Banner */}
        <DataStatusBanner />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Database className="w-8 h-8 text-emerald-600" />
                <GitCompare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Explore & Compare</h1>
                <p className="text-slate-600">Discover ESG leaders and compare sustainability performance across markets</p>
              </div>
            </div>
            
            {/* Cache Status Button */}
            <button
              onClick={() => setShowCacheStatus(true)}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-gray-200 hover:border-emerald-200"
              title="View cache performance and manage cached ESG data"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Cache Status</span>
            </button>
          </div>

          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span>📊 {filteredCompanies.length.toLocaleString()} companies</span>
            <span>🔍 {mainstreamInstruments.toLocaleString()} instruments available</span>
            {selectedCompanies.length > 0 && (
              <span className="text-emerald-600 font-medium">
                {selectedCompanies.length} selected for comparison
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
            <Loader className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Loading ESG Data</h3>
            <p className="text-slate-600 mb-4">
              Fetching live ESG scores and sustainability metrics...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 mt-2">{Math.round(loadingProgress)}% complete</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters & Search</span>
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
            >
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className={`grid lg:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            {/* Search */}
            <div className="lg:col-span-4 mb-4 lg:mb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search companies or tickers (e.g., AAPL, Tesla, Microsoft...)"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader className="w-5 h-5 animate-spin text-emerald-500" />
                  </div>
                )}
              </div>
              {filters.searchTerm && (
                <div className="mt-2 text-sm text-slate-600">
                  {isSearching ? (
                    <span>Searching...</span>
                  ) : (
                    <span>Found {searchResults.length} results for "{filters.searchTerm}"</span>
                  )}
                </div>
              )}
            </div>

            {/* Sector Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sector</label>
              <select
                value={filters.sector}
                onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Sectors</option>
                {uniqueSectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            {/* ESG Dimension */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ESG Focus</label>
              <select
                value={filters.esgDimension}
                onChange={(e) => setFilters(prev => ({ ...prev, esgDimension: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="total">Total ESG Score</option>
                <option value="environmental">Environmental (E)</option>
                <option value="social">Social (S)</option>
                <option value="governance">Governance (G)</option>
              </select>
            </div>

            {/* Score Range */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Score Range: {filters.esgScoreMin.toFixed(1)} - {filters.esgScoreMax.toFixed(1)}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.esgScoreMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, esgScoreMin: parseFloat(e.target.value) }))}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.esgScoreMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, esgScoreMax: parseFloat(e.target.value) }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count and Pagination Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-slate-600">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCompanies.length)} of {filteredCompanies.length} companies
          </div>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ESG Score
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E / S / G
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Controversies
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Source
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compare
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCompanies.map((company) => (
                  <tr key={company.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{company.prototypeData?.logo || '📊'}</span>
                        <div>
                          <button
                            onClick={() => {
                              // Navigate to company page with ticker
                              const tickerData = tickerService.getTickerBySymbol(company.symbol);
                              if (tickerData) {
                                onNavigate('company', undefined, tickerData);
                              }
                            }}
                            className="font-medium text-slate-800 hover:text-emerald-600 transition-colors text-left"
                          >
                            {company.companyName}
                          </button>
                          <div className="text-sm text-slate-500">
                            {company.symbol} • {company.exchange}
                            {company.price && (
                              <span className="ml-2">${company.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {company.sector}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <span className={`text-xl font-bold ${getScoreColor(getDimensionScore(company, filters.esgDimension)).split(' ')[0]}`}>
                          {getDimensionScore(company, filters.esgDimension).toFixed(1)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getScoreBadgeColor(getDimensionScore(company, filters.esgDimension))}`}>
                          {filters.esgDimension === 'total' ? 'Total' : 
                           filters.esgDimension === 'environmental' ? 'E' :
                           filters.esgDimension === 'social' ? 'S' : 'G'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <div className="text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getScoreBadgeColor(company.environmentScore)}`}>
                            {company.environmentScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">E</div>
                        </div>
                        <div className="text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getScoreBadgeColor(company.socialScore)}`}>
                            {company.socialScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">S</div>
                        </div>
                        <div className="text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getScoreBadgeColor(company.governanceScore)}`}>
                            {company.governanceScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">G</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {company.controversiesCount > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {company.controversiesCount}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <DataSourceIndicator 
                        dataSource={company.dataSource}
                        className="text-xs"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleCompanySelect(company)}
                        disabled={!company.isSelected && selectedCompanies.length >= 5}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          company.isSelected
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : selectedCompanies.length >= 5
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {company.isSelected ? 'Added' : 'Add'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Section */}
        {selectedCompanies.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
                <GitCompare className="w-5 h-5" />
                <span>ESG Comparison ({selectedCompanies.length}/5)</span>
              </h2>
              <button
                onClick={() => {
                  setSelectedCompanies([]);
                  setCompanies(prev => prev.map(c => ({ ...c, isSelected: false })));
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                Clear All
              </button>
            </div>

            {/* Selected Companies Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCompanies.map((company) => (
                <div
                  key={company.symbol}
                  className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1"
                >
                  <span className="text-sm font-medium text-emerald-800">
                    {company.symbol}
                  </span>
                  <button
                    onClick={() => removeFromComparison(company.symbol)}
                    className="text-emerald-600 hover:text-emerald-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {selectedCompanies.length >= 2 && (
              <>
                {/* Comparison Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Metric</th>
                        {selectedCompanies.map((company) => (
                          <th key={company.symbol} className="text-center py-3 px-4 font-medium text-slate-700">
                            <div className="flex flex-col items-center">
                              <span className="text-sm">{company.symbol}</span>
                              <span className="text-xs text-slate-500">{company.companyName}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-slate-700">Total ESG Score</td>
                        {selectedCompanies.map((company) => (
                          <td key={company.symbol} className="text-center py-3 px-4">
                            <span className={`text-lg font-bold ${getScoreColor(company.esgScore).split(' ')[0]}`}>
                              {company.esgScore.toFixed(1)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-slate-700">Environmental</td>
                        {selectedCompanies.map((company) => (
                          <td key={company.symbol} className="text-center py-3 px-4">
                            <span className={`font-semibold ${getScoreColor(company.environmentScore).split(' ')[0]}`}>
                              {company.environmentScore.toFixed(1)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-slate-700">Social</td>
                        {selectedCompanies.map((company) => (
                          <td key={company.symbol} className="text-center py-3 px-4">
                            <span className={`font-semibold ${getScoreColor(company.socialScore).split(' ')[0]}`}>
                              {company.socialScore.toFixed(1)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-slate-700">Governance</td>
                        {selectedCompanies.map((company) => (
                          <td key={company.symbol} className="text-center py-3 px-4">
                            <span className={`font-semibold ${getScoreColor(company.governanceScore).split(' ')[0]}`}>
                              {company.governanceScore.toFixed(1)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-slate-700">Controversies</td>
                        {selectedCompanies.map((company) => (
                          <td key={company.symbol} className="text-center py-3 px-4">
                            {company.controversiesCount > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {company.controversiesCount}
                              </span>
                            ) : (
                              <span className="text-green-600 text-sm">None</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* AI-Generated Comparison Insight */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-2">AI Comparison Insight</h3>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        {generateComparisonInsight()}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ESG News Feed */}
        <div className="mt-8">
          <ESGNewsFeed 
            maxArticles={10}
            showFilters={true}
            className="w-full"
          />
        </div>

        {/* Cache Status Modal */}
        <CacheStatusModal 
          isOpen={showCacheStatus}
          onClose={() => setShowCacheStatus(false)}
        />
      </div>
    </div>
  );
};

export default ExploreComparePage; 