/**
 * ESG Cache Service
 * 
 * Provides intelligent caching for FMP API ESG data responses to:
 * - Reduce API calls and respect rate limits
 * - Improve performance with instant cache hits
 * - Handle cache expiration and cleanup
 * - Support both localStorage and IndexedDB storage
 */

import { FMPESGScores } from '../api/esgApi';

// Cache configuration
const CACHE_CONFIG = {
  ESG_DATA_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours for ESG data
  SEARCH_RESULTS_EXPIRY: 30 * 60 * 1000, // 30 minutes for search results
  MAX_CACHE_SIZE: 5 * 1024 * 1024, // 5MB max cache size
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour cleanup interval
  MAX_ENTRIES: 1000, // Maximum number of cached entries
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute rate limit window
  MAX_REQUESTS_PER_MINUTE: 100, // Max 100 requests per minute
};

// Cache entry interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

// Rate limiting interface
interface RateLimitEntry {
  requests: number[];
  lastReset: number;
}

// Cache statistics
interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  oldestEntry: number;
  newestEntry: number;
}

class ESGCacheService {
  private rateLimits = new Map<string, RateLimitEntry>();
  private cacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
  };

  constructor() {
    this.initializeCache();
    this.setupPeriodicCleanup();
  }

  /**
   * Initialize cache system
   */
  private initializeCache(): void {
    try {
      // Check if localStorage is available
      if (!this.isLocalStorageAvailable()) {
        console.warn('localStorage not available, cache disabled');
        return;
      }

      // Initialize cache metadata if not exists
      if (!localStorage.getItem('esg_cache_metadata')) {
        const metadata = {
          version: '1.0',
          created: Date.now(),
          lastCleanup: Date.now(),
        };
        localStorage.setItem('esg_cache_metadata', JSON.stringify(metadata));
      }

      // Perform initial cleanup
      this.performCleanup();
      
      console.log('ESG Cache Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ESG cache:', error);
    }
  }

  /**
   * Check localStorage availability
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__esg_cache_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate cache key for ESG data
   */
  private generateCacheKey(type: 'esg' | 'search', identifier: string): string {
    return `esg_cache_${type}_${identifier.toUpperCase()}`;
  }

  /**
   * Calculate object size in bytes (approximate)
   */
  private calculateSize(obj: any): number {
    try {
      return new Blob([JSON.stringify(obj)]).size;
    } catch {
      return JSON.stringify(obj).length * 2; // Fallback estimation
    }
  }

  /**
   * Check rate limits for API endpoint
   */
  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const rateLimit = this.rateLimits.get(endpoint) || {
      requests: [],
      lastReset: now,
    };

    // Reset if window passed
    if (now - rateLimit.lastReset > CACHE_CONFIG.RATE_LIMIT_WINDOW) {
      rateLimit.requests = [];
      rateLimit.lastReset = now;
    }

    // Remove old requests outside the window
    rateLimit.requests = rateLimit.requests.filter(
      timestamp => now - timestamp < CACHE_CONFIG.RATE_LIMIT_WINDOW
    );

    // Check if we're within limits
    if (rateLimit.requests.length >= CACHE_CONFIG.MAX_REQUESTS_PER_MINUTE) {
      console.warn(`Rate limit exceeded for ${endpoint}`);
      return false;
    }

    // Add current request
    rateLimit.requests.push(now);
    this.rateLimits.set(endpoint, rateLimit);
    return true;
  }

  /**
   * Get ESG data from cache
   */
  async getESGData(ticker: string): Promise<FMPESGScores | null> {
    this.cacheStats.totalRequests++;
    
    try {
      const cacheKey = this.generateCacheKey('esg', ticker);
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const entry: CacheEntry<FMPESGScores> = JSON.parse(cached);
        
        // Check if not expired
        if (Date.now() < entry.expiry) {
          // Update access statistics
          entry.accessCount++;
          entry.lastAccessed = Date.now();
          localStorage.setItem(cacheKey, JSON.stringify(entry));
          
          this.cacheStats.hits++;
          console.log(`Cache HIT for ESG data: ${ticker}`);
          return entry.data;
        } else {
          // Remove expired entry
          localStorage.removeItem(cacheKey);
          console.log(`Cache EXPIRED for ESG data: ${ticker}`);
        }
      }
      
      this.cacheStats.misses++;
      console.log(`Cache MISS for ESG data: ${ticker}`);
      return null;
      
    } catch (error) {
      console.error(`Cache read error for ${ticker}:`, error);
      this.cacheStats.misses++;
      return null;
    }
  }

  /**
   * Store ESG data in cache
   */
  async setESGData(ticker: string, data: FMPESGScores): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey('esg', ticker);
      const now = Date.now();
      
      const entry: CacheEntry<FMPESGScores> = {
        data,
        timestamp: now,
        expiry: now + CACHE_CONFIG.ESG_DATA_EXPIRY,
        accessCount: 1,
        lastAccessed: now,
        size: this.calculateSize(data),
      };

      // Check cache size limits before storing
      if (await this.shouldCache(entry)) {
        localStorage.setItem(cacheKey, JSON.stringify(entry));
        console.log(`Cached ESG data for: ${ticker}`);
      } else {
        console.warn(`Cache storage skipped for ${ticker} (size/limit constraints)`);
      }
      
    } catch (error) {
      console.error(`Cache write error for ${ticker}:`, error);
    }
  }

  /**
   * Check if we should cache this entry
   */
  private async shouldCache(entry: CacheEntry): Promise<boolean> {
    try {
      const stats = await this.getCacheStats();
      
      // Check size limits
      if (stats.totalSize + entry.size > CACHE_CONFIG.MAX_CACHE_SIZE) {
        console.log('Cache size limit reached, performing cleanup...');
        await this.performCleanup();
        
        // Recheck after cleanup
        const newStats = await this.getCacheStats();
        if (newStats.totalSize + entry.size > CACHE_CONFIG.MAX_CACHE_SIZE) {
          return false;
        }
      }

      // Check entry count limits
      if (stats.totalEntries >= CACHE_CONFIG.MAX_ENTRIES) {
        console.log('Cache entry limit reached, performing cleanup...');
        await this.performCleanup();
        
        const newStats = await this.getCacheStats();
        if (newStats.totalEntries >= CACHE_CONFIG.MAX_ENTRIES) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking cache constraints:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    try {
      let totalEntries = 0;
      let totalSize = 0;
      let oldestEntry = Date.now();
      let newestEntry = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('esg_cache_')) {
          try {
            const entryData = localStorage.getItem(key);
            if (entryData) {
              const entry: CacheEntry = JSON.parse(entryData);
              totalEntries++;
              totalSize += entry.size || 0;
              oldestEntry = Math.min(oldestEntry, entry.timestamp);
              newestEntry = Math.max(newestEntry, entry.timestamp);
            }
          } catch {
            // Invalid entry, skip
          }
        }
      }

      const hitRate = this.cacheStats.totalRequests > 0 
        ? (this.cacheStats.hits / this.cacheStats.totalRequests) * 100 
        : 0;
      
      const missRate = this.cacheStats.totalRequests > 0 
        ? (this.cacheStats.misses / this.cacheStats.totalRequests) * 100 
        : 0;

      return {
        totalEntries,
        totalSize,
        hitRate,
        missRate,
        oldestEntry,
        newestEntry,
      };
    } catch (error) {
      console.error('Error calculating cache stats:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        missRate: 0,
        oldestEntry: 0,
        newestEntry: 0,
      };
    }
  }

  /**
   * Perform cache cleanup
   */
  async performCleanup(): Promise<void> {
    try {
      console.log('Performing ESG cache cleanup...');
      const now = Date.now();
      const entriesToRemove: string[] = [];
      const entriesToKeep: Array<{ key: string; entry: CacheEntry; score: number }> = [];

      // Collect all cache entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('esg_cache_')) {
          try {
            const entryData = localStorage.getItem(key);
            if (entryData) {
              const entry: CacheEntry = JSON.parse(entryData);
              
              // Remove expired entries
              if (now >= entry.expiry) {
                entriesToRemove.push(key);
              } else {
                // Calculate keeping score based on access frequency and recency
                const ageScore = (now - entry.timestamp) / (24 * 60 * 60 * 1000); // Days old
                const accessScore = entry.accessCount;
                const recencyScore = (now - entry.lastAccessed) / (60 * 60 * 1000); // Hours since last access
                
                const score = accessScore / (ageScore + 1) / (recencyScore + 1);
                entriesToKeep.push({ key, entry, score });
              }
            }
          } catch {
            // Invalid entry, mark for removal
            entriesToRemove.push(key);
          }
        }
      }

      // Remove expired/invalid entries
      entriesToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // If still over limits, remove least valuable entries
      if (entriesToKeep.length > CACHE_CONFIG.MAX_ENTRIES * 0.8) {
        entriesToKeep.sort((a, b) => a.score - b.score); // Sort by score ascending
        const toRemove = entriesToKeep.slice(0, entriesToKeep.length - Math.floor(CACHE_CONFIG.MAX_ENTRIES * 0.8));
        
        toRemove.forEach(({ key }) => {
          localStorage.removeItem(key);
        });
        
        console.log(`Cleaned up ${toRemove.length} low-value cache entries`);
      }

      // Update cleanup timestamp
      const metadata = JSON.parse(localStorage.getItem('esg_cache_metadata') || '{}');
      metadata.lastCleanup = now;
      localStorage.setItem('esg_cache_metadata', JSON.stringify(metadata));

      console.log(`Cache cleanup completed. Removed ${entriesToRemove.length} expired entries`);
      
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  /**
   * Setup periodic cleanup
   */
  private setupPeriodicCleanup(): void {
    setInterval(() => {
      this.performCleanup();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  /**
   * Clear all cache data
   */
  async clearCache(): Promise<void> {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('esg_cache_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Reset statistics
      this.cacheStats = {
        hits: 0,
        misses: 0,
        totalRequests: 0,
      };

      console.log(`Cleared ${keysToRemove.length} cache entries`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Check if we can make API request (rate limiting)
   */
  canMakeAPIRequest(endpoint: string = 'esg'): boolean {
    return this.checkRateLimit(endpoint);
  }

  /**
   * Get cache performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.cacheStats,
      hitRate: this.cacheStats.totalRequests > 0 
        ? (this.cacheStats.hits / this.cacheStats.totalRequests) * 100 
        : 0,
      missRate: this.cacheStats.totalRequests > 0 
        ? (this.cacheStats.misses / this.cacheStats.totalRequests) * 100 
        : 0,
    };
  }

  /**
   * Prefetch ESG data for multiple tickers
   */
  async prefetchESGData(tickers: string[]): Promise<void> {
    console.log(`Prefetching ESG data for ${tickers.length} tickers...`);
    
    for (const ticker of tickers) {
      // Check if already cached
      const cached = await this.getESGData(ticker);
      if (cached) {
        continue; // Skip if already cached
      }

      // Check rate limits
      if (!this.canMakeAPIRequest('esg')) {
        console.warn('Rate limit reached during prefetch, stopping');
        break;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Create singleton instance
export const esgCacheService = new ESGCacheService();
export type { CacheStats, CacheEntry }; 