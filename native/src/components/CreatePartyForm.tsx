/**
 * React Native Create Party Form Component
 * 
 * Example of how to integrate the DatePicker component into your create party form
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { DateRangePicker, validateDateRange, getDefaultStartDate, getDefaultEndDate } from './DatePicker';
import { colors, spacing } from '@/theme/tokens';

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

const SPORTS = ['NFL', 'NBA', 'MLB', 'NHL', 'NCAAB', 'NCAAF', 'MLS', 'UFC'];

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

  const handleSubmit = () => {
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
      dateValidation.errors.forEach((error) => {
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Party Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Party Name *</Text>
        <TextInput
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="Enter party name"
          style={[styles.input, errors.name && styles.inputError]}
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name}</Text>
        )}
      </View>

      {/* Party Type */}
      <View style={styles.field}>
        <Text style={styles.label}>Party Type *</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[styles.radioOption, formData.type === 'friendly' && styles.radioOptionSelected]}
            onPress={() => setFormData(prev => ({ ...prev, type: 'friendly' }))}
          >
            <View style={[styles.radioCircle, formData.type === 'friendly' && styles.radioCircleSelected]}>
              {formData.type === 'friendly' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>Friendly</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.radioOption, formData.type === 'competitive' && styles.radioOptionSelected]}
            onPress={() => setFormData(prev => ({ ...prev, type: 'competitive' }))}
          >
            <View style={[styles.radioCircle, formData.type === 'competitive' && styles.radioCircleSelected]}>
              {formData.type === 'competitive' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>Competitive</Text>
          </TouchableOpacity>
        </View>
      </View>

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
          <View style={styles.field}>
            <Text style={styles.label}>Buy-in Amount ($) *</Text>
            <TextInput
              value={formData.buyIn?.toString() || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, buyIn: parseFloat(text) || 0 }))}
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.input, errors.buyIn && styles.inputError]}
            />
            {errors.buyIn && (
              <Text style={styles.errorText}>{errors.buyIn}</Text>
            )}
          </View>

          {/* Allowed Sports */}
          <View style={styles.field}>
            <Text style={styles.label}>Allowed Sports *</Text>
            <View style={styles.sportsGrid}>
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport}
                  style={[
                    styles.sportOption,
                    formData.allowedSports?.includes(sport) && styles.sportOptionSelected
                  ]}
                  onPress={() => handleSportToggle(sport)}
                >
                  <Text style={[
                    styles.sportText,
                    formData.allowedSports?.includes(sport) && styles.sportTextSelected
                  ]}>
                    {sport}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.allowedSports && (
              <Text style={styles.errorText}>{errors.allowedSports}</Text>
            )}
          </View>

          {/* Evaluation Limit */}
          <View style={styles.field}>
            <Text style={styles.label}>Evaluation Limit</Text>
            <TextInput
              value={formData.evalLimit?.toString() || '5'}
              onChangeText={(text) => setFormData(prev => ({ ...prev, evalLimit: parseInt(text) || 5 }))}
              keyboardType="numeric"
              style={styles.input}
            />
            <Text style={styles.helperText}>
              Maximum number of parlays to evaluate per user
            </Text>
          </View>
        </>
      )}

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Optional description for your party"
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
      >
        <Text style={[styles.submitButtonText, loading && styles.submitButtonTextDisabled]}>
          {loading ? 'Creating Party...' : 'Create Party'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  radioOptionSelected: {
    // Add selected styling if needed
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.primary,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary.main,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.main,
  },
  radioText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sportOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  sportOptionSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  sportText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  sportTextSelected: {
    color: colors.background.primary,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  errorContainer: {
    backgroundColor: colors.error.light,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 14,
    color: colors.error.primary,
  },
  submitButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: colors.background.disabled,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background.primary,
  },
  submitButtonTextDisabled: {
    color: colors.text.disabled,
  },
});
