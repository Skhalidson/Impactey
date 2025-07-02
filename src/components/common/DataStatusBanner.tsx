import React from 'react';
import { AlertTriangle, Database, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useTickerStats } from '../../hooks/useTickerService';

const DataStatusBanner: React.FC = () => {
  const { 
    totalStocks, 
    totalETFs, 
    totalInstruments, 
    isLoading, 
    error, 
    lastFetched 
  } = useTickerStats();

  // Don't show banner if everything is loaded successfully
  if (!isLoading && !error && totalInstruments > 10000) {
    return null;
  }

  const formatLastFetched = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Loading Live Market Data</h3>
            <p className="text-sm text-blue-600">
              Fetching latest stock and ETF information from Financial Modeling Prep...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <div>
            <h3 className="text-sm font-medium text-orange-800">Live Data Unavailable</h3>
            <p className="text-sm text-orange-600">
              Unable to load live instruments—falling back to prototype data. 
              Some search functionality may be limited.
            </p>
            {error && (
              <p className="text-xs text-orange-500 mt-1">Error: {error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show warning for low data counts
  if (totalStocks < 20000 || totalETFs < 1000) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Limited Market Data</h3>
            <p className="text-sm text-yellow-600">
              Retrieved {totalStocks.toLocaleString()} stocks and {totalETFs.toLocaleString()} ETFs.
              Some instruments may not be available for search.
            </p>
            {lastFetched && (
              <p className="text-xs text-yellow-500 mt-1">
                Last updated: {formatLastFetched(lastFetched)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Data source indicator for individual components
 */
export const DataSourceIndicator: React.FC<{ 
  dataSource: 'live' | 'prototype' | 'demo';
  className?: string;
}> = ({ dataSource, className = '' }) => {
  const getIndicatorConfig = () => {
    switch (dataSource) {
      case 'live':
        return {
          icon: CheckCircle,
          text: 'Live Data',
          className: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'prototype':
        return {
          icon: Database,
          text: 'Prototype Data',
          className: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      case 'demo':
        return {
          icon: Clock,
          text: 'Demo Score',
          className: 'text-orange-600 bg-orange-50 border-orange-200'
        };
    }
  };

  const config = getIndicatorConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md border text-xs font-medium ${config.className} ${className}`}>
      <Icon className="w-3 h-3" />
      <span>{config.text}</span>
    </div>
  );
};

export default DataStatusBanner; 