/**
 * Date Picker Integration Example
 * 
 * This shows how to integrate the DatePicker components into your existing create party functionality
 */

import React, { useState } from 'react';
import { DateRangePicker, validateDateRange } from './ui/date-picker';

// Example: How to integrate with your existing createParty function
export const CreatePartyWithDatePicker = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'friendly' as 'friendly' | 'competitive',
    startDate: '',
    endDate: '',
    buyIn: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleCreateParty = async () => {
    // Clear previous errors
    setErrors({});

    // Validate date range
    const dateValidation = validateDateRange(formData.startDate, formData.endDate);
    if (!dateValidation.isValid) {
      const newErrors: Record<string, string> = {};
      dateValidation.errors.forEach((error) => {
        if (error.includes('Start date')) {
          newErrors.startDate = error;
        } else if (error.includes('End date')) {
          newErrors.endDate = error;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Validate other fields
    if (!formData.name.trim()) {
      setErrors({ name: 'Party name is required' });
      return;
    }

    if (formData.type === 'competitive' && (!formData.buyIn || formData.buyIn <= 0)) {
      setErrors({ buyIn: 'Buy-in amount is required for competitive parties' });
      return;
    }

    setLoading(true);
    
    try {
      // Call your existing createParty function
      // await createParty(formData.name, formData.type, formData.startDate, formData.endDate, formData.buyIn);
      
      console.log('Creating party with data:', formData);
      
      // Reset form
      setFormData({
        name: '',
        type: 'friendly',
        startDate: '',
        endDate: '',
        buyIn: 0,
      });
    } catch (error) {
      console.error('Error creating party:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Party</h2>
      
      <div className="space-y-4">
        {/* Party Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Party Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter party name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Party Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Party Type
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
              Friendly
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="competitive"
                checked={formData.type === 'competitive'}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'friendly' | 'competitive' }))}
                className="mr-2"
              />
              Competitive
            </label>
          </div>
        </div>

        {/* Date Range Picker - This is the key component! */}
        <DateRangePicker
          startDate={formData.startDate}
          endDate={formData.endDate}
          onStartDateChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
          onEndDateChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
          startDateError={errors.startDate}
          endDateError={errors.endDate}
        />

        {/* Buy-in for competitive parties */}
        {formData.type === 'competitive' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buy-in Amount ($)
            </label>
            <input
              type="number"
              value={formData.buyIn || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, buyIn: parseFloat(e.target.value) || 0 }))}
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.buyIn && (
              <p className="mt-1 text-sm text-red-600">{errors.buyIn}</p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleCreateParty}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Party'}
        </button>
      </div>
    </div>
  );
};

// Example: How to update your existing PartiesScreen component
export const UpdatedPartiesScreenExample = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'friendly' as 'friendly' | 'competitive',
    startDate: '',
    endDate: '',
    buyIn: 0,
  });

  const handleCreateParty = () => {
    // Your existing createParty logic here
    console.log('Creating party:', formData);
    setShowCreateForm(false);
  };

  return (
    <div>
      {/* Your existing parties list */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">My Parties</h1>
        {/* Your existing parties display */}
      </div>

      {/* Create Party Button */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Create New Party
      </button>

      {/* Create Party Modal/Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Party</h2>
            
            <div className="space-y-4">
              {/* Party Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Party Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter party name"
                />
              </div>

              {/* Party Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Party Type
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
                    Friendly
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="competitive"
                      checked={formData.type === 'competitive'}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'friendly' | 'competitive' }))}
                      className="mr-2"
                    />
                    Competitive
                  </label>
                </div>
              </div>

              {/* Date Range Picker */}
              <DateRangePicker
                startDate={formData.startDate}
                endDate={formData.endDate}
                onStartDateChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                onEndDateChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
              />

              {/* Buy-in for competitive parties */}
              {formData.type === 'competitive' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buy-in Amount ($)
                  </label>
                  <input
                    type="number"
                    value={formData.buyIn || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyIn: parseFloat(e.target.value) || 0 }))}
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateParty}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Create Party
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
