import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Database, 
  RefreshCw, 
  X, 
  Wifi, 
  Key, 
  Clock 
} from 'lucide-react';

export interface ApiNotification {
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  showRetry?: boolean;
  apiName?: string;
  source?: 'api' | 'fallback' | 'error';
}

interface ApiNotificationBannerProps {
  notification: ApiNotification;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const ApiNotificationBanner: React.FC<ApiNotificationBannerProps> = ({
  notification,
  onRetry,
  onDismiss,
  className = ''
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <Database className="w-5 h-5" />;
      case 'info':
        return <Wifi className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          border: 'border-l-red-500',
          text: 'text-red-800',
          icon: 'text-red-500',
          button: 'bg-red-100 hover:bg-red-200 text-red-800'
        };
      case 'warning':
        return {
          container: 'bg-orange-50 border-orange-200',
          border: 'border-l-orange-500',
          text: 'text-orange-800',
          icon: 'text-orange-500',
          button: 'bg-orange-100 hover:bg-orange-200 text-orange-800'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          border: 'border-l-blue-500',
          text: 'text-blue-800',
          icon: 'text-blue-500',
          button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          border: 'border-l-gray-500',
          text: 'text-gray-800',
          icon: 'text-gray-500',
          button: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        };
    }
  };

  const colors = getColors();

  const getSourceBadge = () => {
    if (!notification.source) return null;

    switch (notification.source) {
      case 'fallback':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 ml-2">
            <Database className="w-3 h-3 mr-1" />
            Demo Mode
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Offline
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`
          ${colors.container} ${colors.border}
          border border-l-4 rounded-lg shadow-sm p-4 mb-4 
          ${className}
        `}
      >
        <div className="flex items-start">
          {/* Icon */}
          <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
            {getIcon()}
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className={`text-sm font-semibold ${colors.text}`}>
                  {notification.title}
                </h3>
                {getSourceBadge()}
              </div>

              {/* Dismiss button */}
              {onDismiss && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onDismiss}
                  className={`
                    ${colors.icon} hover:${colors.text}
                    transition-colors ml-2 p-1 rounded-full hover:bg-white/50
                  `}
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            <p className={`text-sm ${colors.text} mt-1 opacity-90`}>
              {notification.message}
            </p>

            {/* Action buttons */}
            {(notification.showRetry && onRetry) && (
              <div className="mt-3 flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRetry}
                  className={`
                    inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium
                    ${colors.button}
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
                  `}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try Again
                </motion.button>

                <span className={`text-xs ${colors.text} opacity-70 flex items-center`}>
                  <Clock className="w-3 h-3 mr-1" />
                  Next retry available in 60s
                </span>
              </div>
            )}

            {/* API specific messages */}
            {notification.apiName && (
              <div className={`text-xs ${colors.text} opacity-75 mt-2 flex items-center`}>
                <Key className="w-3 h-3 mr-1" />
                {notification.apiName} API
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApiNotificationBanner; 