import axios from 'axios';

// ESG API Types
export interface ESGData {
  companyId: string;
  companyName: string;
  ticker: string;
  sector: string;
  lastUpdated: string;
  esgScores: {
    environmental: number;
    social: number;
    governance: number;
    overall: number;
  };
  impactMetrics: {
    carbonFootprint: number; // in metric tons CO2 equivalent
    waterUsage: number; // in cubic meters
    wasteGenerated: number; // in metric tons
    renewableEnergyPercentage: number; // percentage
    employeeSatisfaction: number; // 1-10 scale
    diversityScore: number; // 1-10 scale
    boardIndependence: number; // percentage
    executivePayRatio: number; // CEO to median worker pay ratio
  };
  controversies: Array<{
    id: string;
    title: string;
    description: string;
    year: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'environmental' | 'social' | 'governance';
    status: 'resolved' | 'ongoing' | 'pending';
  }>;
  sustainabilityInitiatives: Array<{
    id: string;
    title: string;
    description: string;
    targetYear: string;
    status: 'completed' | 'in-progress' | 'planned';
    impact: 'positive' | 'neutral' | 'negative';
  }>;
  ratings: {
    msciesg: string; // MSCI ESG Rating (AAA-CCC)
    sustainalytics: string; // Sustainalytics Risk Rating
    ftse4good: string; // FTSE4Good Index inclusion
    dowJones: string; // DJSI inclusion
  };
}

// FinancialModelingPrep API Types
export interface FMPESGScores {
  symbol: string;
  esgScore: number;
  environmentScore: number;
  socialScore: number;
  governanceScore: number;
}

export interface ESGSearchParams {
  companyName?: string;
  ticker?: string;
  sector?: string;
  minScore?: number;
  maxScore?: number;
}

export interface ESGSearchResponse {
  data: ESGData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// API Configuration
const API_CONFIG = {
  baseUrl: 'https://api.esgdata.com/v1', // Placeholder URL
  apiKey: import.meta.env.VITE_ESG_API_KEY || 'demo-key',
  timeout: 10000, // 10 seconds
};

// Error Types
export class ESGAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ESGAPIError';
  }
}

