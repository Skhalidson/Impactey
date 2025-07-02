import React, { useState } from 'react';
import { Database, RefreshCw, Search, CheckCircle, AlertTriangle, Clock, TrendingUp, Globe } from 'lucide-react';
import { useTickerStats, useTickerSearch } from '../hooks/useTickerService';
import DataStatusBanner, { DataSourceIndicator } from './DataStatusBanner';

const DataStatusPage: React.FC = () => {
  const { 
    totalStocks, 
    totalETFs, 
    totalInstruments, 
    isLoading, 
    error, 
    lastFetched,
    exchanges
  } = useTickerStats();

  const { search, results, isSearching, clearSearch } = useTickerSearch();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      search(query, 20);
    } else {
      clearSearch();
    }
  };

  const formatLastFetched = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (instruments: number) => {
    const avgSize = 120; // Average bytes per instrument
    const totalBytes = instruments * avgSize;
    if (totalBytes < 1024 * 1024) {
      return `${Math.round(totalBytes / 1024)} KB`;
    }
    return `${Math.round(totalBytes / (1024 * 1024))} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            Live Market Data Status
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Real-time status of our Financial Modeling Prep integration and ticker database.
          </p>
        </div>

        {/* Data Status Banner */}
        <DataStatusBanner />

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Stocks</h3>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {totalStocks.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">
              {exchanges.stocks} exchanges
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">ETFs</h3>
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {totalETFs.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">
              {exchanges.etfs} exchanges
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Total Instruments</h3>
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {totalInstruments.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">
              ~{formatFileSize(totalInstruments)} cached
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Status</h3>
              {isLoading ? (
                <RefreshCw className="w-6 h-6 text-orange-600 animate-spin" />
              ) : error ? (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div className={`text-lg font-bold mb-2 ${
              isLoading ? 'text-orange-600' : error ? 'text-red-600' : 'text-green-600'
            }`}>
              {isLoading ? 'Loading...' : error ? 'Error' : 'Live'}
            </div>
            <div className="text-sm text-slate-500">
              {formatLastFetched(lastFetched)}
            </div>
          </div>
        </div>

        {/* Live Search Demo */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Live Ticker Search Demo</h3>
          
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for stocks or ETFs (e.g., AAPL, Apple, SPY, Technology...)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-base"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <RefreshCw className="h-5 w-5 text-emerald-500 animate-spin" />
              </div>
            )}
          </div>

          {searchQuery && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                <span>
                  {results.length > 0 
                    ? `Found ${results.length} results ${results.length === 20 ? '(showing top 20)' : ''}`
                    : isSearching ? 'Searching...' : 'No results found'
                  }
                </span>
                {searchQuery && (
                  <button
                    onClick={() => handleSearch('')}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>

              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {results.map((ticker, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-slate-900">{ticker.symbol}</span>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          ticker.type === 'stock' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {ticker.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate mt-1">{ticker.name}</p>
                      <p className="text-xs text-slate-500">{ticker.exchangeShortName} • ${ticker.price}</p>
                    </div>
                    <DataSourceIndicator dataSource="demo" className="ml-3" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!searchQuery && (
            <div className="text-center py-8 text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Start typing to search through {totalInstruments.toLocaleString()} live instruments</p>
              <p className="text-sm mt-1">Try searching for: AAPL, Tesla, Microsoft, SPY, or any company name</p>
              <p className="text-xs mt-2 text-slate-400">
                🛡️ Search shows only mainstream securities from major exchanges (no OTC, leveraged, or exotic products)
              </p>
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Technical Implementation</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-slate-700 mb-3">Data Sources</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-600">Financial Modeling Prep API</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-600">Prototype ESG Database (20 companies)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-slate-600">Demo ESG Generator (any valid ticker)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-slate-700 mb-3">Caching & Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Cache Duration:</span>
                  <span className="font-medium text-slate-800">24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Search Debounce:</span>
                  <span className="font-medium text-slate-800">300ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">API Rate Limit:</span>
                  <span className="font-medium text-slate-800">250 calls/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Storage:</span>
                  <span className="font-medium text-slate-800">localStorage</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h5 className="font-semibold text-slate-700 mb-2">Data Flow</h5>
            <ol className="text-sm text-slate-600 space-y-1">
              <li>1. App loads → Check localStorage cache (24h expiry)</li>
              <li>2. If cache miss → Fetch from Financial Modeling Prep</li>
              <li>3. User searches → Real-time filtering of cached data</li>
              <li>4. Portfolio analysis → ESG lookup: Live API → Prototype → Demo</li>
              <li>5. All tickers get ESG scores with clear data source labeling</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataStatusPage; 