import React from 'react';
import { parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale'; 
import { useTranslation } from 'react-i18next'; 
import { formatTime, formatDate } from '../../utils/timeUtils';

const ActorEventList = ({ events = [] }) => {
  const { t, i18n } = useTranslation(); 

  const locale = i18n.language === 'fr' ? fr : enUS; 

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className="mx-auto h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('actorEventList.noEventsTitle')}</h3>
        <p className="mt-1 text-sm text-gray-500">{t('actorEventList.noEventsDescription')}</p>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => parseISO(b.start) - parseISO(a.start));

  const eventColors = [
    'bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500',
    'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500',
    'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500',
    'bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500',
    'bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500',
    'bg-gradient-to-r from-cyan-50 to-sky-50 border-l-4 border-cyan-500',
  ];

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => {
        const startDate = parseISO(event.start);
        const endDate = parseISO(event.end);
        const locationActor = event.extendedProps?.location;
        
        const eventColor = event.backgroundColor 
          ? `border-l-4 border-[${event.backgroundColor}] bg-gradient-to-r from-[${event.backgroundColor}]/10 to-[${event.backgroundColor}]/5`
          : eventColors[index % eventColors.length];

        return (
          <div 
            key={event.id} 
            className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${eventColor}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-base font-semibold text-indigo-700">{event.title || t('actorEventList.untitledEvent')}</h4>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                {formatTime(startDate, locale)} - {formatTime(endDate, locale)}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="font-medium">{formatDate(startDate, locale)}</span>
              </div>
              
              {locationActor && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>{locationActor.name || t('actorEventList.unspecifiedLocation')}</span>
                </div>
              )}
              
              {event.extendedProps?.description && (
                <div className="mt-2 text-sm text-gray-600 bg-white bg-opacity-50 p-2 rounded">
                  {event.extendedProps.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActorEventList;