// Sample ESG data for demonstration
const SAMPLE_ESG_DATA: Record<string, ESGData> = {
  'AAPL': {
    companyId: 'apple-inc',
    companyName: 'Apple Inc.',
    ticker: 'AAPL',
    sector: 'Technology',
    lastUpdated: '2024-12-15',
    esgScores: {
      environmental: 7.9,
      social: 6.8,
      governance: 7.5,
      overall: 7.4,
    },
    impactMetrics: {
      carbonFootprint: 23.2,
      waterUsage: 125000,
      wasteGenerated: 45000,
      renewableEnergyPercentage: 85,
      employeeSatisfaction: 7.2,
      diversityScore: 6.8,
      boardIndependence: 75,
      executivePayRatio: 1447,
    },
    controversies: [
      {
        id: 'cont-001',
        title: 'Supply Chain Labor Rights Concerns',
        description: 'Reports of poor working conditions in Chinese manufacturing facilities',
        year: '2023',
        severity: 'high',
        category: 'social',
        status: 'ongoing',
      },
      {
        id: 'cont-002',
        title: 'App Store Antitrust Investigation',
        description: 'Regulatory scrutiny over App Store commission structure',
        year: '2023',
        severity: 'medium',
        category: 'governance',
        status: 'ongoing',
      },
    ],
    sustainabilityInitiatives: [
      {
        id: 'init-001',
        title: 'Carbon Neutral by 2030',
        description: 'Commitment to achieve carbon neutrality across entire supply chain',
        targetYear: '2030',
        status: 'in-progress',
        impact: 'positive',
      },
      {
        id: 'init-002',
        title: '100% Recycled Materials',
        description: 'Transition to 100% recycled or renewable materials in products',
        targetYear: '2025',
        status: 'in-progress',
        impact: 'positive',
      },
    ],
    ratings: {
      msciesg: 'AA',
      sustainalytics: 'Low Risk',
      ftse4good: 'Included',
      dowJones: 'Included',
    },
  },
  'MSFT': {
    companyId: 'microsoft-corp',
    companyName: 'Microsoft Corporation',
    ticker: 'MSFT',
    sector: 'Technology',
    lastUpdated: '2024-12-15',
    esgScores: {
      environmental: 8.2,
      social: 7.9,
      governance: 8.5,
      overall: 8.2,
    },
    impactMetrics: {
      carbonFootprint: 15.8,
      waterUsage: 89000,
      wasteGenerated: 32000,
      renewableEnergyPercentage: 95,
      employeeSatisfaction: 8.1,
      diversityScore: 7.5,
      boardIndependence: 80,
      executivePayRatio: 1547,
    },
    controversies: [
      {
        id: 'cont-003',
        title: 'AI Ethics and Bias Concerns',
        description: 'Allegations of bias in AI algorithms and facial recognition technology',
        year: '2023',
        severity: 'medium',
        category: 'social',
        status: 'ongoing',
      },
    ],
    sustainabilityInitiatives: [
      {
        id: 'init-003',
        title: 'Carbon Negative by 2030',
        description: 'Commitment to remove more carbon than emitted',
        targetYear: '2030',
        status: 'in-progress',
        impact: 'positive',
      },
    ],
    ratings: {
      msciesg: 'AAA',
      sustainalytics: 'Low Risk',
      ftse4good: 'Included',
      dowJones: 'Included',
    },
  },
  'TSLA': {
    companyId: 'tesla-inc',
    companyName: 'Tesla, Inc.',
    ticker: 'TSLA',
    sector: 'Clean Technology',
    lastUpdated: '2024-12-15',
    esgScores: {
      environmental: 7.8,
      social: 5.4,
      governance: 6.1,
      overall: 6.4,
    },
    impactMetrics: {
      carbonFootprint: 8.5,
      waterUsage: 45000,
      wasteGenerated: 18000,
      renewableEnergyPercentage: 90,
      employeeSatisfaction: 5.8,
      diversityScore: 5.2,
      boardIndependence: 60,
      executivePayRatio: 2347,
    },
    controversies: [
      {
        id: 'cont-004',
        title: 'Cobalt Mining Labor Rights',
        description: 'Concerns over child labor in cobalt mining supply chain',
        year: '2023',
        severity: 'high',
        category: 'social',
        status: 'ongoing',
      },
      {
        id: 'cont-005',
        title: 'Factory Working Conditions',
        description: 'Reports of poor working conditions in manufacturing facilities',
        year: '2023',
        severity: 'medium',
        category: 'social',
        status: 'ongoing',
      },
    ],
    sustainabilityInitiatives: [
      {
        id: 'init-004',
        title: 'Sustainable Battery Production',
        description: 'Development of more sustainable battery manufacturing processes',
        targetYear: '2025',
        status: 'in-progress',
        impact: 'positive',
      },
    ],
    ratings: {
      msciesg: 'A',
      sustainalytics: 'Medium Risk',
      ftse4good: 'Not Included',
      dowJones: 'Not Included',
    },
  },
};

/**
 * Fetch ESG data for a specific company by name or ticker
 * @param identifier - Company name or ticker symbol
 * @returns Promise<ESGData> - ESG data for the company
 */
export async function fetchESGData(identifier: string): Promise<ESGData> {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Normalize identifier (uppercase for tickers, title case for names)
    const normalizedId = identifier.toUpperCase();
    
    // Check if we have sample data for this company
    if (SAMPLE_ESG_DATA[normalizedId]) {
      return SAMPLE_ESG_DATA[normalizedId];
    }

    // Simulate API call to external service
    const response = await fetch(`${API_CONFIG.baseUrl}/companies/${encodeURIComponent(identifier)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    if (!response.ok) {
      throw new ESGAPIError(
        `Failed to fetch ESG data: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data as ESGData;

  } catch (error) {
    if (error instanceof ESGAPIError) {
      throw error;
    }
    
    // For demo purposes, return a generic ESG data structure
    console.warn(`ESG data not found for ${identifier}, returning sample data`);
    
    return {
      companyId: identifier.toLowerCase().replace(/\s+/g, '-'),
      companyName: identifier,
      ticker: identifier.toUpperCase(),
      sector: 'Unknown',
      lastUpdated: new Date().toISOString().split('T')[0],
      esgScores: {
        environmental: Math.random() * 10,
        social: Math.random() * 10,
        governance: Math.random() * 10,
        overall: Math.random() * 10,
      },
      impactMetrics: {
        carbonFootprint: Math.random() * 100,
        waterUsage: Math.random() * 200000,
        wasteGenerated: Math.random() * 50000,
        renewableEnergyPercentage: Math.random() * 100,
        employeeSatisfaction: Math.random() * 10,
        diversityScore: Math.random() * 10,
        boardIndependence: Math.random() * 100,
        executivePayRatio: Math.random() * 2000,
      },
      controversies: [],
      sustainabilityInitiatives: [],
      ratings: {
        msciesg: 'N/A',
        sustainalytics: 'N/A',
        ftse4good: 'N/A',
        dowJones: 'N/A',
      },
    };
  }
}

