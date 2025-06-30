import { useState, useEffect, useCallback } from 'react';
import { tickerService, TickerData, TickerServiceState } from '../services/tickerService';

/**
 * Hook to use the ticker service state
 */
export function useTickerService() {
  const [state, setState] = useState<TickerServiceState>(tickerService.getState());

  useEffect(() => {
    const unsubscribe = tickerService.subscribe(() => {
      setState(tickerService.getState());
    });

    return unsubscribe;
  }, []);

  const refreshData = useCallback(() => {
    return tickerService.refreshData();
  }, []);

  const getStats = useCallback(() => {
    return tickerService.getStats();
  }, []);

  return {
    ...state,
    refreshData,
    getStats
  };
}

/**
 * Hook to search tickers
 */
export function useTickerSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TickerData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

  const search = useCallback((searchQuery: string, limit?: number) => {
    setQuery(searchQuery);
    setSearchError(null);
    
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Debounce search with cleanup
    const timeoutId = setTimeout(() => {
      try {
        const tickerState = tickerService.getState();
        
        // Check if data is available
        if (tickerState.isLoading) {
          setSearchError('Loading market data...');
          setIsSearching(false);
          return;
        }

        if (tickerState.error && (tickerState.stocks.length === 0 && tickerState.etfs.length === 0)) {
          setSearchError('Unable to load instruments—please try again later');
          setIsSearching(false);
          return;
        }

        const searchResults = tickerService.searchTickers(searchQuery, limit);
        setResults(searchResults);
        setIsSearching(false);

        // Development logging
        if (import.meta.env.DEV) {
          console.log(`🔍 Search completed for "${searchQuery}": ${searchResults.length} results`);
        }

      } catch (error) {
        setSearchError('Search failed—please try again');
        setIsSearching(false);
        if (import.meta.env.DEV) {
          console.error('Search error:', error);
        }
      }
    }, 300);

    setDebounceTimer(timeoutId);
  }, [debounceTimer]);

  const clearSearch = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    setQuery('');
    setResults([]);
    setIsSearching(false);
    setSearchError(null);
  }, [debounceTimer]);

  const getTickerBySymbol = useCallback((symbol: string) => {
    return tickerService.getTickerBySymbol(symbol);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    query,
    results,
    isSearching,
    searchError,
    search,
    clearSearch,
    getTickerBySymbol
  };
}

/**
 * Hook to get ticker statistics and data overview
 */
export function useTickerStats() {
  const { isLoading, error, lastFetched } = useTickerService();
  const [stats, setStats] = useState(tickerService.getStats());

  useEffect(() => {
    const updateStats = () => {
      setStats(tickerService.getStats());
    };

    const unsubscribe = tickerService.subscribe(updateStats);
    updateStats(); // Initial update

    return unsubscribe;
  }, []);

  return {
    ...stats,
    isLoading,
    error,
    lastFetched
  };
} 