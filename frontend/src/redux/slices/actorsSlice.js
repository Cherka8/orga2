import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import actorService from '../../services/actorService'; // Import the actor service

// Types d'acteurs
export const ACTOR_TYPES = {
  HUMAN: 'human',
  LOCATION: 'location',
  GROUP: 'group'
};

// Actions asynchrones
export const fetchActors = createAsyncThunk(
  'actors/fetchActors',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('🚀 [actorsSlice] fetchActors déclenché avec filters:', filters);
      const response = await actorService.getActors(filters);
      console.log('📦 [actorsSlice] fetchActors response:', response);
      console.log('📊 [actorsSlice] Nombre d\'acteurs reçus:', response?.data?.length || 0);
      return response; // { data: Actor[], total: number, page: number, limit: number }
    } catch (error) {
      console.error('❌ [actorsSlice] fetchActors error:', error);
      const message = 
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return rejectWithValue(message);
    }
  }
);

export const addActor = createAsyncThunk(
  'actors/addActor',
  async (actorData, { rejectWithValue }) => {
    try {
      const response = await actorService.createActor(actorData);
      return response.data; // The backend should return the created actor with its new ID
    } catch (error) {
      // Handle API errors (e.g., validation errors)
      const message = 
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return rejectWithValue(message);
    }
  }
);

export const updateActor = createAsyncThunk(
  'actors/updateActor',
  async (actor, { rejectWithValue }) => {
    try {
      const response = await actorService.updateActor(actor.id, actor);
      return response;
    } catch (error) {
      const message = 
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return rejectWithValue(message);
    }
  }
);

export const fetchActorHours = createAsyncThunk(
  'actors/fetchActorHours',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await actorService.getActorHours(filters);
      // La réponse du backend (une fois implémentée) sera un tableau d'objets
      // ex: [{ actorId: 1, totalMilliseconds: 7200000 }]
      return response.data; 
    } catch (error) {
      const message = 
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return rejectWithValue(message);
    }
  }
);

export const deleteActor = createAsyncThunk(
  'actors/deleteActor',
  async (actorId, { rejectWithValue }) => {
    try {
      console.log('Redux deleteActor called with ID:', actorId);
      const response = await actorService.deleteActor(actorId);
      console.log('Redux deleteActor response:', response);
      return actorId; // Retourner l'ID pour la mise à jour du state
    } catch (error) {
      console.error('Redux deleteActor error:', error);
      const message = 
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return rejectWithValue(message);
    }
  }
);

// Slice initial
const initialState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  filter: {
    type: null,
    search: ''
  },
  hoursById: {},
  hoursLoading: false,
  hoursError: null
};

