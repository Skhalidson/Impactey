import React, { useState, useMemo } from 'react';
import { companies } from '../data/companies';

interface EnhancedCompany {
  name: string;
  ticker: string;
  sector: string;
  region: string;
  esgScore: number;
  environmentScore: number;
  socialScore: number;
  governanceScore: number;
  tags: string[];
}

const ESGExplorer: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ 
    key: keyof EnhancedCompany | 'none'; 
    direction: 'asc' | 'desc' 
  }>({ key: 'none', direction: 'asc' });
  
  const [filters, setFilters] = useState({
    sector: '',
    region: '',
    esgScoreMin: 0,
    esgScoreMax: 10,
    tags: [] as string[]
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced company data with regions and tags
  const companiesWithData: EnhancedCompany[] = useMemo(() => {
    return companies.map(company => {
      const esgScore = company.impactScore;
      const environmentScore = company.esgScores.environmental;
      const socialScore = company.esgScores.social;
      const governanceScore = company.esgScores.governance;

      // Assign regions based on company location/ticker
      let region = 'North America';
      if (['NSRGY'].includes(company.ticker)) region = 'Europe';
      if (['ASML', 'NVO'].includes(company.ticker)) region = 'Europe';

      // Generate tags based on scores and characteristics
      const tags: string[] = [];
      
      if (esgScore >= 8.5) tags.push('ESG Leader');
      if (esgScore <= 4.5) tags.push('High Risk');
      if (environmentScore >= 8.5) tags.push('Carbon Neutral');
      if (socialScore >= 8.0) tags.push('Social Impact');
      if (governanceScore >= 8.0) tags.push('Strong Governance');
      if (company.sector === 'Technology' && esgScore >= 7.5) tags.push('Tech Pioneer');
      if (company.sector === 'Renewable Energy' && environmentScore >= 8.0) tags.push('Clean Energy');
      
      // Top 10 Most Improved (based on current high performers)
      const topImproved = ['MSFT', 'UL', 'NEE', 'AAPL', 'JPM', 'TSLA', 'KO', 'NSRGY'];
      if (topImproved.includes(company.ticker)) tags.push('Top 10 Most Improved');

      return {
        name: company.name,
        ticker: company.ticker,
        sector: company.sector,
        region,
        esgScore,
        environmentScore,
        socialScore,
        governanceScore,
        tags
      };
    });
  }, []);

  // Calculate sector averages
  const sectorAverages = useMemo(() => {
    const sectorData: { [key: string]: { total: number; count: number } } = {};
    
    companiesWithData.forEach(company => {
      if (!sectorData[company.sector]) {
        sectorData[company.sector] = { total: 0, count: 0 };
      }
      sectorData[company.sector].total += company.esgScore;
      sectorData[company.sector].count += 1;
    });

    return Object.entries(sectorData).reduce((acc, [sector, data]) => {
      acc[sector] = Math.round((data.total / data.count) * 10) / 10;
      return acc;
    }, {} as { [key: string]: number });
  }, [companiesWithData]);

  // Get unique values for filters
  const uniqueSectors = [...new Set(companiesWithData.map(c => c.sector))].sort();
  const uniqueRegions = [...new Set(companiesWithData.map(c => c.region))].sort();
  const allTags = [...new Set(companiesWithData.flatMap(c => c.tags))].sort();

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companiesWithData.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.ticker.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = !filters.sector || company.sector === filters.sector;
      const matchesRegion = !filters.region || company.region === filters.region;
      const matchesScoreRange = company.esgScore >= filters.esgScoreMin && 
                               company.esgScore <= filters.esgScoreMax;
      const matchesTags = filters.tags.length === 0 || 
                         filters.tags.some(tag => company.tags.includes(tag));

      return matchesSearch && matchesSector && matchesRegion && matchesScoreRange && matchesTags;
    });

    if (sortConfig.key !== 'none') {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof EnhancedCompany];
        const bValue = b[sortConfig.key as keyof EnhancedCompany];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [companiesWithData, searchTerm, filters, sortConfig]);

  const handleSort = (key: keyof EnhancedCompany) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      'ESG Leader': 'bg-green-100 text-green-800',
      'High Risk': 'bg-red-100 text-red-800',
      'Carbon Neutral': 'bg-emerald-100 text-emerald-800',
      'Social Impact': 'bg-blue-100 text-blue-800',
      'Strong Governance': 'bg-purple-100 text-purple-800',
      'Tech Pioneer': 'bg-indigo-100 text-indigo-800',
      'Clean Energy': 'bg-lime-100 text-lime-800',
      'Mega Cap': 'bg-orange-100 text-orange-800',
      'Top 10 Most Improved': 'bg-pink-100 text-pink-800'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">ESG Explorer</h1>
          <p className="text-gray-600 text-lg">
            Discover and analyze ESG performance across {companiesWithData.length} companies
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Company name or ticker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sector Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <select
                value={filters.sector}
                onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sectors</option>
                {uniqueSectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector} (Avg: {sectorAverages[sector]})
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                value={filters.region}
                onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Regions</option>
                {uniqueRegions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* ESG Score Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ESG Score Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.esgScoreMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, esgScoreMin: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.esgScoreMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, esgScoreMax: parseFloat(e.target.value) || 10 }))}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          {/* Tag Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      tags: prev.tags.includes(tag)
                        ? prev.tags.filter(t => t !== tag)
                        : [...prev.tags, tag]
                    }));
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedCompanies.length} of {companiesWithData.length} companies
            </p>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          <div className="space-y-4">
            {filteredAndSortedCompanies.map((company) => (
              <div key={company.ticker} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.ticker} • {company.sector}</p>
                    <p className="text-xs text-gray-400">{company.region}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(company.esgScore)}`}>
                    {company.esgScore.toFixed(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">E</p>
                    <span className={`text-sm font-medium px-1 py-0.5 rounded ${getScoreColor(company.environmentScore)}`}>
                      {company.environmentScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">S</p>
                    <span className={`text-sm font-medium px-1 py-0.5 rounded ${getScoreColor(company.socialScore)}`}>
                      {company.socialScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">G</p>
                    <span className={`text-sm font-medium px-1 py-0.5 rounded ${getScoreColor(company.governanceScore)}`}>
                      {company.governanceScore.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {company.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className={`px-2 py-1 text-xs font-medium rounded-full ${getTagColor(tag)}`}>
                      {tag}
                    </span>
                  ))}
                  {company.tags.length > 2 && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      +{company.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Company
                    {sortConfig.key === 'name' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('sector')}
                  >
                    Sector
                    {sortConfig.key === 'sector' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('region')}
                  >
                    Region
                    {sortConfig.key === 'region' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('esgScore')}
                  >
                    ESG Score
                    {sortConfig.key === 'esgScore' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('environmentScore')}
                  >
                    E
                    {sortConfig.key === 'environmentScore' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('socialScore')}
                  >
                    S
                    {sortConfig.key === 'socialScore' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('governanceScore')}
                  >
                    G
                    {sortConfig.key === 'governanceScore' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedCompanies.map((company) => (
                  <tr key={company.ticker} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.ticker}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.sector}</div>
                      <div className="text-xs text-gray-500">
                        Avg: {sectorAverages[company.sector]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(company.esgScore)}`}>
                        {company.esgScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(company.environmentScore)}`}>
                        {company.environmentScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(company.socialScore)}`}>
                        {company.socialScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(company.governanceScore)}`}>
                        {company.governanceScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {company.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {company.tags.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            +{company.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedCompanies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No companies match your current filters</p>
              <button
                onClick={() => {
                  setFilters({ sector: '', region: '', esgScoreMin: 0, esgScoreMax: 10, tags: [] });
                  setSearchTerm('');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ESGExplorer; 