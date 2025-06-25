import React, { useState, useEffect } from 'react';
import { Bell, Settings, Filter, MailCheck, Smartphone, Search, Eye, EyeOff, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { 
  alertsService, 
  Alert, 
  AlertType, 
  CompanyAlertSettings, 
  AlertPreferences, 
  ALERT_TYPES 
} from '../services/alertsService';

interface AlertsPageProps {
  onNavigate: (page: string, companyId?: string) => void;
}

const AlertsPage: React.FC<AlertsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'settings' | 'preferences'>('feed');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanyAlertSettings[]>([]);
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAlerts(alertsService.getRecentAlerts());
    setCompanySettings(alertsService.getCompanyAlertSettings());
    setPreferences(alertsService.getAlertPreferences());
  };

  const getFilteredAlerts = () => {
    return alertsService.getRecentAlerts({
      severity: selectedSeverity.length > 0 ? selectedSeverity : undefined,
      alertTypes: selectedCategories.length > 0 ? 
        ALERT_TYPES.filter(t => selectedCategories.includes(t.category)).map(t => t.id) : undefined,
      unreadOnly: showUnreadOnly
    }).filter(alert => 
      !searchQuery || 
      alert.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleAlertToggle = (companyId: string, alertTypeId: string, enabled: boolean) => {
    alertsService.updateCompanyAlertSetting(companyId, alertTypeId, enabled);
    setCompanySettings(alertsService.getCompanyAlertSettings());
  };

  const handlePreferenceUpdate = (key: string, value: any) => {
    if (!preferences) return;
    
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    alertsService.saveAlertPreferences(updated);
  };

  const handleCategoryToggle = (category: string, enabled: boolean) => {
    if (!preferences) return;
    
    const updated = {
      ...preferences,
      categories: { ...preferences.categories, [category]: enabled }
    };
    setPreferences(updated);
    alertsService.saveAlertPreferences(updated);
  };

  const handleEmailSetup = async () => {
    if (!emailInput.trim()) return;
    
    setEmailLoading(true);
    try {
      await alertsService.setupEmailWebhook(emailInput, preferences?.emailNotifications || false);
      setEmailInput('');
    } catch (error) {
      console.error('Email setup failed:', error);
    } finally {
      setEmailLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'bg-blue-100 text-blue-800';
      case 'news': return 'bg-purple-100 text-purple-800';
      case 'index': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const alertCounts = alertsService.getAlertCounts();
  const filteredAlerts = getFilteredAlerts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
              ESG Alerts
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Stay informed about ESG developments across your portfolio companies and watchlist.
          </p>
        </div>

        {/* Alert Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Total Alerts</h3>
              <Bell className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{alertCounts.total}</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Unread</h3>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-red-600">{alertCounts.unread}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Performance</h3>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-blue-600">{alertCounts.byCategory.performance || 0}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">News & Index</h3>
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {(alertCounts.byCategory.news || 0) + (alertCounts.byCategory.index || 0)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === 'feed'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Recent Alerts ({alertCounts.total})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Company Settings
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Notification Preferences
            </button>
          </div>

          {/* Recent Alerts Feed */}
          {activeTab === 'feed' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    multiple
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(Array.from(e.target.selectedOptions, option => option.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="high">High Severity</option>
                    <option value="medium">Medium Severity</option>
                    <option value="low">Low Severity</option>
                  </select>

                  <select
                    multiple
                    value={selectedCategories}
                    onChange={(e) => setSelectedCategories(Array.from(e.target.selectedOptions, option => option.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="performance">Performance</option>
                    <option value="news">News</option>
                    <option value="index">Index Changes</option>
                  </select>

                  <button
                    onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showUnreadOnly
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {showUnreadOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showUnreadOnly ? ' Show All' : ' Unread Only'}
                  </button>
                </div>
              </div>

              {/* Alerts List */}
              <div className="space-y-4">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        alert.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="text-2xl">{alert.logo}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-slate-800">{alert.title}</h3>
                              {!alert.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-slate-700">{alert.companyName}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">{alert.ticker}</span>
                              <span className="text-slate-400">•</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(alert.alertType.category)}`}>
                                {alert.alertType.icon} {alert.alertType.name}
                              </span>
                            </div>
                            <p className="text-slate-600 mb-3">{alert.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1 text-slate-500">
                                <Clock className="w-4 h-4" />
                                <span>{formatTimeAgo(alert.timestamp)}</span>
                              </div>
                              {alert.source && (
                                <div className="flex items-center space-x-1 text-slate-500">
                                  <ExternalLink className="w-4 h-4" />
                                  <span>{alert.source}</span>
                                </div>
                              )}
                              {alert.impactScore && alert.previousScore && (
                                <div className="text-slate-500">
                                  Score: {alert.previousScore} → {alert.impactScore}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded border font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <button
                            onClick={() => onNavigate('company', alert.companyId)}
                            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                          >
                            View Company →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No Alerts Found</h3>
                    <p className="text-slate-500">
                      {searchQuery || selectedSeverity.length > 0 || selectedCategories.length > 0
                        ? 'Try adjusting your filters to see more alerts.'
                        : 'No recent ESG alerts available.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Company Settings */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Alert Settings by Company</h3>
                <p className="text-slate-600">Configure which types of alerts you want to receive for each company in your portfolio.</p>
              </div>

              <div className="space-y-6">
                {companySettings.map((company) => (
                  <div key={company.companyId} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-800">{company.companyName}</h4>
                        <p className="text-sm text-slate-600">{company.ticker}</p>
                      </div>
                      <button
                        onClick={() => onNavigate('company', company.companyId)}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ALERT_TYPES.map((alertType) => (
                        <div key={alertType.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{alertType.icon}</span>
                            <div>
                              <div className="font-medium text-slate-800 text-sm">{alertType.name}</div>
                              <div className="text-xs text-slate-500">{alertType.description}</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={company.alertTypes[alertType.id] || false}
                              onChange={(e) => handleAlertToggle(company.companyId, alertType.id, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notification Preferences */}
          {activeTab === 'preferences' && preferences && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Notification Preferences</h3>
                <p className="text-slate-600">Configure how and when you receive ESG alerts.</p>
              </div>

              <div className="space-y-8">
                {/* Delivery Methods */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-4">Delivery Methods</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MailCheck className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-slate-800">Email Notifications</div>
                          <div className="text-sm text-slate-600">Receive alerts via email</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) => handlePreferenceUpdate('emailNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5 text-emerald-600" />
                        <div>
                          <div className="font-medium text-slate-800">Push Notifications</div>
                          <div className="text-sm text-slate-600">Receive alerts in your browser</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.pushNotifications}
                          onChange={(e) => handlePreferenceUpdate('pushNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Email Configuration */}
                {preferences.emailNotifications && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-4">Email Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <div className="flex space-x-2">
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="Enter your email address"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <button
                            onClick={handleEmailSetup}
                            disabled={emailLoading || !emailInput.trim()}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            {emailLoading ? 'Setting up...' : 'Setup Webhook'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Frequency</label>
                        <select
                          value={preferences.emailFrequency}
                          onChange={(e) => handlePreferenceUpdate('emailFrequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="immediate">Immediate</option>
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Summary</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-4">Alert Categories</h4>
                  <div className="space-y-3">
                    {['performance', 'news', 'index'].map((category) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-800 capitalize">{category} Alerts</div>
                          <div className="text-sm text-slate-600">
                            {category === 'performance' && 'ESG score changes and performance updates'}
                            {category === 'news' && 'Controversies, awards, and regulatory actions'}
                            {category === 'index' && 'ESG index inclusions and removals'}
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.categories[category]}
                            onChange={(e) => handleCategoryToggle(category, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPage; 