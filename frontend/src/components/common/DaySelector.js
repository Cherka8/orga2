import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setDaysPreset } from '../../redux/slices/calendarSettingsSlice';

const DaySelector = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const visibleDays = useSelector(state => state.calendarSettings.visibleDays);
  
  // Vérifier si le mode actuel est "workweek" (5 jours) ou "fullweek" (7 jours)
  const isWorkWeek = visibleDays[1] && visibleDays[2] && visibleDays[3] && 
                     visibleDays[4] && visibleDays[5] && 
                     !visibleDays[0] && !visibleDays[6];
  
  const isFullWeek = visibleDays[0] && visibleDays[1] && visibleDays[2] && 
                     visibleDays[3] && visibleDays[4] && visibleDays[5] && 
                     visibleDays[6];

  const handleSetPreset = (preset) => {
    dispatch(setDaysPreset(preset));
  };

  return (
    <div className="day-selector">
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => handleSetPreset('workweek')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
            isWorkWeek 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-pressed={isWorkWeek}
        >
          {t('daySelector.fiveDays')}
        </button>
        
        <button
          onClick={() => handleSetPreset('fullweek')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
            isFullWeek 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-pressed={isFullWeek}
        >
          {t('daySelector.sevenDays')}
        </button>
      </div>
    </div>
  );
};

export default DaySelector;
