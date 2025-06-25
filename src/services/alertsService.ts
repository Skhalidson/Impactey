import { companies } from '../data/companies';

export interface AlertType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'performance' | 'news' | 'index';
}

export interface CompanyAlertSettings {
  companyId: string;
  companyName: string;
  ticker: string;
  alertTypes: {
    [alertTypeId: string]: boolean;
  };
}

export interface Alert {
  id: string;
  companyId: string;
  companyName: string;
  ticker: string;
  logo: string;
  alertType: AlertType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  isRead: boolean;
  source?: string;
  impactScore?: number;
  previousScore?: number;
}

export interface AlertPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  emailFrequency: 'immediate' | 'daily' | 'weekly';
  categories: {
    [category: string]: boolean;
  };
}

// Available alert types
export const ALERT_TYPES: AlertType[] = [
  {
    id: 'controversy',
    name: 'Controversy Alerts',
    description: 'New ESG controversies or negative news coverage',
    icon: '⚠️',
    category: 'news'
  },
  {
    id: 'score_drop',
    name: 'ESG Score Drops',
    description: 'Significant decreases in ESG ratings (>0.5 points)',
    icon: '📉',
    category: 'performance'
  },
  {
    id: 'score_improvement',
    name: 'ESG Score Improvements',
    description: 'Notable improvements in ESG ratings (>0.5 points)',
    icon: '📈',
    category: 'performance'
  },
  {
    id: 'index_inclusion',
    name: 'ESG Index Inclusion',
    description: 'Added to major ESG indices (MSCI, FTSE4Good, etc.)',
    icon: '✅',
    category: 'index'
  },
  {
    id: 'index_removal',
    name: 'ESG Index Removal',
    description: 'Removed from major ESG indices',
    icon: '❌',
    category: 'index'
  },
  {
    id: 'positive_news',
    name: 'Positive ESG News',
    description: 'Awards, certifications, or positive ESG initiatives',
    icon: '🏆',
    category: 'news'
  },
  {
    id: 'regulatory_action',
    name: 'Regulatory Actions',
    description: 'ESG-related fines, sanctions, or regulatory investigations',
    icon: '⚖️',
    category: 'news'
  }
];

class AlertsService {
  private storageKey = 'impactey-alert-settings';
  private preferencesKey = 'impactey-alert-preferences';
  private alertsKey = 'impactey-alerts';

  // Get alert settings for all companies
  getCompanyAlertSettings(): CompanyAlertSettings[] {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }

    // Default settings - all alerts enabled for all companies
    const defaultSettings: CompanyAlertSettings[] = companies.map(company => ({
      companyId: company.id,
      companyName: company.name,
      ticker: company.ticker,
      alertTypes: ALERT_TYPES.reduce((acc, alertType) => {
        acc[alertType.id] = true;
        return acc;
      }, {} as { [key: string]: boolean })
    }));

