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