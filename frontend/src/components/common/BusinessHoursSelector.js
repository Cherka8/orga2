import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setSlotMinTime, setSlotMaxTime } from '../../redux/slices/calendarSettingsSlice';

const BusinessHoursSelector = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slotMinTime, slotMaxTime } = useSelector(state => state.calendarSettings);
  const [error, setError] = useState('');

  // Helper function to convert time string to minutes for comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.substring(0, 5).split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    const formattedTime = `${newStartTime}:00`;
    
    // Check if new start time is before end time
    if (timeToMinutes(newStartTime) >= timeToMinutes(slotMaxTime)) {
      setError(t('businessHoursSelector.errorStartBeforeEnd'));
      return;
    }
    
    setError('');
    dispatch(setSlotMinTime(formattedTime));
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    const formattedTime = `${newEndTime}:00`;
    
    // Check if new end time is after start time
    if (timeToMinutes(newEndTime) <= timeToMinutes(slotMinTime)) {
      setError(t('businessHoursSelector.errorEndAfterStart'));
      return;
    }
    
    setError('');
    dispatch(setSlotMaxTime(formattedTime));
  };

  // Format time for display in the input (HH:MM)
  const formatTimeForDisplay = (time) => {
    return time.substring(0, 5);
  };

  return (
    <div className="business-hours-selector mb-3">
      <p className="text-sm font-medium text-gray-700 mb-2">{t('businessHoursSelector.title')}</p>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <label className="text-xs text-gray-500 w-10">{t('businessHoursSelector.startLabel')}</label>
          <input
            type="time"
            value={formatTimeForDisplay(slotMinTime)}
            onChange={handleStartTimeChange}
            className="w-20 px-1 py-1 text-sm border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex items-center">
          <label className="text-xs text-gray-500 w-10">{t('businessHoursSelector.endLabel')}</label>
          <input
            type="time"
            value={formatTimeForDisplay(slotMaxTime)}
            onChange={handleEndTimeChange}
            className="w-20 px-1 py-1 text-sm border border-gray-300 rounded-md"
          />
        </div>
        
        {error && (
          <div className="mt-1">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessHoursSelector;
