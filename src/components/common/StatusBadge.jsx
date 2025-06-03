import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    // User/Account statuses
    ACTIVE: { color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100', label: 'Active' },
    INACTIVE: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100', label: 'Inactive' },
    
    // Card statuses
    LOST: { color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100', label: 'Lost' },
    EXPIRED: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100', label: 'Expired' },
    PENDING_ACTIVATION: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100', label: 'Pending' },
    
    // Scanner statuses
    ONLINE: { color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100', label: 'Online' },
    OFFLINE: { color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100', label: 'Offline' },
    MAINTENANCE: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100', label: 'Maintenance' },
    
    // Transaction statuses
    COMPLETED: { color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100', label: 'Completed' },
    PENDING: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100', label: 'Pending' },
    FAILED: { color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100', label: 'Failed' },
    
    // Transaction types
    CREDIT: { color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100', label: 'Credit' },
    DEBIT: { color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100', label: 'Debit' },
    TRANSFER: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100', label: 'Transfer' },
    
    // Admin roles
    SUPER_ADMIN: { color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100', label: 'Super Admin' },
    ADMIN: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100', label: 'Admin' },
    MANAGER: { color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100', label: 'Manager' }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const config = statusConfig[status] || { 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100', 
    label: status || 'Unknown' 
  };

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;