// Création du slice
const actorsSlice = createSlice({
  name: 'actors',
  initialState,
  reducers: {
    setTypeFilter: (state, action) => {
      state.filter.type = action.payload;
    },
    setSearchFilter: (state, action) => {
      state.filter.search = action.payload;
    },
    clearFilters: (state) => {
      state.filter.type = null;
      state.filter.search = '';
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch actors
      .addCase(fetchActors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActors.fulfilled, (state, action) => {
        console.log('✅ [actorsSlice] fetchActors.fulfilled - payload:', action.payload);
        state.loading = false;
        state.byId = {};
        state.allIds = [];

        // Assurer que la pagination existe (migration implicite pour redux-persist)
        if (!state.pagination) {
          // Assigner une COPIE pour qu'elle soit modifiable par Immer
          state.pagination = { ...initialState.pagination };
        }

        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.limit = action.payload.limit;
        state.pagination.totalPages = Math.ceil(action.payload.total / action.payload.limit);
        
        action.payload.data.forEach(actor => {
          state.byId[actor.id] = actor;
          state.allIds.push(actor.id);
        });
        
        console.log('📊 [actorsSlice] Acteurs stockés dans state.byId:', Object.keys(state.byId));
        console.log('📊 [actorsSlice] state.allIds:', state.allIds);
      })
      .addCase(fetchActors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add actor
      .addCase(addActor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addActor.fulfilled, (state, action) => {
        const actor = action.payload;
        state.loading = false;
        state.byId[actor.id] = actor;
        state.allIds.push(actor.id);
      })
      .addCase(addActor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update actor
      .addCase(updateActor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateActor.fulfilled, (state, action) => {
        const actor = action.payload;
        state.loading = false;
        state.byId[actor.id] = actor;
      })
      .addCase(updateActor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete actor
      .addCase(deleteActor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActor.fulfilled, (state, action) => {
        const actorId = action.payload;
        state.loading = false;
        delete state.byId[actorId];
        state.allIds = state.allIds.filter(id => id !== actorId);
      })
      .addCase(deleteActor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reducers for fetchActorHours
      .addCase(fetchActorHours.pending, (state) => {
        state.hoursLoading = true;
        state.hoursError = null;
      })
      .addCase(fetchActorHours.fulfilled, (state, action) => {
        state.hoursLoading = false;
        const newHoursById = {};
        // La réponse est un tableau : [{ actorId, totalMilliseconds }]
        // On la transforme en objet pour un accès facile
        if (Array.isArray(action.payload)) {
            action.payload.forEach(item => {
                newHoursById[item.actorId] = item.totalMilliseconds;
            });
        }
        state.hoursById = newHoursById;
      })
      .addCase(fetchActorHours.rejected, (state, action) => {
        state.hoursLoading = false;
        state.hoursError = action.payload;
      });
  }
});

// Selectors de base (non mémorisés)
const getActorsById = state => state.actors?.byId || {};
const getActorsAllIds = state => state.actors?.allIds || [];
const getActorsFilter = state => state.actors?.filter || { type: null, search: '' };

export const selectSearchFilter = createSelector(
  [getActorsFilter],
  (filter) => filter.search
);
const getActorsState = state => state.actors || {}; // Helper selector for entities
const getActorsPagination = state => state.actors?.pagination;

// Objet vide stable pour les sélecteurs
const EMPTY_OBJECT = {};

// Selectors mémorisés
export const selectActorsEntities = createSelector(
  [getActorsState],
  (actorsState) => actorsState?.entities || EMPTY_OBJECT // Use entities if available
  // Correction: actors state structure is byId/allIds, not entities directly
  // Let's select byId directly and ensure it's an object
);

export const selectActorsByIdMap = createSelector(
  [getActorsState],
  (actorsState) => actorsState?.byId || EMPTY_OBJECT
);

export const selectAllActors = createSelector(
  [selectActorsByIdMap, getActorsAllIds],
  (byId, allIds) => allIds.map(id => byId[id])
);

export const selectActorById = createSelector(
  [selectActorsByIdMap, (_, actorId) => actorId],
  (byId, actorId) => byId[actorId]
);

export const selectActorsByType = createSelector(
  [selectAllActors, (_, type) => type],
  (actors, type) => actors.filter(actor => actor.type === type)
);

export const selectFilteredActors = createSelector(
  [selectAllActors, getActorsFilter],
  (actors, filter) => {
    const { type, search } = filter;
    let filtered = actors;
    
    if (type) {
      filtered = filtered.filter(actor => actor.type === type);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(actor => {
        // Pour les humains, rechercher dans prénom et nom
        if (actor.type === ACTOR_TYPES.HUMAN) {
          return (actor.firstName || '').toLowerCase().includes(searchLower) || 
                 (actor.lastName || '').toLowerCase().includes(searchLower) ||
                 `${actor.firstName || ''} ${actor.lastName || ''}`.toLowerCase().includes(searchLower) ||
                 (actor.email || '').toLowerCase().includes(searchLower);
        }
        // Pour les lieux, rechercher dans le nom du lieu
        else if (actor.type === ACTOR_TYPES.LOCATION) {
          return (actor.locationName || '').toLowerCase().includes(searchLower) ||
                 (actor.address || '').toLowerCase().includes(searchLower);
        }
        // Pour tout autre type d'acteur (au cas où)
        return false;
      });
    }
    
    return filtered;
  }
);

export const selectPagination = createSelector(
  [getActorsPagination],
  (pagination) => pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  }
);

export const selectActorsLoading = createSelector(
  [getActorsState],
  (actorsState) => actorsState.loading || false
);

export const selectActorsError = createSelector(
  [getActorsState],
  (actorsState) => actorsState.error || null
);

export const { setTypeFilter, setSearchFilter, clearFilters, setPage } = actorsSlice.actions;

export default actorsSlice.reducer;
