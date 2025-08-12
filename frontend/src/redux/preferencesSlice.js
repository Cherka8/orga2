import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper pour récupérer le token depuis le localStorage
const getToken = () => localStorage.getItem('token');

// --- THUNKS ASYNCHRONES ---

// Thunk pour charger les préférences de l'utilisateur
export const fetchPreferences = createAsyncThunk(
  'preferences/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await axios.get('/api/preferences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : 'An error occurred');
    }
  }
);

// Thunk pour mettre à jour les préférences de l'utilisateur
export const updatePreferences = createAsyncThunk(
  'preferences/updatePreferences',
  async (preferencesData, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await axios.put('/api/preferences', preferencesData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : 'An error occurred');
    }
  }
);

// --- SLICE ---

const initialState = {
  settings: {
    language: 'fr',
    visibleDays: 7,
    businessHours: {
      start: '09:00',
      end: '17:00',
    },
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Reducers pour fetchPreferences
      .addCase(fetchPreferences.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Reducers pour updatePreferences
      .addCase(updatePreferences.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default preferencesSlice.reducer;
