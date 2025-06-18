import React, { useState } from 'react';
import { Search, TrendingUp, Shield, Leaf, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { searchCompanies, companies } from '../data/companies';
import { Company } from '../types';

interface HomePageProps {
  onNavigate: (page: string, companyId?: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchCompanies(query);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleCompanySelect = (companyId: string) => {
    onNavigate('company', companyId);
    setSearchQuery('');
    setShowResults(false);
  };

  // Alphabetically sorted companies
  const sortedCompanies = [...companies].sort((a, b) => a.name.localeCompare(b.name));
  const featuredCompanies = sortedCompanies.slice(0, 6);
  const allCompanies = sortedCompanies;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
            See The Real Impact Behind 
            <span className="text-emerald-600"> Any Company</span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Avoid greenwashing. Understand ESG scores. Invest consciously with data-driven insights.
          </p>

          {/* Search Section */}
          <div className="relative max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search any company (e.g., Tesla, Microsoft, Amazon...)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-32 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-lg"
              />
              <button
                onClick={() => searchResults.length > 0 && handleCompanySelect(searchResults[0].id)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Check Impact
              </button>
            </div>

            {/* Search Results */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanySelect(company.id)}
                      className="w-full px-4 py-3 text-left hover:bg-emerald-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-2xl">{company.logo}</span>
                      <div>
                        <div className="font-medium text-slate-800">{company.name}</div>
                        <div className="text-sm text-slate-500">{company.sector} • Impact Score: {company.impactScore}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-slate-500">No companies found</div>
                )}
              </div>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Environmental Impact</h3>
              <p className="text-slate-600">Analyze carbon footprint, renewable energy usage, and environmental policies</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Social Responsibility</h3>
              <p className="text-slate-600">Evaluate labor practices, diversity initiatives, and community impact</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Corporate Governance</h3>
              <p className="text-slate-600">Review board independence, transparency, and ethical business practices</p>
            </div>
          </div>

          {/* Featured Companies */}
          <div className="text-left">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Featured Companies</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleCompanySelect(company.id)}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 text-left"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{company.logo}</span>
                    <div>
                      <h3 className="font-semibold text-slate-800">{company.name}</h3>
                      <p className="text-sm text-slate-500">{company.sector}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Impact Score</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        company.impactScore >= 7 ? 'bg-green-500' :
                        company.impactScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-bold text-slate-800">{company.impactScore}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Show All Companies Toggle */}
            <div className="text-center">
              <button
                onClick={() => setShowAllCompanies(!showAllCompanies)}
                className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-emerald-700 font-medium"
              >
                <span>{showAllCompanies ? 'Hide All Companies' : 'Show All Companies'}</span>
                {showAllCompanies ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* All Companies Grid */}
            {showAllCompanies && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
                  All Available Companies ({allCompanies.length})
                </h3>
                <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto bg-white rounded-xl p-6 shadow-md">
                  {allCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanySelect(company.id)}
                      className="p-4 rounded-lg hover:bg-emerald-50 transition-colors text-left border border-gray-100 hover:border-emerald-200"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">{company.logo}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800 text-sm truncate">{company.name}</div>
                          <div className="text-xs text-slate-500 truncate">{company.sector}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Score</span>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            company.impactScore >= 7 ? 'bg-green-500' :
                            company.impactScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-bold text-slate-800">{company.impactScore}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;