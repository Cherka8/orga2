import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eventService from '../../services/eventService';

// État initial plus complet pour gérer les opérations asynchrones
const initialState = {
  data: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Thunk pour récupérer tous les événements
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const events = await eventService.getEvents();
      // Le backend retourne startTime et endTime. On les mappe vers start et end.
      // On garde les dates comme des strings ISO pour la sérialisation.
      return events.map(event => ({
        ...event,
        start: event.startTime,
        end: event.endTime,
        backgroundColor: event.eventColor,
        borderColor: event.eventColor,
      }));
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
      const response = await eventService.createEvent(eventData);
      return response.data; // Retourner directement les données sérializables
    } catch (error) {
      return rejectWithValue(error.response.data);
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
          // Le payload contient startTime et endTime du backend.
          // On le mappe vers start et end pour la cohérence dans le state, en gardant des strings.
          const newEvent = {
            ...action.payload,
            start: action.payload.startTime,
            end: action.payload.endTime,
            backgroundColor: action.payload.eventColor,
            borderColor: action.payload.eventColor,
          };
          // Remplacer l'array pour garantir le re-render
          state.data = [...state.data, newEvent];
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
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

// Exporter le reducer
export default eventsSlice.reducer;
