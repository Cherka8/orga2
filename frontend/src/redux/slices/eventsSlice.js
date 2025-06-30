import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import eventService from '../../services/eventService';
import { getHexFromColorName } from '../../utils/colorUtils';

// État initial plus complet pour gérer les opérations asynchrones
const initialState = {
  data: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Thunk pour récupérer tous les événements
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  // On remplace '_' par 'dateRange'. On lui donne une valeur par défaut {}
  // pour que les appels existants sans dates continuent de fonctionner.
  async (dateRange = {}, { rejectWithValue }) => {
    try {
      // On passe l'objet dateRange à la fonction du service.
      const events = await eventService.getEvents(dateRange);
      // Le backend retourne startTime et endTime. On les mappe vers start et end.
      // On garde les dates comme des strings ISO pour la sérialisation.
      return events.map(event => {
        // Convertir le nom de couleur en code hex pour l'affichage
        const displayColor = event.eventColor ? getHexFromColorName(event.eventColor) : '#3788d8';
        
        // On retourne un objet plat. FullCalendar placera automatiquement
        // les propriétés non standard (comme 'participants') dans 'extendedProps'.
        return {
          ...event,
          start: event.startTime,
          end: event.endTime,
          backgroundColor: displayColor,
          borderColor: displayColor,
        };
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk asynchrone pour créer un événement
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      // Le service retourne l'événement créé avec startTime et endTime
      const newEvent = await eventService.createEvent(eventData);
      return newEvent; // Retourner directement l'objet événement
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk pour récupérer un événement par son ID avec tous les détails
export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (eventId, { rejectWithValue }) => {
    try {
      const event = await eventService.getEventById(eventId);
      // Convertir le nom de couleur en code hex pour l'affichage
      const displayColor = event.eventColor ? getHexFromColorName(event.eventColor) : '#3788d8';
      
      // Mapper les noms de champs pour la cohérence avec FullCalendar
      return {
        ...event,
        start: event.startTime,
        end: event.endTime,
        backgroundColor: displayColor,
        borderColor: displayColor,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk pour mettre à jour un événement
export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      // Le service doit retourner l'événement mis à jour
      const updatedEvent = await eventService.updateEvent(id, eventData);
      return updatedEvent;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Action pour définir/mettre à jour l'ensemble des événements (utile pour le chargement initial)
    setEvents: (state, action) => {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          // Convertir le nom de couleur en code hex pour l'affichage
          const displayColor = action.payload.eventColor ? getHexFromColorName(action.payload.eventColor) : '#3788d8';
          
          // Le payload contient startTime et endTime du backend.
          // On le mappe vers start et end pour la cohérence dans le state, en gardant des strings.
          const newEvent = {
            ...action.payload,
            start: action.payload.startTime,
            end: action.payload.endTime,
            backgroundColor: displayColor,
            borderColor: displayColor,
            eventColor: action.payload.eventColor, // Garder le nom de couleur pour le filtrage
            extendedProps: {
              ...action.payload.extendedProps,
              participants: action.payload.participants || [],
              presenterId: action.payload.presenterId,
              ...action.payload
            }
          };
          // Remplacer l'array pour garantir le re-render
          state.data = [...state.data, newEvent];
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedEvent = action.payload;
        const index = state.data.findIndex(event => event.id === updatedEvent.id);
        if (index !== -1) {
          // Remplacer l'événement existant par la version détaillée
          state.data[index] = updatedEvent;
        } else {
          // Si l'événement n'est pas dans la liste, on l'ajoute
          state.data.push(updatedEvent);
        }
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedEvent = action.payload;
        const index = state.data.findIndex(event => event.id === updatedEvent.id);
        if (index !== -1) {
          // Convertir le nom de couleur en code hex pour l'affichage
          const displayColor = updatedEvent.eventColor ? getHexFromColorName(updatedEvent.eventColor) : '#3788d8';
          
          // Mapper les noms de champs pour la cohérence avec FullCalendar
          state.data[index] = {
            ...state.data[index], // Conserver les props non retournées par l'API si besoin
            ...updatedEvent,
            start: updatedEvent.startTime,
            end: updatedEvent.endTime,
            backgroundColor: displayColor,
            borderColor: displayColor,
            eventColor: updatedEvent.eventColor, // Garder le nom de couleur pour le filtrage
          };
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Exporter les actions et les sélecteurs
export const { setEvents } = eventsSlice.actions;
export const selectEvents = (state) => state.events.data;
export const selectEventsStatus = (state) => state.events.status;
export const selectEventsError = (state) => state.events.error;

// Sélecteur pour obtenir les événements filtrés en fonction de la visibilité
const selectActorsVisibility = (state) => state.views.actors;
const selectGroupsVisibility = (state) => state.views.groups;

export const selectVisibleEvents = createSelector(
  [selectEvents, selectActorsVisibility, selectGroupsVisibility],
  (events, actorsVisibility, groupsVisibility) => {
    // If visibility states aren't loaded, return all events to avoid showing an empty calendar initially.
    if (Object.keys(actorsVisibility).length === 0 && Object.keys(groupsVisibility).length === 0) {
      return events;
    }

    return events.filter(event => {
      // On accède directement aux propriétés de l'événement, car la structure a été aplatie.
      const participants = event.participants || [];
      const presenterId = event.presenterId;

      const involvedActorIds = new Set();
      if (presenterId) {
        involvedActorIds.add(presenterId);
      }
      participants.forEach(p => {
        if (p.type === 'human' || p.type === 'object') {
          involvedActorIds.add(p.id);
        }
      });

      const involvedGroupIds = new Set();
      participants.forEach(p => {
        if (p.type === 'group') {
          involvedGroupIds.add(p.id);
        }
      });

      // An event is visible if (it has no associated actors OR at least one of them is visible)
      // AND (it has no associated groups OR at least one of them is visible).
      const actorsAreVisible = involvedActorIds.size === 0 || 
        [...involvedActorIds].some(id => actorsVisibility[id] !== false);

      const groupsAreVisible = involvedGroupIds.size === 0 || 
        [...involvedGroupIds].some(id => groupsVisibility[id] !== false);

      return actorsAreVisible && groupsAreVisible;
    });
  }
);

// Exporter le reducer
export default eventsSlice.reducer;
