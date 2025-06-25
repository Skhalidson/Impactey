import React, { useState } from 'react';
import { Search, TrendingUp, Shield, Leaf, Users, ChevronDown, ChevronUp, Target, BarChart3, AlertTriangle } from 'lucide-react';
import { searchCompanies, companies } from '../data/companies';
import { Company } from '../types/index';

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
            See How Sustainable Your 
            <span className="text-emerald-600"> Portfolio Really Is</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Benchmark, compare, and monitor ESG impact—without the greenwashing. 
            Your personal ESG clarity engine for confident, sustainable investing.
          </p>

          {/* Persona-based taglines */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="bg-white px-4 py-2 rounded-full shadow-md border border-emerald-100">
              <span className="text-sm font-medium text-emerald-700">Retail Investors:</span>
              <span className="text-sm text-slate-600 ml-2">"Invest sustainably, confidently."</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-md border border-blue-100">
              <span className="text-sm font-medium text-blue-700">Advisors:</span>
              <span className="text-sm text-slate-600 ml-2">"ESG clarity for every client portfolio."</span>
            </div>
          </div>

          {/* Search Section */}
          <div className="relative max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search any company for ESG insights (e.g., Tesla, Microsoft, Amazon...)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-32 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-lg"
              />
              <button
                onClick={() => searchResults.length > 0 && handleCompanySelect(searchResults[0].id)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Get ESG Clarity
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

          {/* Enhanced Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Portfolio Tracker</h3>
              <p className="text-slate-600">Track ESG performance across your entire portfolio with real-time monitoring and alerts</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Side-by-Side Comparison</h3>
              <p className="text-slate-600">Compare ESG metrics across companies, funds, and ETFs to make informed decisions</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Proactive ESG Alerts</h3>
              <p className="text-slate-600">Get notified of ESG controversies and score changes before they impact your investments</p>
            </div>
          </div>

          {/* Why Impactey Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16 text-left">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Why Impactey?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">For Retail Investors</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Build ESG-aligned portfolios with confidence using data-driven insights</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Avoid greenwashing with transparent, verified ESG scores and metrics</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor portfolio sustainability impact with real-time tracking</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Make informed decisions with AI-powered investment recommendations</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">For Advisors & Wealth Managers</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Help clients align investments with their sustainability goals</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Generate comprehensive ESG reports for client presentations</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Access deep market exploration tools for ESG fund selection</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Provide trustworthy ESG analysis to enhance client relationships</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-lg text-slate-700 font-medium">
                Empowering real-world investment decisions with transparent ESG clarity
              </p>
            </div>
          </div>

          {/* Featured Companies */}
          <div className="text-left">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Explore ESG Data</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{company.logo}</span>
                    <div>
                      <h3 className="font-semibold text-slate-800">{company.name}</h3>
                      <p className="text-sm text-slate-500">{company.sector}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-600">ESG Impact Score</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        company.impactScore >= 7 ? 'bg-green-500' :
                        company.impactScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-bold text-slate-800">{company.impactScore}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCompanySelect(company.id)}
                      className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onNavigate('compare')}
                      className="px-3 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium"
                      title="Add to comparison"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Show All Companies Toggle */}
            <div className="text-center">
              <button
                onClick={() => setShowAllCompanies(!showAllCompanies)}
                className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-emerald-700 font-medium"
              >
                <span>{showAllCompanies ? 'Hide Company Database' : 'Explore Full Company Database'}</span>
                {showAllCompanies ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* All Companies Grid */}
            {showAllCompanies && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
                  ESG Database ({allCompanies.length} Companies)
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
                        <span className="text-xs text-slate-600">ESG Score</span>
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