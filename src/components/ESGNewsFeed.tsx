import React, { useState, useEffect, useMemo } from 'react';
import { 
  Newspaper, 
  ExternalLink, 
  Clock, 
  AlertTriangle, 
  Leaf, 
  Users, 
  Shield, 
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Loader,
  Calendar,
  Globe,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { NewsArticle, fetchCompanyESGNews, fetchGeneralESGNews, fetchRecentESGNews } from '../api/newsApi';
import { generateBatchSummaries, AISummary, isAIConfigured } from '../services/aiSummaryService';
import { 
  analyzeControversy, 
  batchAnalyzeControversies, 
  ControversyAnalysis, 
  filterByControversy,
  getControversyStats
} from '../utils/controversyDetection';

interface ESGNewsFeedProps {
  companyName?: string;
  ticker?: string;
  maxArticles?: number;
  showFilters?: boolean;
  className?: string;
}

interface NewsItem {
  article: NewsArticle;
  summary: AISummary;
  controversy: ControversyAnalysis;
}

type FilterMode = 'all' | 'controversies' | 'positive';
type ViewMode = 'ai' | 'full';

const ESGNewsFeed: React.FC<ESGNewsFeedProps> = ({
  companyName,
  ticker,
  maxArticles = 15,
  showFilters = true,
  className = ''
}) => {
  // State management
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('ai');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [dateRange, setDateRange] = useState<number>(7); // days
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch news data
  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let articles: NewsArticle[] = [];
      
      if (companyName || ticker) {
        // Fetch company-specific ESG news
        console.log(`Fetching ESG news for company: ${companyName || ticker}`);
        articles = await fetchCompanyESGNews(
          companyName || ticker || '', 
          ticker, 
          maxArticles
        );
      } else {
        // Fetch general ESG news
        console.log('Fetching general ESG news');
        articles = await fetchGeneralESGNews(maxArticles);
      }

      if (articles.length === 0) {
        setError('No ESG news found for this search. Try adjusting your filters or check back later.');
        setNewsItems([]);
        return;
      }

      console.log(`Fetched ${articles.length} articles, generating summaries and analyzing controversies...`);

      // Generate AI summaries and analyze controversies in parallel
      const [summaries, controversies] = await Promise.all([
        generateBatchSummaries(articles),
        Promise.resolve(batchAnalyzeControversies(articles))
      ]);

      // Combine all data
      const items: NewsItem[] = articles.map((article, index) => ({
        article,
        summary: summaries[index],
        controversy: controversies[index]
      }));

      setNewsItems(items);
      setLastRefresh(new Date());
      console.log(`Successfully processed ${items.length} news items`);

    } catch (err) {
      console.error('Failed to fetch ESG news:', err);
      setError('Failed to load ESG news. Please try again later.');
      setNewsItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [companyName, ticker, maxArticles, dateRange]);

  // Filter news items based on selected filters
  const filteredItems = useMemo(() => {
    let filtered = newsItems;

    switch (filterMode) {
      case 'controversies':
        filtered = newsItems.filter(item => item.controversy.isControversial);
        break;
      case 'positive':
        filtered = newsItems.filter(item => !item.controversy.isControversial);
        break;
      default:
        // 'all' - no filtering
        break;
    }

    return filtered;
  }, [newsItems, filterMode]);

  // Get controversy statistics
  const controversyStats = useMemo(() => {
    if (newsItems.length === 0) return null;
    return getControversyStats(newsItems.map(item => item.controversy));
  }, [newsItems]);

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  // Get controversy badge
  const getControversyBadge = (analysis: ControversyAnalysis) => {
    if (!analysis.isControversial) return null;

    const colors = {
      low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      high: 'bg-red-100 text-red-800 border-red-200'
    };

    const icons = {
      environmental: <Leaf className="w-3 h-3" />,
      social: <Users className="w-3 h-3" />,
      governance: <Shield className="w-3 h-3" />,
      general: <AlertTriangle className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${colors[analysis.severity]}`}>
        {icons[analysis.category]}
        <span>🚨 {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}</span>
      </span>
    );
  };

  // Get category badge
  const getCategoryBadge = (category: string) => {
    const badges = {
      environmental: { icon: <Leaf className="w-3 h-3" />, text: 'Environmental', color: 'bg-green-100 text-green-800' },
      social: { icon: <Users className="w-3 h-3" />, text: 'Social', color: 'bg-blue-100 text-blue-800' },
      governance: { icon: <Shield className="w-3 h-3" />, text: 'Governance', color: 'bg-purple-100 text-purple-800' },
      general: { icon: <Globe className="w-3 h-3" />, text: 'General ESG', color: 'bg-gray-100 text-gray-800' }
    };

    const badge = badges[category as keyof typeof badges] || badges.general;

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        <span>{badge.text}</span>
      </span>
    );
  };

  if (error && newsItems.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 text-center ${className}`}>
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No ESG News Found</h3>
        <p className="text-slate-600 mb-4">{error}</p>
        <button
          onClick={fetchNews}
          disabled={isLoading}
          className="flex items-center space-x-2 mx-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Newspaper className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {companyName || ticker ? `${companyName || ticker} ESG News` : 'ESG News Feed'}
              </h2>
              <p className="text-sm text-slate-600">
                {isLoading ? 'Loading latest updates...' : `${filteredItems.length} articles found`}
                {lastRefresh && (
                  <span className="ml-2">• Updated {formatRelativeTime(lastRefresh.toISOString())}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showFilters && (
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFiltersPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={fetchNews}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Controversy Statistics */}
        {controversyStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800">{controversyStats.total}</div>
              <div className="text-xs text-slate-600">Total Articles</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-800">{controversyStats.controversial}</div>
              <div className="text-xs text-red-600">Controversial</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-800">{controversyStats.bySeverity.medium + controversyStats.bySeverity.high}</div>
              <div className="text-xs text-yellow-600">Medium+ Issues</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800">{Math.round((1 - controversyStats.controversyRate / 100) * 100)}%</div>
              <div className="text-xs text-green-600">Positive News</div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && showFiltersPanel && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Filter Mode */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content Filter</label>
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'All News', icon: <Globe className="w-4 h-4" /> },
                    { key: 'controversies', label: 'Controversies Only', icon: <AlertTriangle className="w-4 h-4" /> },
                    { key: 'positive', label: 'Positive News', icon: <TrendingUp className="w-4 h-4" /> }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setFilterMode(filter.key as FilterMode)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterMode === filter.key
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600 hover:bg-emerald-50'
                      }`}
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Summary View
                  {!isAIConfigured() && (
                    <span className="text-xs text-amber-600 ml-2">(AI summaries unavailable)</span>
                  )}
                </label>
                <div className="flex space-x-2">
                  {[
                    { key: 'ai', label: 'AI Summaries', icon: <Eye className="w-4 h-4" /> },
                    { key: 'full', label: 'Full Headlines', icon: <EyeOff className="w-4 h-4" /> }
                  ].map(view => (
                    <button
                      key={view.key}
                      onClick={() => setViewMode(view.key as ViewMode)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === view.key
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600 hover:bg-emerald-50'
                      }`}
                    >
                      {view.icon}
                      <span>{view.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* News Articles */}
      <div className="p-6">
        {isLoading && newsItems.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-emerald-600 mr-3" />
            <span className="text-slate-600">Loading ESG news...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No articles match your filters</h3>
            <p className="text-slate-500">Try adjusting your filter settings or refresh the feed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.map((item, index) => (
              <article
                key={`${item.article.url}-${index}`}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {/* Article Header */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getControversyBadge(item.controversy)}
                      {getCategoryBadge(item.controversy.category)}
                      {item.summary.source === 'ai' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-1"></span>
                          AI Summary
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-slate-800 mb-2 leading-tight">
                      <a
                        href={item.article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-600 transition-colors"
                      >
                        {item.article.title}
                      </a>
                    </h3>

                    {/* Summary or Description */}
                    <p className="text-slate-600 mb-3 leading-relaxed">
                      {viewMode === 'ai' ? item.summary.summary : item.article.description}
                    </p>

                    {/* Controversy Analysis */}
                    {item.controversy.isControversial && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-amber-800 font-medium">Controversy Detected</p>
                            <p className="text-xs text-amber-700 mt-1">{item.controversy.summary}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Article Meta */}
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>{item.article.source.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatRelativeTime(item.article.publishedAt)}</span>
                      </div>
                      <a
                        href={item.article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Read Full Article</span>
                      </a>
                    </div>
                  </div>

                  {/* Article Image */}
                  {item.article.image && (
                    <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32">
                      <img
                        src={item.article.image}
                        alt={item.article.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ESGNewsFeed; 