import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: [], // Simplement un tableau pour contenir les événements
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Action pour définir/mettre à jour l'ensemble des événements dans Redux
    setEvents: (state, action) => {
      // action.payload sera le nouveau tableau d'événements
      state.data = action.payload;
    },
  },
});

// Exporter l'action creator
export const { setEvents } = eventsSlice.actions;

// Exporter un sélecteur pour accéder facilement aux événements
export const selectEvents = (state) => state.events.data;

// Exporter le reducer
export default eventsSlice.reducer;
