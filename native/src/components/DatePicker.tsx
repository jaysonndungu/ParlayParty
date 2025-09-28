/**
 * React Native Date Picker Component for ParlayParty
 * 
 * A custom date picker that enforces date constraints:
 * - Start date: Today or later
 * - End date: After start date, up to 1 year from start date
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform, ScrollView } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export interface DatePickerProps {
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

export const DatePicker: React.FC<DatePickerProps> = ({
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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value ? new Date(value) : new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(value ? new Date(value) : new Date());

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    }
  }, [value]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleOpen = () => {
    if (!disabled) {
      setCurrentMonth(selectedDate);
      setIsOpen(true);
    }
  };

  const handleConfirm = () => {
    onChange(selectedDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const canNavigatePrev = () => {
    const minDate = getMinDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return firstDayOfMonth > minDate;
  };

  const canNavigateNext = () => {
    const maxDate = getMaxDate();
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    return lastDayOfMonth < maxDate;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    return days;
  };

  const isDateDisabled = (date: Date) => {
    const minDate = getMinDate();
    const maxDate = getMaxDate();
    return date < minDate || date > maxDate;
  };

  const isDateSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date) => {
    if (!date) return placeholder;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMinDate = () => {
    if (minDate) return new Date(minDate);
    return new Date();
  };

  const getMaxDate = () => {
    if (maxDate) return new Date(maxDate);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return oneYearFromNow;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        style={[
          styles.input,
          error && styles.inputError,
          disabled && styles.inputDisabled
        ]}
      >
        <Text style={[
          styles.inputText,
          error && styles.inputTextError,
          disabled && styles.inputTextDisabled
        ]}>
          {formatDate(selectedDate)}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isOpen}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleConfirm} style={styles.modalButton}>
                  <Text style={[styles.modalButtonText, styles.modalButtonConfirm]}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity 
                    onPress={() => navigateMonth('prev')} 
                    disabled={!canNavigatePrev()}
                    style={[styles.navButton, !canNavigatePrev() && styles.navButtonDisabled]}
                  >
                    <Text style={[styles.navButtonText, !canNavigatePrev() && styles.navButtonTextDisabled]}>‹</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.monthYear}>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  
                  <TouchableOpacity 
                    onPress={() => navigateMonth('next')} 
                    disabled={!canNavigateNext()}
                    style={[styles.navButton, !canNavigateNext() && styles.navButtonDisabled]}
                  >
                    <Text style={[styles.navButtonText, !canNavigateNext() && styles.navButtonTextDisabled]}>›</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.weekDays}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} style={styles.weekDayText}>{day}</Text>
                  ))}
                </View>
                
                <View style={styles.calendarGrid}>
                  {generateCalendarDays().map((date, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayButton,
                        date && isDateSelected(date) && styles.selectedDay,
                        date && isDateDisabled(date) && styles.disabledDay,
                        date && isToday(date) && !isDateSelected(date) && styles.todayDay,
                      ]}
                      onPress={() => date && !isDateDisabled(date) && handleDateSelect(date)}
                      disabled={!date || isDateDisabled(date)}
                    >
                      <Text style={[
                        styles.dayText,
                        date && isDateSelected(date) && styles.selectedDayText,
                        date && isDateDisabled(date) && styles.disabledDayText,
                        date && isToday(date) && !isDateSelected(date) && styles.todayDayText,
                      ]}>
                        {date ? date.getDate() : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
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
  style?: any;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateError,
  endDateError,
  disabled = false,
  style,
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
    <View style={[styles.rangeContainer, style]}>
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
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing(2),
  },
  rangeContainer: {
    gap: spacing(2),
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing(1),
    color: colors.textHigh,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.steel,
    borderRadius: 8,
    padding: spacing(2),
    backgroundColor: colors.slate,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.chip,
  },
  inputText: {
    fontSize: 16,
    color: colors.textHigh,
  },
  inputTextError: {
    color: colors.error,
  },
  inputTextDisabled: {
    color: colors.textLow,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: spacing(1),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.slate,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area bottom
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: colors.steel,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textHigh,
  },
  modalButton: {
    padding: spacing(1),
  },
  modalButtonText: {
    fontSize: 16,
    color: colors.textMid,
  },
  modalButtonConfirm: {
    color: colors.primary,
    fontWeight: '600',
  },
  calendarContainer: {
    padding: spacing(2),
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(2),
    paddingHorizontal: spacing(1),
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.chip,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: colors.steel,
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textHigh,
  },
  navButtonTextDisabled: {
    color: colors.textLow,
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textHigh,
    flex: 1,
    textAlign: 'center',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: spacing(1),
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMid,
    paddingVertical: spacing(1),
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing(1),
  },
  selectedDay: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  todayDay: {
    backgroundColor: colors.chip,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: colors.textHigh,
  },
  selectedDayText: {
    color: '#000',
    fontWeight: '600',
  },
  todayDayText: {
    color: colors.primary,
    fontWeight: '600',
  },
  disabledDayText: {
    color: colors.textLow,
  },
});

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
