import React from 'react';
import { useESGData } from '../hooks/useESGData';
import { motion, AnimatePresence } from 'framer-motion';

interface ESGDataDisplayProps {
  ticker: string;
}

const ESGDataDisplay: React.FC<ESGDataDisplayProps> = ({ ticker }) => {
  const { data, loading, error, refetch } = useESGData(ticker);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="p-4 bg-white rounded-lg shadow"
        >
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </motion.div>
      ) : error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center">
            <div className="text-red-600 text-sm">
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={refetch}
              className="ml-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </motion.div>
      ) : !data ? (
        <motion.div
          key="nodata"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="text-yellow-800 text-sm">
            No ESG data available for {ticker}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={data.symbol}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="p-6 bg-white rounded-lg shadow-lg"
        >
          {/* Header with data source indicator */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{data.companyName}</h3>
              <p className="text-sm text-gray-600">{data.sector}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                data.dataSource === 'live' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {data.dataSource === 'live' ? '🟢 Live Data' : '🔵 Prototype Data'}
              </span>
              <button
                onClick={refetch}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* ESG Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{data.esgScore.toFixed(1)}</div>
              <div className="text-xs text-gray-600">Overall ESG</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{data.environmentScore.toFixed(1)}</div>
              <div className="text-xs text-green-600">Environmental</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{data.socialScore.toFixed(1)}</div>
              <div className="text-xs text-blue-600">Social</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{data.governanceScore.toFixed(1)}</div>
              <div className="text-xs text-purple-600">Governance</div>
            </div>
          </div>

          {/* Additional Data (if available from prototype) */}
          {data.prototypeData && (
            <div className="space-y-4">
              {/* Summary */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                <p className="text-sm text-gray-700">{data.prototypeData.summary}</p>
              </div>

              {/* Controversies */}
              {data.prototypeData.controversies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Recent Controversies</h4>
                  <div className="space-y-2">
                    {data.prototypeData.controversies.map((controversy, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          controversy.severity === 'high' ? 'bg-red-100 text-red-800' :
                          controversy.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {controversy.severity}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{controversy.title}</div>
                          <div className="text-xs text-gray-600">{controversy.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact Metrics */}
              {data.prototypeData.impactMetrics && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Impact Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-900">
                        {data.prototypeData.impactMetrics.carbonFootprint.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">CO2 (tons)</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-900">
                        {data.prototypeData.impactMetrics.renewableEnergyPercentage.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-600">Renewable Energy</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-900">
                        {data.prototypeData.impactMetrics.employeeSatisfaction.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">Employee Satisfaction</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-900">
                        {data.prototypeData.impactMetrics.boardIndependence.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-600">Board Independence</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Last Updated */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {data.lastUpdated}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ESGDataDisplay; 