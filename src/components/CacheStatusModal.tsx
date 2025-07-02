import React, { useState, useEffect } from 'react';
import { X, Database, Trash2, RefreshCw, BarChart3, Clock, HardDrive, TrendingUp } from 'lucide-react';
import { esgCacheService, CacheStats } from '../services/esgCacheService';

interface CacheStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CacheStatusModal: React.FC<CacheStatusModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load cache statistics
  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [cacheStats, perfMetrics] = await Promise.all([
        esgCacheService.getCacheStats(),
        Promise.resolve(esgCacheService.getPerformanceMetrics())
      ]);
      
      setStats(cacheStats);
      setPerformanceMetrics(perfMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear all cached ESG data? This will require fresh API calls.')) {
      setIsLoading(true);
      try {
        await esgCacheService.clearCache();
        await loadStats(); // Refresh stats
      } catch (error) {
        console.error('Failed to clear cache:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (timestamp: number): string => {
    if (timestamp === 0) return 'No data';
    return new Date(timestamp).toLocaleString();
  };

  // Load stats when modal opens
  useEffect(() => {
    if (isOpen) {
      loadStats();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadStats, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-slate-800">ESG Cache Status</h2>
              <p className="text-sm text-slate-600">Monitor and manage API cache performance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && !stats ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-slate-600">Loading cache statistics...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Performance Overview */}
              {performanceMetrics && (
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Hit Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {performanceMetrics.hitRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-600">
                      {performanceMetrics.hits} / {performanceMetrics.totalRequests} requests
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Total Requests</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {performanceMetrics.totalRequests.toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-600">
                      {performanceMetrics.misses} misses
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Database className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Cache Entries</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-800">
                      {stats?.totalEntries || 0}
                    </div>
                    <div className="text-xs text-purple-600">
                      entries stored
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <HardDrive className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Cache Size</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-800">
                      {formatSize(stats?.totalSize || 0)}
                    </div>
                    <div className="text-xs text-orange-600">
                      of 5MB limit
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Statistics */}
              {stats && (
                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Detailed Statistics</span>
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-600">Total Entries:</span>
                        <span className="font-medium text-slate-800">{stats.totalEntries}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-600">Total Size:</span>
                        <span className="font-medium text-slate-800">{formatSize(stats.totalSize)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-600">Hit Rate:</span>
                        <span className="font-medium text-slate-800">{stats.hitRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600">Miss Rate:</span>
                        <span className="font-medium text-slate-800">{stats.missRate.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-600">Oldest Entry:</span>
                        <span className="font-medium text-slate-800 text-xs">{formatDate(stats.oldestEntry)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-600">Newest Entry:</span>
                        <span className="font-medium text-slate-800 text-xs">{formatDate(stats.newestEntry)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-600">Cache Efficiency:</span>
                        <span className={`font-medium ${stats.hitRate > 70 ? 'text-green-600' : stats.hitRate > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {stats.hitRate > 70 ? 'Excellent' : stats.hitRate > 40 ? 'Good' : 'Poor'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600">Storage Usage:</span>
                        <span className="font-medium text-slate-800">
                          {((stats.totalSize / (5 * 1024 * 1024)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cache Usage Bar */}
              {stats && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Storage Usage</span>
                    <span className="text-xs text-slate-500">{formatSize(stats.totalSize)} / 5MB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (stats.totalSize / (5 * 1024 * 1024)) > 0.8 ? 'bg-red-500' :
                        (stats.totalSize / (5 * 1024 * 1024)) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (stats.totalSize / (5 * 1024 * 1024)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={loadStats}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={handleClearCache}
                    disabled={isLoading || !stats || stats.totalEntries === 0}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Cache</span>
                  </button>
                </div>
              </div>

              {/* Cache Benefits Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Cache Benefits</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Reduces API calls and avoids rate limits</li>
                  <li>• Improves page load times with instant data retrieval</li>
                  <li>• Automatically expires data after 24 hours for freshness</li>
                  <li>• Intelligent cleanup removes least-used entries when storage is full</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CacheStatusModal; 