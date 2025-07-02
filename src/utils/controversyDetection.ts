/**
 * Controversy Detection Utility
 * 
 * Analyzes ESG news articles to identify potentially controversial content
 * using keyword matching and contextual analysis
 */

import { NewsArticle } from '../api/newsApi';

// Controversy keywords categorized by severity and type
const CONTROVERSY_KEYWORDS = {
  high: [
    'lawsuit', 'fraud', 'scandal', 'corruption', 'bribery', 'violation', 
    'illegal', 'criminal', 'felony', 'indictment', 'guilty', 'convicted',
    'fined', 'penalty', 'sanctions', 'banned', 'suspended', 'terminated'
  ],
  medium: [
    'protest', 'boycott', 'breach', 'misconduct', 'allegation', 'accused',
    'investigation', 'probe', 'inquiry', 'criticism', 'controversy', 
    'disputed', 'questioned', 'challenged', 'recalled', 'warning'
  ],
  low: [
    'concern', 'issue', 'problem', 'risk', 'threat', 'challenge',
    'decline', 'drop', 'fall', 'loss', 'deficit', 'shortfall'
  ]
};

// ESG-specific controversy indicators
const ESG_CONTROVERSY_KEYWORDS = {
  environmental: [
    'pollution', 'contamination', 'spill', 'leak', 'toxic', 'emissions',
    'deforestation', 'greenwashing', 'climate denial', 'carbon fraud',
    'environmental damage', 'ecosystem destruction', 'biodiversity loss'
  ],
  social: [
    'discrimination', 'harassment', 'labor violation', 'child labor',
    'unsafe working', 'human rights', 'wage theft', 'exploitation',
    'workplace death', 'injury', 'safety violation', 'union busting'
  ],
  governance: [
    'board misconduct', 'executive scandal', 'shareholder fraud',
    'insider trading', 'conflicts of interest', 'governance failure',
    'transparency issues', 'accounting fraud', 'audit problems'
  ]
};

// Positive ESG indicators (to balance false positives)
const POSITIVE_KEYWORDS = [
  'award', 'recognition', 'achievement', 'milestone', 'success',
  'improvement', 'progress', 'innovation', 'leadership', 'best practice',
  'certification', 'accreditation', 'commitment', 'pledge', 'initiative'
];

// Controversy analysis result
export interface ControversyAnalysis {
  isControversial: boolean;
  severity: 'low' | 'medium' | 'high';
  category: 'environmental' | 'social' | 'governance' | 'general';
  confidence: number; // 0-1 scale
  keywords: string[];
  summary: string;
}

/**
 * Analyze article for controversial content
 * @param article - News article to analyze
 * @returns ControversyAnalysis - Detailed controversy analysis
 */
export function analyzeControversy(article: NewsArticle): ControversyAnalysis {
  const text = `${article.title} ${article.description}`.toLowerCase();
  const words = text.split(/\s+/);
  
  // Track found keywords by category
  const foundKeywords: { [key: string]: string[] } = {
    high: [],
    medium: [],
    low: [],
    environmental: [],
    social: [],
    governance: [],
    positive: []
  };

  // Check for controversy keywords
  Object.entries(CONTROVERSY_KEYWORDS).forEach(([severity, keywords]) => {
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        foundKeywords[severity].push(keyword);
      }
    });
  });

  // Check for ESG-specific keywords
  Object.entries(ESG_CONTROVERSY_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        foundKeywords[category].push(keyword);
      }
    });
  });

  // Check for positive indicators
  POSITIVE_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      foundKeywords.positive.push(keyword);
    }
  });

  // Calculate controversy score
  const scores = {
    high: foundKeywords.high.length * 3,
    medium: foundKeywords.medium.length * 2,
    low: foundKeywords.low.length * 1,
    environmental: foundKeywords.environmental.length * 1.5,
    social: foundKeywords.social.length * 1.5,
    governance: foundKeywords.governance.length * 1.5,
    positive: foundKeywords.positive.length * -1 // Positive words reduce controversy score
  };

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  
  // Determine primary category
  const categoryScores = {
    environmental: foundKeywords.environmental.length,
    social: foundKeywords.social.length,
    governance: foundKeywords.governance.length
  };
  
  const primaryCategory = Object.entries(categoryScores).reduce(
    (max, [category, score]) => score > max.score ? { category, score } : max,
    { category: 'general', score: 0 }
  ).category as 'environmental' | 'social' | 'governance' | 'general';

  // Determine severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (foundKeywords.high.length > 0 || totalScore >= 6) {
    severity = 'high';
  } else if (foundKeywords.medium.length > 0 || totalScore >= 3) {
    severity = 'medium';
  }

  // Calculate confidence (0-1)
  const confidence = Math.min(1, Math.max(0, totalScore / 10));
  
  // Determine if controversial
  const isControversial = totalScore >= 1 && foundKeywords.positive.length < foundKeywords.high.length + foundKeywords.medium.length;

  // Compile all found keywords
  const allKeywords = [
    ...foundKeywords.high,
    ...foundKeywords.medium,
    ...foundKeywords.environmental,
    ...foundKeywords.social,
    ...foundKeywords.governance
  ];

  // Generate summary
  const summary = generateControversySummary(isControversial, severity, primaryCategory, allKeywords);

  return {
    isControversial,
    severity,
    category: primaryCategory,
    confidence,
    keywords: allKeywords,
    summary
  };
}

