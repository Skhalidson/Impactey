interface TickerData {
  symbol: string;
  name: string;
  price: number;
  exchange: string;
  exchangeShortName: string;
  type: 'stock' | 'etf';
}

interface TickerServiceState {
  stocks: TickerData[];
  etfs: TickerData[];
  isLoading: boolean;
  lastFetched: Date | null;
  error: string | null;
}

class TickerService {
  private state: TickerServiceState = {
    stocks: [],
    etfs: [],
    isLoading: false,
    lastFetched: null,
    error: null
  };

  private listeners: Set<() => void> = new Set();
  private readonly API_KEY = 'GLrZCQn3n4erOKonZ0mRSYLbHyh9nCgU';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MIN_EXPECTED_STOCKS = 20000;
  private readonly MIN_EXPECTED_ETFS = 1000;

  constructor() {
    this.loadFromCache();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Get current state
   */
  getState(): TickerServiceState {
    return { ...this.state };
  }

  /**
   * Load cached data from localStorage
   */
  private loadFromCache(): void {
    try {
      const cached = localStorage.getItem('impactey-ticker-data');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.lastFetched && Date.now() - new Date(data.lastFetched).getTime() < this.CACHE_DURATION) {
          this.state = {
            ...data,
            lastFetched: new Date(data.lastFetched),
            isLoading: false,
            error: null
          };
          
          // Development mode logging
          if (import.meta.env.DEV) {
            console.log('📦 Loaded ticker data from cache:', {
              stocks: this.state.stocks.length,
              etfs: this.state.etfs.length,
              total: this.state.stocks.length + this.state.etfs.length,
              cachedAt: this.state.lastFetched,
              sampleStocks: this.state.stocks.slice(0, 3).map(s => `${s.symbol} - ${s.name}`),
              sampleETFs: this.state.etfs.slice(0, 3).map(e => `${e.symbol} - ${e.name}`)
            });
          }
          
          this.notify();
          return;
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to load cached ticker data:', error);
      }
    }
    
    // No valid cache, fetch fresh data
    this.fetchAllTickers();
  }

  /**
   * Save data to localStorage
   */
  private saveToCache(): void {
    try {
      const dataToCache = {
        stocks: this.state.stocks,
        etfs: this.state.etfs,
        lastFetched: this.state.lastFetched
      };
      localStorage.setItem('impactey-ticker-data', JSON.stringify(dataToCache));
    } catch (error) {
      console.warn('Failed to cache ticker data:', error);
    }
  }

