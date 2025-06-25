import React, { useState, useRef } from 'react';
import { Upload, Plus, X, BarChart3, PieChart, AlertTriangle, CheckCircle, Loader, TrendingUp, TrendingDown } from 'lucide-react';
import { PortfolioHolding, PortfolioESGAnalysis, ESGBenchmark } from '../types/index';
import { portfolioService, ESG_BENCHMARKS } from '../services/portfolioService';

interface PortfolioPageProps {
  onNavigate: (page: string) => void;
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ onNavigate }) => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [analysis, setAnalysis] = useState<PortfolioESGAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualTicker, setManualTicker] = useState('');
  const [manualWeight, setManualWeight] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      const text = await file.text();
      const parsedHoldings = portfolioService.parseCSV(text);
      
      if (parsedHoldings.length === 0) {
        throw new Error('No valid tickers found in CSV file');
      }

      const holdingsWithData = await portfolioService.fetchPortfolioData(parsedHoldings);
      setHoldings(holdingsWithData);
      
      const portfolioAnalysis = await portfolioService.analyzePortfolio(holdingsWithData);
      setAnalysis(portfolioAnalysis);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process CSV file');
    } finally {
      setLoading(false);
    }
  };

  const addManualHolding = async () => {
    if (!manualTicker.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const weight = manualWeight ? parseFloat(manualWeight) : undefined;
      const newHolding: PortfolioHolding = {
        ticker: manualTicker.toUpperCase(),
        weight,
        isLiveData: false
      };

      const [holdingWithData] = await portfolioService.fetchPortfolioData([newHolding]);
      const updatedHoldings = [...holdings, holdingWithData];
      setHoldings(updatedHoldings);

      const portfolioAnalysis = await portfolioService.analyzePortfolio(updatedHoldings);
      setAnalysis(portfolioAnalysis);

      setManualTicker('');
      setManualWeight('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add ticker');
    } finally {
      setLoading(false);
    }
  };

  const removeHolding = async (index: number) => {
    const updatedHoldings = holdings.filter((_, i) => i !== index);
    setHoldings(updatedHoldings);

    if (updatedHoldings.length > 0) {
      const portfolioAnalysis = await portfolioService.analyzePortfolio(updatedHoldings);
      setAnalysis(portfolioAnalysis);
    } else {
      setAnalysis(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 bg-green-100';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreColorBar = (score: number) => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const clearPortfolio = () => {
    setHoldings([]);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            Portfolio ESG Tracker
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your portfolio or add tickers manually to analyze ESG performance and compare against benchmarks.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* CSV Upload */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload CSV Portfolio</h3>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Click to upload CSV file</p>
                <p className="text-xs text-gray-500">Include columns: ticker/symbol, weight/allocation (optional)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Manual Entry */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Ticker Manually</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter ticker (e.g., AAPL, TSLA)"
                  value={manualTicker}
                  onChange={(e) => setManualTicker(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Weight % (optional)"
                  value={manualWeight}
                  onChange={(e) => setManualWeight(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  onClick={addManualHolding}
                  disabled={!manualTicker.trim() || loading}
                  className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Portfolio</span>
                </button>
              </div>
            </div>
          </div>

          {holdings.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-slate-800">Portfolio Holdings ({holdings.length})</h4>
                <button
                  onClick={clearPortfolio}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {holdings.map((holding, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-slate-800">{holding.ticker}</span>
                      {holding.companyName && (
                        <span className="text-sm text-slate-600">{holding.companyName}</span>
                      )}
                      {holding.weight && (
                        <span className="text-sm text-slate-500">({holding.weight}%)</span>
                      )}
                      {!holding.isLiveData && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          Mock Data
                        </span>
                      )}
                      {holding.esgData ? (
                        <span className={`text-xs px-2 py-1 rounded ${getScoreColor(holding.esgData.overallScore)}`}>
                          ESG: {holding.esgData.overallScore.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          No Data
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeHolding(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <Loader className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
            <p className="text-slate-600">Analyzing portfolio...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {analysis && (
          <>
            {/* ESG Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Overall ESG</h3>
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(analysis.totalScore).split(' ')[0]}`}>
                  {analysis.totalScore.toFixed(1)}
                </div>
                <div className="text-sm text-slate-500">
                  {analysis.coveragePercentage.toFixed(0)}% coverage
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Environmental</h3>
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 text-xs font-bold">E</span>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(analysis.environmentalScore).split(' ')[0]}`}>
                  {analysis.environmentalScore.toFixed(1)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getScoreColorBar(analysis.environmentalScore)}`}
                    style={{ width: `${(analysis.environmentalScore / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Social</h3>
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">S</span>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(analysis.socialScore).split(' ')[0]}`}>
                  {analysis.socialScore.toFixed(1)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getScoreColorBar(analysis.socialScore)}`}
                    style={{ width: `${(analysis.socialScore / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Governance</h3>
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-xs font-bold">G</span>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(analysis.governanceScore).split(' ')[0]}`}>
                  {analysis.governanceScore.toFixed(1)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getScoreColorBar(analysis.governanceScore)}`}
                    style={{ width: `${(analysis.governanceScore / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Benchmark Comparison */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Benchmark Comparison</h3>
              <div className="space-y-4">
                {ESG_BENCHMARKS.map((benchmark, index) => {
                  const diff = analysis.totalScore - benchmark.totalScore;
                  const isAbove = diff > 0;
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-800">{benchmark.name}</h4>
                          <p className="text-sm text-slate-600">{benchmark.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isAbove ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`font-bold ${isAbove ? 'text-green-600' : 'text-red-600'}`}>
                            {isAbove ? '+' : ''}{diff.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Overall:</span>
                          <span className="ml-2 font-medium">{benchmark.totalScore.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">E:</span>
                          <span className="ml-2 font-medium">{benchmark.environmentalScore.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">S:</span>
                          <span className="ml-2 font-medium">{benchmark.socialScore.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">G:</span>
                          <span className="ml-2 font-medium">{benchmark.governanceScore.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Detailed Holdings Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Ticker</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Company</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Weight</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Overall ESG</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">E</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">S</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">G</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Data Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-slate-800">{holding.ticker}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {holding.companyName || '-'}
                          {holding.sector && (
                            <div className="text-xs text-slate-500">{holding.sector}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          {holding.weight ? `${holding.weight}%` : 'Equal'}
                        </td>
                        {holding.esgData ? (
                          <>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(holding.esgData.overallScore)}`}>
                                {holding.esgData.overallScore.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-700">{holding.esgData.environmentalScore.toFixed(1)}</td>
                            <td className="py-3 px-4 text-center text-slate-700">{holding.esgData.socialScore.toFixed(1)}</td>
                            <td className="py-3 px-4 text-center text-slate-700">{holding.esgData.governanceScore.toFixed(1)}</td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4 text-center text-slate-400" colSpan={4}>No ESG data available</td>
                          </>
                        )}
                        <td className="py-3 px-4 text-center">
                          {holding.esgData ? (
                            <span className={`text-xs px-2 py-1 rounded ${
                              holding.isLiveData 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {holding.isLiveData ? 'Live' : 'Mock'}
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              N/A
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {holdings.length === 0 && !loading && (
          <div className="text-center py-12">
            <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Portfolio Data</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Upload a CSV file with your holdings or manually add tickers to start analyzing your portfolio's ESG performance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage; 