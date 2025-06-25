import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Thunk pour la connexion
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials.email, credentials.password, credentials.rememberMe);
      // Stocker le token dans localStorage (déjà fait par authService)
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de connexion');
    }
  }
);

// Thunk pour récupérer le profil utilisateur
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }
);

// Thunk pour mettre à jour le profil utilisateur
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  }
);

// Thunk pour l'inscription individuelle
export const registerIndividual = createAsyncThunk(
  'auth/registerIndividual',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.registerIndividual(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de l\'inscription individuelle');
    }
  }
);

// Thunk pour l'inscription d'entreprise
export const registerCompany = createAsyncThunk(
  'auth/registerCompany',
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await authService.registerCompany(companyData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de l\'inscription de l\'entreprise');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  registrationSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        // Le profil sera récupéré séparément
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
      })
      
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Si l'erreur est 401, déconnecter l'utilisateur
        if (action.payload?.includes('401') || action.payload?.includes('Unauthorized')) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem('token');
        }
      })
      
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register Individual
      .addCase(registerIndividual.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerIndividual.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationSuccess = true;
        state.error = null;
      })
      .addCase(registerIndividual.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationSuccess = false;
      })
      
      // Register Company
      .addCase(registerCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationSuccess = true;
        state.error = null;
      })
      .addCase(registerCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationSuccess = false;
      });
  },
});

export const { logout, clearError, clearRegistrationSuccess, setUser, setToken } = authSlice.actions;

// Sélecteurs
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectRegistrationSuccess = (state) => state.auth.registrationSuccess;

export default authSlice.reducer;
