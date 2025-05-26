import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

// Types d'acteurs
export const ACTOR_TYPES = {
  HUMAN: 'human',
  LOCATION: 'location',
  GROUP: 'group'
};

// Actions asynchrones
export const fetchActors = createAsyncThunk(
  'actors/fetchActors',
  async (_, { rejectWithValue }) => {
    try {
      // Simuler un appel API
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addActor = createAsyncThunk(
  'actors/addActor',
  async (actor, { rejectWithValue }) => {
    try {
      // Simuler un appel API
      return {
        ...actor,
        id: Date.now().toString()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateActor = createAsyncThunk(
  'actors/updateActor',
  async (actor, { rejectWithValue }) => {
    try {
      // Simuler un appel API
      return actor;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteActor = createAsyncThunk(
  'actors/deleteActor',
  async (actorId, { rejectWithValue }) => {
    try {
      // Simuler un appel API
      return actorId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice initial
const initialState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
  filter: {
    type: null,
    search: ''
  }
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
        state.loading = false;
        state.byId = {};
        state.allIds = [];
        
        action.payload.forEach(actor => {
          state.byId[actor.id] = actor;
          state.allIds.push(actor.id);
        });
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
      });
  }
});

// Selectors de base (non mémorisés)
const getActorsById = state => state.actors.byId;
const getActorsAllIds = state => state.actors.allIds;
const getActorsFilter = state => state.actors.filter;
const getActorsState = state => state.actors; // Helper selector for entities

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
                 `${actor.firstName || ''} ${actor.lastName || ''}`.toLowerCase().includes(searchLower);
        }
        // Pour les lieux, rechercher dans le nom
        else if (actor.type === ACTOR_TYPES.LOCATION) {
          return (actor.name || '').toLowerCase().includes(searchLower);
        }
        // Pour tout autre type d'acteur (au cas où)
        return false;
      });
    }
    
    return filtered;
  }
);

export const { setTypeFilter, setSearchFilter, clearFilters } = actorsSlice.actions;

export default actorsSlice.reducer;
