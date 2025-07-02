import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Building, 
  TrendingDown, 
  BarChart3,
  Calendar
} from 'lucide-react';
import { getUnifiedESGData, UnifiedESGData } from '../services/esgDataService';
import { tickerService, TickerData } from '../services/tickerService';
import ESGNewsFeed from './ESGNewsFeed';
// import DataStatusBanner from './DataStatusBanner'; // Hidden for production
import CompanyProfileCard from './CompanyProfileCard';
import ESGScoreSection from './ESGScoreSection';

interface CompanyPageProps {
  ticker: string;
  onNavigate: (page: string, companyId?: string, ticker?: TickerData) => void;
  returnPath?: string;
}

const CompanyPage: React.FC<CompanyPageProps> = ({ ticker, onNavigate, returnPath = 'explore-compare' }) => {
  const [companyData, setCompanyData] = useState<UnifiedESGData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanyData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getUnifiedESGData(ticker);
        if (data) {
          setCompanyData(data);
        } else {
          setError('Company data not found');
        }
      } catch (err) {
        console.error('Failed to load company data:', err);
        setError('Failed to load company data');
      } finally {
        setIsLoading(false);
      }
    };

    if (ticker) {
      loadCompanyData();
    }
  }, [ticker]);

  // Get ticker information
  const tickerInfo = tickerService.getTickerBySymbol(ticker);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Loading Company Data</h3>
            <p className="text-slate-600">Fetching ESG information for {ticker}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !companyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Company Not Found</h3>
            <p className="text-slate-600 mb-4">{error || 'No data available for this company'}</p>
            <button
              onClick={() => onNavigate(returnPath)}
              className="flex items-center space-x-2 mx-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {returnPath === 'home' ? 'Search' : 'Explorer'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Data Status Banner - Hidden for production */}
        {/* <DataStatusBanner /> */}

        {/* Header */}
        {/* Back Navigation */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate(returnPath)}
            className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to {returnPath === 'home' ? 'Search' : 'Explorer'}</span>
          </button>
        </div>

        {/* Company Profile */}
        <CompanyProfileCard 
          companyData={companyData} 
          tickerInfo={tickerInfo}
          className="mb-8"
        />

        {/* ESG Scores */}
        <ESGScoreSection 
          companyData={companyData}
          className="mb-8"
        />

        {/* Impact Metrics */}
        {companyData.prototypeData?.impactMetrics && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Impact Metrics</span>
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-800 mb-1">
                  {companyData.prototypeData.impactMetrics.renewableEnergyPercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-green-600">Renewable Energy</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-800 mb-1">
                  {companyData.prototypeData.impactMetrics.employeeSatisfaction.toFixed(1)}/10
                </div>
                <div className="text-sm text-blue-600">Employee Satisfaction</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-800 mb-1">
                  {companyData.prototypeData.impactMetrics.boardIndependence.toFixed(0)}%
                </div>
                <div className="text-sm text-purple-600">Board Independence</div>
              </div>
              
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-800 mb-1">
                  {companyData.prototypeData.impactMetrics.carbonFootprint.toFixed(0)}
                </div>
                <div className="text-sm text-amber-600">Carbon Footprint (kt)</div>
              </div>
            </div>
          </div>
        )}

        {/* Controversies */}
        {companyData.prototypeData?.controversies && companyData.prototypeData.controversies.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span>Recent Controversies</span>
            </h3>
            
            <div className="space-y-4">
              {companyData.prototypeData.controversies.map((controversy, index) => (
                <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">{controversy.title}</h4>
                      <div className="flex items-center space-x-3 text-sm text-red-700">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{controversy.year}</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          controversy.severity === 'high' ? 'bg-red-200 text-red-800' :
                          controversy.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {controversy.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Company-Specific ESG News */}
        <ESGNewsFeed 
          companyName={companyData.companyName}
          ticker={companyData.symbol}
          maxArticles={15}
          showFilters={true}
          className="w-full"
        />

        {/* Last Updated */}
        <div className="text-center text-sm text-slate-500">
          <p>ESG data last updated: {companyData.lastUpdated}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;