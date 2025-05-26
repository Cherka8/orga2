import { createSlice, createSelector } from '@reduxjs/toolkit';

/**
 * Slice Redux pour gérer les filtres de visualisation des événements du calendrier
 * Permet de filtrer les événements par acteurs, groupes et couleurs
 * Inclut également un mode "focus" pour se concentrer sur un élément spécifique
 */

// État initial du slice
const initialState = {
  // État de visibilité des acteurs (true = visible, false = caché)
  actors: {},
  
  // État de visibilité des groupes (true = visible, false = caché)
  groups: {},
  
  // État de visibilité des couleurs (true = visible, false = caché)
  colors: {},
  
  // État du mode focus
  focus: {
    active: false,         // Si le mode focus est actif
    targetId: null,        // ID de l'élément ciblé
    targetType: null,      // Type de l'élément ciblé ('actor', 'group', 'color')
    previousState: null    // Sauvegarde de l'état avant le focus
  }
};

// Création du slice Redux
const viewsSlice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    /**
     * Initialise les filtres avec les acteurs, groupes et couleurs présents dans les événements
     * @param {Object} state - État actuel du slice
     * @param {Object} action - Action avec payload { actors, groups, colors }
     */
    initializeFilters(state, action) {
      const { actors, groups, colors } = action.payload;
      
      // Initialiser tous les acteurs comme visibles
      actors.forEach(actorId => {
        if (state.actors[actorId] === undefined) {
          state.actors[actorId] = true;
        }
      });
      
      // Initialiser tous les groupes comme visibles
      groups.forEach(groupId => {
        if (state.groups[groupId] === undefined) {
          state.groups[groupId] = true;
        }
      });
      
      // Initialiser toutes les couleurs comme visibles
      colors.forEach(color => {
        if (state.colors[color] === undefined) {
          state.colors[color] = true;
        }
      });
    },
    
    /**
     * Met à jour les acteurs disponibles en supprimant ceux qui ne sont plus utilisés
     * @param {Object} state - État actuel du slice
     * @param {Object} action - Action avec payload { actors } - Liste des acteurs actuellement utilisés
     */
    updateAvailableActors(state, action) {
      const currentActors = action.payload.actors;
      
      // Créer un nouvel objet pour les acteurs
      const updatedActors = {};
      
      // Conserver uniquement les acteurs qui sont encore utilisés
      currentActors.forEach(actorId => {
        // Préserver l'état de visibilité si l'acteur existait déjà
        updatedActors[actorId] = state.actors[actorId] !== undefined ? state.actors[actorId] : true;
      });
      
      // Remplacer complètement l'objet des acteurs
      state.actors = updatedActors;
    },
    
    /**
     * Met à jour les groupes disponibles en supprimant ceux qui ne sont plus utilisés
     * @param {Object} state - État actuel du slice
     * @param {Object} action - Action avec payload { groups } - Liste des groupes actuellement utilisés
     */
    updateAvailableGroups(state, action) {
      const currentGroups = action.payload.groups;
      
      // Créer un nouvel objet pour les groupes
      const updatedGroups = {};
      
      // Conserver uniquement les groupes qui sont encore utilisés
      currentGroups.forEach(groupId => {
        // Préserver l'état de visibilité si le groupe existait déjà
        updatedGroups[groupId] = state.groups[groupId] !== undefined ? state.groups[groupId] : true;
      });
      
      // Remplacer complètement l'objet des groupes
      state.groups = updatedGroups;
    },
    
    /**
     * Met à jour les couleurs disponibles en supprimant celles qui ne sont plus utilisées
     * @param {Object} state - État actuel du slice
     * @param {Object} action - Action avec payload { colors } - Liste des couleurs actuellement utilisées
     */
    updateAvailableColors(state, action) {
      const currentColors = action.payload.colors;
      
      // Créer un nouvel objet pour les couleurs
      const updatedColors = {};
      
      // Conserver uniquement les couleurs qui sont encore utilisées
      currentColors.forEach(color => {
        // Préserver l'état de visibilité si la couleur existait déjà
        updatedColors[color] = state.colors[color] !== undefined ? state.colors[color] : true;
      });
      
      // Remplacer complètement l'objet des couleurs
      state.colors = updatedColors;
    },
    
    /**
     * Bascule la visibilité d'un acteur
     * @param {Object} state - État actuel du slice
     * @param {Object} action - Action avec payload actorId
     */
    toggleActorVisibility(state, action) {
      const actorId = action.payload;
      state.actors[actorId] = !state.actors[actorId];
    },
    
    /**
     * Bascule la visibilité d'un groupe
     * @param {Object} state - État actuel du slice
     * @param {Object} action - Action avec payload groupId
     */
    toggleGroupVisibility(state, action) {
      const groupId = action.payload;
      state.groups[groupId] = !state.groups[groupId];
    },
    
    /**
     * Bascule la visibilité d'une couleur
     * @param {Object} state - État actuel du slice
     * @param {Object} action - Action avec payload color
     */
    toggleColorVisibility(state, action) {
      const colorId = action.payload;
      state.colors[colorId] = !state.colors[colorId];
    },
    
    /**
     * Définit la visibilité d'un acteur
     * @param {Object} state - État actuel du slice
     * @param {Object} action - Action avec payload { actorId, isVisible }
     */
    setActorVisibility(state, action) {
      const { actorId, isVisible } = action.payload;
      state.actors[actorId] = isVisible;
    },
    
    /**
     * Définit la visibilité d'un groupe
     * @param {Object} state - État actuel du slice
     * @param {Object} action - Action avec payload { groupId, isVisible }
     */
    setGroupVisibility(state, action) {
      const { groupId, isVisible } = action.payload;
      state.groups[groupId] = isVisible;
    },
    
    /**
     * Définit la visibilité d'une couleur
     * @param {Object} state - État actuel du slice
     * @param {Object} action - Action avec payload { color, isVisible }
     */
    setColorVisibility(state, action) {
      const { color, isVisible } = action.payload;
      state.colors[color] = isVisible;
    },
    
    /**
     * Active le mode focus sur un élément spécifique
     * @param {Object} state - État actuel du slice
     * @param {Object} action - Action avec payload { id, type }
     */
    activateFocus(state, action) {
      const { id, type } = action.payload;
      
      // Si le focus est déjà actif sur cet élément, le désactiver
      if (state.focus.active && state.focus.targetId === id && state.focus.targetType === type) {
        viewsSlice.caseReducers.deactivateFocus(state, { type: 'views/deactivateFocus' });
        return;
      }
      
      // Sauvegarder l'état actuel UNIQUEMENT si le focus n'était PAS déjà actif
      if (!state.focus.active) {
        state.focus.previousState = {
          actors: { ...state.actors },
          groups: { ...state.groups },
          colors: { ...state.colors }
        };
      }
      
      // Activer le focus (ou mettre à jour la cible si déjà actif)
      state.focus.active = true;
      state.focus.targetId = id;
      state.focus.targetType = type;
      
      // Masquer tous les éléments sauf celui qui est ciblé
      if (type === 'actor') {
        // Masquer tous les acteurs sauf celui ciblé
        Object.keys(state.actors).forEach(actorId => {
          state.actors[actorId] = actorId === id;
        });
      } else if (type === 'group') {
        // Masquer tous les groupes sauf celui ciblé
        Object.keys(state.groups).forEach(groupId => {
          state.groups[groupId] = groupId === id;
        });
      } else if (type === 'color') {
        // Masquer toutes les couleurs sauf celle ciblée
        Object.keys(state.colors).forEach(color => {
          state.colors[color] = color === id;
        });
      }
    },
    
    /**
     * Désactive le mode focus et restaure l'état précédent
     * @param {Object} state - État actuel du slice
     */
    deactivateFocus(state) {
      // Si le focus n'est pas actif, ne rien faire
      if (!state.focus.active) {
        return;
      }
      
      // Restaurer l'état précédent
      if (state.focus.previousState) {
        state.actors = { ...state.focus.previousState.actors };
        state.groups = { ...state.focus.previousState.groups };
        state.colors = { ...state.focus.previousState.colors };
      }
      
      // Réinitialiser l'état du focus
      state.focus.active = false;
      state.focus.targetId = null;
      state.focus.targetType = null;
      state.focus.previousState = null;
    },
    
    /**
     * Updates the lists of actors, groups, and colors shown in the Views panel
     * based on the items present in the current calendar view's date range.
     * All items are initially set to visible (true).
     * Also deactivates focus if the focused item is no longer in the visible set.
     */
    updateVisibleViewItems(state, action) {
      const { actors = [], groups = [], colors = [] } = action.payload;

      const newActorsVisibility = {};
      actors.forEach(id => { newActorsVisibility[id] = true; });

      const newGroupsVisibility = {};
      groups.forEach(id => { newGroupsVisibility[id] = true; });

      const newColorsVisibility = {};
      colors.forEach(color => { newColorsVisibility[color] = true; });

      state.actors = newActorsVisibility;
      state.groups = newGroupsVisibility;
      state.colors = newColorsVisibility;

      // Check if the currently focused item is still present
      if (state.focus.active) {
        let isFocusTargetStillVisible = false;
        const { targetId, targetType } = state.focus;
        if (targetType === 'actor' && state.actors[targetId]) {
          isFocusTargetStillVisible = true;
        } else if (targetType === 'group' && state.groups[targetId]) {
          isFocusTargetStillVisible = true;
        } else if (targetType === 'color' && state.colors[targetId]) {
          isFocusTargetStillVisible = true;
        }

        // If the focus target is no longer visible, deactivate focus
        if (!isFocusTargetStillVisible) {
          state.focus.active = false;
          state.focus.targetId = null;
          state.focus.targetType = null;
          state.focus.previousState = null; // No state to restore as it was based on the old list
        }
        // If focus remains active, previousState might become irrelevant
        // as it reflects a potentially different set of items.
        // Consider clearing previousState here too, or handling restoration carefully.
        // For simplicity (option chosen), we only deactivate focus.
      }
    },
  }
});

