import axios from 'axios';
import { fetchWithFallback, getAPIStatus, forceRetryAPI } from '../utils/apiErrorHandler';
import fallbackNews from '../data/prototype/fallbackNews.json';

// GNews API configuration
const GNEWS_API_KEY = 'a99ba0f01690c84366f154eaafb42a73';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4/search';

// News article interface
export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

// GNews API response interface
interface GNewsResponse {
  totalArticles: number;
  articles: NewsArticle[];
}

// News query parameters
export interface NewsQueryParams {
  query: string;
  lang?: string;
  country?: string;
  max?: number;
  from?: string;
  to?: string;
  sortby?: 'publishedAt' | 'relevance';
}

/**
 * Fetch ESG news articles from GNews API with fallback support
 * @param params - Query parameters for news search
 * @returns Promise<{ data: NewsArticle[]; source: 'api' | 'fallback' | 'error'; notification?: any }> - News data with source info
 */
export async function fetchESGNews(params: NewsQueryParams): Promise<{
  data: NewsArticle[];
  source: 'api' | 'fallback' | 'error';
  notification?: any;
}> {
  const {
    query,
    lang = 'en',
    country,
    max = 20,
    from,
    to,
    sortby = 'publishedAt'
  } = params;

  const url = new URL(GNEWS_BASE_URL);
  url.searchParams.append('q', query);
  url.searchParams.append('lang', lang);
  url.searchParams.append('max', max.toString());
  url.searchParams.append('sortby', sortby);
  url.searchParams.append('token', GNEWS_API_KEY);

  if (country) url.searchParams.append('country', country);
  if (from) url.searchParams.append('from', from);
  if (to) url.searchParams.append('to', to);

  console.log(`Fetching ESG news for query: "${query}"`);

  const result = await fetchWithFallback<GNewsResponse>('GNews', {
    url: url.toString(),
    fallbackData: { totalArticles: fallbackNews.articles.length, articles: fallbackNews.articles },
    fetchFn: async () => {
      const response = await axios.get<GNewsResponse>(url.toString(), {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'Impactey-ESG-Platform/1.0'
        }
      });

      if (!response.data || !response.data.articles) {
        throw new Error(`No articles found for query: ${query}`);
      }

      return response.data;
    }
  });

  if (!result.data || !result.data.articles) {
    return { data: [], source: 'error' };
  }

  // Filter fallback articles to match query if using fallback
  let articles = result.data.articles;
  if (result.source === 'fallback') {
    // Simple filtering for demo data to make it seem more relevant
    const queryTerms = query.toLowerCase().split(' ');
    articles = articles.filter(article => 
      queryTerms.some(term => 
        article.title.toLowerCase().includes(term) ||
        article.description.toLowerCase().includes(term)
      )
    ).slice(0, max);
    
    // If no matches, return some fallback articles anyway
    if (articles.length === 0) {
      articles = result.data.articles.slice(0, Math.min(max, 5));
    }
  }

  console.log(`Successfully fetched ${articles.length} articles for: ${query} (source: ${result.source})`);
  
  return {
    data: articles,
    source: result.source,
    notification: result.notification
  };
}

/**
 * Fetch company-specific ESG news
 * @param companyName - Name of the company
 * @param ticker - Optional ticker symbol
 * @param maxArticles - Maximum number of articles to fetch
 * @returns Promise<{ data: NewsArticle[]; source: 'api' | 'fallback' | 'error'; notification?: any }> - Company ESG news with source info
 */
export async function fetchCompanyESGNews(
  companyName: string, 
  ticker?: string, 
  maxArticles: number = 15
): Promise<{ data: NewsArticle[]; source: 'api' | 'fallback' | 'error'; notification?: any }> {
  // Create search queries for better coverage
  const queries = [
    `"${companyName}" ESG`,
    `"${companyName}" sustainability`,
    ticker ? `"${ticker}" ESG` : `"${companyName}" environment`
  ].filter(Boolean);

  try {
    // Fetch news for each query and combine results
    const newsPromises = queries.slice(0, 2).map(query => // Limit to 2 queries to stay within rate limits
      fetchESGNews({
        query,
        max: Math.ceil(maxArticles / 2),
        sortby: 'publishedAt'
      })
    );

    const results = await Promise.allSettled(newsPromises);
    
    // Combine and deduplicate articles
    const allArticles: NewsArticle[] = [];
    const seenUrls = new Set<string>();
    let primarySource: 'api' | 'fallback' | 'error' = 'error';
    let notification: any = undefined;

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        // Use the source from the first successful result
        if (primarySource === 'error') {
          primarySource = result.value.source;
          notification = result.value.notification;
        }
        
        result.value.data.forEach(article => {
          if (!seenUrls.has(article.url)) {
            seenUrls.add(article.url);
            allArticles.push(article);
          }
        });
      }
    });

    // Sort by publish date (newest first) and limit
    const sortedArticles = allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, maxArticles);

    return {
      data: sortedArticles,
      source: primarySource,
      notification
    };

  } catch (error) {
    console.error(`Failed to fetch company ESG news for ${companyName}:`, error);
    return { data: [], source: 'error' };
  }
}

/**
 * Fetch general ESG news (industry-wide)
 * @param maxArticles - Maximum number of articles to fetch
 * @returns Promise<{ data: NewsArticle[]; source: 'api' | 'fallback' | 'error'; notification?: any }> - General ESG news with source info
 */
export async function fetchGeneralESGNews(maxArticles: number = 20): Promise<{ data: NewsArticle[]; source: 'api' | 'fallback' | 'error'; notification?: any }> {
  const queries = [
    'ESG investing',
    'sustainability reporting',
    'net zero emissions',
    'greenwashing',
    'ESG regulation'
  ];

  try {
    // Rotate through queries to get diverse content
    const selectedQuery = queries[Math.floor(Date.now() / (1000 * 60 * 60)) % queries.length];
    
    return await fetchESGNews({
      query: selectedQuery,
      max: maxArticles,
      sortby: 'publishedAt'
    });

  } catch (error) {
    console.error('Failed to fetch general ESG news:', error);
    return { data: [], source: 'error' };
  }
}

/**
 * Get news articles from the last N days
 * @param query - Search query
 * @param days - Number of days to look back
 * @param maxArticles - Maximum articles to return
 * @returns Promise<{ data: NewsArticle[]; source: 'api' | 'fallback' | 'error'; notification?: any }> - Recent news articles with source info
 */
export async function fetchRecentESGNews(
  query: string, 
  days: number = 7, 
  maxArticles: number = 10
): Promise<{ data: NewsArticle[]; source: 'api' | 'fallback' | 'error'; notification?: any }> {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  
  return await fetchESGNews({
    query,
    max: maxArticles,
    from: fromDate.toISOString().split('T')[0], // YYYY-MM-DD format
    sortby: 'publishedAt'
  });
} 