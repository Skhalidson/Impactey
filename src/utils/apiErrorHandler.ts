/**
 * API Error Handler Utility
 * 
 * Provides graceful fallback strategies for API rate limiting (429) and other errors.
 * Includes retry logic, fallback data support, and user-friendly error notifications.
 */

export interface APIError {
  status: number;
  message: string;
  isRateLimit: boolean;
  isNetworkError: boolean;
  isAuthError: boolean;
}

export interface FallbackOptions<T> {
  fallbackData?: T;
  showNotification?: boolean;
  retryable?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

export interface FetchWithFallbackOptions<T> extends FallbackOptions<T> {
  url: string;
  fetchFn?: () => Promise<T>;
  timeout?: number;
}

// Global state for tracking API failures and retry attempts
class APIStateManager {
  private rateLimitedAPIs = new Map<string, { until: number; retries: number }>();
  private fallbackActive = new Set<string>();

  isRateLimited(apiKey: string): boolean {
    const limit = this.rateLimitedAPIs.get(apiKey);
    if (!limit) return false;
    
    if (Date.now() > limit.until) {
      this.rateLimitedAPIs.delete(apiKey);
      return false;
    }
    return true;
  }

  setRateLimit(apiKey: string, retryAfter: number = 60000): void {
    const existing = this.rateLimitedAPIs.get(apiKey) || { until: 0, retries: 0 };
    this.rateLimitedAPIs.set(apiKey, {
      until: Date.now() + retryAfter,
      retries: existing.retries + 1
    });
  }

  setFallbackActive(apiKey: string, active: boolean): void {
    if (active) {
      this.fallbackActive.add(apiKey);
    } else {
      this.fallbackActive.delete(apiKey);
    }
  }

  isFallbackActive(apiKey: string): boolean {
    return this.fallbackActive.has(apiKey);
  }

  getRetryCount(apiKey: string): number {
    return this.rateLimitedAPIs.get(apiKey)?.retries || 0;
  }