    this.saveCompanyAlertSettings(defaultSettings);
    return defaultSettings;
  }

  // Save alert settings
  saveCompanyAlertSettings(settings: CompanyAlertSettings[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(settings));
  }

  // Update alert setting for a specific company and alert type
  updateCompanyAlertSetting(companyId: string, alertTypeId: string, enabled: boolean): void {
    const settings = this.getCompanyAlertSettings();
    const companySettings = settings.find(s => s.companyId === companyId);
    
    if (companySettings) {
      companySettings.alertTypes[alertTypeId] = enabled;
      this.saveCompanyAlertSettings(settings);
    }
  }

  // Get user preferences
  getAlertPreferences(): AlertPreferences {
    const stored = localStorage.getItem(this.preferencesKey);
    if (stored) {
      return JSON.parse(stored);
    }

    const defaultPreferences: AlertPreferences = {
      emailNotifications: false,
      pushNotifications: true,
      emailFrequency: 'daily',
      categories: {
        performance: true,
        news: true,
        index: true
      }
    };

    this.saveAlertPreferences(defaultPreferences);
    return defaultPreferences;
  }

  // Save user preferences
  saveAlertPreferences(preferences: AlertPreferences): void {
    localStorage.setItem(this.preferencesKey, JSON.stringify(preferences));
  }

  // Generate mock recent alerts
  generateMockAlerts(): Alert[] {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        companyId: companies.find(c => c.name === 'Tesla')?.id || '1',
        companyName: 'Tesla',
        ticker: 'TSLA',
        logo: '🚗',
        alertType: ALERT_TYPES.find(t => t.id === 'controversy')!,
        title: 'Workplace Safety Investigation',
        description: 'OSHA opens investigation into workplace safety practices at Tesla\'s Fremont facility following employee complaints.',
        severity: 'medium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        source: 'Reuters'
      },
      {
        id: '2',
        companyId: companies.find(c => c.name === 'Microsoft')?.id || '2',
        companyName: 'Microsoft',
        ticker: 'MSFT',
        logo: '💻',
        alertType: ALERT_TYPES.find(t => t.id === 'score_improvement')!,
        title: 'ESG Score Upgraded',
        description: 'Microsoft\'s ESG score improved from 7.6 to 8.1 following carbon negative commitments and diversity initiatives.',
        severity: 'low',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isRead: false,
        impactScore: 8.1,
        previousScore: 7.6
      },
      {
        id: '3',
        companyId: companies.find(c => c.name === 'Chevron')?.id || '3',
        companyName: 'Chevron',
        ticker: 'CVX',
        logo: '⛽',
        alertType: ALERT_TYPES.find(t => t.id === 'index_removal')!,
        title: 'Removed from MSCI ESG Leaders Index',
        description: 'Chevron removed from MSCI ESG Leaders Index due to continued fossil fuel expansion and environmental concerns.',
        severity: 'high',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isRead: true,
        source: 'MSCI'
      },
      {
        id: '4',
        companyId: companies.find(c => c.name === 'Johnson & Johnson')?.id || '4',
        companyName: 'Johnson & Johnson',
        ticker: 'JNJ',
        logo: '🏥',
        alertType: ALERT_TYPES.find(t => t.id === 'positive_news')!,
        title: 'Sustainability Award Received',
        description: 'J&J awarded "Healthcare Sustainability Leader 2024" for carbon neutrality achievements and global health initiatives.',
        severity: 'low',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: true,
        source: 'Healthcare Sustainability Council'
      },
      {
        id: '5',
        companyId: companies.find(c => c.name === 'Amazon')?.id || '5',
        companyName: 'Amazon',
        ticker: 'AMZN',
        logo: '📦',
        alertType: ALERT_TYPES.find(t => t.id === 'regulatory_action')!,
        title: 'EU Privacy Fine Imposed',
        description: 'Amazon fined €65M by EU regulators for GDPR violations affecting worker privacy and data protection.',
        severity: 'high',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: false,
        source: 'European Commission'
      },
      {
        id: '6',
        companyId: companies.find(c => c.name === 'Apple')?.id || '6',
        companyName: 'Apple',
        ticker: 'AAPL',
        logo: '🍎',
        alertType: ALERT_TYPES.find(t => t.id === 'index_inclusion')!,
        title: 'Added to FTSE4Good Index',
        description: 'Apple included in FTSE4Good Index Series following improvements in supply chain transparency and labor practices.',
        severity: 'low',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isRead: true,
        source: 'FTSE Russell'
      },
      {
        id: '7',
        companyId: companies.find(c => c.name === 'Walmart')?.id || '7',
        companyName: 'Walmart',
        ticker: 'WMT',
        logo: '🛒',
        alertType: ALERT_TYPES.find(t => t.id === 'score_drop')!,
        title: 'ESG Score Downgraded',
        description: 'Walmart\'s ESG score decreased from 6.8 to 6.2 due to supply chain labor concerns and environmental impact issues.',
        severity: 'medium',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        isRead: true,
        impactScore: 6.2,
        previousScore: 6.8
      }
    ];

    return mockAlerts;
  }

  // Get recent alerts with filtering
  getRecentAlerts(filters?: {
    companyIds?: string[];
    alertTypes?: string[];
    severity?: string[];
    unreadOnly?: boolean;
  }): Alert[] {
    let alerts = this.generateMockAlerts();

    if (filters) {
      if (filters.companyIds?.length) {
        alerts = alerts.filter(alert => filters.companyIds!.includes(alert.companyId));
      }

      if (filters.alertTypes?.length) {
        alerts = alerts.filter(alert => filters.alertTypes!.includes(alert.alertType.id));
      }

      if (filters.severity?.length) {
        alerts = alerts.filter(alert => filters.severity!.includes(alert.severity));
      }

      if (filters.unreadOnly) {
        alerts = alerts.filter(alert => !alert.isRead);
      }
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Mark alert as read
  markAsRead(alertId: string): void {
    // In a real app, this would update the backend
    console.log(`Marking alert ${alertId} as read`);
  }

  // Mark all alerts as read
  markAllAsRead(): void {
    // In a real app, this would update the backend
    console.log('Marking all alerts as read');
  }

  // Get alert counts
  getAlertCounts(): { total: number; unread: number; byCategory: { [category: string]: number } } {
    const alerts = this.getRecentAlerts();
    const unread = alerts.filter(a => !a.isRead);

    const byCategory = ALERT_TYPES.reduce((acc, type) => {
      acc[type.category] = alerts.filter(a => a.alertType.category === type.category).length;
      return acc;
    }, {} as { [category: string]: number });

    return {
      total: alerts.length,
      unread: unread.length,
      byCategory
    };
  }

  // Simulate webhook setup for email notifications
  setupEmailWebhook(email: string, enabled: boolean): Promise<boolean> {
    // In a real app, this would configure backend webhooks
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Email webhook ${enabled ? 'enabled' : 'disabled'} for ${email}`);
        resolve(true);
      }, 1000);
    });
  }
}

export const alertsService = new AlertsService(); 