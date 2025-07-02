import React from 'react';
import { Star, Leaf, Users, Shield } from 'lucide-react';
import { UnifiedESGData } from '../services/esgDataService';

interface ESGScoreSectionProps {
  companyData: UnifiedESGData;
  className?: string;
}

const ESGScoreSection: React.FC<ESGScoreSectionProps> = ({
  companyData,
  className = ''
}) => {
  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-emerald-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get score background color
  const getScoreBgColor = (score: number): string => {
    if (score >= 8) return 'bg-green-100 border-green-200';
    if (score >= 6) return 'bg-emerald-100 border-emerald-200';
    if (score >= 4) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {/* Total ESG Score */}
      <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${getScoreBgColor(companyData.esgScore)}`}>
        <div className="flex items-center space-x-3 mb-4">
          <Star className="w-6 h-6 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-800">Total ESG Score</h3>
        </div>
        <div className={`text-4xl font-bold mb-2 ${getScoreColor(companyData.esgScore)}`}>
          {companyData.esgScore.toFixed(1)}
        </div>
        <p className="text-sm text-slate-600">Overall ESG performance rating</p>
        {companyData.dataSource === 'demo' && (
          <div className="mt-2 text-xs text-orange-600 font-medium">
            ⚠️ Demo score for prototype
          </div>
        )}
      </div>

      {/* Environmental Score */}
      <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${getScoreBgColor(companyData.environmentScore)}`}>
        <div className="flex items-center space-x-3 mb-4">
          <Leaf className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-slate-800">Environmental</h3>
        </div>
        <div className={`text-4xl font-bold mb-2 ${getScoreColor(companyData.environmentScore)}`}>
          {companyData.environmentScore.toFixed(1)}
        </div>
        <p className="text-sm text-slate-600">Climate & environmental impact</p>
        {companyData.dataSource === 'demo' && (
          <div className="mt-2 text-xs text-orange-600 font-medium">
            ⚠️ Demo score for prototype
          </div>
        )}
      </div>

      {/* Social Score */}
      <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${getScoreBgColor(companyData.socialScore)}`}>
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-800">Social</h3>
        </div>
        <div className={`text-4xl font-bold mb-2 ${getScoreColor(companyData.socialScore)}`}>
          {companyData.socialScore.toFixed(1)}
        </div>
        <p className="text-sm text-slate-600">Employee & community relations</p>
        {companyData.dataSource === 'demo' && (
          <div className="mt-2 text-xs text-orange-600 font-medium">
            ⚠️ Demo score for prototype
          </div>
        )}
      </div>

      {/* Governance Score */}
      <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${getScoreBgColor(companyData.governanceScore)}`}>
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-800">Governance</h3>
        </div>
        <div className={`text-4xl font-bold mb-2 ${getScoreColor(companyData.governanceScore)}`}>
          {companyData.governanceScore.toFixed(1)}
        </div>
        <p className="text-sm text-slate-600">Corporate governance & ethics</p>
        {companyData.dataSource === 'demo' && (
          <div className="mt-2 text-xs text-orange-600 font-medium">
            ⚠️ Demo score for prototype
          </div>
        )}
      </div>
    </div>
  );
};

export default ESGScoreSection; 