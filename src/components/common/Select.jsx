import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder, 
  required, 
  error, 
  disabled,
  className = '',
  helperText,
  ...props 
}) => {
  const selectClasses = `
    block w-full px-3 py-2 border rounded-lg shadow-sm bg-white dark:bg-gray-700
    focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange
    dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    appearance-none cursor-pointer
    transition-colors duration-200
    ${error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 dark:border-gray-600'
    }
  `;

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} 
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {error ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Select;