import { PortfolioHolding, PortfolioESGAnalysis, ESGBenchmark, ESGData } from '../types/index';
import { getUnifiedESGData, generateDemoESGData, UnifiedESGData } from './esgDataService';
import { companies } from '../data/companies';
import { tickerService } from './tickerService';

// ESG Benchmark data
export const ESG_BENCHMARKS: ESGBenchmark[] = [
  {
    name: 'MSCI ESG Leaders',
    totalScore: 7.8,
    environmentalScore: 7.9,
    socialScore: 7.7,
    governanceScore: 7.8,
    description: 'Companies with the highest ESG scores in each sector'
  },
  {
    name: 'S&P 500 ESG',
    totalScore: 6.8,
    environmentalScore: 6.5,
    socialScore: 7.0,
    governanceScore: 6.9,
    description: 'S&P 500 companies with strong ESG practices'
  },
  {
    name: 'FTSE4Good Index',
    totalScore: 7.5,
    environmentalScore: 7.6,
    socialScore: 7.4,
    governanceScore: 7.5,
    description: 'Global index of companies meeting ESG criteria'
  },
  {
    name: 'Market Average',
    totalScore: 5.8,
    environmentalScore: 5.5,
    socialScore: 6.0,
    governanceScore: 5.9,
    description: 'Average ESG scores across all public companies'
  }
];

// Mock ESG data for common tickers not in our database
const MOCK_ESG_DATA: Record<string, ESGData> = {
  // Technology
  'GOOGL': { overallScore: 7.2, environmentalScore: 7.0, socialScore: 7.5, governanceScore: 7.1 },
  'META': { overallScore: 5.8, environmentalScore: 6.2, socialScore: 5.1, governanceScore: 6.1 },
  'NFLX': { overallScore: 6.8, environmentalScore: 6.5, socialScore: 7.2, governanceScore: 6.7 },
  'CRM': { overallScore: 8.1, environmentalScore: 7.8, socialScore: 8.5, governanceScore: 8.0 },
  
  // Finance
  'JPM': { overallScore: 6.4, environmentalScore: 5.8, socialScore: 6.7, governanceScore: 6.7 },
  'BRK.A': { overallScore: 6.2, environmentalScore: 5.9, socialScore: 6.5, governanceScore: 6.2 },
  'BRK.B': { overallScore: 6.2, environmentalScore: 5.9, socialScore: 6.5, governanceScore: 6.2 },
  
  // Healthcare
  'JNJ': { overallScore: 7.5, environmentalScore: 7.2, socialScore: 7.8, governanceScore: 7.5 },
  'PFE': { overallScore: 7.1, environmentalScore: 6.8, socialScore: 7.4, governanceScore: 7.1 },
  'UNH': { overallScore: 6.9, environmentalScore: 6.5, socialScore: 7.2, governanceScore: 7.0 },
  
  // Consumer
  'KO': { overallScore: 6.7, environmentalScore: 6.0, socialScore: 7.1, governanceScore: 7.0 },
  'PEP': { overallScore: 7.0, environmentalScore: 6.8, socialScore: 7.2, governanceScore: 7.0 },
  'WMT': { overallScore: 6.5, environmentalScore: 6.2, socialScore: 6.8, governanceScore: 6.5 },
  
  // Energy
  'XOM': { overallScore: 4.2, environmentalScore: 3.5, socialScore: 4.8, governanceScore: 4.3 },
  'CVX': { overallScore: 4.8, environmentalScore: 4.2, socialScore: 5.2, governanceScore: 5.0 },
  
  // ETFs
  'SPY': { overallScore: 5.8, environmentalScore: 5.5, socialScore: 6.0, governanceScore: 5.9 },
  'QQQ': { overallScore: 6.5, environmentalScore: 6.2, socialScore: 6.7, governanceScore: 6.6 },
  'VTI': { overallScore: 5.8, environmentalScore: 5.5, socialScore: 6.0, governanceScore: 5.9 },
  'VOO': { overallScore: 5.8, environmentalScore: 5.5, socialScore: 6.0, governanceScore: 5.9 }
};

