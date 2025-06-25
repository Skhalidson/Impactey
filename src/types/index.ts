export interface Company {
  id: string;
  name: string;
  sector: string;
  ticker: string;
  logo: string;
  esgScores: {
    environmental: number;
    social: number;
    governance: number;
  };
  impactScore: number;
  summary: string;
  controversies: Array<{
    title: string;
    year: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  lastUpdated: string;
}

export interface Route {
  path: string;
  component: React.ComponentType<any>;
}

export interface PortfolioHolding {
  ticker: string;
  weight?: number;
  companyName?: string;
  esgData?: ESGData;
  isLiveData: boolean;
  sector?: string;
}

export interface PortfolioESGAnalysis {
  totalScore: number;
  averageScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  totalWeight: number;
  coveragePercentage: number;
  holdings: PortfolioHolding[];
}

export interface ESGBenchmark {
  name: string;
  totalScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  description: string;
}

export interface ESGData {
  overallScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  controversyScore?: number;
  lastUpdated?: string;
}