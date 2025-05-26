import { createSlice } from '@reduxjs/toolkit';

// État initial avec tous les jours visibles par défaut
const initialState = {
  visibleDays: {
    0: true, // Dimanche (Sunday)
    1: true, // Lundi (Monday)
    2: true, // Mardi (Tuesday)
    3: true, // Mercredi (Wednesday)
    4: true, // Jeudi (Thursday)
    5: true, // Vendredi (Friday)
    6: true, // Samedi (Saturday)
  },
  slotMinTime: '09:00:00',
  slotMaxTime: '17:00:00'
};

const calendarSettingsSlice = createSlice({
  name: 'calendarSettings',
  initialState,
  reducers: {
    toggleDayVisibility: (state, action) => {
      const dayIndex = action.payload;
      state.visibleDays[dayIndex] = !state.visibleDays[dayIndex];
    },
    setDayVisibility: (state, action) => {
      const { dayIndex, isVisible } = action.payload;
      state.visibleDays[dayIndex] = isVisible;
    },
    resetDaysVisibility: (state) => {
      Object.keys(state.visibleDays).forEach(day => {
        state.visibleDays[day] = true;
      });
    },
    setDaysPreset: (state, action) => {
      const preset = action.payload; // 'workweek' ou 'fullweek'
      
      if (preset === 'workweek') {
        // Lundi à vendredi visibles, weekend caché
        state.visibleDays = {
          0: false, // Dimanche
          1: true,  // Lundi
          2: true,  // Mardi
          3: true,  // Mercredi
          4: true,  // Jeudi
          5: true,  // Vendredi
          6: false  // Samedi
        };
      } else if (preset === 'fullweek') {
        // Tous les jours visibles
        state.visibleDays = {
          0: true, // Dimanche
          1: true, // Lundi
          2: true, // Mardi
          3: true, // Mercredi
          4: true, // Jeudi
          5: true, // Vendredi
          6: true  // Samedi
        };
      }
    },
    setSlotMinTime: (state, action) => {
      state.slotMinTime = action.payload;
    },
    setSlotMaxTime: (state, action) => {
      state.slotMaxTime = action.payload;
    }
  }
});

export const { 
  toggleDayVisibility, 
  setDayVisibility, 
  resetDaysVisibility,
  setDaysPreset,
  setSlotMinTime,
  setSlotMaxTime
} = calendarSettingsSlice.actions;

export default calendarSettingsSlice.reducer;
