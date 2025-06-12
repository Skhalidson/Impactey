import React from 'react';
import { ArrowRight, Calendar, AlertTriangle, Bookmark, BookmarkCheck, TrendingUp, Building2 } from 'lucide-react';
import { Company } from '../types';

interface CompanyPageProps {
  company: Company;
  isBookmarked: boolean;
  onBookmark: (companyId: string) => void;
}

const CompanyPage: React.FC<CompanyPageProps> = ({ company, isBookmarked, onBookmark }) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) return 'Strong';
    if (score >= 5) return 'Moderate';
    return 'Needs Improvement';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-3xl">{company.logo}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{company.name}</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-slate-600 font-medium">{company.sector}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{company.ticker}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onBookmark(company.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-gray-300 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span className="font-medium">{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Impact Score */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-1">Overall Impact Score</h2>
                <p className="text-slate-600">Composite ESG Rating</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-slate-800 mb-1">{company.impactScore}</div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(company.impactScore)}`}>
                  {getScoreLabel(company.impactScore)}
                </div>
              </div>
            </div>
          </div>

          {/* ESG Scores */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-6 border border-green-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">E</span>
                </div>
                <h3 className="font-semibold text-slate-800">Environmental</h3>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-2">{company.esgScores.environmental}</div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(company.esgScores.environmental)}`}>
                {getScoreLabel(company.esgScores.environmental)}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <h3 className="font-semibold text-slate-800">Social</h3>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-2">{company.esgScores.social}</div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(company.esgScores.social)}`}>
                {getScoreLabel(company.esgScores.social)}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <h3 className="font-semibold text-slate-800">Governance</h3>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-2">{company.esgScores.governance}</div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(company.esgScores.governance)}`}>
                {getScoreLabel(company.esgScores.governance)}
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Impact Analysis</h2>
          </div>
          <div className="bg-slate-50 rounded-lg p-6 border-l-4 border-emerald-500">
            <p className="text-slate-700 leading-relaxed">{company.summary}</p>
          </div>
        </div>

        {/* Controversies */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Recent Controversies & Concerns</h2>
          </div>
          
          {company.controversies.length > 0 ? (
            <div className="space-y-4">
              {company.controversies.map((controversy, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(controversy.severity)}`}>
                    {controversy.severity.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800 mb-1">{controversy.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>{controversy.year}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No recent controversies reported for this company.</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {company.lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;