/**
 * Search for companies based on ESG criteria
 * @param params - Search parameters
 * @returns Promise<ESGSearchResponse> - Search results
 */
export async function searchESGCompanies(params: ESGSearchParams): Promise<ESGSearchResponse> {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Convert sample data to array for searching
    const allCompanies = Object.values(SAMPLE_ESG_DATA);
    
    let filteredCompanies = allCompanies;

    // Apply filters
    if (params.companyName) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.companyName.toLowerCase().includes(params.companyName!.toLowerCase())
      );
    }

    if (params.ticker) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.ticker.toLowerCase().includes(params.ticker!.toLowerCase())
      );
    }

    if (params.sector) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.sector.toLowerCase().includes(params.sector!.toLowerCase())
      );
    }

    if (params.minScore !== undefined) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.esgScores.overall >= params.minScore!
      );
    }

    if (params.maxScore !== undefined) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.esgScores.overall <= params.maxScore!
      );
    }

    return {
      data: filteredCompanies,
      total: filteredCompanies.length,
      page: 1,
      limit: filteredCompanies.length,
      hasMore: false,
    };

  } catch (error) {
    throw new ESGAPIError(`Failed to search ESG companies: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get ESG data for multiple companies by their identifiers
 * @param identifiers - Array of company names or ticker symbols
 * @returns Promise<ESGData[]> - Array of ESG data
 */
export async function fetchMultipleESGData(identifiers: string[]): Promise<ESGData[]> {
  try {
    const promises = identifiers.map(id => fetchESGData(id));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<ESGData> => result.status === 'fulfilled')
      .map(result => result.value);
  } catch (error) {
    throw new ESGAPIError(`Failed to fetch multiple ESG data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get ESG data for companies in a specific sector
 * @param sector - Sector name
 * @returns Promise<ESGData[]> - Array of ESG data for companies in the sector
 */
export async function fetchESGDataBySector(sector: string): Promise<ESGData[]> {
  try {
    const allCompanies = Object.values(SAMPLE_ESG_DATA);
    return allCompanies.filter(company =>
      company.sector.toLowerCase().includes(sector.toLowerCase())
    );
  } catch (error) {
    throw new ESGAPIError(`Failed to fetch ESG data by sector: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

import { esgCacheService } from '../services/esgCacheService';

/**
 * Fetch ESG scores from FinancialModelingPrep API with intelligent caching
 * @param ticker - Company ticker symbol (e.g., 'AAPL', 'MSFT')
 * @returns Promise<FMPESGScores | null> - ESG scores or null if fetch fails
 */
export async function fetchESGScores(ticker: string): Promise<FMPESGScores | null> {
  const normalizedTicker = ticker.toUpperCase();
  
  try {
    // First, try to get from cache
    const cachedData = await esgCacheService.getESGData(normalizedTicker);
    if (cachedData) {
      return cachedData;
    }

    // Check rate limits before making API call
    if (!esgCacheService.canMakeAPIRequest('esg')) {
      console.warn(`Rate limit exceeded for ESG API, skipping ${normalizedTicker}`);
      return null;
    }

    const apiKey = import.meta.env.VITE_FMP_API_KEY;
    
    if (!apiKey) {
      console.warn('VITE_FMP_API_KEY not found in environment variables');
      return null;
    }

    console.log(`Fetching live ESG data for: ${normalizedTicker}`);
    const url = `https://financialmodelingprep.com/api/v3/esg-environmental-social-governance/${normalizedTicker}?apikey=${apiKey}`;
    
    const response = await axios.get<FMPESGScores[]>(url, {
      timeout: 10000, // 10 second timeout
    });

    if (!response.data || response.data.length === 0) {
      console.warn(`No ESG data found for ticker: ${normalizedTicker}`);
      return null;
    }

    // Get the first object from the array
    const esgData = response.data[0];
    
    // Cache the successful response
    await esgCacheService.setESGData(normalizedTicker, esgData);
    
    console.log(`Successfully fetched and cached ESG data for: ${normalizedTicker}`);
    return esgData;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.warn(`ESG data not found for ticker: ${normalizedTicker}`);
      } else if (error.response?.status === 401) {
        console.error('Invalid API key for FinancialModelingPrep');
      } else if (error.response?.status === 429) {
        console.error('API rate limit exceeded');
        // Note: Rate limiting is also handled proactively by cache service
      } else {
        console.error(`API request failed for ${normalizedTicker}:`, error.response?.statusText || error.message);
      }
    } else {
      console.error(`Unexpected error fetching ESG scores for ${normalizedTicker}:`, error);
    }
    
    return null;
  }
} 