/**
 * Generate human-readable controversy summary
 * @param isControversial - Whether content is controversial
 * @param severity - Severity level
 * @param category - Primary ESG category
 * @param keywords - Found keywords
 * @returns string - Summary description
 */
function generateControversySummary(
  isControversial: boolean, 
  severity: string, 
  category: string, 
  keywords: string[]
): string {
  if (!isControversial) {
    return 'No significant controversy indicators detected.';
  }

  const categoryLabels = {
    environmental: 'Environmental',
    social: 'Social',
    governance: 'Governance',
    general: 'General ESG'
  };

  const severityLabels = {
    low: 'Minor concerns',
    medium: 'Moderate issues',
    high: 'Serious allegations'
  };

  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || 'General ESG';
  const severityLabel = severityLabels[severity as keyof typeof severityLabels] || 'Issues';

  if (keywords.length > 0) {
    const keywordsList = keywords.slice(0, 3).join(', ');
    return `${severityLabel} detected in ${categoryLabel} context (${keywordsList}).`;
  }

  return `${severityLabel} detected in ${categoryLabel} context.`;
}

/**
 * Batch analyze multiple articles for controversies
 * @param articles - Array of news articles
 * @returns ControversyAnalysis[] - Array of controversy analyses
 */
export function batchAnalyzeControversies(articles: NewsArticle[]): ControversyAnalysis[] {
  return articles.map(article => analyzeControversy(article));
}

/**
 * Filter articles by controversy level
 * @param articles - Array of news articles
 * @param analysisResults - Array of controversy analyses
 * @param severityFilter - Minimum severity to include
 * @returns NewsArticle[] - Filtered articles
 */
export function filterByControversy(
  articles: NewsArticle[],
  analysisResults: ControversyAnalysis[],
  severityFilter: 'low' | 'medium' | 'high' = 'medium'
): NewsArticle[] {
  const severityOrder = { low: 1, medium: 2, high: 3 };
  const minSeverity = severityOrder[severityFilter];

  return articles.filter((article, index) => {
    const analysis = analysisResults[index];
    return analysis.isControversial && 
           severityOrder[analysis.severity] >= minSeverity;
  });
}

/**
 * Get controversy statistics for a set of articles
 * @param analysisResults - Array of controversy analyses
 * @returns Object with controversy statistics
 */
export function getControversyStats(analysisResults: ControversyAnalysis[]) {
  const total = analysisResults.length;
  const controversial = analysisResults.filter(a => a.isControversial).length;
  
  const bySeverity = {
    high: analysisResults.filter(a => a.severity === 'high').length,
    medium: analysisResults.filter(a => a.severity === 'medium').length,
    low: analysisResults.filter(a => a.severity === 'low').length
  };
  
  const byCategory = {
    environmental: analysisResults.filter(a => a.category === 'environmental').length,
    social: analysisResults.filter(a => a.category === 'social').length,
    governance: analysisResults.filter(a => a.category === 'governance').length,
    general: analysisResults.filter(a => a.category === 'general').length
  };

  return {
    total,
    controversial,
    controversyRate: total > 0 ? (controversial / total) * 100 : 0,
    bySeverity,
    byCategory
  };
}

/**
 * Check if keyword indicates positive ESG news
 * @param text - Text to analyze
 * @returns boolean - Whether text contains positive indicators
 */
export function hasPositiveIndicators(text: string): boolean {
  const lowerText = text.toLowerCase();
  return POSITIVE_KEYWORDS.some(keyword => lowerText.includes(keyword));
} 