export class PortfolioService {
  // Fetch ESG data for a single ticker
  async fetchTickerESGData(ticker: string): Promise<{ 
    esgData: ESGData | null; 
    unifiedESGData: UnifiedESGData | null;
    isLiveData: boolean; 
    companyName?: string; 
    sector?: string 
  }> {
    try {
      // First try to find in our company database
      const company = companies.find(c => 
        c.ticker?.toLowerCase() === ticker.toLowerCase() ||
        c.name.toLowerCase().includes(ticker.toLowerCase())
      );

      if (company) {
        const esgData: ESGData = {
          overallScore: company.impactScore,
          environmentalScore: company.esgScores.environmental,
          socialScore: company.esgScores.social,
          governanceScore: company.esgScores.governance
        };
        
        // Create unified ESG data from company data
        const unifiedESGData: UnifiedESGData = {
          symbol: company.ticker,
          companyName: company.name,
          sector: company.sector,
          esgScore: company.impactScore,
          environmentScore: company.esgScores.environmental,
          socialScore: company.esgScores.social,
          governanceScore: company.esgScores.governance,
          dataSource: 'prototype',
          lastUpdated: company.lastUpdated,
          prototypeData: {
            logo: company.logo,
            summary: company.summary,
            controversies: company.controversies,
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
        
        return {
          esgData,
          unifiedESGData,
          isLiveData: true,
          companyName: company.name,
          sector: company.sector
        };
      }

      // Try live API data or prototype data
      const unifiedData = await getUnifiedESGData(ticker);
      if (unifiedData) {
        const esgData: ESGData = {
          overallScore: unifiedData.esgScore,
          environmentalScore: unifiedData.environmentScore,
          socialScore: unifiedData.socialScore,
          governanceScore: unifiedData.governanceScore
        };
        return {
          esgData,
          unifiedESGData: unifiedData,
          isLiveData: unifiedData.dataSource === 'live',
          companyName: unifiedData.companyName,
          sector: unifiedData.sector
        };
      }

      // Check if ticker exists in our ticker service for demo data
      const tickerInfo = tickerService.getTickerBySymbol(ticker);
      if (tickerInfo) {
        const demoData = generateDemoESGData(ticker, tickerInfo);
        const esgData: ESGData = {
          overallScore: demoData.esgScore,
          environmentalScore: demoData.environmentScore,
          socialScore: demoData.socialScore,
          governanceScore: demoData.governanceScore
        };
        return {
          esgData,
          unifiedESGData: demoData,
          isLiveData: false,
          companyName: tickerInfo.name,
          sector: 'Unknown'
        };
      }

      // Fall back to mock data
      const mockData = MOCK_ESG_DATA[ticker.toUpperCase()];
      if (mockData) {
        return {
          esgData: mockData,
          unifiedESGData: null,
          isLiveData: false,
          companyName: ticker.toUpperCase()
        };
      }

      return { esgData: null, unifiedESGData: null, isLiveData: false };
    } catch (error) {
      console.error(`Error fetching ESG data for ${ticker}:`, error);
      return { esgData: null, unifiedESGData: null, isLiveData: false };
    }
  }

  // Analyze portfolio ESG performance
  async analyzePortfolio(holdings: PortfolioHolding[]): Promise<PortfolioESGAnalysis> {
    const validHoldings = holdings.filter(h => h.esgData);
    const totalWeight = holdings.reduce((sum, h) => sum + (h.weight || 1), 0);

    if (validHoldings.length === 0) {
      return {
        totalScore: 0,
        averageScore: 0,
        environmentalScore: 0,
        socialScore: 0,
        governanceScore: 0,
        totalWeight,
        coveragePercentage: 0,
        holdings
      };
    }

    // Calculate weighted scores if weights are provided, otherwise use equal weights
    const hasWeights = holdings.some(h => h.weight !== undefined);
    
    let weightedTotalScore = 0;
    let weightedEnvironmentalScore = 0;
    let weightedSocialScore = 0;
    let weightedGovernanceScore = 0;
    let validWeight = 0;

    validHoldings.forEach(holding => {
      const weight = hasWeights ? (holding.weight || 0) : 1;
      const esg = holding.esgData!;
      
      weightedTotalScore += esg.overallScore * weight;
      weightedEnvironmentalScore += esg.environmentalScore * weight;
      weightedSocialScore += esg.socialScore * weight;
      weightedGovernanceScore += esg.governanceScore * weight;
      validWeight += weight;
    });

    const coverageWeight = validHoldings.reduce((sum, h) => sum + (h.weight || 1), 0);
    const coveragePercentage = (coverageWeight / totalWeight) * 100;

    return {
      totalScore: weightedTotalScore / validWeight,
      averageScore: weightedTotalScore / validWeight,
      environmentalScore: weightedEnvironmentalScore / validWeight,
      socialScore: weightedSocialScore / validWeight,
      governanceScore: weightedGovernanceScore / validWeight,
      totalWeight,
      coveragePercentage,
      holdings
    };
  }

  // Parse CSV content
  parseCSV(csvContent: string): PortfolioHolding[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    const tickerIndex = headers.findIndex(h => 
      h.includes('ticker') || h.includes('symbol') || h.includes('stock')
    );
    const weightIndex = headers.findIndex(h => 
      h.includes('weight') || h.includes('allocation') || h.includes('percent') || h.includes('%')
    );

    if (tickerIndex === -1) {
      throw new Error('CSV must contain a ticker/symbol column');
    }

    const holdings: PortfolioHolding[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const ticker = values[tickerIndex]?.replace(/"/g, '').trim();
      
      if (ticker) {
        const weightStr = weightIndex >= 0 ? values[weightIndex]?.replace(/["%]/g, '').trim() : undefined;
        const weight = weightStr ? parseFloat(weightStr) : undefined;
        
        holdings.push({
          ticker: ticker.toUpperCase(),
          weight,
          isLiveData: false
        });
      }
    }

    return holdings;
  }

  // Fetch ESG data for multiple tickers
  async fetchPortfolioData(holdings: PortfolioHolding[]): Promise<PortfolioHolding[]> {
    const promises = holdings.map(async (holding) => {
      const result = await this.fetchTickerESGData(holding.ticker);
      return {
        ...holding,
        esgData: result.esgData || undefined,
        unifiedESGData: result.unifiedESGData || undefined,
        isLiveData: result.isLiveData,
        companyName: result.companyName,
        sector: result.sector
      };
    });

    return Promise.all(promises);
  }
}

export const portfolioService = new PortfolioService(); 