  /**
   * Fetch stock list from FMP API
   */
  private async fetchStocks(): Promise<TickerData[]> {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock/list?apikey=${this.API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Stock API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price || 0,
      exchange: stock.exchange || 'Unknown',
      exchangeShortName: stock.exchangeShortName || 'Unknown',
      type: 'stock' as const
    }));
  }

  /**
   * Fetch ETF list from FMP API
   */
  private async fetchETFs(): Promise<TickerData[]> {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/etf/list?apikey=${this.API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`ETF API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.map((etf: any) => ({
      symbol: etf.symbol,
      name: etf.name,
      price: etf.price || 0,
      exchange: etf.exchange || 'Unknown',
      exchangeShortName: etf.exchangeShortName || 'Unknown',
      type: 'etf' as const
    }));
  }

  /**
   * Fetch all ticker data (stocks and ETFs)
   */
  async fetchAllTickers(): Promise<void> {
    if (this.state.isLoading) {
      console.log('📊 Ticker fetch already in progress...');
      return;
    }

    this.state.isLoading = true;
    this.state.error = null;
    this.notify();

    console.log('🚀 Fetching live ticker data from Financial Modeling Prep...');
    const startTime = Date.now();

    try {
      // Fetch stocks and ETFs in parallel
      const [stocks, etfs] = await Promise.all([
        this.fetchStocks(),
        this.fetchETFs()
      ]);

      // Update state
      this.state.stocks = stocks;
      this.state.etfs = etfs;
      this.state.lastFetched = new Date();
      this.state.isLoading = false;
      this.state.error = null;

      // Save to cache
      this.saveToCache();

      const fetchTime = Date.now() - startTime;
      
      // Log results and warnings
      if (import.meta.env.DEV) {
        console.log('✅ Ticker data fetch completed:', {
          stocks: stocks.length,
          etfs: etfs.length,
          total: stocks.length + etfs.length,
          fetchTime: `${fetchTime}ms`,
          timestamp: this.state.lastFetched,
          sampleStocks: stocks.slice(0, 5).map(s => `${s.symbol} - ${s.name}`),
          sampleETFs: etfs.slice(0, 5).map(e => `${e.symbol} - ${e.name}`)
        });
      }

      // Check for expected data volumes and show warnings
      if (stocks.length < this.MIN_EXPECTED_STOCKS) {
        const message = `⚠️ Low stock count: Expected ${this.MIN_EXPECTED_STOCKS}+, got ${stocks.length}`;
        console.warn(message);
        this.state.error = `Low data volume: ${stocks.length} stocks`;
      }

      if (etfs.length < this.MIN_EXPECTED_ETFS) {
        const message = `⚠️ Low ETF count: Expected ${this.MIN_EXPECTED_ETFS}+, got ${etfs.length}`;
        console.warn(message);
        this.state.error = this.state.error 
          ? `${this.state.error}, ${etfs.length} ETFs`
          : `Low data volume: ${etfs.length} ETFs`;
      }

      this.notify();

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Failed to fetch ticker data:', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
          apiKey: this.API_KEY ? 'Present' : 'Missing'
        });
      }
      
      this.state.isLoading = false;
      this.state.error = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // If we have no cached data, show friendly error
      if (this.state.stocks.length === 0 && this.state.etfs.length === 0) {
        if (import.meta.env.DEV) {
          console.log('📋 No cached data available - users will see error message');
        }
      } else {
        if (import.meta.env.DEV) {
          console.log('📦 Using cached data despite fetch error:', {
            stocks: this.state.stocks.length,
            etfs: this.state.etfs.length
          });
        }
      }
      
      this.notify();
    }
  }

  /**
   * Search for tickers by symbol or name
   */
  searchTickers(query: string, limit: number = 50): TickerData[] {
    if (!query.trim()) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const allTickers = [...this.state.stocks, ...this.state.etfs];
    
    if (allTickers.length === 0) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ No ticker data available for search');
      }
      return [];
    }

    // Enhanced search: exact matches, starts with, and contains
    const results = allTickers.filter(ticker => {
      if (!ticker.symbol || !ticker.name) return false;
      
      const symbol = ticker.symbol.toLowerCase();
      const name = ticker.name.toLowerCase();
      
      return symbol.includes(normalizedQuery) || 
             name.includes(normalizedQuery) ||
             // Support partial word matching
             name.split(' ').some(word => word.startsWith(normalizedQuery));
    });

    // Sort by relevance: exact symbol match first, then symbol starts with, then name matches
    results.sort((a, b) => {
      if (!a.symbol || !a.name || !b.symbol || !b.name) return 0;
      
      const aSymbol = a.symbol.toLowerCase();
      const bSymbol = b.symbol.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // Exact symbol match gets highest priority
      if (aSymbol === normalizedQuery && bSymbol !== normalizedQuery) return -1;
      if (bSymbol === normalizedQuery && aSymbol !== normalizedQuery) return 1;

      // Symbol starts with query
      if (aSymbol.startsWith(normalizedQuery) && !bSymbol.startsWith(normalizedQuery)) return -1;
      if (bSymbol.startsWith(normalizedQuery) && !aSymbol.startsWith(normalizedQuery)) return 1;

      // Name starts with query
      if (aName.startsWith(normalizedQuery) && !bName.startsWith(normalizedQuery)) return -1;
      if (bName.startsWith(normalizedQuery) && !aName.startsWith(normalizedQuery)) return 1;

      // Name contains query
      if (aName.includes(normalizedQuery) && !bName.includes(normalizedQuery)) return -1;
      if (bName.includes(normalizedQuery) && !aName.includes(normalizedQuery)) return 1;

      // Prefer stocks over ETFs for equal matches
      if (a.type === 'stock' && b.type === 'etf') return -1;
      if (a.type === 'etf' && b.type === 'stock') return 1;

      // Alphabetical by symbol
      return aSymbol.localeCompare(bSymbol);
    });

    const finalResults = results.slice(0, limit);

    // Development logging
    if (import.meta.env.DEV && finalResults.length > 0) {
      console.log(`🔍 Search "${query}" found ${results.length} results (showing ${finalResults.length}):`, 
        finalResults.slice(0, 3).map(r => `${r.symbol} - ${r.name} (${r.type.toUpperCase()})`)
      );
    }

    return finalResults;
  }

  /**
   * Get ticker by exact symbol
   */
  getTickerBySymbol(symbol: string): TickerData | null {
    const normalizedSymbol = symbol.toUpperCase().trim();
    return [...this.state.stocks, ...this.state.etfs]
      .find(ticker => ticker.symbol === normalizedSymbol) || null;
  }

  /**
   * Get all tickers of a specific type
   */
  getTickersByType(type: 'stock' | 'etf'): TickerData[] {
    return type === 'stock' ? this.state.stocks : this.state.etfs;
  }

  /**
   * Force refresh data
   */
  async refreshData(): Promise<void> {
    // Clear cache and fetch fresh data
    localStorage.removeItem('impactey-ticker-data');
    await this.fetchAllTickers();
  }

  /**
   * Get data statistics
   */
  getStats() {
    return {
      totalStocks: this.state.stocks.length,
      totalETFs: this.state.etfs.length,
      totalInstruments: this.state.stocks.length + this.state.etfs.length,
      lastFetched: this.state.lastFetched,
      isLoading: this.state.isLoading,
      error: this.state.error,
      exchanges: {
        stocks: [...new Set(this.state.stocks.map(s => s.exchangeShortName))].length,
        etfs: [...new Set(this.state.etfs.map(e => e.exchangeShortName))].length
      }
    };
  }
}

// Create singleton instance
export const tickerService = new TickerService();
export type { TickerData, TickerServiceState }; 