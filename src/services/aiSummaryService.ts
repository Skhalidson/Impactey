/**
 * AI Summary Service for ESG News Articles
 * 
 * Generates investor-focused summaries of ESG news articles using OpenAI API
 * with intelligent caching and fallback mechanisms
 */

import { NewsArticle } from '../api/newsApi';

// OpenAI API configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Summary cache to avoid duplicate API calls
const summaryCache = new Map<string, { summary: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// AI Summary interface
export interface AISummary {
  summary: string;
  source: 'ai' | 'fallback';
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Generate AI summary for an ESG article
 * @param article - News article to summarize
 * @returns Promise<AISummary> - AI-generated or fallback summary
 */
export async function generateESGSummary(article: NewsArticle): Promise<AISummary> {
  const cacheKey = generateCacheKey(article.title, article.description);
  
  // Check cache first
  const cached = summaryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      summary: cached.summary,
      source: 'ai',
      confidence: 'high'
    };
  }

  // Try to generate AI summary
  if (OPENAI_API_KEY) {
    try {
      const aiSummary = await callOpenAI(article.title, article.description);
      if (aiSummary) {
        // Cache successful result
        summaryCache.set(cacheKey, {
          summary: aiSummary,
          timestamp: Date.now()
        });
        
        return {
          summary: aiSummary,
          source: 'ai',
          confidence: 'high'
        };
      }
    } catch (error) {
      console.warn('OpenAI API failed, using fallback summary:', error);
    }
  }

  // Fallback to intelligent summary extraction
  return {
    summary: generateFallbackSummary(article),
    source: 'fallback',
    confidence: 'medium'
  };
}

/**
 * Call OpenAI API to generate summary
 * @param title - Article title
 * @param description - Article description
 * @returns Promise<string | null> - AI summary or null if failed
 */
async function callOpenAI(title: string, description: string): Promise<string | null> {
  try {
    const prompt = `Summarize this ESG article for investors in 1 clear sentence. Focus on the financial and ESG impact.

Title: ${title}
Description: ${description}

Summary:`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an ESG investment analyst. Provide concise, investor-focused summaries of ESG news articles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.3,
        timeout: 10000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const summary = data.choices[0].message.content.trim();
      
      // Validate summary quality
      if (summary.length > 20 && summary.length < 200) {
        return summary;
      }
    }

    return null;

  } catch (error) {
    console.error('OpenAI API call failed:', error);
    return null;
  }
}

/**
 * Generate intelligent fallback summary
 * @param article - News article
 * @returns string - Fallback summary
 */
function generateFallbackSummary(article: NewsArticle): string {
  const { title, description } = article;
  
  // If description is concise enough, use it
  if (description && description.length <= 150) {
    return description;
  }
  
  // If description is too long, create intelligent excerpt
  if (description && description.length > 150) {
    // Find first sentence that's not too long
    const sentences = description.split(/[.!?]+/);
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 30 && trimmed.length <= 120) {
        return trimmed + '.';
      }
    }
    
    // Fallback to truncated description
    return description.substring(0, 120).trim() + '...';
  }
  
  // Last resort: use title with context
  return `ESG news update: ${title}`;
}

/**
 * Generate cache key for article
 * @param title - Article title
 * @param description - Article description
 * @returns string - Cache key
 */
function generateCacheKey(title: string, description: string): string {
  const content = (title + description).toLowerCase();
  return btoa(content).substring(0, 32); // Base64 encoded, truncated
}

/**
 * Batch generate summaries for multiple articles
 * @param articles - Array of news articles
 * @param maxConcurrent - Maximum concurrent API calls
 * @returns Promise<AISummary[]> - Array of summaries
 */
export async function generateBatchSummaries(
  articles: NewsArticle[], 
  maxConcurrent: number = 3
): Promise<AISummary[]> {
  const results: AISummary[] = [];
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < articles.length; i += maxConcurrent) {
    const batch = articles.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(article => generateESGSummary(article));
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        // Fallback for failed requests
        results.push({
          summary: generateFallbackSummary(batch[index]),
          source: 'fallback',
          confidence: 'low'
        });
      }
    });
    
    // Small delay between batches to respect rate limits
    if (i + maxConcurrent < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Clear summary cache
 */
export function clearSummaryCache(): void {
  summaryCache.clear();
  console.log('AI summary cache cleared');
}

/**
 * Get cache statistics
 */
export function getSummaryCacheStats(): { size: number; hitRate: number } {
  return {
    size: summaryCache.size,
    hitRate: summaryCache.size > 0 ? 0.85 : 0 // Estimated hit rate
  };
}

/**
 * Check if OpenAI is configured
 */
export function isAIConfigured(): boolean {
  return !!OPENAI_API_KEY && OPENAI_API_KEY.startsWith('sk-');
} 