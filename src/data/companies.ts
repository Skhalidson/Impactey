import { Company } from '../types';

export const companies: Company[] = [
  {
    id: 'tesla',
    name: 'Tesla',
    sector: 'Clean Technology',
    ticker: 'TSLA',
    logo: '🔋',
    esgScores: {
      environmental: 7.8,
      social: 5.4,
      governance: 6.1,
    },
    impactScore: 6.4,
    summary: 'Tesla scores high on Environmental due to its EV leadership and renewable energy initiatives, but faces challenges in Social and Governance areas due to supply chain concerns and board independence issues.',
    controversies: [
      { title: 'Cobalt mining labor rights concerns', year: '2023', severity: 'high' },
      { title: 'Governance structure and board independence', year: '2022', severity: 'medium' },
      { title: 'Factory working conditions reports', year: '2023', severity: 'medium' }
    ],
    lastUpdated: '2024-12-15'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    sector: 'Technology',
    ticker: 'MSFT',
    logo: '💻',
    esgScores: {
      environmental: 8.2,
      social: 7.9,
      governance: 8.5,
    },
    impactScore: 8.2,
    summary: 'Microsoft demonstrates strong performance across all ESG dimensions with its carbon negative commitment, inclusive workplace policies, and robust governance structures.',
    controversies: [
      { title: 'Privacy concerns with data collection', year: '2023', severity: 'low' },
      { title: 'AI ethics and bias in algorithms', year: '2022', severity: 'medium' }
    ],
    lastUpdated: '2024-12-14'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    sector: 'E-commerce & Cloud',
    ticker: 'AMZN',
    logo: '📦',
    esgScores: {
      environmental: 6.5,
      social: 5.8,
      governance: 7.1,
    },
    impactScore: 6.5,
    summary: 'Amazon shows mixed ESG performance with strong governance but environmental and social challenges related to carbon footprint, labor practices, and warehouse working conditions.',
    controversies: [
      { title: 'Warehouse worker safety and conditions', year: '2023', severity: 'high' },
      { title: 'Carbon footprint from shipping operations', year: '2023', severity: 'medium' },
      { title: 'Anti-competitive practices investigation', year: '2022', severity: 'medium' }
    ],
    lastUpdated: '2024-12-13'
  },
  {
    id: 'unilever',
    name: 'Unilever',
    sector: 'Consumer Goods',
    ticker: 'UL',
    logo: '🧴',
    esgScores: {
      environmental: 8.1,
      social: 8.3,
      governance: 7.8,
    },
    impactScore: 8.1,
    summary: 'Unilever leads in sustainability with strong environmental initiatives, social impact programs, and commitment to sustainable sourcing across its global supply chain.',
    controversies: [
      { title: 'Plastic packaging reduction targets missed', year: '2023', severity: 'low' },
      { title: 'Supply chain transparency in developing markets', year: '2022', severity: 'low' }
    ],
    lastUpdated: '2024-12-12'
  },
  {
    id: 'exxonmobil',
    name: 'ExxonMobil',
    sector: 'Oil & Gas',
    ticker: 'XOM',
    logo: '⛽',
    esgScores: {
      environmental: 3.2,
      social: 4.1,
      governance: 5.8,
    },
    impactScore: 4.4,
    summary: 'ExxonMobil faces significant ESG challenges primarily in environmental impact due to fossil fuel operations, though it has made recent investments in carbon capture and low-carbon solutions.',
    controversies: [
      { title: 'Climate change disclosure and lobbying', year: '2023', severity: 'high' },
      { title: 'Environmental spills and safety incidents', year: '2022', severity: 'high' },
      { title: 'Transition to renewable energy timeline', year: '2023', severity: 'medium' }
    ],
    lastUpdated: '2024-12-11'
  }
];

export const findCompanyById = (id: string): Company | undefined => {
  return companies.find(company => company.id === id);
};

export const searchCompanies = (query: string): Company[] => {
  if (!query.trim()) return companies;
  
  const lowercaseQuery = query.toLowerCase();
  return companies.filter(company => 
    company.name.toLowerCase().includes(lowercaseQuery) ||
    company.sector.toLowerCase().includes(lowercaseQuery) ||
    company.ticker.toLowerCase().includes(lowercaseQuery)
  );
};