// Export des actions
export const { 
  initializeFilters,
  updateAvailableActors,
  updateAvailableGroups,
  updateAvailableColors,
  toggleActorVisibility,
  toggleGroupVisibility,
  toggleColorVisibility,
  setActorVisibility,
  setGroupVisibility,
  setColorVisibility,
  activateFocus,
  deactivateFocus,
  updateVisibleViewItems // Exporter la nouvelle action
} = viewsSlice.actions;

// Sélecteurs de base
const selectViewsActors = state => state.views.actors;
const selectViewsGroups = state => state.views.groups;
const selectViewsColors = state => state.views.colors;
const selectViewsFocusActive = state => state.views.focus.active;
const selectViewsFocusTargetId = state => state.views.focus.targetId;
const selectViewsFocusTargetType = state => state.views.focus.targetType;

// Sélecteurs mémorisés
export const selectActorVisibility = createSelector(
  [selectViewsActors, (_, actorId) => actorId],
  (actors, actorId) => actors[actorId] !== undefined ? actors[actorId] : true // Default to true if undefined
);

export const selectGroupVisibility = createSelector(
  [selectViewsGroups, (_, groupId) => groupId],
  (groups, groupId) => groups[groupId] !== undefined ? groups[groupId] : true // Default to true if undefined
);

