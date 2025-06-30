import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Shield, Leaf, Users, Info, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import { TickerData } from '../services/tickerService';
import { getESGData, UnifiedESGData } from '../services/esgDataService';

interface InstrumentDetailPageProps {
  ticker: TickerData;
  onBack: () => void;
}

const InstrumentDetailPage: React.FC<InstrumentDetailPageProps> = ({ ticker, onBack }) => {
  const [esgData, setEsgData] = useState<UnifiedESGData | null>(null);
  const [isLoadingESG, setIsLoadingESG] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate ticker prop
  if (!ticker || !ticker.symbol) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Invalid Instrument Data</h2>
          <p className="text-slate-600 mb-4">No valid ticker information was provided.</p>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadInstrumentData();
  }, [ticker.symbol]);

  const loadInstrumentData = async () => {
    setIsLoadingESG(true);
    setError(null);
    
    try {
      if (import.meta.env.DEV) {
        console.log(`🔍 Loading data for ${ticker.symbol}:`, ticker);
      }

      // Load ESG data with fallback to demo scores
      const esgResult = await getESGData(ticker.symbol);
      if (esgResult) {
        setEsgData(esgResult);
        if (import.meta.env.DEV) {
          console.log(`✅ ESG data loaded for ${ticker.symbol}:`, esgResult);
        }
      } else {
        throw new Error(`No ESG data available for ${ticker.symbol}`);
      }

      // Try to fetch basic company info from FMP API
      try {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/profile/${ticker.symbol}?apikey=GLrZCQn3n4erOKonZ0mRSYLbHyh9nCgU`
        );
        
        if (response.ok) {
          const profileData = await response.json();
          if (profileData && profileData.length > 0) {
            setCompanyInfo(profileData[0]);
            if (import.meta.env.DEV) {
              console.log(`✅ Company profile loaded for ${ticker.symbol}:`, profileData[0]);
            }
          }
        } else {
          if (import.meta.env.DEV) {
            console.warn(`⚠️ Company profile API returned ${response.status} for ${ticker.symbol}`);
          }
        }
      } catch (profileError) {
        if (import.meta.env.DEV) {
          console.log('Could not fetch company profile, using basic data:', profileError);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load instrument data';
      setError(errorMessage);
      console.error('Failed to load instrument data:', error);
      
      if (import.meta.env.DEV) {
        console.error(`❌ Error loading data for ${ticker.symbol}:`, {
          error,
          ticker,
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      setIsLoadingESG(false);
    }
  };

  const getDataSourceBadge = (source: string) => {
    switch (source) {
      case 'live':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
            Live Data
          </span>
        );
      case 'prototype':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
            Prototype Data
          </span>
        );
      case 'demo':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
            Demo Score
          </span>
        );
      default:
        return null;
    }
  };

  const getESGScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const generateAISummary = (data: UnifiedESGData) => {
    const scoreQuality = data.esgScore >= 8 ? 'strong' : data.esgScore >= 6 ? 'moderate' : 'weak';
    const dataQualifier = data.dataSource === 'demo' ? ' (based on demo calculations)' : '';
    
    return `${ticker.name} shows ${scoreQuality} ESG performance with an overall score of ${data.esgScore}/10${dataQualifier}. ` +
           `Environmental practices score ${data.environmentScore}/10, social responsibility ${data.socialScore}/10, ` +
           `and governance ${data.governanceScore}/10. ${data.dataSource === 'demo' ? 
           'These scores are generated for demonstration purposes and do not reflect actual ESG ratings.' : 
           'Analysis includes verified sustainability metrics and governance assessments.'}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with Back Navigation */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </button>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-800">{ticker.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ticker.type === 'stock' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {ticker.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-600 mb-3">
                  <span className="text-xl font-mono font-semibold text-slate-800">{ticker.symbol}</span>
                  <span>{ticker.exchangeShortName}</span>
                  {companyInfo?.sector && <span>• {companyInfo.sector}</span>}
                  {ticker.price && <span>• ${ticker.price.toFixed(2)}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Market Cap</div>
                <div className="text-lg font-semibold text-slate-800">
                  {companyInfo?.mktCap ? `$${(companyInfo.mktCap / 1e9).toFixed(1)}B` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Company Description */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">About</h3>
              <p className="text-slate-600 leading-relaxed">
                {companyInfo?.description || 
                 `${ticker.name} is a ${ticker.type === 'stock' ? 'publicly traded company' : 'exchange-traded fund'} ` +
                 `listed on ${ticker.exchangeShortName}. ${ticker.type === 'etf' ? 
                 'This ETF provides diversified exposure across multiple securities.' : 
                 'Detailed company information will be available when live data integration is complete.'}`}
              </p>
              {companyInfo?.website && (
                <a
                  href={companyInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ESG Clarity Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">ESG Clarity</h2>
            {esgData && getDataSourceBadge(esgData.dataSource)}
          </div>

          {error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Data</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <button
                onClick={loadInstrumentData}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          ) : isLoadingESG ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-slate-600">Loading ESG analysis...</span>
            </div>
          ) : esgData ? (
            <div className="space-y-6">
              
              {/* Overall ESG Score */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${getESGScoreColor(esgData.esgScore)} mb-3`}>
                  <span className="text-2xl font-bold">{esgData.esgScore}</span>
                </div>
                <div className="text-lg font-semibold text-slate-800">
                  {esgData.dataSource === 'demo' ? 'Demo ESG Score' : 'ESG Score'}
                </div>
                <div className="text-sm text-slate-500">Out of 10</div>
                {esgData.dataSource === 'demo' && (
                  <div className="mt-2 text-sm text-orange-600 font-medium">
                    ⚠️ Demonstration scores for prototype purposes
                  </div>
                )}
              </div>

              {/* Component Scores */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <Leaf className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-slate-800">{esgData.environmentScore}</div>
                  <div className="text-sm font-medium text-emerald-700">Environmental</div>
                  {esgData.dataSource === 'demo' && (
                    <div className="text-xs text-orange-600 mt-1">Demo Value</div>
                  )}
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-slate-800">{esgData.socialScore}</div>
                  <div className="text-sm font-medium text-blue-700">Social</div>
                  {esgData.dataSource === 'demo' && (
                    <div className="text-xs text-orange-600 mt-1">Demo Value</div>
                  )}
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-slate-800">{esgData.governanceScore}</div>
                  <div className="text-sm font-medium text-purple-700">Governance</div>
                  {esgData.dataSource === 'demo' && (
                    <div className="text-xs text-orange-600 mt-1">Demo Value</div>
                  )}
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 border border-emerald-200">
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" />
                  ESG Analysis Summary
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {generateAISummary(esgData)}
                </p>
              </div>

              {/* Controversies Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
                  Recent ESG News & Controversies
                </h4>
                {esgData.prototypeData?.controversies && esgData.prototypeData.controversies.length > 0 ? (
                  <div className="space-y-2">
                    {esgData.prototypeData.controversies.map((item, index) => (
                      <div key={index} className="text-sm text-slate-600 border-l-2 border-amber-300 pl-3">
                        {item.title} ({item.year}) - <span className={`font-medium ${
                          item.severity === 'high' ? 'text-red-600' :
                          item.severity === 'medium' ? 'text-amber-600' : 'text-slate-600'
                        }`}>{item.severity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm">
                    No recent ESG controversies found. {esgData.dataSource === 'demo' && 
                    'Live controversy monitoring will be available with real data integration.'}
                  </p>
                )}
              </div>

              {/* Data Source & Methodology */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-blue-600" />
                  Data Source & Methodology
                </h4>
                <div className="space-y-2 text-sm text-slate-700">
                  {esgData.dataSource === 'live' && (
                    <>
                      <p><strong>Source:</strong> Live ESG ratings from verified providers</p>
                      <p><strong>Methodology:</strong> Comprehensive analysis of environmental impact, social responsibility, and governance practices</p>
                      <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                    </>
                  )}
                  {esgData.dataSource === 'prototype' && (
                    <>
                      <p><strong>Source:</strong> Curated prototype dataset with detailed company profiles</p>
                      <p><strong>Methodology:</strong> Manual research and analysis of 20 major companies</p>
                      <p><strong>Coverage:</strong> Limited to prototype companies with comprehensive ESG data</p>
                    </>
                  )}
                  {esgData.dataSource === 'demo' && (
                    <>
                      <p><strong>Source:</strong> <span className="text-orange-600 font-medium">Algorithmically generated demonstration scores</span></p>
                      <p><strong>Methodology:</strong> Deterministic calculation based on ticker symbol and company characteristics</p>
                      <p><strong>Purpose:</strong> UI demonstration only - not for investment decisions</p>
                      <p className="text-orange-700 font-medium">⚠️ These scores are placeholders and do not reflect actual ESG performance</p>
                    </>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">ESG Data Unavailable</h3>
              <p className="text-slate-600">
                Unable to load ESG analysis for this instrument. Please try again later.
              </p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        {companyInfo && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Key Metrics</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {companyInfo.industry && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-slate-500">Industry</div>
                  <div className="font-semibold text-slate-800">{companyInfo.industry}</div>
                </div>
              )}
              {companyInfo.country && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-slate-500">Country</div>
                  <div className="font-semibold text-slate-800">{companyInfo.country}</div>
                </div>
              )}
              {companyInfo.employeeCount && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-slate-500">Employees</div>
                  <div className="font-semibold text-slate-800">{companyInfo.employeeCount.toLocaleString()}</div>
                </div>
              )}
              {companyInfo.ipoDate && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-slate-500">IPO Date</div>
                  <div className="font-semibold text-slate-800">{companyInfo.ipoDate}</div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InstrumentDetailPage; 