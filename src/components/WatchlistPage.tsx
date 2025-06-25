import React from 'react';
import { Bookmark, TrendingUp, AlertTriangle, Search, BookmarkX } from 'lucide-react';
import { Company } from '../types/index';

interface WatchlistPageProps {
  savedCompanies: Company[];
  onNavigate: (page: string, companyId?: string) => void;
  onRemoveBookmark: (companyId: string) => void;
}

const WatchlistPage: React.FC<WatchlistPageProps> = ({ 
  savedCompanies, 
  onNavigate, 
  onRemoveBookmark 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 7) return 'bg-green-50 border-green-200';
    if (score >= 5) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Your Watchlist</h1>
          </div>
          <p className="text-slate-600">
            Track the companies you're interested in and monitor their sustainability performance.
          </p>
        </div>

        {savedCompanies.length > 0 ? (
          <div className="space-y-6">
            {savedCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{company.logo}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{company.name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-slate-600">{company.sector}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{company.ticker}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveBookmark(company.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from watchlist"
                  >
                    <BookmarkX className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Overall Impact Score */}
                  <div className={`p-4 rounded-lg border ${getScoreBackground(company.impactScore)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Impact Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(company.impactScore)}`}>
                          {company.impactScore}
                        </p>
                      </div>
                      <TrendingUp className={`w-6 h-6 ${getScoreColor(company.impactScore)}`} />
                    </div>
                  </div>

                  {/* ESG Scores */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-slate-700">Environmental</p>
                    <p className="text-xl font-bold text-green-600">{company.esgScores.environmental}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-slate-700">Social</p>
                    <p className="text-xl font-bold text-blue-600">{company.esgScores.social}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-slate-700">Governance</p>
                    <p className="text-xl font-bold text-purple-600">{company.esgScores.governance}</p>
                  </div>
                </div>

                {/* Controversies Alert */}
                {company.controversies.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        {company.controversies.length} recent controversies
                      </span>
                    </div>
                    <p className="text-sm text-red-700">
                      Latest: {company.controversies[0].title} ({company.controversies[0].year})
                    </p>
                  </div>
                )}

                {/* Summary */}
                <p className="text-slate-600 mb-4 line-clamp-2">{company.summary}</p>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    Updated: {company.lastUpdated}
                  </span>
                  <button
                    onClick={() => onNavigate('company', company.id)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Your watchlist is empty</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Start exploring companies and save the ones you want to track. Click the bookmark icon on any company page to add them here.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Explore Companies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;