export const selectColorVisibility = createSelector(
  [selectViewsColors, (_, color) => color],
  (colors, color) => colors[color] !== undefined ? colors[color] : true // Default to true if undefined
);

export const selectAllVisibleActors = selectViewsActors; // Already selecting the direct object, usually stable
export const selectAllVisibleGroups = selectViewsGroups; // Already selecting the direct object, usually stable
export const selectAllVisibleColors = selectViewsColors; // Already selecting the direct object, usually stable

export const selectFocusActive = selectViewsFocusActive; // Already selecting a primitive, stable

// Sélecteur mémorisé pour l'objet focus target
export const selectFocusTarget = createSelector(
  [selectViewsFocusTargetId, selectViewsFocusTargetType],
  (id, type) => ({ id, type })
);

// Sélecteur mémorisé pour récupérer tous les filtres
export const selectAllFilters = createSelector(
  [
    selectAllVisibleActors, // Use the already defined selector
    selectAllVisibleGroups, // Use the already defined selector
    selectAllVisibleColors, // Use the already defined selector
    selectFocusActive,      // Use the already defined selector
    selectFocusTarget       // Use the new memoized selector
  ],
  (actors, groups, colors, focusActive, focusTarget) => ({
    actors,
    groups,
    colors,
    focus: {
      active: focusActive,
      target: focusTarget
    }
  })
);

