import { fetchESGScores, FMPESGScores } from '../api/esgApi';
import { companies } from '../data/companies';
import { Company } from '../types/index';
import { tickerService } from './tickerService';

// Enhanced ESG data interface that combines live and prototype data
export interface UnifiedESGData {
  symbol: string;
  companyName: string;
  sector: string;
  esgScore: number;
  environmentScore: number;
  socialScore: number;
  governanceScore: number;
  dataSource: 'live' | 'prototype' | 'demo';
  lastUpdated: string;
  // Additional prototype data when available
  prototypeData?: {
    logo: string;
    summary: string;
    controversies: Array<{
      title: string;
      year: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    impactMetrics?: {
      carbonFootprint: number;
      waterUsage: number;
      wasteGenerated: number;
      renewableEnergyPercentage: number;
      employeeSatisfaction: number;
      diversityScore: number;
      boardIndependence: number;
      executivePayRatio: number;
    };
  };
}

// Cache for API responses to avoid repeated calls
const apiCache = new Map<string, { data: FMPESGScores | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get unified ESG data for a company, combining live API data with prototype fallback
 * @param ticker - Company ticker symbol
 * @returns Promise<UnifiedESGData | null> - Combined ESG data or null if not found
 */
export async function getUnifiedESGData(ticker: string): Promise<UnifiedESGData | null> {
  const normalizedTicker = ticker.toUpperCase();
  
  // Try to get live API data first
  const liveData = await getLiveESGData(normalizedTicker);
  
  // Get prototype data as fallback
  const prototypeData = getPrototypeData(normalizedTicker);
  
  if (liveData) {
    // Return live data with prototype enhancements
    return {
      symbol: liveData.symbol,
      companyName: prototypeData?.name || liveData.symbol,
      sector: prototypeData?.sector || 'Unknown',
      esgScore: liveData.esgScore,
      environmentScore: liveData.environmentScore,
      socialScore: liveData.socialScore,
      governanceScore: liveData.governanceScore,
      dataSource: 'live',
      lastUpdated: new Date().toISOString().split('T')[0],
      prototypeData: prototypeData ? {
        logo: prototypeData.logo,
        summary: prototypeData.summary,
        controversies: prototypeData.controversies,
        impactMetrics: {
          carbonFootprint: Math.random() * 100, // Placeholder since not in live API
          waterUsage: Math.random() * 200000,
          wasteGenerated: Math.random() * 50000,
          renewableEnergyPercentage: Math.random() * 100,
          employeeSatisfaction: Math.random() * 10,
          diversityScore: Math.random() * 10,
          boardIndependence: Math.random() * 100,
          executivePayRatio: Math.random() * 2000,
        }
      } : undefined
    };
  } else if (prototypeData) {
    // Return prototype data when live data is not available
    return {
      symbol: prototypeData.ticker,
      companyName: prototypeData.name,
      sector: prototypeData.sector,
      esgScore: prototypeData.impactScore,
      environmentScore: prototypeData.esgScores.environmental,
      socialScore: prototypeData.esgScores.social,
      governanceScore: prototypeData.esgScores.governance,
      dataSource: 'prototype',
      lastUpdated: prototypeData.lastUpdated,
      prototypeData: {
        logo: prototypeData.logo,
        summary: prototypeData.summary,
        controversies: prototypeData.controversies,
        impactMetrics: {
          carbonFootprint: Math.random() * 100,
          waterUsage: Math.random() * 200000,
          wasteGenerated: Math.random() * 50000,
          renewableEnergyPercentage: Math.random() * 100,
          employeeSatisfaction: Math.random() * 10,
          diversityScore: Math.random() * 10,
          boardIndependence: Math.random() * 100,
          executivePayRatio: Math.random() * 2000,
        }
      }
    };
  }
  
  // If no prototype data exists, create a demo placeholder for valid ticker symbols
  const tickerData = tickerService.getTickerBySymbol(normalizedTicker);
  if (tickerData) {
    return generateDemoESGData(normalizedTicker, tickerData);
  }
  
  return null;
}

/**
 * Generate demo ESG data for any valid ticker symbol
 * @param ticker - Valid ticker symbol from ticker service
 * @param tickerData - Ticker information from FMP
 * @returns UnifiedESGData with demo scores
 */
export function generateDemoESGData(ticker: string, tickerData: any): UnifiedESGData {
  // Generate consistent but random-looking scores based on ticker symbol
  const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = hash % 100;
  
  // Generate scores that look realistic (not too perfect, some variation)
  const esgScore = Math.round((5 + (seed % 4) + Math.sin(hash) * 2) * 10) / 10;
  const environmentScore = Math.round((4 + (seed % 5) + Math.cos(hash) * 2) * 10) / 10;
  const socialScore = Math.round((5 + (seed % 4) + Math.sin(hash * 2) * 2) * 10) / 10;
  const governanceScore = Math.round((6 + (seed % 3) + Math.cos(hash * 3) * 1.5) * 10) / 10;

  return {
    symbol: ticker,
    companyName: tickerData.name || ticker,
    sector: tickerData.sector || 'Technology', // Default to Technology if no sector
    esgScore: Math.min(10, Math.max(0, esgScore)),
    environmentScore: Math.min(10, Math.max(0, environmentScore)),
    socialScore: Math.min(10, Math.max(0, socialScore)),
    governanceScore: Math.min(10, Math.max(0, governanceScore)),
    dataSource: 'demo',
    lastUpdated: new Date().toISOString().split('T')[0],
    prototypeData: {
      logo: '📊',
      summary: `Demo ESG analysis for ${tickerData.name || ticker}. This is placeholder data for demonstration purposes. ${tickerData.type === 'etf' ? 'ETF' : 'Stock'} analysis shows moderate ESG performance across key metrics.`,
      controversies: seed % 3 === 0 ? [
        {
          title: `Environmental compliance review - ${ticker}`,
          year: '2023',
          severity: 'low' as const
        }
      ] : [],
      impactMetrics: {
        carbonFootprint: Math.round(seed * 2),
        waterUsage: Math.round(seed * 1000),
        wasteGenerated: Math.round(seed * 100),
        renewableEnergyPercentage: Math.round(seed % 80 + 10),
        employeeSatisfaction: Math.round((seed % 40 + 60) / 10),
        diversityScore: Math.round((seed % 30 + 60) / 10),
        boardIndependence: Math.round(seed % 40 + 50),
        executivePayRatio: Math.round(seed * 10 + 100),
      }
    }
  };
}

/**
 * Get live ESG data from API with caching
 * @param ticker - Company ticker symbol
 * @returns Promise<FMPESGScores | null> - Live ESG data or null
 */
async function getLiveESGData(ticker: string): Promise<FMPESGScores | null> {
  // Check cache first
  const cached = apiCache.get(ticker);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const data = await fetchESGScores(ticker);
    
    // Cache the result
    apiCache.set(ticker, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.warn(`Failed to fetch live ESG data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Get prototype data for a company
 * @param ticker - Company ticker symbol
 * @returns Company | undefined - Prototype data or undefined
 */
function getPrototypeData(ticker: string): Company | undefined {
  return companies.find(company => 
    company.ticker.toUpperCase() === ticker.toUpperCase()
  );
}

/**
 * Get unified ESG data for multiple companies
 * @param tickers - Array of company ticker symbols
 * @returns Promise<UnifiedESGData[]> - Array of unified ESG data
 */
export async function getMultipleUnifiedESGData(tickers: string[]): Promise<UnifiedESGData[]> {
  const promises = tickers.map(ticker => getUnifiedESGData(ticker));
  const results = await Promise.allSettled(promises);
  
  return results
    .filter((result): result is PromiseFulfilledResult<UnifiedESGData> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value);
}

/**
 * Search companies with unified ESG data
 * @param query - Search query
 * @returns Promise<UnifiedESGData[]> - Search results with unified data
 */
export async function searchUnifiedESGCompanies(query: string): Promise<UnifiedESGData[]> {
  if (!query.trim()) {
    // Return all companies with unified data
    const allTickers = companies.map(company => company.ticker);
    return getMultipleUnifiedESGData(allTickers);
  }
  
  // Filter companies based on query
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(query.toLowerCase()) ||
    company.sector.toLowerCase().includes(query.toLowerCase()) ||
    company.ticker.toLowerCase().includes(query.toLowerCase())
  );
  
  const tickers = filteredCompanies.map(company => company.ticker);
  return getMultipleUnifiedESGData(tickers);
}

/**
 * Get companies by sector with unified ESG data
 * @param sector - Sector name
 * @returns Promise<UnifiedESGData[]> - Companies in sector with unified data
 */
export async function getUnifiedESGDataBySector(sector: string): Promise<UnifiedESGData[]> {
  const sectorCompanies = companies.filter(company =>
    company.sector.toLowerCase().includes(sector.toLowerCase())
  );
  
  const tickers = sectorCompanies.map(company => company.ticker);
  return getMultipleUnifiedESGData(tickers);
}

/**
 * Get ESG data for a ticker (alias for getUnifiedESGData for backward compatibility)
 * @param ticker - Company ticker symbol
 * @returns Promise<UnifiedESGData | null> - ESG data or null if not found
 */
export async function getESGData(ticker: string): Promise<UnifiedESGData | null> {
  return getUnifiedESGData(ticker);
}

/**
 * Clear API cache
 */
export function clearESGCache(): void {
  apiCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: apiCache.size,
    entries: Array.from(apiCache.keys())
  };
} 