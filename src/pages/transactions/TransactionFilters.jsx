import React from 'react';
import { Button } from '../../components/common';

const TransactionFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'CREDIT', label: 'Credit' },
    { value: 'DEBIT', label: 'Debit' },
    { value: 'TRANSFER', label: 'Transfer' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Advanced Filters
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Transaction Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Amount (NPR)
          </label>
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Amount (NPR)
          </label>
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            placeholder="No limit"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="secondary" onClick={onClearFilters}>
          Clear All Filters
        </Button>
      </div>

      {/* Active Filters Summary */}
      {Object.values(filters).some(value => value !== '') && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Active Filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.startDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tapyze-orange-100 text-tapyze-orange-800 dark:bg-tapyze-orange-800 dark:text-tapyze-orange-100">
                From: {new Date(filters.startDate).toLocaleDateString()}
              </span>
            )}
            {filters.endDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tapyze-orange-100 text-tapyze-orange-800 dark:bg-tapyze-orange-800 dark:text-tapyze-orange-100">
                To: {new Date(filters.endDate).toLocaleDateString()}
              </span>
            )}
            {filters.type && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                Type: {filters.type}
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                Status: {filters.status}
              </span>
            )}
            {filters.minAmount && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                Min: NPR {filters.minAmount}
              </span>
            )}
            {filters.maxAmount && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                Max: NPR {filters.maxAmount}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;