/**
 * Détermine si un événement est visible en fonction des filtres actifs
 * @param {Object} state - État Redux
 * @param {Object} event - Événement à vérifier
 * @returns {boolean} - true si l'événement est visible, false sinon
 */
export const selectEventVisibility = createSelector(
  [
    state => state.views.actors,
    state => state.views.groups,
    state => state.views.colors,
    state => state.views.focus,
    (_, event) => event
  ],
  (actorsVisibility, groupsVisibility, colorsVisibility, focus, event) => {
    console.log(`=== Checking visibility for event: ${event.title} ===`);
    
    // Si le mode focus est actif, vérifier si l'événement correspond à l'élément ciblé
    if (focus.active) {
      console.log('Focus is active:', focus);
      const { targetId, targetType } = focus;
      
      if (targetType === 'actor') {
        // Vérifier si l'acteur ciblé est présent dans l'événement
        const participants = event.extendedProps?.participants || [];
        console.log('Event participants:', participants);
        
        const hasTargetActor = participants.some(p => 
          (p.type === 'human' || p.type === 'object') && p.id === targetId
        );
        
        // Vérifier si l'acteur est le présentateur
        const isPresentedByTarget = event.extendedProps?.presenterId === targetId;
        
        const isVisible = hasTargetActor || isPresentedByTarget;
        console.log(`Actor focus check result: ${isVisible} (hasTargetActor: ${hasTargetActor}, isPresentedByTarget: ${isPresentedByTarget})`);
        return isVisible;
      }
      
      if (targetType === 'group') {
        // Vérifier si le groupe ciblé est présent dans l'événement
        const participants = event.extendedProps?.participants || [];
        return participants.some(p => p.type === 'group' && p.id === targetId);
      }
      
      if (targetType === 'color') {
        // Vérifier si la couleur ciblée est utilisée par l'événement
        return event.backgroundColor === targetId || event.borderColor === targetId;
      }
      
      return false;
    }
    
    // Vérifier la visibilité par couleur
    const colorVisible = 
      !event.backgroundColor || 
      colorsVisibility[event.backgroundColor] !== false;
    
    if (!colorVisible) return false;
    
    // Vérifier la visibilité par acteur et groupe
    const participants = event.extendedProps?.participants || [];
    
    // Si l'événement n'a pas de participants, il est visible
    if (participants.length === 0) return true;
    
    // Vérifier si au moins un participant est visible
    const hasVisibleParticipant = participants.some(participant => {
      if (participant.type === 'human' || participant.type === 'object') {
        return actorsVisibility[participant.id] !== false;
      }
      if (participant.type === 'group') {
        return groupsVisibility[participant.id] !== false;
      }
      return true;
    });
    
    // Vérifier si le présentateur est visible
    const presenterId = event.extendedProps?.presenterId;
    const presenterVisible = !presenterId || actorsVisibility[presenterId] !== false;
    
    return hasVisibleParticipant && presenterVisible;
  }
);

export default viewsSlice.reducer;
