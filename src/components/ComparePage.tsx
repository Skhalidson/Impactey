import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Plus, TrendingUp, TrendingDown, Minus, BarChart3, Target, Zap } from 'lucide-react';
import { Company } from '../types/index';
import { companies, searchCompanies } from '../data/companies';

interface ComparePageProps {
  onNavigate: (page: string, companyId?: string) => void;
}

interface RadarChartProps {
  companies: Company[];
  size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ companies, size = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    const center = size / 2;
    const radius = (size / 2) * 0.8;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Define the ESG categories
    const categories = ['Environmental', 'Social', 'Governance', 'Overall ESG'];
    const angleStep = (2 * Math.PI) / categories.length;

    // Draw background grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Draw concentric circles
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(center, center, (radius * i) / 5, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw category lines
    categories.forEach((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw category labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    categories.forEach((category, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = center + Math.cos(angle) * labelRadius;
      const y = center + Math.sin(angle) * labelRadius;

      // Handle text wrapping for longer labels
      if (category.length > 10) {
        const words = category.split(' ');
        words.forEach((word, wordIndex) => {
          ctx.fillText(word, x, y + (wordIndex - (words.length - 1) / 2) * 14);
        });
      } else {
        ctx.fillText(category, x, y);
      }
    });

    // Draw company data
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
    
    companies.forEach((company, companyIndex) => {
      if (companyIndex >= colors.length) return;

      const color = colors[companyIndex];
      ctx.strokeStyle = color;
      ctx.fillStyle = color + '40'; // Add transparency
      ctx.lineWidth = 2;

      const values = [
        company.esgScores.environmental,
        company.esgScores.social,
        company.esgScores.governance,
        company.impactScore
      ];

      // Draw the polygon
      ctx.beginPath();
      values.forEach((value, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const distance = (value / 10) * radius;
        const x = center + Math.cos(angle) * distance;
        const y = center + Math.sin(angle) * distance;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw data points
      ctx.fillStyle = color;
      values.forEach((value, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const distance = (value / 10) * radius;
        const x = center + Math.cos(angle) * distance;
        const y = center + Math.sin(angle) * distance;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

  }, [companies, size]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

const ComparePage: React.FC<ComparePageProps> = ({ onNavigate }) => {
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [showResults, setShowResults] = useState(false);

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

  const addCompany = (company: Company) => {
    if (selectedCompanies.length < 5 && !selectedCompanies.find(c => c.id === company.id)) {
      setSelectedCompanies([...selectedCompanies, company]);
    }
    setSearchQuery('');
    setShowResults(false);
  };

  const removeCompany = (companyId: string) => {
    setSelectedCompanies(selectedCompanies.filter(c => c.id !== companyId));
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColorBg = (score: number) => {
    if (score >= 7) return 'bg-green-100 border-green-200';
    if (score >= 5) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const generateTrendIcon = (score: number) => {
    // Simulate trend based on score (in real app, this would be historical data)
    const trend = score > 6.5 ? 'up' : score < 5 ? 'down' : 'stable';
    
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const generateAIComparison = () => {
    if (selectedCompanies.length < 2) return null;

    const sortedByESG = [...selectedCompanies].sort((a, b) => b.impactScore - a.impactScore);
    const best = sortedByESG[0];
    const worst = sortedByESG[sortedByESG.length - 1];

    if (best.id === worst.id) return null;

    const bestStrengths = [];
    const worstWeaknesses = [];

    // Analyze Environmental scores
    if (best.esgScores.environmental > worst.esgScores.environmental + 1) {
      bestStrengths.push(`superior environmental practices (${best.esgScores.environmental.toFixed(1)} vs ${worst.esgScores.environmental.toFixed(1)})`);
    }

    // Analyze Social scores
    if (best.esgScores.social > worst.esgScores.social + 1) {
      bestStrengths.push(`stronger social responsibility (${best.esgScores.social.toFixed(1)} vs ${worst.esgScores.social.toFixed(1)})`);
    }

    // Analyze Governance scores
    if (best.esgScores.governance > worst.esgScores.governance + 1) {
      bestStrengths.push(`better corporate governance (${best.esgScores.governance.toFixed(1)} vs ${worst.esgScores.governance.toFixed(1)})`);
    }

    // Generate sector-specific insights
    let sectorInsight = '';
    if (best.sector !== worst.sector) {
      sectorInsight = ` Additionally, the ${best.sector.toLowerCase()} sector typically has different ESG challenges compared to ${worst.sector.toLowerCase()}.`;
    }

    const strengthsText = bestStrengths.length > 0 
      ? bestStrengths.join(', ') 
      : 'a more balanced approach across all ESG dimensions';

    return `${best.name} demonstrates stronger ESG alignment than ${worst.name} due to ${strengthsText}. With an overall ESG score of ${best.impactScore.toFixed(1)} compared to ${worst.impactScore.toFixed(1)}, ${best.name} shows ${(((best.impactScore - worst.impactScore) / worst.impactScore) * 100).toFixed(0)}% higher sustainable performance.${sectorInsight} Investors seeking ESG-focused exposure should consider these performance differentials when making allocation decisions.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            Compare Companies
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Compare ESG performance across up to 5 companies to make informed sustainable investment decisions.
          </p>
        </div>

        {/* Company Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search companies to compare..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              
              {/* Search Results */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((company) => {
                      const isAlreadySelected = !!selectedCompanies.find(c => c.id === company.id);
                      const canAdd = selectedCompanies.length < 5;
                      
                      return (
                        <button
                          key={company.id}
                          onClick={() => !isAlreadySelected && canAdd && addCompany(company)}
                          disabled={isAlreadySelected || !canAdd}
                          className={`w-full px-4 py-3 text-left flex items-center space-x-3 border-b border-gray-100 last:border-b-0 ${
                            isAlreadySelected 
                              ? 'bg-gray-50 cursor-not-allowed opacity-50' 
                              : canAdd 
                                ? 'hover:bg-emerald-50 cursor-pointer' 
                                : 'bg-gray-50 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <span className="text-2xl">{company.logo}</span>
                          <div className="flex-1">
                            <div className="font-medium text-slate-800">{company.name}</div>
                            <div className="text-sm text-slate-500">{company.sector} • ESG Score: {company.impactScore}</div>
                          </div>
                          {isAlreadySelected && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                              Selected
                            </span>
                          )}
                          {!canAdd && !isAlreadySelected && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              Max 5
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-slate-500">No companies found</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-sm text-slate-500 flex items-center">
              {selectedCompanies.length}/5 companies selected
            </div>
          </div>

          {/* Selected Companies */}
          {selectedCompanies.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Selected Companies:</h3>
              <div className="flex flex-wrap gap-3">
                {selectedCompanies.map((company, index) => (
                  <div key={company.id} className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <span className="text-lg">{company.logo}</span>
                    <span className="font-medium text-slate-800">{company.name}</span>
                    <span className={`text-sm px-2 py-1 rounded ${getScoreColorBg(company.impactScore)}`}>
                      {company.impactScore}
                    </span>
                    <button
                      onClick={() => removeCompany(company.id)}
                      className="text-slate-500 hover:text-red-600 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedCompanies.length === 0 && (
          <div className="text-center py-16">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Select Companies to Compare</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Search and select up to 5 companies to compare their ESG performance, scores, and sustainability metrics.
            </p>
          </div>
        )}

        {selectedCompanies.length > 0 && (
          <>
            {/* Radar Chart Visualization */}
            {selectedCompanies.length >= 2 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">ESG Performance Radar Chart</h3>
                <RadarChart companies={selectedCompanies} size={400} />
                
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  {selectedCompanies.map((company, index) => {
                    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
                    return (
                      <div key={company.id} className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2"
                          style={{ backgroundColor: colors[index] + '40', borderColor: colors[index] }}
                        ></div>
                        <span className="text-sm font-medium text-slate-700">{company.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detailed Comparison Table */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Detailed ESG Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-slate-700">Company</th>
                      <th className="text-center py-4 px-4 font-semibold text-slate-700">Sector</th>
                      <th className="text-center py-4 px-4 font-semibold text-slate-700">Overall ESG</th>
                      <th className="text-center py-4 px-4 font-semibold text-slate-700">Environmental</th>
                      <th className="text-center py-4 px-4 font-semibold text-slate-700">Social</th>
                      <th className="text-center py-4 px-4 font-semibold text-slate-700">Governance</th>
                      <th className="text-center py-4 px-4 font-semibold text-slate-700">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCompanies.map((company) => (
                      <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{company.logo}</span>
                            <div>
                              <div className="font-medium text-slate-800">{company.name}</div>
                              <button
                                onClick={() => onNavigate('company', company.id)}
                                className="text-sm text-emerald-600 hover:text-emerald-700"
                              >
                                View Details →
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {company.sector}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className={`text-2xl font-bold ${getScoreColor(company.impactScore)}`}>
                              {company.impactScore}
                            </span>
                            {generateTrendIcon(company.impactScore)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className={`text-xl font-semibold ${getScoreColor(company.esgScores.environmental)}`}>
                              {company.esgScores.environmental.toFixed(1)}
                            </span>
                            {generateTrendIcon(company.esgScores.environmental)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className={`text-xl font-semibold ${getScoreColor(company.esgScores.social)}`}>
                              {company.esgScores.social.toFixed(1)}
                            </span>
                            {generateTrendIcon(company.esgScores.social)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className={`text-xl font-semibold ${getScoreColor(company.esgScores.governance)}`}>
                              {company.esgScores.governance.toFixed(1)}
                            </span>
                            {generateTrendIcon(company.esgScores.governance)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            {generateTrendIcon(company.impactScore)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Metrics Comparison */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Top ESG Performer</h3>
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                </div>
                {(() => {
                  const topCompany = selectedCompanies.reduce((prev, current) => 
                    (prev.impactScore > current.impactScore) ? prev : current
                  );
                  return (
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{topCompany.logo}</span>
                      <div>
                        <div className="font-medium text-slate-800">{topCompany.name}</div>
                        <div className="text-2xl font-bold text-emerald-600">{topCompany.impactScore}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Average ESG Score</h3>
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {(selectedCompanies.reduce((sum, company) => sum + company.impactScore, 0) / selectedCompanies.length).toFixed(1)}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Across {selectedCompanies.length} companies
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Score Range</h3>
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {(() => {
                    const scores = selectedCompanies.map(c => c.impactScore);
                    const range = Math.max(...scores) - Math.min(...scores);
                    return range.toFixed(1);
                  })()}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  ESG performance spread
                </div>
              </div>
            </div>

            {/* AI-Generated Comparison Summary */}
            {selectedCompanies.length >= 2 && (
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">AI-Generated ESG Analysis</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {generateAIComparison()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComparePage; 