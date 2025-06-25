import { Company } from '../types/index';

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
  },
  {
    id: 'apple',
    name: 'Apple',
    sector: 'Technology',
    ticker: 'AAPL',
    logo: '🍎',
    esgScores: {
      environmental: 7.9,
      social: 6.8,
      governance: 7.5,
    },
    impactScore: 7.4,
    summary: 'Apple shows strong environmental performance with carbon neutrality goals and renewable energy initiatives, but faces social challenges related to supply chain labor practices and privacy concerns.',
    controversies: [
      { title: 'Supply chain labor rights in China', year: '2023', severity: 'high' },
      { title: 'App Store antitrust concerns', year: '2023', severity: 'medium' },
      { title: 'Right to repair restrictions', year: '2022', severity: 'medium' }
    ],
    lastUpdated: '2024-12-10'
  },
  {
    id: 'jpmorgan',
    name: 'JPMorgan Chase',
    sector: 'Financial Services',
    ticker: 'JPM',
    logo: '🏦',
    esgScores: {
      environmental: 6.2,
      social: 7.1,
      governance: 7.8,
    },
    impactScore: 7.0,
    summary: 'JPMorgan demonstrates strong governance and social responsibility but faces environmental challenges due to fossil fuel financing, though it has committed to net-zero emissions by 2050.',
    controversies: [
      { title: 'Fossil fuel financing and climate impact', year: '2023', severity: 'high' },
      { title: 'Consumer protection violations settlement', year: '2022', severity: 'medium' },
      { title: 'Executive compensation and pay ratio', year: '2023', severity: 'low' }
    ],
    lastUpdated: '2024-12-09'
  },
  {
    id: 'nestle',
    name: 'Nestlé',
    sector: 'Food & Beverage',
    ticker: 'NSRGY',
    logo: '☕',
    esgScores: {
      environmental: 6.8,
      social: 5.9,
      governance: 7.2,
    },
    impactScore: 6.6,
    summary: 'Nestlé has made progress in environmental sustainability but continues to face criticism over water usage, plastic packaging, and child labor in cocoa supply chains.',
    controversies: [
      { title: 'Water bottling and local community impact', year: '2023', severity: 'high' },
      { title: 'Child labor in cocoa supply chain', year: '2023', severity: 'high' },
      { title: 'Plastic packaging waste concerns', year: '2022', severity: 'medium' }
    ],
    lastUpdated: '2024-12-08'
  },
  {
    id: 'nextera',
    name: 'NextEra Energy',
    sector: 'Renewable Energy',
    ticker: 'NEE',
    logo: '⚡',
    esgScores: {
      environmental: 8.7,
      social: 7.3,
      governance: 7.9,
    },
    impactScore: 8.0,
    summary: 'NextEra Energy leads in renewable energy transition with strong environmental performance, though it faces some governance concerns related to political influence and regulatory relationships.',
    controversies: [
      { title: 'Political influence and lobbying activities', year: '2023', severity: 'medium' },
      { title: 'Land use conflicts for solar installations', year: '2022', severity: 'low' },
      { title: 'Grid reliability during extreme weather', year: '2023', severity: 'low' }
    ],
    lastUpdated: '2024-12-07'
  },
  {
    id: 'coca-cola',
    name: 'The Coca-Cola Company',
    sector: 'Beverages',
    ticker: 'KO',
    logo: '🥤',
    esgScores: {
      environmental: 5.9,
      social: 6.7,
      governance: 7.4,
    },
    impactScore: 6.7,
    summary: 'Coca-Cola faces environmental challenges related to plastic waste and water usage, but has strong governance and has made commitments to improve sustainability across its operations.',
    controversies: [
      { title: 'Plastic pollution and ocean waste', year: '2023', severity: 'high' },
      { title: 'Water usage in water-stressed regions', year: '2023', severity: 'medium' },
      { title: 'Sugar content and public health impact', year: '2022', severity: 'medium' }
    ],
    lastUpdated: '2024-12-06'
  },
  {
    id: 'blackrock',
    name: 'BlackRock',
    sector: 'Asset Management',
    ticker: 'BLK',
    logo: '📊',
    esgScores: {
      environmental: 7.1,
      social: 7.8,
      governance: 8.2,
    },
    impactScore: 7.7,
    summary: 'BlackRock has positioned itself as a leader in ESG investing and stewardship, though it faces criticism for continuing to invest in fossil fuel companies while advocating for climate action.',
    controversies: [
      { title: 'ESG investing hypocrisy and fossil fuel holdings', year: '2023', severity: 'high' },
      { title: 'Voting against climate resolutions', year: '2023', severity: 'medium' },
      { title: 'Executive compensation and pay ratio', year: '2022', severity: 'low' }
    ],
    lastUpdated: '2024-12-05'
  },
  {
    id: 'walmart',
    name: 'Walmart',
    sector: 'Retail',
    ticker: 'WMT',
    logo: '🛒',
    esgScores: {
      environmental: 6.4,
      social: 6.1,
      governance: 7.6,
    },
    impactScore: 6.7,
    summary: 'Walmart has made progress in environmental initiatives and supply chain sustainability, but continues to face social challenges related to labor practices and community impact.',
    controversies: [
      { title: 'Employee wages and working conditions', year: '2023', severity: 'high' },
      { title: 'Local business impact and community displacement', year: '2022', severity: 'medium' },
      { title: 'Supply chain labor standards', year: '2023', severity: 'medium' }
    ],
    lastUpdated: '2024-12-04'
  },
  {
    id: 'pfizer',
    name: 'Pfizer',
    sector: 'Healthcare',
    ticker: 'PFE',
    logo: '💊',
    esgScores: {
      environmental: 6.9,
      social: 8.1,
      governance: 7.7,
    },
    impactScore: 7.6,
    summary: 'Pfizer demonstrates strong social responsibility through healthcare access initiatives and COVID-19 vaccine development, with solid governance and environmental performance.',
    controversies: [
      { title: 'Drug pricing and access to medicines', year: '2023', severity: 'high' },
      { title: 'COVID-19 vaccine profit concerns', year: '2022', severity: 'medium' },
      { title: 'Clinical trial transparency', year: '2023', severity: 'low' }
    ],
    lastUpdated: '2024-12-03'
  },
  {
    id: 'chevron',
    name: 'Chevron',
    sector: 'Oil & Gas',
    ticker: 'CVX',
    logo: '🛢️',
    esgScores: {
      environmental: 3.8,
      social: 4.5,
      governance: 6.2,
    },
    impactScore: 4.8,
    summary: 'Chevron faces significant environmental challenges as a major fossil fuel producer, though it has made some investments in renewable energy and carbon capture technologies.',
    controversies: [
      { title: 'Climate change litigation and liability', year: '2023', severity: 'high' },
      { title: 'Environmental damage in Ecuador', year: '2023', severity: 'high' },
      { title: 'Transition to renewable energy pace', year: '2022', severity: 'medium' }
    ],
    lastUpdated: '2024-12-02'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    sector: 'Technology',
    ticker: 'CRM',
    logo: '☁️',
    esgScores: {
      environmental: 8.4,
      social: 8.7,
      governance: 8.1,
    },
    impactScore: 8.4,
    summary: 'Salesforce demonstrates excellent ESG performance with strong environmental initiatives, inclusive workplace policies, and commitment to stakeholder capitalism principles.',
    controversies: [
      { title: 'Data privacy and security concerns', year: '2023', severity: 'low' },
      { title: 'AI ethics and bias in algorithms', year: '2022', severity: 'low' },
      { title: 'Executive compensation levels', year: '2023', severity: 'low' }
    ],
    lastUpdated: '2024-12-01'
  },
  {
    id: 'johnson-johnson',
    name: 'Johnson & Johnson',
    sector: 'Healthcare',
    ticker: 'JNJ',
    logo: '🏥',
    esgScores: {
      environmental: 7.2,
      social: 7.5,
      governance: 6.8,
    },
    impactScore: 7.2,
    summary: 'Johnson & Johnson shows strong social responsibility in healthcare access but faces governance challenges related to product safety and legal settlements.',
    controversies: [
      { title: 'Talc powder safety and cancer lawsuits', year: '2023', severity: 'high' },
      { title: 'Opioid crisis legal settlements', year: '2023', severity: 'high' },
      { title: 'Product safety and quality control', year: '2022', severity: 'medium' }
    ],
    lastUpdated: '2024-11-30'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    sector: 'Entertainment',
    ticker: 'NFLX',
    logo: '📺',
    esgScores: {
      environmental: 7.6,
      social: 7.2,
      governance: 7.8,
    },
    impactScore: 7.5,
    summary: 'Netflix demonstrates good ESG performance with carbon neutral operations and inclusive content policies, though it faces some content moderation and data privacy challenges.',
    controversies: [
      { title: 'Content moderation and harmful content', year: '2023', severity: 'medium' },
      { title: 'Data privacy and user tracking', year: '2022', severity: 'low' },
      { title: 'Workplace culture and diversity', year: '2023', severity: 'low' }
    ],
    lastUpdated: '2024-11-29'
  },
  {
    id: 'disney',
    name: 'The Walt Disney Company',
    sector: 'Entertainment',
    ticker: 'DIS',
    logo: '🏰',
    esgScores: {
      environmental: 7.1,
      social: 7.8,
      governance: 7.3,
    },
    impactScore: 7.4,
    summary: 'Disney shows strong social responsibility through inclusive content and workplace diversity, with solid environmental initiatives and governance practices.',
    controversies: [
      { title: 'Content censorship and political influence', year: '2023', severity: 'medium' },
      { title: 'Theme park worker wages and conditions', year: '2022', severity: 'medium' },
      { title: 'Streaming content moderation', year: '2023', severity: 'low' }
    ],
    lastUpdated: '2024-11-28'
  },
  {
    id: 'starbucks',
    name: 'Starbucks',
    sector: 'Food & Beverage',
    ticker: 'SBUX',
    logo: '☕',
    esgScores: {
      environmental: 7.5,
      social: 7.2,
      governance: 7.6,
    },
    impactScore: 7.4,
    summary: 'Starbucks demonstrates strong environmental initiatives in sustainable sourcing and waste reduction, with good social responsibility and governance practices.',
    controversies: [
      { title: 'Unionization efforts and labor relations', year: '2023', severity: 'high' },
      { title: 'Coffee sourcing and fair trade practices', year: '2022', severity: 'medium' },
      { title: 'Single-use cup waste concerns', year: '2023', severity: 'low' }
    ],
    lastUpdated: '2024-11-27'
  },
  {
    id: 'nike',
    name: 'Nike',
    sector: 'Consumer Goods',
    ticker: 'NKE',
    logo: '👟',
    esgScores: {
      environmental: 6.8,
      social: 6.5,
      governance: 7.9,
    },
    impactScore: 7.1,
    summary: 'Nike has made progress in environmental sustainability and supply chain transparency, though it continues to face challenges related to labor practices in manufacturing.',
    controversies: [
      { title: 'Supply chain labor rights and working conditions', year: '2023', severity: 'high' },
      { title: 'Plastic waste from packaging and materials', year: '2022', severity: 'medium' },
      { title: 'Athlete endorsement controversies', year: '2023', severity: 'low' }
    ],
    lastUpdated: '2024-11-26'
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