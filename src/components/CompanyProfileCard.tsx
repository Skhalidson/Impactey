import React from 'react';
import { Building, Globe, DollarSign, BarChart3, MapPin } from 'lucide-react';
import { UnifiedESGData } from '../services/esgDataService';
import { TickerData } from '../services/tickerService';
import { DataSourceIndicator } from './common/DataStatusBanner';
import { motion } from 'framer-motion';

interface CompanyProfileCardProps {
  companyData: UnifiedESGData;
  tickerInfo?: TickerData | null;
  className?: string;
}

const CompanyProfileCard: React.FC<CompanyProfileCardProps> = ({
  companyData,
  tickerInfo,
  className = ''
}) => {
  // Format large numbers
  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-start space-x-6">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-emerald-100 rounded-xl flex items-center justify-center">
              {companyData.prototypeData?.logo ? (
                <span className="text-3xl">{companyData.prototypeData.logo}</span>
              ) : (
                <Building className="w-10 h-10 text-emerald-600" />
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-800">{companyData.companyName}</h1>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                {companyData.symbol}
              </span>
              {tickerInfo && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tickerInfo.type === 'stock' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  {tickerInfo.type.toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-6 text-slate-600 mb-4 flex-wrap">
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>{companyData.sector}</span>
              </div>
              {tickerInfo && (
                <>
                  {tickerInfo.price && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${tickerInfo.price.toFixed(2)}</span>
                    </div>
                  )}
                  {tickerInfo.marketCap && (
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>{formatLargeNumber(tickerInfo.marketCap)} Market Cap</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{tickerInfo.exchangeShortName}</span>
                  </div>
                </>
              )}
            </div>

            {companyData.prototypeData?.summary && (
              <p className="text-slate-600 leading-relaxed">{companyData.prototypeData.summary}</p>
            )}
          </div>
        </div>

        <DataSourceIndicator 
          dataSource={companyData.dataSource}
          className="text-sm"
        />
      </div>
    </div>
  );
};

export default CompanyProfileCard; 