import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, MoreVertical } from 'lucide-react';
import LoadingSpinner, { TableSkeleton } from './LoadingSpinner';
import Pagination from './Pagination';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  sortable = true,
  searchable = true,
  filterable = false,
  selectable = false,
  pagination = null,
  emptyState = null,
  actions = null,
  bulkActions = null,
  className = '',
  rowClassName = '',
  onRowClick = null,
  onSort = null,
  onSearch = null,
  onFilter = null,
  onSelect = null,
  onSelectAll = null,
  selectedRows = [],
  searchTerm = '',
  searchPlaceholder = 'Search...',
  noDataMessage = 'No data available',
  noDataIcon = null
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm);
  const [showFilters, setShowFilters] = useState(false);

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    
    if (onSort) {
      onSort(newSortConfig);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setInternalSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle row selection
  const handleRowSelect = (id, checked) => {
    if (onSelect) {
      onSelect(id, checked);
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (onSelectAll) {
      onSelectAll(checked);
    }
  };

  // Render sort indicator
  const renderSortIndicator = (columnKey) => {
    if (!sortable || !columnKey) return null;

    if (sortConfig.key !== columnKey) {
      return <ChevronDown size={14} className="text-gray-400" />;
    }

    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="text-gray-600 dark:text-gray-300" />
      : <ChevronDown size={14} className="text-gray-600 dark:text-gray-300" />;
  };

  // Render table header
  const renderHeader = () => (
    <thead className="bg-gray-50 dark:bg-gray-900">
      <tr>
        {selectable && (
          <th className="px-6 py-3 text-left">
            <input
              type="checkbox"
              checked={selectedRows.length === data.length && data.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 text-tapyze-orange focus:ring-tapyze-orange border-gray-300 rounded"
            />
          </th>
        )}
        {columns.map((column, index) => (
          <th
            key={column.key || index}
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
              sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''
            }`}
            onClick={() => column.sortable !== false && handleSort(column.key)}
          >
            <div className="flex items-center space-x-1">
              <span>{column.title}</span>
              {column.sortable !== false && renderSortIndicator(column.key)}
            </div>
          </th>
        ))}
        {actions && (
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Actions
          </th>
        )}
      </tr>
    </thead>
  );

  // Render table row
  const renderRow = (row, index) => (
    <tr
      key={row.id || index}
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
        onRowClick ? 'cursor-pointer' : ''
      } ${rowClassName} ${selectedRows.includes(row.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      onClick={() => onRowClick && onRowClick(row)}
    >
      {selectable && (
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(row.id, e.target.checked);
            }}
            className="h-4 w-4 text-tapyze-orange focus:ring-tapyze-orange border-gray-300 rounded"
          />
        </td>
      )}
      {columns.map((column, columnIndex) => (
        <td key={column.key || columnIndex} className="px-6 py-4 whitespace-nowrap">
          {column.render ? column.render(row[column.key], row, index) : (
            <span className="text-sm text-gray-900 dark:text-white">
              {row[column.key]}
            </span>
          )}
        </td>
      ))}
      {actions && (
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          {typeof actions === 'function' ? actions(row) : actions}
        </td>
      )}
    </tr>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (emptyState) {
      return emptyState;
    }

    return (
      <tr>
        <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="px-6 py-12 text-center">
          <div className="flex flex-col items-center space-y-3">
            {noDataIcon && <div className="text-gray-400">{noDataIcon}</div>}
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {noDataMessage}
            </h3>
            {searchable && internalSearchTerm && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {/* Table Header Controls */}
      {(searchable || filterable || bulkActions) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            {searchable && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={internalSearchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Bulk Actions */}
              {bulkActions && selectedRows.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedRows.length} selected
                  </span>
                  {typeof bulkActions === 'function' ? bulkActions(selectedRows) : bulkActions}
                </div>
              )}

              {/* Filters Toggle */}
              {filterable && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-tapyze-orange"
                >
                  <Filter size={16} className="mr-2" />
                  Filters
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {filterable && showFilters && onFilter && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {onFilter()}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {renderHeader()}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <TableSkeleton 
                rows={5} 
                columns={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} 
              />
            ) : data.length > 0 ? (
              data.map((row, index) => renderRow(row, index))
            ) : (
              renderEmptyState()
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination {...pagination} />
        </div>
      )}

      {/* Loading Overlay */}
      {loading && data.length > 0 && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      )}
    </div>
  );
};

// Helper function to create column definitions
export const createColumn = (key, title, options = {}) => ({
  key,
  title,
  sortable: options.sortable !== false,
  render: options.render,
  width: options.width,
  align: options.align || 'left'
});

// Common column renderers
export const columnRenderers = {
  // Date renderer
  date: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
  
  // Status badge renderer
  status: (value, statusConfig = {}) => {
    const config = statusConfig[value] || { color: 'gray', label: value };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  },

  // Avatar renderer
  avatar: (value, row, nameField = 'name') => (
    <div className="flex items-center">
      <div className="flex-shrink-0 h-10 w-10">
        {value ? (
          <img className="h-10 w-10 rounded-full" src={value} alt="" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-tapyze-orange flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {row[nameField]?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {row[nameField]}
        </div>
      </div>
    </div>
  ),

  // Actions dropdown
  actions: (actions) => (
    <div className="relative inline-block text-left">
      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <MoreVertical size={16} />
      </button>
      {/* Dropdown menu would be implemented here */}
    </div>
  )
};

export default DataTable;