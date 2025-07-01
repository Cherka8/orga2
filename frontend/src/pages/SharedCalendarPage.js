import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import { getSharedCalendar } from '../services/calendarSharingService';
import '../styles/calendar-modern.css'; // Re-use existing calendar styles
import { useTranslation } from 'react-i18next';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const SharedCalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const location = useLocation();
  const { i18n, t } = useTranslation();
  
  // Configure le localisateur moment en fonction de la langue
  moment.locale(i18n.language.startsWith('fr') ? 'fr' : 'en');
  const localizer = momentLocalizer(moment);

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    console.log('SharedCalendarPage: Using token:', token);

    if (!token) {
      setError('Token de partage manquant.');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const result = await getSharedCalendar(token);
        console.log('SharedCalendarPage: Received data from API:', result);

        if (result && result.events) {
          const formattedEvents = result.events.map(event => {
            // Ensure dates are properly parsed as Date objects
            const startDate = new Date(event.startTime);
            const endDate = event.endTime ? new Date(event.endTime) : null;
            
            return {
              title: event.title,
              start: startDate,
              end: endDate || new Date(startDate.getTime() + 60 * 60 * 1000), // Default to 1 hour if no end time
              allDay: event.isAllDay,
              resource: event.description,
              color: event.eventColor || '#3788d8'
            };
          });
          console.log('SharedCalendarPage: Formatted events for React Big Calendar:', formattedEvents);
          setData(result);
          setEvents(formattedEvents);
        } else {
          setData(result);
        }
      } catch (err) {
        console.error('SharedCalendarPage: Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location.search]);

  if (loading) {
    return <div>Chargement du calendrier...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (!data) {
    // This can happen briefly if loading is done but data is not yet set, or if the API returned null.
    return <div>Aucune donnée de calendrier à afficher.</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Calendrier de {data.actor.firstName} {data.actor.lastName}
      </h1>
      <div className="calendar-container" style={{ height: '80vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day']}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          messages={{
            today: i18n.language.startsWith('fr') ? 'Aujourd\'hui' : 'Today',
            previous: i18n.language.startsWith('fr') ? 'Précédent' : 'Back',
            next: i18n.language.startsWith('fr') ? 'Suivant' : 'Next',
            month: i18n.language.startsWith('fr') ? 'Mois' : 'Month',
            week: i18n.language.startsWith('fr') ? 'Semaine' : 'Week',
            day: i18n.language.startsWith('fr') ? 'Jour' : 'Day',
            agenda: i18n.language.startsWith('fr') ? 'Agenda' : 'Agenda',
            date: i18n.language.startsWith('fr') ? 'Date' : 'Date',
            time: i18n.language.startsWith('fr') ? 'Heure' : 'Time',
            event: i18n.language.startsWith('fr') ? 'Événement' : 'Event',
            allDay: i18n.language.startsWith('fr') ? 'Toute la journée' : 'All Day'
          }}
          formats={{
            timeGutterFormat: (date, culture, localizer) =>
              localizer.format(date, 'HH:mm', culture),
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color,
              borderColor: event.color,
              color: '#ffffff',
              fontSize: '0.9em',
              padding: '2px 5px',
              borderRadius: '3px',
              height: 'auto'
            }
          })}
          onSelectEvent={(event) => {
            alert(`Événement: ${event.title}\nDébut: ${event.start.toLocaleString()}\nFin: ${event.end.toLocaleString()}${event.resource ? '\nDescription: ' + event.resource : ''}`);
          }}
        />
      </div>
    </div>
  );
};

export default SharedCalendarPage;