  clearRateLimit(apiKey: string): void {
    this.rateLimitedAPIs.delete(apiKey);
  }
}

export const apiStateManager = new APIStateManager();

/**
 * Parse API error from response or exception
 */
export function parseAPIError(error: any): APIError {
  const status = error.response?.status || error.status || 0;
  const message = error.response?.statusText || error.message || 'Unknown error';
  
  return {
    status,
    message,
    isRateLimit: status === 429,
    isNetworkError: !status || status >= 500,
    isAuthError: status === 401 || status === 403
  };
}

/**
 * Log API errors with appropriate severity
 */
export function logAPIError(apiName: string, error: APIError, context?: string): void {
  const prefix = context ? `[${context}] ` : '';
  
  if (error.isRateLimit) {
    console.warn(`${prefix}${apiName} API: Rate limit exceeded (429) - falling back to cached/demo data`);
  } else if (error.isAuthError) {
    console.error(`${prefix}${apiName} API: Authentication failed (${error.status}) - ${error.message}`);
  } else if (error.isNetworkError) {
    console.error(`${prefix}${apiName} API: Network error (${error.status}) - ${error.message}`);
  } else {
    console.error(`${prefix}${apiName} API: Request failed (${error.status}) - ${error.message}`);
  }
}

/**
 * Create user-friendly notification for API failures
 */
export function createAPIErrorNotification(apiName: string, error: APIError, hasFallback: boolean = false): {
  type: 'warning' | 'error';
  title: string;
  message: string;
  showRetry: boolean;
} {
  if (error.isRateLimit && hasFallback) {
    return {
      type: 'warning',
      title: 'Live Data Temporarily Unavailable',
      message: `${apiName} API rate limit reached. Showing cached or demo data instead.`,
      showRetry: true
    };
  }
  
  if (error.isAuthError) {
    return {
      type: 'error',
      title: 'API Configuration Error',
      message: `${apiName} API authentication failed. Please check API key configuration.`,
      showRetry: false
    };
  }
  
  if (error.isNetworkError && hasFallback) {
    return {
      type: 'warning',
      title: 'Connection Issue',
      message: `Unable to reach ${apiName} API. Using cached data while connectivity is restored.`,
      showRetry: true
    };
  }
  
  return {
    type: 'error',
    title: 'Data Unavailable',
    message: `Failed to load data from ${apiName} API. Please try again later.`,
    showRetry: true
  };
}

/**
 * Generic fetch with fallback utility
 */
export async function fetchWithFallback<T>(
  apiKey: string,
  options: FetchWithFallbackOptions<T>
): Promise<{
  data: T | null;
  source: 'api' | 'fallback' | 'error';
  error?: APIError;
  notification?: ReturnType<typeof createAPIErrorNotification>;
}> {
  const {
    url,
    fetchFn,
    fallbackData,
    showNotification = true,
    retryable = true,
    retryDelay = 60000,
    maxRetries = 3,
    timeout = 10000
  } = options;

  // Check if API is currently rate limited
  if (apiStateManager.isRateLimited(apiKey)) {
    console.log(`${apiKey} API is rate limited, using fallback data`);
    apiStateManager.setFallbackActive(apiKey, true);
    
    return {
      data: fallbackData || null,
      source: fallbackData ? 'fallback' : 'error',
      notification: showNotification && fallbackData ? createAPIErrorNotification(apiKey, {
        status: 429,
        message: 'Rate limited',
        isRateLimit: true,
        isNetworkError: false,
        isAuthError: false
      }, true) : undefined
    };
  }

  try {
    console.log(`Fetching data from ${apiKey} API: ${url}`);
    
    let data: T;
    if (fetchFn) {
      data = await fetchFn();
    } else {
      // Generic fetch implementation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      data = await response.json();
    }
    
    // Success - clear any previous fallback state
    apiStateManager.setFallbackActive(apiKey, false);
    apiStateManager.clearRateLimit(apiKey);
    
    console.log(`Successfully fetched data from ${apiKey} API`);
    return {
      data,
      source: 'api'
    };
    
  } catch (error: any) {
    const apiError = parseAPIError(error);
    logAPIError(apiKey, apiError, url);
    
    // Handle rate limiting
    if (apiError.isRateLimit) {
      apiStateManager.setRateLimit(apiKey, retryDelay);
      apiStateManager.setFallbackActive(apiKey, true);
    }
    
    // Return fallback data if available
    if (fallbackData) {
      return {
        data: fallbackData,
        source: 'fallback',
        error: apiError,
        notification: showNotification ? createAPIErrorNotification(apiKey, apiError, true) : undefined
      };
    }
    
    // No fallback available
    return {
      data: null,
      source: 'error',
      error: apiError,
      notification: showNotification ? createAPIErrorNotification(apiKey, apiError, false) : undefined
    };
  }
}

/**
 * Check if retry is possible for an API
 */
export function canRetryAPI(apiKey: string): boolean {
  return !apiStateManager.isRateLimited(apiKey) && apiStateManager.getRetryCount(apiKey) < 3;
}

/**
 * Force retry an API by clearing rate limit state
 */
export function forceRetryAPI(apiKey: string): void {
  apiStateManager.clearRateLimit(apiKey);
  apiStateManager.setFallbackActive(apiKey, false);
  console.log(`Forcing retry for ${apiKey} API`);
}

/**
 * Get API status information
 */
export function getAPIStatus(apiKey: string): {
  isRateLimited: boolean;
  isFallbackActive: boolean;
  retryCount: number;
  canRetry: boolean;
} {
  return {
    isRateLimited: apiStateManager.isRateLimited(apiKey),
    isFallbackActive: apiStateManager.isFallbackActive(apiKey),
    retryCount: apiStateManager.getRetryCount(apiKey),
    canRetry: canRetryAPI(apiKey)
  };
} 