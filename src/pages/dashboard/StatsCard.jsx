import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "blue",
  trend,
  trendDirection = "up",
  subtitle,
  onClick
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      icon: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800"
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      icon: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800"
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      icon: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800"
    },
    orange: {
      bg: "bg-tapyze-orange-50 dark:bg-orange-900/20",
      icon: "text-tapyze-orange dark:text-orange-400",
      border: "border-tapyze-orange-200 dark:border-orange-800"
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      icon: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-200 dark:border-indigo-800"
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      icon: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800"
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div 
      className={`bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border ${colors.border} hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg ${colors.bg}`}>
              <Icon className={`h-6 w-6 ${colors.icon}`} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {value}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trendDirection === 'up' ? (
                      <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                    )}
                    <span className="ml-1">{trend}</span>
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {subtitle}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;