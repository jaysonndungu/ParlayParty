/**
 * Create Party Form Component
 * 
 * Example of how to integrate the DatePicker component into your create party form
 */

import React, { useState } from 'react';
import { DateRangePicker, validateDateRange, getDefaultStartDate, getDefaultEndDate } from './ui/date-picker';

export interface CreatePartyFormData {
  name: string;
  type: 'friendly' | 'competitive';
  startDate: string;
  endDate: string;
  buyIn?: number;
  allowedSports?: string[];
  evalLimit?: number;
  description?: string;
}

export interface CreatePartyFormProps {
  onSubmit: (data: CreatePartyFormData) => void;
  loading?: boolean;
  error?: string;
}

export const CreatePartyForm: React.FC<CreatePartyFormProps> = ({
  onSubmit,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<CreatePartyFormData>({
    name: '',
    type: 'friendly',
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
    buyIn: 0,
    allowedSports: ['NFL', 'NBA'],
    evalLimit: 5,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form data
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Party name is required';
    }

    if (formData.type === 'competitive') {
      if (!formData.buyIn || formData.buyIn <= 0) {
        newErrors.buyIn = 'Buy-in amount is required for competitive parties';
      }
      if (!formData.allowedSports || formData.allowedSports.length === 0) {
        newErrors.allowedSports = 'At least one sport must be selected';
      }
    }

    // Validate date range
    const dateValidation = validateDateRange(formData.startDate, formData.endDate);
    if (!dateValidation.isValid) {
      dateValidation.errors.forEach((error, index) => {
        if (error.includes('Start date')) {
          newErrors.startDate = error;
        } else if (error.includes('End date')) {
          newErrors.endDate = error;
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    onSubmit(formData);
  };

  const handleStartDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, startDate: date }));
    // Clear date errors when user changes dates
    if (errors.startDate || errors.endDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        delete newErrors.endDate;
        return newErrors;
      });
    }
  };

  const handleEndDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, endDate: date }));
    // Clear date errors when user changes dates
    if (errors.startDate || errors.endDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        delete newErrors.endDate;
        return newErrors;
      });
    }
  };

  const handleSportToggle = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      allowedSports: prev.allowedSports?.includes(sport)
        ? prev.allowedSports.filter(s => s !== sport)
        : [...(prev.allowedSports || []), sport]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Party Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Party Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter party name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Party Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Party Type *
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="friendly"
              checked={formData.type === 'friendly'}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'friendly' | 'competitive' }))}
              className="mr-2"
            />
            <span>Friendly</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="competitive"
              checked={formData.type === 'competitive'}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'friendly' | 'competitive' }))}
              className="mr-2"
            />
            <span>Competitive</span>
          </label>
        </div>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        startDate={formData.startDate}
        endDate={formData.endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        startDateError={errors.startDate}
        endDateError={errors.endDate}
      />

      {/* Competitive Party Fields */}
      {formData.type === 'competitive' && (
        <>
          {/* Buy-in Amount */}
          <div>
            <label htmlFor="buyIn" className="block text-sm font-medium text-gray-700 mb-1">
              Buy-in Amount ($) *
            </label>
            <input
              type="number"
              id="buyIn"
              value={formData.buyIn || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, buyIn: parseFloat(e.target.value) || 0 }))}
              min="0.01"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.buyIn ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.buyIn && (
              <p className="mt-1 text-sm text-red-600">{errors.buyIn}</p>
            )}
          </div>

          {/* Allowed Sports */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Sports *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['NFL', 'NBA', 'MLB', 'NHL', 'NCAAB', 'NCAAF', 'MLS', 'UFC'].map((sport) => (
                <label key={sport} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allowedSports?.includes(sport) || false}
                    onChange={() => handleSportToggle(sport)}
                    className="mr-2"
                  />
                  <span>{sport}</span>
                </label>
              ))}
            </div>
            {errors.allowedSports && (
              <p className="mt-1 text-sm text-red-600">{errors.allowedSports}</p>
            )}
          </div>

          {/* Evaluation Limit */}
          <div>
            <label htmlFor="evalLimit" className="block text-sm font-medium text-gray-700 mb-1">
              Evaluation Limit
            </label>
            <input
              type="number"
              id="evalLimit"
              value={formData.evalLimit || 5}
              onChange={(e) => setFormData(prev => ({ ...prev, evalLimit: parseInt(e.target.value) || 5 }))}
              min="1"
              max="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of parlays to evaluate per user
            </p>
          </div>
        </>
      )}

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Optional description for your party"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 py-2 px-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Party...' : 'Create Party'}
      </button>
    </form>
  );
};
