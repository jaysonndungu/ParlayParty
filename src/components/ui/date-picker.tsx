/**
 * Date Picker Component for ParlayParty
 * 
 * A custom date picker that enforces date constraints:
 * - Start date: Today or later
 * - End date: After start date, up to 1 year from start date
 */

import React, { useState, useEffect } from 'react';

export interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date",
  label,
  error,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);

  useEffect(() => {
    setSelectedDate(value);
  }, [value]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    onChange(date);
    setIsOpen(false);
  };

  const formatDate = (date: string) => {
    if (!date) return placeholder;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMinDate = () => {
    if (minDate) return minDate;
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    if (maxDate) return maxDate;
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return oneYearFromNow.toISOString().split('T')[0];
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error 
            ? 'border-red-300 text-red-900 placeholder-red-300' 
            : 'border-gray-300 text-gray-900 placeholder-gray-500'
          }
          ${disabled 
            ? 'bg-gray-50 cursor-not-allowed' 
            : 'bg-white cursor-pointer hover:border-gray-400'
          }
        `}
      >
        {formatDate(selectedDate)}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-0"
          />
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// ============================================================================
// Date Range Picker Component
// ============================================================================

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  startDateError?: string;
  endDateError?: string;
  disabled?: boolean;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateError,
  endDateError,
  disabled = false,
  className = "",
}) => {
  const [startDateValue, setStartDateValue] = useState(startDate);
  const [endDateValue, setEndDateValue] = useState(endDate);

  useEffect(() => {
    setStartDateValue(startDate);
  }, [startDate]);

  useEffect(() => {
    setEndDateValue(endDate);
  }, [endDate]);

  const handleStartDateChange = (date: string) => {
    setStartDateValue(date);
    onStartDateChange(date);
    
    // If end date is before new start date, clear it
    if (endDateValue && date && new Date(endDateValue) <= new Date(date)) {
      setEndDateValue('');
      onEndDateChange('');
    }
  };

  const handleEndDateChange = (date: string) => {
    setEndDateValue(date);
    onEndDateChange(date);
  };

  const getEndDateMin = () => {
    if (!startDateValue) return new Date().toISOString().split('T')[0];
    const nextDay = new Date(startDateValue);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  const getEndDateMax = () => {
    if (!startDateValue) {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      return oneYearFromNow.toISOString().split('T')[0];
    }
    const oneYearFromStart = new Date(startDateValue);
    oneYearFromStart.setFullYear(oneYearFromStart.getFullYear() + 1);
    return oneYearFromStart.toISOString().split('T')[0];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <DatePicker
        value={startDateValue}
        onChange={handleStartDateChange}
        label="Start Date"
        placeholder="Select start date"
        error={startDateError}
        disabled={disabled}
      />
      
      <DatePicker
        value={endDateValue}
        onChange={handleEndDateChange}
        minDate={getEndDateMin()}
        maxDate={getEndDateMax()}
        label="End Date"
        placeholder="Select end date"
        error={endDateError}
        disabled={disabled || !startDateValue}
      />
    </div>
  );
};

// ============================================================================
// React Native Date Picker (for mobile)
// ============================================================================

export interface MobileDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  style?: any;
}

export const MobileDatePicker: React.FC<MobileDatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date",
  label,
  error,
  disabled = false,
  style,
}) => {
  const formatDate = (date: string) => {
    if (!date) return placeholder;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMinDate = () => {
    if (minDate) return minDate;
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    if (maxDate) return maxDate;
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return oneYearFromNow.toISOString().split('T')[0];
  };

  return (
    <div style={style}>
      {label && (
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
          {label}
        </Text>
      )}
      
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={getMinDate()}
        max={getMaxDate()}
        disabled={disabled}
        style={{
          width: '100%',
          padding: 12,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : '#d1d5db',
          borderRadius: 8,
          fontSize: 16,
          backgroundColor: disabled ? '#f9fafb' : '#ffffff',
          color: disabled ? '#9ca3af' : '#111827',
        }}
      />

      {error && (
        <Text style={{ fontSize: 14, color: '#ef4444', marginTop: 4 }}>
          {error}
        </Text>
      )}
    </div>
  );
};

// ============================================================================
// Utility Functions
// ============================================================================

export const validateDateRange = (startDate: string, endDate: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!startDate) {
    errors.push('Start date is required');
  }

  if (!endDate) {
    errors.push('End date is required');
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if start date is today or later
    if (start < today) {
      errors.push('Start date must be today or later');
    }

    // Check if end date is after start date
    if (end <= start) {
      errors.push('End date must be after start date');
    }

    // Check if duration is within 1 year
    const maxDuration = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if (end.getTime() - start.getTime() > maxDuration) {
      errors.push('Party duration cannot exceed 1 year');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getDefaultStartDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getDefaultEndDate = (): string => {
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
  return oneWeekFromNow.toISOString().split('T')[0];
};
