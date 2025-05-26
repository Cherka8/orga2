import React from 'react';
import { useTranslation } from 'react-i18next';

const CalendarToolbar = ({ 
  title, 
  onPrev, 
  onNext, 
  onToday, 
  onViewChange, 
  currentView,
  dateRange
}) => {
  const { t } = useTranslation();

  return (
    <div style={{
      padding: '8px 12px',
      backgroundColor: 'white',
      borderBottom: '1px solid #ebeef2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Left section with navigation controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Navigation controls */}
        <button 
          onClick={onPrev}
          style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '14px'
          }}
        >
          &lt;
        </button>
        <span style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#111827'
        }}>
          {title}
        </span>
        <button 
          onClick={onNext}
          style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '14px'
          }}
        >
          &gt;
        </button>
      </div>

      {/* Right section with view controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Today button */}
        <button
          onClick={onToday}
          style={{
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: '#f3f4f6',
            color: '#111827',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          {t('calendarToolbar.today', 'Today')}
        </button>
        
        {/* View buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          padding: '2px'
        }}>
          <button
            onClick={() => onViewChange('timeGridDay')}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: currentView === 'timeGridDay' ? '#ffffff' : 'transparent',
              color: currentView === 'timeGridDay' ? '#111827' : '#6b7280',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              boxShadow: currentView === 'timeGridDay' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
            }}
          >
            {t('calendarToolbar.day', 'Day')}
          </button>
          <button
            onClick={() => onViewChange('timeGridWeek')}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: currentView === 'timeGridWeek' ? '#ffffff' : 'transparent',
              color: currentView === 'timeGridWeek' ? '#111827' : '#6b7280',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              boxShadow: currentView === 'timeGridWeek' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
            }}
          >
            {t('calendarToolbar.week', 'Week')}
          </button>
          <button
            onClick={() => onViewChange('dayGridMonth')}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: currentView === 'dayGridMonth' ? '#ffffff' : 'transparent',
              color: currentView === 'dayGridMonth' ? '#111827' : '#6b7280',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              boxShadow: currentView === 'dayGridMonth' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
            }}
          >
            {t('calendarToolbar.month', 'Month')}
          </button>
        </div>

        {/* Settings button */}
        <button
          style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '14px'
          }}
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default CalendarToolbar;
