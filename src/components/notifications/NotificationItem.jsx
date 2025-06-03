import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationItem = ({ notification }) => {
  const { removeNotification } = useNotification();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-in-out transform ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : isLeaving
          ? 'translate-x-full opacity-0 scale-95'
          : 'translate-x-full opacity-0 scale-95'
      } ${getNotificationStyles(notification.type)}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10">
        <div 
          className="h-full bg-current opacity-50 transition-all duration-5000 ease-linear"
          style={{
            width: isVisible ? '0%' : '100%',
            transitionDuration: '5000ms'
          }}
        />
      </div>
    </div>
  );
};

export default NotificationItem;