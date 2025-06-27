import React, { useState, useRef, useEffect, useMemo, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; // Assurer que useDispatch est importé
import { store } from './redux/store';
import { selectAllFilters } from './redux/slices/viewsSlice';
import { setEvents as setEventsInStore, createEvent, fetchEvents, selectEvents } from './redux/slices/eventsSlice';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// import listPlugin from '@fullcalendar/list'; // Commenté car non utilisé dans la configuration actuelle
import enLocale from '@fullcalendar/core/locales/en-gb';
import frLocale from '@fullcalendar/core/locales/fr'; // Import French locale
import CalendarToolbar from './components/calendar/CalendarToolbar';
import Sidebar from './components/common/Sidebar';
import TempEvent from './components/events/TempEvent';
import { loadEventsFromLocalStorage, saveEventsToLocalStorage, removeEventFromLocalStorage } from './utils/storageUtils';
// Importer les nouvelles fonctions et l'action
import { 
  extractViewFiltersFromEvents, 
  filterEventsByFocus, 
  filterEvents, 
  filterEventsByDateRange, // <-- Nouveau
  extractItemsFromEvents // <-- Nouveau
} from './utils/viewsUtils';
import { selectGroupsByIdMap } from './redux/slices/groupsSlice';
import { selectIsAuthenticated } from './redux/slices/authSlice';
import { 
  initializeFilters, 
  updateAvailableColors, 
  updateAvailableActors, 
  updateAvailableGroups, 
  updateVisibleViewItems // <-- Nouveau
} from './redux/slices/viewsSlice';
import './styles/calendar-modern.css';
import './styles/event-modal.css';
import './styles/event-popover.css';

// Chargement paresseux des composants volumineux
const ActorsPage = lazy(() => import('./components/actors/ActorsPage'));
const EventFormModal = lazy(() => import('./components/calendar/EventFormModal'));
const EventDetailsPopover = lazy(() => import('./components/events/EventDetailsPopover'));
const RegisterPage = lazy(() => import('./components/auth/RegisterPage'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage'));
const EmailVerificationPage = lazy(() => import('./components/auth/EmailVerificationPage'));
const ForgotPasswordPage = lazy(() => import('./components/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./components/auth/ResetPasswordPage'));
const AuthInitializer = lazy(() => import('./components/auth/AuthInitializer'));

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const publicPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
    const isPublicPage = publicPages.some(page => location.pathname.startsWith(page));

    if (!isAuthenticated && !isPublicPage) {
      console.log('User is not authenticated, redirecting to login.');
      navigate('/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);
  // Déterminer si nous sommes sur une page d'authentification ou de profil
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/email-verification'].some(path => location.pathname.startsWith(path));
  const isProfilePage = location.pathname === '/profile';
  const { i18n } = useTranslation(); // Get i18n instance
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const calendarRef = useRef(null);
  const dispatch = useDispatch();
  const eventsFromStore = useSelector(selectEvents);
  const [sidebarWidth, setSidebarWidth] = useState(300); // Initial width
  const [sidebarOpen, setSidebarOpen] = useState(true); // État pour la sidebar

  // Get filters from Redux
  const filters = useSelector(selectAllFilters);
  
  // Get groups data from Redux
  const groupsById = useSelector(selectGroupsByIdMap);

  // State for event modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventModalPosition, setEventModalPosition] = useState({ x: 0, y: 0 });
  const [eventInitialDate, setEventInitialDate] = useState(new Date());
  const [eventRect, setEventRect] = useState(null);
  const [tempEvent, setTempEvent] = useState(null);
  const [tempEventId, setTempEventId] = useState('temp-event-' + Date.now());
  const [eventToEdit, setEventToEdit] = useState(null);

  // State for event details popover
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsPopoverOpen, setIsDetailsPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  // Générer un nouvel ID pour l'événement temporaire à chaque ouverture de modal
  const generateNewTempEventId = () => {
    const newId = 'temp-event-' + Date.now();
    setTempEventId(newId);
    return newId;
  };

  const [calendarTitle, setCalendarTitle] = useState('');

  const visibleDays = useSelector(state => state.calendarSettings?.visibleDays || {
    0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true
  });

  // Get start and end times from Redux store
  const slotMinTime = useSelector(state => state.calendarSettings?.slotMinTime || '09:00:00');
  const slotMaxTime = useSelector(state => state.calendarSettings?.slotMaxTime || '17:00:00');

  // Récupérer les filtres de vue depuis le store Redux
  const viewFilters = useSelector(selectAllFilters);
  const focus = useSelector(state => state.views.focus);
  
  // Add a useEffect to update the title when the language changes
  useEffect(() => {
    if (calendarRef.current && calendarRef.current.getApi()) {
      updateCalendarTitle(calendarRef.current.getApi());
    }
  }, [i18n.language]); // Re-run when language changes

  // Initialiser les filtres de vue à partir des événements
  useEffect(() => {
    if (eventsFromStore.length > 0) {
      const { actors, groups, colors } = extractViewFiltersFromEvents(eventsFromStore, groupsById);
      
      // Initialiser les filtres pour les acteurs, groupes et couleurs
      dispatch(initializeFilters({ actors, groups, colors }));
      
      // Mettre à jour les éléments disponibles (pour supprimer ceux qui ne sont plus utilisés)
      dispatch(updateAvailableActors({ actors }));
      dispatch(updateAvailableGroups({ groups }));
      dispatch(updateAvailableColors({ colors }));
    } else {
      // Si aucun événement, mettre à jour avec des tableaux vides
      dispatch(updateAvailableActors({ actors: [] }));
      dispatch(updateAvailableGroups({ groups: [] }));
      dispatch(updateAvailableColors({ colors: [] }));
    }
  }, [eventsFromStore, dispatch, groupsById]);

  // Filtrer les événements en fonction des filtres actifs

  const hiddenDays = useMemo(() => {
    const hidden = Object.entries(visibleDays)
      .filter(([_, isVisible]) => !isVisible)
      .map(([dayIndex]) => parseInt(dayIndex));
    
    // If all days are hidden, show at least Monday (index 1)
    if (hidden.length === 7) {
      return [0, 2, 3, 4, 5, 6]; // Hide all days except Monday
    }
    
    return hidden;
  }, [visibleDays]);

  // Handle date click
  const handleDateClick = (arg) => {
    // Si la popover est ouverte, on la ferme simplement et on ne fait rien d'autre
    if (isDetailsPopoverOpen) {
      setIsDetailsPopoverOpen(false);
      return;
    }
    
    // Si une sauvegarde est en cours, ne rien faire
    if (isSaving) return;
    
    // Si la modal est déjà ouverte, ne rien faire
    if (isEventModalOpen) return;
    
    // Prevent default selection
    arg.jsEvent.preventDefault();
    
    // Capture the dimensions of the clicked date cell
    const rect = arg.jsEvent.target.getBoundingClientRect();
    
    // Store the full dimensions of the cell
    setEventRect({
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height
    });
    
    // Set the initial date for the event - create a new Date object to avoid reference issues
    setEventInitialDate(new Date(arg.date));
    
    // Create a temporary event
    const newTempEventId = generateNewTempEventId();
    
    // Create new Date objects for start and end to avoid reference issues
    const startDate = new Date(arg.date);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);
    
    const newTempEvent = {
      id: newTempEventId,
      title: 'New Event',
      start: startDate,
      end: endDate,
      display: 'block',
      className: 'temp-event',
      extendedProps: {
        isTemporary: true
      }
    };
    
    // Add the temporary event to the calendar
    if (calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      
      // Remove any existing temporary events
      calendarApi.getEvents().forEach(event => {
        if (event.extendedProps && event.extendedProps.isTemporary) {
          event.remove();
        }
      });
      
      // Add the new temporary event
      calendarApi.addEvent(newTempEvent);
      setTempEvent({...newTempEvent}); // Use a copy to avoid reference issues
      setTempEventId(newTempEventId);
      
      // Give the calendar a moment to render the event
      requestAnimationFrame(() => {
        // Find the event element in the DOM
        const eventElement = document.querySelector('.temp-event');
        
        if (eventElement) {
          // Get the actual rendered position of the event
          const eventRect = eventElement.getBoundingClientRect();
          
          // Update the event rect with the actual position
          setEventRect({
            left: eventRect.left,
            right: eventRect.right,
            top: eventRect.top,
            bottom: eventRect.bottom,
            width: eventRect.width,
            height: eventRect.height
          });
          
          console.log('Event element found and position updated:', eventRect);
        } else {
          console.log('Event element not found, using cell position');
        }
        
        // Open the modal after we've updated the event position
        setIsEventModalOpen(true);
      }); // Short delay to ensure the event is rendered
    } else {
      // If we can't access the calendar API, just open the modal with the cell position
      setIsEventModalOpen(true);
    }
  };

  const handleEventClick = (arg) => {
    // Stocker l'événement sélectionné
    setSelectedEvent(arg.event);
    
    // Calculer la position de la popover
    const rect = arg.el.getBoundingClientRect();
    setPopoverPosition({
      x: rect.right + 10, // 10px à droite de l'événement
      y: rect.top, // Aligné avec le haut de l'événement
    });
    
    // Ouvrir la popover
    setIsDetailsPopoverOpen(true);
  };

  const handleEventChange = (arg) => {
    // Ignore changes related to the temporary event used for preview
    if (arg.event.id === tempEventId || (arg.event.extendedProps && arg.event.extendedProps.isTemporary)) {
      // console.log("Ignoring change for temporary event:", arg.event.id);
      return;
    }

    console.log("Event changed:", arg.event.toPlainObject());
    
    // Mettre à jour l'état local des événements
    dispatch(setEventsInStore(eventsFromStore.map(event => {
      if (event.id === arg.event.id) {
        return {
          ...arg.event.toPlainObject(),
          start: new Date(arg.event.start),
          end: arg.event.end ? new Date(arg.event.end) : null
        };
      }
      return event;
    })));
  };

  const handleEventDrop = (arg) => {
    // Cette fonction est appelée lorsqu'un événement est déplacé
    console.log("Event dropped:", arg.event.toPlainObject());
    
    // Vérifier si l'événement déplacé est un événement temporaire
    if (arg.event.extendedProps && arg.event.extendedProps.isTemporary) {
      // Si c'est un événement temporaire, mettre à jour l'état local du tempEvent
      setTempEvent({
        ...tempEvent,
        start: new Date(arg.event.start),
        end: arg.event.end ? new Date(arg.event.end) : null
      });
    } else {
      // Sinon, mettre à jour l'état local des événements
      handleEventChange(arg);
    }
  };

  const handleEventResize = (arg) => {
    // Cette fonction est appelée lorsqu'un événement est redimensionné
    console.log("Event resized:", arg.event.toPlainObject());
    
    // Vérifier si l'événement redimensionné est un événement temporaire
    if (arg.event.extendedProps && arg.event.extendedProps.isTemporary) {
      // Si c'est un événement temporaire, mettre à jour l'état local du tempEvent
      setTempEvent({
        ...tempEvent,
        start: new Date(arg.event.start),
        end: arg.event.end ? new Date(arg.event.end) : null
      });
    } else {
      // Sinon, mettre à jour l'état local des événements
      handleEventChange(arg);
    }
  };

  const handlePrev = () => {
    if (calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      updateCalendarTitle(calendarApi);
    }
  };

  const handleNext = () => {
    if (calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      updateCalendarTitle(calendarApi);
    }
  };

  const handleToday = () => {
    if (calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      updateCalendarTitle(calendarApi);
    }
  };

  const handleViewChange = (viewType) => {
    setCurrentView(viewType);
    if (calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(viewType);
      updateCalendarTitle(calendarApi);
    }
  };

  const updateCalendarTitle = (calendarApi) => {
    if (!calendarApi) return;
    
    const currentDate = calendarApi.getDate();
    let title = '';
    
    if (currentView === 'dayGridMonth') {
      // Format: "September 2023"
      title = currentDate.toLocaleString(i18n.language, { month: 'long', year: 'numeric' });
    } else if (currentView === 'timeGridWeek') {
      // Format: "September 4 - 10, 2023"
      const start = calendarApi.view.activeStart;
      const end = calendarApi.view.activeEnd;
      const endDate = new Date(end);
      endDate.setDate(endDate.getDate() - 1); // Adjust to get the last day of the week
      
      if (start.getMonth() === endDate.getMonth()) {
        // Same month
        title = `${start.toLocaleString(i18n.language, { month: 'long' })} ${start.getDate()} - ${endDate.getDate()}, ${start.getFullYear()}`;
      } else {
        // Different months
        title = `${start.toLocaleString(i18n.language, { month: 'long' })} ${start.getDate()} - ${endDate.toLocaleString(i18n.language, { month: 'long' })} ${endDate.getDate()}, ${start.getFullYear()}`;
      }
    } else if (currentView === 'timeGridDay') {
      // Format: "Monday, September 4, 2023"
      title = currentDate.toLocaleString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    
    setCalendarTitle(title);
  };

  const handleSelect = (arg) => {
    // Calculate the position of the modal relative to the selection
    const rect = arg.jsEvent.target.getBoundingClientRect();
    setEventModalPosition({
      x: rect.left,
      y: rect.bottom + 5 // Slightly below the click
    });
    
    // Set the initial date for the event
    setEventInitialDate(arg.start);
    
    // Open the modal
    setIsEventModalOpen(true);
  };

  useEffect(() => {
    // Charger les événements depuis le backend
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    if (calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      
      // Set initial calendar title
      updateCalendarTitle(calendarApi);
      
      // Add event listeners for title updates
      calendarApi.on('datesSet', () => {
        updateCalendarTitle(calendarApi);
      });
      
      return () => {
        // Remove event listeners
        calendarApi.off('datesSet');
      };
    }
  }, [currentView]);

  useEffect(() => {
    if (calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(currentView);
    }
  }, [currentView]);

  // Fonction pour synchroniser l'état local avec les événements du calendrier

  
  // Function to create a visual indicator between non-consecutive days
  const dayHeaderContent = (args) => {
    const { date, isToday } = args;
    
    return (
      <div className="fc-day-header-content" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: '4px 0',
        position: 'relative'
      }}>
        <span style={{ 
          fontWeight: '600', 
          color: '#111827', 
          fontSize: '0.85em', 
          marginBottom: '4px',
          textTransform: 'uppercase'
        }}>
          {date.toLocaleString(i18n.language, { weekday: 'short' })}
        </span>
        <span style={{ 
          color: '#6b7280', 
          fontSize: '1.1em', 
          fontWeight: '400' 
        }}>
          {date.getDate()}
        </span>
      </div>
    );
  };

  // Function to add indicators after the calendar is rendered
  useEffect(() => {
    const addDayGapIndicators = () => {
      // Select all day headers
      const headerCells = document.querySelectorAll('.fc-col-header-cell');
      if (!headerCells.length) return;
      
      // Remove existing indicators
      document.querySelectorAll('.day-gap-indicator').forEach(el => el.remove());
      
      // Get the main calendar container
      const calendarContainer = document.querySelector('.calendar-container');
      if (!calendarContainer) return;
      
      // Iterate through day headers (except the first)
      for (let i = 1; i < headerCells.length; i++) {
        const currentCell = headerCells[i];
        const prevCell = headerCells[i-1];
        
        // Extract dates from cells
        const currentDate = new Date(currentCell.getAttribute('data-date'));
        const prevDate = new Date(prevCell.getAttribute('data-date'));
        
        // Calculate the difference in days
        const diffTime = Math.abs(currentDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // If there is more than one day gap, add an indicator
        if (diffDays > 1) {
          const hiddenDaysCount = diffDays - 1;
          
          // Create the indicator
          const indicator = document.createElement('div');
          indicator.className = 'day-gap-indicator';
          indicator.title = hiddenDaysCount === 1 
            ? '1 hidden day' 
            : `${hiddenDaysCount} hidden days`;
          
          // Get the position of the current cell
          const cellRect = currentCell.getBoundingClientRect();
          const containerRect = calendarContainer.getBoundingClientRect();
          
          // Position the indicator absolutely relative to the calendar container
          indicator.style.position = 'absolute';
          indicator.style.left = `${cellRect.left - containerRect.left - 10}px`;
          indicator.style.top = `${cellRect.top - containerRect.top}px`;
          indicator.style.height = `${cellRect.height}px`;
          
          // Add the indicator directly to the calendar container
          calendarContainer.appendChild(indicator);
        }
      }
    };
    
    // Add indicators immediately after the calendar is rendered
    addDayGapIndicators();
    
    // Observe changes in the calendar
    const observer = new MutationObserver(() => {
      addDayGapIndicators();
    });
    
    // Observe the calendar container with a more sensitive configuration
    if (calendarRef.current) {
      const calendarEl = calendarRef.current.elRef.current;
      observer.observe(calendarEl, { 
        childList: true, 
        subtree: true,
        attributes: true,
        characterData: true
      });
    }
    
    // Add a resize listener to reposition the indicators
    window.addEventListener('resize', addDayGapIndicators);
    
    // Listen for changes in the Redux store for visible days
    const unsubscribe = store.subscribe(() => {
      const newVisibleDays = store.getState().calendarSettings?.visibleDays;
      if (newVisibleDays && JSON.stringify(newVisibleDays) !== JSON.stringify(visibleDays)) {
        addDayGapIndicators();
      }
    });
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', addDayGapIndicators);
      unsubscribe();
    };
  }, [hiddenDays, currentView, visibleDays]);

  // Handle closing the event modal
  const handleCloseEventModal = () => {
    // Close the modal
    setIsEventModalOpen(false);
    
    // Reset the event to edit AFTER checking if it's a modification or creation
    requestAnimationFrame(() => {
      setEventToEdit(null);
    });
    
    // Remove any temporary events from the calendar
    if (calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      
      // Remove all temporary events to ensure clean state
      let tempEventsRemoved = 0;
      calendarApi.getEvents().forEach(event => {
        if (event.extendedProps && event.extendedProps.isTemporary) {
          console.log("Removing temporary event on modal close:", event.id);
          event.remove();
          tempEventsRemoved++;
        }
      });
      
      // Log the number of events removed for debugging
      if (tempEventsRemoved > 0) {
        console.log(`Removed ${tempEventsRemoved} temporary events from calendar`);
      }
      
      // Force a refresh of the calendar if needed
      if (tempEventsRemoved > 1) {
        // If we removed more than one temporary event, there might have been duplicates.
        // The calendar will refresh from the Redux state, so no manual sync is needed.
      }
    }
    
    // Reset the temp event state
    setTempEvent(null);
    
    // Generate a new temp event ID for next time
    const newId = generateNewTempEventId();
    setTempEventId(newId);
    
    console.log("Modal closed, temporary events removed, new temp ID generated:", newId);
  };

  // Handle saving an event
  const [isSaving, setIsSaving] = useState(false);
  const handleSaveEvent = (savedEvent) => {
    // La logique de sauvegarde est maintenant entièrement gérée dans EventFormModal.
    // Cette fonction est appelée après le succès de la sauvegarde.
    // Le `savedEvent` est déjà ajouté à l'état Redux par le thunk `createEvent` ou `updateEvent`.
    // Nous n'avons donc plus rien à dispatcher ici. On se contente de fermer la modale.
    console.log('Event action successful via modal, closing now.', savedEvent);
    handleCloseEventModal();

    // La logique ci-dessous est pour l'édition, qui est gérée différemment pour l'instant.
    // Si nous venons de créer un événement, nous sortons.
    const isEditing = eventToEdit !== null;
    if (!isEditing) {
      return;
    }

    // ===============================================
    // == ANCIENNE LOGIQUE D'ÉDITION (VIA LOCALSTORAGE)
    // ===============================================
    console.log("Editing existing event:", eventToEdit.id);
    
    // Protection against double submissions
    if (isSaving) return;
    setIsSaving(true);
    
    // TODO: Remplacer par la logique d'API via Redux (créer un thunk `updateEvent`)
    console.log("Logique d'édition à implémenter via Redux");
    // const updatedEvents = eventsFromStore.map(event => 
    //   event.id === eventToEdit.id ? newEvent : event
    // );
    // saveEventsToLocalStorage(updatedEvents);
    
    // La notification à Redux et la mise à jour des filtres se feront
    // dans le futur thunk `updateEvent`.

    // Fermer la modale et réinitialiser l'état
    handleCloseEventModal();
    requestAnimationFrame(() => {
      setIsSaving(false);
    });
  };

  // Handle editing an event from the popover
  const handleEditEvent = (event) => {
    // Set the event to edit
    setEventToEdit(event);
    
    // Stocker l'ID de l'événement à éditer pour le retrouver plus tard
    const eventId = event.id;
    
    // Utiliser la même approche que pour la création d'un événement
    if (calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      
      // Créer un événement fantôme temporaire à la même position que l'événement à éditer
      // pour obtenir sa position exacte après rendu
      const ghostEventId = `ghost-${eventId}`;
      
      // Créer un événement fantôme avec les mêmes propriétés que l'événement à éditer
      const ghostEvent = {
        id: ghostEventId,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: event.allDay,
        display: 'block',
        className: 'ghost-event temp-event', // Ajouter une classe pour le retrouver facilement
        backgroundColor: 'transparent', // Rendre l'événement invisible
        borderColor: 'transparent',
        textColor: 'transparent',
        extendedProps: {
          isTemporary: true,
          isGhost: true
        }
      };
      
      // Supprimer tous les événements fantômes existants
      calendarApi.getEvents().forEach(evt => {
        if (evt.extendedProps && (evt.extendedProps.isGhost || evt.extendedProps.isTemporary)) {
          evt.remove();
        }
      });
      
      // Ajouter l'événement fantôme au calendrier
      calendarApi.addEvent(ghostEvent);
      
      // Donner au calendrier le temps de rendre l'événement fantôme
      requestAnimationFrame(() => {
        // Trouver l'élément de l'événement fantôme dans le DOM
        const ghostElement = document.querySelector('.ghost-event');
        
        // Trouver l'élément de l'événement original dans le DOM (pour avoir une référence visuelle)
        const originalElement = document.querySelector(`[data-event-id="${eventId}"]`);
        
        // Utiliser l'élément qui est disponible (préférer l'original si disponible)
        const eventElement = originalElement || ghostElement;
        
        if (eventElement) {
          // Obtenir la position exacte de l'événement
          const eventRect = eventElement.getBoundingClientRect();
          
          // Mettre à jour le rectangle de l'événement
          setEventRect({
            left: eventRect.left,
            right: eventRect.right,
            top: eventRect.top,
            bottom: eventRect.bottom,
            width: eventRect.width,
            height: eventRect.height
          });
          
          console.log('Event position for modal:', eventRect);
          
          // Supprimer l'événement fantôme maintenant qu'on a sa position
          if (ghostElement) {
            const ghostEventObj = calendarApi.getEventById(ghostEventId);
            if (ghostEventObj) {
              ghostEventObj.remove();
            }
          }
          
          // Ouvrir la modal maintenant qu'on a mis à jour la position
          setEventInitialDate(event.start);
          setIsEventModalOpen(true);
        } else {
          console.log('Event element not found, using fallback position');
          
          // Fallback: utiliser la position de l'événement original si disponible
          if (originalElement) {
            const rect = originalElement.getBoundingClientRect();
            setEventRect({
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
              width: rect.width,
              height: rect.height
            });
          }
          
          // Ouvrir la modal même si on n'a pas pu trouver l'élément
          setEventInitialDate(event.start);
          setIsEventModalOpen(true);
        }
      });
    } else {
      // Si on ne peut pas accéder à l'API du calendrier, ouvrir simplement la modal
      setEventInitialDate(event.start);
      setIsEventModalOpen(true);
    }
  };

  // Handle deleting an event from the popover
  const handleDeleteEvent = (event) => {
    console.log("Deleting event:", event.id);
    
    if (calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      
      // Find the event in the calendar
      const existingEvent = calendarApi.getEventById(event.id);
      
      if (existingEvent) {
        // Remove the event from the calendar
        existingEvent.remove();
        
        // Remove the event from localStorage
        removeEventFromLocalStorage(event.id);
        
        console.log(`Événement ${event.id} supprimé du calendrier et de localStorage`);
        
        // La synchronisation de l'état se fera via le futur thunk `deleteEvent`.
      } else {
        console.error("Event to delete not found in calendar:", event.id);
      }
    } else {
      // Fallback if the calendar API is not available
      // TODO: Remplacer par la logique d'API via Redux (créer un thunk `deleteEvent`)
      console.log("Logique de suppression à implémenter via Redux");
      // const updatedEvents = eventsFromStore.filter(e => e.id !== event.id);
      
      // La suppression de l'événement dans le store Redux sera gérée par le futur thunk `deleteEvent`.
      
      // Remove the event from localStorage
      removeEventFromLocalStorage(event.id);
    }
  };

  // Update the temporary event with new data
  const updateTempEvent = (updatedData) => {
    if (calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      
      // Clean up any duplicate temporary events first
      if (!eventToEdit) {
        calendarApi.getEvents().forEach(event => {
          if (event.extendedProps && event.extendedProps.isTemporary && event.id !== tempEventId) {
            console.log("Removing duplicate temporary event:", event.id);
            event.remove();
          }
        });
      }
      
      // Determine which event to update: the temporary event or the event being edited
      const eventId = eventToEdit ? eventToEdit.id : tempEventId;
      const existingEvent = calendarApi.getEventById(eventId);
      
      if (existingEvent) {
        // Create a deep copy of the event data to avoid reference issues
        const eventData = { ...existingEvent.toPlainObject() };
        
        // Update the event properties
        if (updatedData.title) {
          existingEvent.setProp('title', updatedData.title);
        }
        
        if (updatedData.start) {
          // Create a new Date object to avoid reference issues
          const newStart = new Date(updatedData.start.getTime());
          existingEvent.setStart(newStart);
        }
        
        if (updatedData.end) {
          // Create a new Date object to avoid reference issues
          const newEnd = new Date(updatedData.end.getTime());
          existingEvent.setEnd(newEnd);
        }
        
        // Update the background and border colors
        if (updatedData.backgroundColor) {
          // If it's a temporary event, apply reduced opacity
          if (!eventToEdit) {
            const bgColorWithOpacity = updatedData.backgroundColor.replace(/rgb\(([^)]+)\)/, 'rgba($1, 0.3)');
            existingEvent.setProp('backgroundColor', bgColorWithOpacity);
          } else {
            // For an event being edited, use the full color
            existingEvent.setProp('backgroundColor', updatedData.backgroundColor);
          }
          
          // Use the full color for the border
          existingEvent.setProp('borderColor', updatedData.borderColor || updatedData.backgroundColor);
        }
        
        // Update the extended properties
        if (updatedData.extendedProps) {
          if (updatedData.extendedProps.location) {
            existingEvent.setExtendedProp('location', updatedData.extendedProps.location);
          }
          
          if (updatedData.extendedProps.participants) {
            existingEvent.setExtendedProp('participants', updatedData.extendedProps.participants);
          }
          
          if (updatedData.extendedProps.description) {
            existingEvent.setExtendedProp('description', updatedData.extendedProps.description);
          }
        }
        
        // Update our state reference to the temp event with a new object to avoid reference issues
        if (!eventToEdit) {
          setTempEvent({
            ...tempEvent,
            ...updatedData,
            id: tempEventId // Ensure the ID is preserved
          });
        }
      } else if (!eventToEdit) {
        // If the event doesn't exist (was possibly removed), recreate it
        console.log("Temporary event not found, recreating with ID:", tempEventId);
        
        // Create a base event using the temp event state
        const baseEvent = tempEvent || {
          id: tempEventId,
          title: 'New Event',
          start: new Date(),
          end: new Date(new Date().setHours(new Date().getHours() + 1)),
          extendedProps: {
            isTemporary: true
          }
        };
        
        // Apply the updates
        const newTempEvent = {
          ...baseEvent,
          ...updatedData,
          id: tempEventId, // Ensure the ID is preserved
          extendedProps: {
            ...(baseEvent.extendedProps || {}),
            ...(updatedData.extendedProps || {}),
            isTemporary: true // Ensure it's marked as temporary
          }
        };
        
        // Add the event to the calendar
        calendarApi.addEvent(newTempEvent);
        
        // Update our state reference
        setTempEvent(newTempEvent);
      }
    }
  };

  // Effect to update the class of the event being edited
  useEffect(() => {
    if (eventToEdit && calendarRef.current && calendarRef.current.getApi()) {
      const calendarApi = calendarRef.current.getApi();
      const event = calendarApi.getEventById(eventToEdit.id);
      
      if (event) {
        // Add a class to indicate that the event is being edited
        event.setProp('classNames', ['event-being-edited']);
      }
      
      return () => {
        // Clean up the class when the event is no longer being edited
        if (event) {
          event.setProp('classNames', []);
        }
      };
    }
  }, [eventToEdit]);

  const renderEventContent = (eventInfo) => {
    return <TempEvent eventInfo={eventInfo} />;
  };

  // Filter events based on the current filters
  const filteredEvents = useMemo(() => {
    // If no events are loaded, return an empty array
    if (!eventsFromStore) {
      return [];
    }

    // Apply focus filter first
    const focusFiltered = filterEventsByFocus(eventsFromStore, filters.focus, groupsById);
    
    // Then apply the general filters
    return filterEvents(focusFiltered, filters);
  }, [eventsFromStore, filters, groupsById]);

  // Convert event dates from string to Date objects for FullCalendar
  const calendarEvents = useMemo(() => {
    const baseEvents = filteredEvents ? filteredEvents.map(event => ({
      ...event,
      start: event.start ? new Date(event.start) : null,
      end: event.end ? new Date(event.end) : null,
    })) : [];

    // Si un événement temporaire existe (et qu'on n'est pas en mode édition), on l'ajoute
    if (tempEvent && !eventToEdit) {
      // On vérifie qu'il n'est pas déjà dans la liste pour éviter les doublons
      if (!baseEvents.some(e => e.id === tempEvent.id)) {
        baseEvents.push({
          ...tempEvent,
          start: new Date(tempEvent.start),
          end: new Date(tempEvent.end)
        });
      }
    }
    
    return baseEvents;
  }, [filteredEvents, tempEvent, eventToEdit]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthInitializer>
        <div className="App" style={{ display: 'flex' }}>
          {!isAuthPage && !isProfilePage && (
          <Sidebar 
            width={sidebarWidth} 
            setWidth={setSidebarWidth} 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen} 
          />
        )}
        <div style={{ 
          flex: 1, 
          padding: '8px', 
          height: '100vh',
          overflow: 'hidden',
          width: isAuthPage ? '100%' : (sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%'),
          transition: 'width 0.3s ease-in-out'
        }}>
          <Routes>
              <Route path="/login" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <LoginPage />
                </Suspense>
              } />
              <Route path="/register" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <RegisterPage />
                </Suspense>
              } />
              <Route path="/verify-email" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <EmailVerificationPage />
                </Suspense>
              } />
              <Route path="/email-verification" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <EmailVerificationPage />
                </Suspense>
              } />
              <Route path="/forgot-password" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ForgotPasswordPage />
                </Suspense>
              } />
              <Route path="/reset-password" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ResetPasswordPage />
                </Suspense>
              } />
              <Route path="/profile" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ProfilePage />
                </Suspense>
              } />
              <Route path="/" element={
                <div className="app-container">
                  <div className="calendar-header" style={{ 
                    padding: '16px 20px', 
                    borderBottom: '1px solid #f3f4f6',
                    paddingLeft: sidebarOpen ? '20px' : '50px' // Ajouter plus d'espace à gauche quand la sidebar est fermée
                  }}>
                    <CalendarToolbar 
                      title={calendarTitle}
                      currentView={currentView}
                      onPrev={handlePrev}
                      onNext={handleNext}
                      onToday={handleToday}
                      onViewChange={handleViewChange}
                    />
                  </div>
                  <div style={{ 
                    flex: '1',
                    padding: '4px', 
                    height: 'calc(100vh - 90px)', 
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      backgroundColor: '#f9fafb', // Gris très léger, presque blanc
                      borderRadius: '8px',
                      height: '100%',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}>
                      <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView={currentView}
                        headerToolbar={false}
                        events={calendarEvents}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        eventChange={handleEventChange}
                        eventDrop={handleEventDrop}
                        eventResize={handleEventResize}
                        selectable={false}
                        editable={true}
                        dayMaxEvents={true}
                        allDaySlot={false}
                        slotMinTime={slotMinTime}
                        slotMaxTime={slotMaxTime}
                        hiddenDays={hiddenDays}
                        // Dynamically set the locale based on i18n language
                        locale={i18n.language.startsWith('fr') ? frLocale : enLocale}
                        height="100%"
                        slotDuration="00:15:00" // Durée de 15 minutes par créneau
                        slotLabelInterval="01:00:00" // Afficher les étiquettes d'heure toutes les heures
                        slotLabelFormat={{
                          hour: 'numeric',
                          minute: '2-digit',
                          omitZeroMinute: true,
                          hour12: false
                        }}
                        eventContent={renderEventContent}
                        datesSet={(dateInfo) => {
                          // Garder le code existant pour la mise à jour du titre
                          if (calendarRef.current) {
                            const calendarApi = calendarRef.current.getApi();
                            if (calendarApi) {
                              // 1. Mettre à jour le titre (existant)
                              updateCalendarTitle(calendarApi);

                              // --- DEBUT AJOUT --- 
                              // 2. Mettre à jour les éléments visibles dans ViewsPanel
                              const viewStartDate = calendarApi.view.activeStart;
                              const viewEndDate = calendarApi.view.activeEnd; // Est exclusif
                              
                              // Filtrer les événements locaux par la plage de dates actuelle
                              // 'eventsFromStore' est la state variable contenant la liste complète
                              const eventsInView = filterEventsByDateRange(eventsFromStore, viewStartDate, viewEndDate);
                              
                              // Extraire les acteurs, groupes, couleurs uniques des événements visibles
                              // 'groupsById' est déjà récupéré via useSelector plus haut
                              const { 
                                actors: visibleActorsSet, 
                                groups: visibleGroupsSet, 
                                colors: visibleColorsSet 
                              } = extractItemsFromEvents(eventsInView, groupsById);
                              
                              // Dispatcher l'action pour mettre à jour le state de viewsSlice
                              dispatch(updateVisibleViewItems({
                                actors: Array.from(visibleActorsSet),
                                groups: Array.from(visibleGroupsSet),
                                colors: Array.from(visibleColorsSet)
                              }));
                              // --- FIN AJOUT ---
                            }
                          }
                        }}
                                                datesSet={(dateInfo) => {
                          dispatch(fetchEvents({ start: dateInfo.startStr, end: dateInfo.endStr }));
                        }}
                        dayHeaderContent={({ date }) => {
                          const day = date.getDate();
                          const weekday = date.toLocaleString(i18n.language, { weekday: 'short' }).toUpperCase();
                          return (
                            <div className="fc-day-header">
                              <div className="fc-day-header-weekday">{weekday}</div>
                              <div className="fc-day-header-day">{day}</div>
                            </div>
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              } />
              <Route path="/actors/*" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ActorsPage />
                </Suspense>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
        
        {/* Modal for creating an event */}
        {!isAuthPage && !isProfilePage && (
          <Suspense fallback={<div>Loading...</div>}>
            <EventFormModal 
            isOpen={isEventModalOpen}
            onClose={handleCloseEventModal}
            position={eventModalPosition}
            initialDate={eventInitialDate}
            eventRect={eventRect}
            onSave={handleSaveEvent}
            updateTempEvent={updateTempEvent}
            eventToEdit={eventToEdit}
          />
          </Suspense>
        )}
        
        {/* Popover for event details */}
        {!isAuthPage && !isProfilePage && selectedEvent && (
          <Suspense fallback={<div>Loading...</div>}>
            <EventDetailsPopover
              event={selectedEvent}
              isOpen={isDetailsPopoverOpen}
              onClose={() => setIsDetailsPopoverOpen(false)}
              position={popoverPosition}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          </Suspense>
        )}
      </AuthInitializer>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;