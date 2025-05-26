import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

// Actions asynchrones
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      // Simuler un appel API
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addGroup = createAsyncThunk(
  'groups/addGroup',
  async (group, { rejectWithValue }) => {
    try {
      // Simuler un appel API
      return {
        ...group,
        id: Date.now().toString(),
        members: group.members || [],
        photo: group.photo || ''
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async (group, { rejectWithValue }) => {
    try {
      // Simuler un appel API
      return group;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      // Simuler un appel API
      return groupId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addActorToGroup = createAsyncThunk(
  'groups/addActorToGroup',
  async ({ groupId, actorId }, { rejectWithValue, getState }) => {
    try {
      const group = getState().groups.byId[groupId];
      if (!group) {
        throw new Error(`Group with id ${groupId} not found`);
      }
      
      // Vérifier si l'acteur est déjà dans le groupe
      if (group.members.includes(actorId)) {
        return { groupId, members: group.members };
      }
      
      // Simuler un appel API
      return {
        groupId,
        members: [...group.members, actorId]
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeActorFromGroup = createAsyncThunk(
  'groups/removeActorFromGroup',
  async ({ groupId, actorId }, { rejectWithValue, getState }) => {
    try {
      const group = getState().groups.byId[groupId];
      if (!group) {
        throw new Error(`Group with id ${groupId} not found`);
      }
      
      // Simuler un appel API
      return {
        groupId,
        members: group.members.filter(id => id !== actorId)
      };
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
  selectedGroupId: null
};

// Création du slice
const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    selectGroup: (state, action) => {
      state.selectedGroupId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.byId = {};
        state.allIds = [];
        
        action.payload.forEach(group => {
          state.byId[group.id] = group;
          state.allIds.push(group.id);
        });
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add group
      .addCase(addGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGroup.fulfilled, (state, action) => {
        const group = action.payload;
        state.loading = false;
        state.byId[group.id] = group;
        state.allIds.push(group.id);
      })
      .addCase(addGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update group
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        const group = action.payload;
        state.loading = false;
        state.byId[group.id] = group;
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete group
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        const groupId = action.payload;
        state.loading = false;
        delete state.byId[groupId];
        state.allIds = state.allIds.filter(id => id !== groupId);
        
        if (state.selectedGroupId === groupId) {
          state.selectedGroupId = null;
        }
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add actor to group
      .addCase(addActorToGroup.fulfilled, (state, action) => {
        const { groupId, members } = action.payload;
        state.byId[groupId].members = members;
      })
      
      // Remove actor from group
      .addCase(removeActorFromGroup.fulfilled, (state, action) => {
        const { groupId, members } = action.payload;
        state.byId[groupId].members = members;
      });
  }
});

// Selectors de base (non mémorisés)
const getGroupsById = state => state.groups.byId;
const getGroupsAllIds = state => state.groups.allIds;
const getSelectedGroupId = state => state.groups.selectedGroupId;
const getGroupsState = state => state.groups; // Helper selector

// Objet vide stable pour les sélecteurs
const EMPTY_OBJECT = {};

// Selectors mémorisés
export const selectGroupsByIdMap = createSelector(
  [getGroupsState],
  (groupsState) => groupsState?.byId || EMPTY_OBJECT
);

export const selectAllGroups = createSelector(
  [selectGroupsByIdMap, getGroupsAllIds],
  (byId, allIds) => allIds.map(id => byId[id])
);

export const selectGroupById = createSelector(
  [selectGroupsByIdMap, (_, groupId) => groupId],
  (byId, groupId) => byId[groupId]
);

export const selectSelectedGroup = createSelector(
  [selectGroupsByIdMap, getSelectedGroupId],
  (byId, selectedId) => selectedId ? byId[selectedId] : null
);

export const selectGroupMembers = createSelector(
  [
    (state, groupId) => selectGroupById(state, groupId),
    state => state.actors.byId
  ],
  (group, actorsById) => {
    return group && group.members 
      ? group.members.map(actorId => actorsById[actorId]).filter(Boolean) 
      : [];
  }
);

export const { selectGroup } = groupsSlice.actions;

export default groupsSlice.reducer;
