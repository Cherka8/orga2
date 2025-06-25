import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as groupService from '../../services/groupService';
import { selectSearchFilter } from './actorsSlice';

// Actions asynchrones
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const groups = await groupService.getGroups();
      return groups;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addGroup = createAsyncThunk(
  'groups/addGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const newGroup = await groupService.createGroup(groupData);
      return newGroup;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ id, formData, members }, { rejectWithValue }) => {
    try {
      const updatedGroup = await groupService.updateGroup(id, formData);
      return updatedGroup;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      await groupService.deleteGroup(groupId);
      return groupId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addActorToGroup = createAsyncThunk(
  'groups/addActorToGroup',
  async ({ groupId, actorId }, { rejectWithValue }) => {
    try {
      const data = await groupService.addActorToGroup(groupId, actorId);
      return data; // Contient { groupId, members }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeActorFromGroup = createAsyncThunk(
  'groups/removeActorFromGroup',
  async ({ groupId, actorId }, { rejectWithValue }) => {
    try {
      const data = await groupService.removeActorFromGroup(groupId, actorId);
      return data; // Contient { groupId, members }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
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

export const selectFilteredGroups = createSelector(
  [selectAllGroups, selectSearchFilter],
  (groups, searchFilter) => {
    if (!searchFilter) {
      return groups;
    }

    const searchLower = searchFilter.toLowerCase();

    return groups.filter(group => {
      if (!group) return false;

      // Recherche dans le nom et la description du groupe
      const nameMatch = group.name && group.name.toLowerCase().includes(searchLower);
      const descriptionMatch = group.description && group.description.toLowerCase().includes(searchLower);

      // Recherche sécurisée dans les noms des membres
      let membersMatch = false;
      if (group.members && Array.isArray(group.members)) {
        membersMatch = group.members.some(member => {
          if (member && member.actor) {
            const fullName = `${member.actor.firstName || ''} ${member.actor.lastName || ''}`.trim();
            return fullName.toLowerCase().includes(searchLower);
          }
          return false;
        });
      }

      return nameMatch || descriptionMatch || membersMatch;
    });
  }
);

export const { selectGroup } = groupsSlice.actions;

export default groupsSlice.reducer;
