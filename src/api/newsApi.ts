import axios from 'axios';

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
 * Fetch ESG news articles from GNews API
 * @param params - Query parameters for news search
 * @returns Promise<NewsArticle[]> - Array of news articles
 */
export async function fetchESGNews(params: NewsQueryParams): Promise<NewsArticle[]> {
  try {
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

    const response = await axios.get<GNewsResponse>(url.toString(), {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Impactey-ESG-Platform/1.0'
      }
    });

    if (!response.data || !response.data.articles) {
      console.warn(`No articles found for query: ${query}`);
      return [];
    }

    console.log(`Successfully fetched ${response.data.articles.length} articles for: ${query}`);
    return response.data.articles;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error('Invalid API key for GNews');
      } else if (error.response?.status === 429) {
        console.error('GNews API rate limit exceeded');
      } else if (error.response?.status === 403) {
        console.error('GNews API access forbidden - check quota');
      } else {
        console.error(`GNews API request failed: ${error.response?.statusText || error.message}`);
      }
    } else {
      console.error(`Unexpected error fetching news: ${error}`);
    }
    
    return [];
  }
}

/**
 * Fetch company-specific ESG news
 * @param companyName - Name of the company
 * @param ticker - Optional ticker symbol
 * @param maxArticles - Maximum number of articles to fetch
 * @returns Promise<NewsArticle[]> - Array of company ESG news
 */
export async function fetchCompanyESGNews(
  companyName: string, 
  ticker?: string, 
  maxArticles: number = 15
): Promise<NewsArticle[]> {
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

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        result.value.forEach(article => {
          if (!seenUrls.has(article.url)) {
            seenUrls.add(article.url);
            allArticles.push(article);
          }
        });
      }
    });

    // Sort by publish date (newest first) and limit
    return allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, maxArticles);

  } catch (error) {
    console.error(`Failed to fetch company ESG news for ${companyName}:`, error);
    return [];
  }
}

/**
 * Fetch general ESG news (industry-wide)
 * @param maxArticles - Maximum number of articles to fetch
 * @returns Promise<NewsArticle[]> - Array of general ESG news
 */
export async function fetchGeneralESGNews(maxArticles: number = 20): Promise<NewsArticle[]> {
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
    return [];
  }
}

/**
 * Get news articles from the last N days
 * @param query - Search query
 * @param days - Number of days to look back
 * @param maxArticles - Maximum articles to return
 * @returns Promise<NewsArticle[]> - Recent news articles
 */
export async function fetchRecentESGNews(
  query: string, 
  days: number = 7, 
  maxArticles: number = 10
): Promise<NewsArticle[]> {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  
  return await fetchESGNews({
    query,
    max: maxArticles,
    from: fromDate.toISOString().split('T')[0], // YYYY-MM-DD format
    sortby: 'publishedAt'
  });
} 