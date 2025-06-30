import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { getSharedCalendar } from '../services/calendarSharingService';
import '../styles/calendar-modern.css'; // Re-use existing calendar styles
import { useTranslation } from 'react-i18next';
import frLocale from '@fullcalendar/core/locales/fr';
import enLocale from '@fullcalendar/core/locales/en-gb';

const SharedCalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const location = useLocation();
  const { i18n } = useTranslation();

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
          const formattedEvents = result.events.map(event => ({
            title: event.title,
            start: event.startTime, // Map startTime to start
            end: event.endTime,     // Map endTime to end
            allDay: event.isAllDay,
            extendedProps: {
              description: event.description,
              color: event.eventColor,
            },
          }));
          console.log('SharedCalendarPage: Formatted events for FullCalendar:', formattedEvents);
          setData({ ...result, events: formattedEvents });
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
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={data.events || []} // Ensure events is an array
          locale={i18n.language.startsWith('fr') ? frLocale : enLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          editable={false}
          selectable={false}
          droppable={false}
          eventClick={(info) => {
            // Prevent default browser action
            info.jsEvent.preventDefault();
            // Optionally, you could show event details in a simple alert or modal
            alert(`Événement: ${info.event.title}\nDébut: ${info.event.start.toLocaleString()}\nFin: ${info.event.end ? info.event.end.toLocaleString() : 'N/A'}`);
          }}
        />
      </div>
    </div>
  );
};

export default SharedCalendarPage;
