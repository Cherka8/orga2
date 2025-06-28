/**
 * Utilitaires pour la fonctionnalité "Views" qui permet de filtrer les événements
 * du calendrier par acteurs, groupes et couleurs.
 */

import { ACTOR_TYPES } from '../redux/slices/actorsSlice';

/**
 * Extrait tous les acteurs, groupes et couleurs uniques présents dans les événements
 * @param {Array} events - Liste des événements du calendrier
 * @param {Object} groupsById - Map des groupes par ID depuis Redux
 * @returns {Object} - { actors, groups, colors } - Listes d'IDs uniques
 */
export const extractViewFiltersFromEvents = (events, groupsById = {}) => {
  const actors = new Set();
  const groups = new Set();
  const colors = new Set();

  events.forEach(event => {
    // DEBUG: Logs pour voir les couleurs extraites
    console.log('🎨 [extractViewFiltersFromEvents] Event:', event.title || event.id);
    console.log('  - event.eventColor:', event.eventColor);
    
    // Extraction des couleurs (utiliser eventColor qui contient le nom français)
    if (event.eventColor) {
      colors.add(event.eventColor);
      console.log('  - Couleur ajoutée:', event.eventColor);
    }

    // Extraction des participants (acteurs et groupes)
    const participants = event.extendedProps?.participants || [];
    participants.forEach(participant => {
      if (participant.type === ACTOR_TYPES.HUMAN) {
        if (participant.id) {
          actors.add(participant.id);
        }
      } else if (participant.type === ACTOR_TYPES.GROUP) {
        if (participant.id) {
          groups.add(participant.id);
          
          // Ajouter les membres du groupe à la liste des acteurs
          const group = groupsById[participant.id];
          if (group && Array.isArray(group.members)) {
            group.members.forEach(memberId => {
              actors.add(memberId);
            });
          }
        }
      }
    });

    // Extraction du présentateur si présent
    const presenterId = event.extendedProps?.presenterId;
    if (presenterId) {
      actors.add(presenterId);
    }
  });

  const result = {
    actors: Array.from(actors),
    groups: Array.from(groups),
    colors: Array.from(colors)
  };
  
  console.log('🎨 [extractViewFiltersFromEvents] Résultat final:');
  console.log('  - Couleurs extraites:', result.colors);
  
  return result;
};

/**
 * Filtre les événements en fonction du mode focus actif
 * @param {Array} events - Liste des événements à filtrer
 * @param {Object} focus - État du focus {active, targetId, targetType}
 * @param {Object} groupsById - Map des groupes par ID depuis Redux
 * @returns {Array} - Liste des événements filtrés
 */
export const filterEventsByFocus = (events, focus, groupsById = {}) => {
  if (!focus.active) {
    return events;
  }

  return events.filter(event => {
    const participants = event.extendedProps?.participants || [];
    
    if (focus.targetType === 'actor') {
      // Vérification directe existante
      const isDirectParticipant = participants.some(p => 
        (p.type === 'human') && p.id === focus.targetId
      ) || event.extendedProps?.presenterId === focus.targetId;
      
      // Nouvelle vérification pour les membres de groupes
      const isGroupMember = participants.some(p => {
        if (p.type === 'group' && groupsById[p.id]) {
          const group = groupsById[p.id];
          return group.members && group.members.includes(focus.targetId);
        }
        return false;
      });
      
      return isDirectParticipant || isGroupMember;
    }
    
    if (focus.targetType === 'group') {
      return participants.some(p => 
        p.type === 'group' && p.id === focus.targetId
      );
    }
    
    if (focus.targetType === 'color') {
      console.log('🎯 [filterEventsByFocus] Focus couleur - Event:', event.title || event.id);
      console.log('  - event.eventColor:', event.eventColor);
      console.log('  - focus.targetId:', focus.targetId);
      console.log('  - Match:', event.eventColor === focus.targetId);
      return event.eventColor === focus.targetId;
    }
    
    return false;
  });
};

/**
 * Filtre les événements en fonction des filtres actifs
 * @param {Array} events - Liste des événements du calendrier
 * @param {Object} filters - { actors, groups, colors } - État des filtres
 * @param {Object} groupsById - Map des groupes par ID depuis Redux
 * @returns {Array} - Liste des événements filtrés
 */
export const filterEvents = (events, filters, groupsById = {}) => {
  if (!events) return [];
  return events.filter(event => isEventVisible(event, filters, groupsById));
};

/**
 * Détermine si un événement doit être visible en fonction des filtres actifs
 * @param {Object} event - Événement du calendrier
 * @param {Object} filters - { actors, groups, colors } - État des filtres (true = visible, false = caché)
 * @param {Object} groupsById - Map des groupes par ID depuis Redux
 * @returns {boolean} - true si l'événement doit être affiché, false sinon
 */
export const isEventVisible = (event, filters, groupsById = {}) => {
  const { actors, groups, colors } = filters;

  // DEBUG: Logs pour diagnostiquer le problème des couleurs
  console.log('🔍 [isEventVisible] Event:', event.title || event.id);
  console.log('  - event.eventColor:', event.eventColor);
  console.log('  - event.extendedProps?.eventColor:', event.extendedProps?.eventColor);
  console.log('  - colors filters:', colors);

  // Vérifier la visibilité basée sur la couleur de l'événement
  // Utiliser eventColor (nom français) plutôt que backgroundColor/borderColor (hex)
  const eventColorName = event.eventColor || event.extendedProps?.eventColor;
  console.log('  - eventColorName déterminé:', eventColorName);
  console.log('  - colors[eventColorName]:', colors[eventColorName]);
  
  if (eventColorName && colors[eventColorName] === false) {
    console.log('  - ❌ Événement caché par filtre couleur');
    return false;
  }
  
  // Vérifier la visibilité basée sur les participants
  const participants = event.extendedProps?.participants || [];
  
  // Si l'événement n'a pas de participants, on le considère visible
  if (participants.length === 0) {
    return true;
  }
  
  // Vérifier si au moins un des participants est visible
  let hasVisibleParticipant = false;
  
  for (const participant of participants) {
    if (participant.type === ACTOR_TYPES.HUMAN) {
      if (actors[participant.id] !== false) {
        hasVisibleParticipant = true;
        break;
      }
    } else if (participant.type === ACTOR_TYPES.GROUP) {
      if (groups[participant.id] !== false) {
        hasVisibleParticipant = true;
        break;
      }
    }
  }
  
  // Nouvelle vérification pour les membres des groupes
  if (!hasVisibleParticipant) {
    const groupParticipants = participants.filter(p => p && p.type === ACTOR_TYPES.GROUP);
    
    for (const groupParticipant of groupParticipants) {
      // Vérifier si le groupe est visible
      if (groups[groupParticipant.id] !== false) {
        const group = groupsById[groupParticipant.id];
        
        // Vérifier si des acteurs visibles sont membres de ce groupe
        if (group && Array.isArray(group.members)) {
          for (const memberId of group.members) {
            if (actors[memberId] !== false) {
              hasVisibleParticipant = true;
              break;
            }
          }
        }
      }
      
      if (hasVisibleParticipant) break;
    }
  }
  
  // Vérifier également le présentateur
  const presenterId = event.extendedProps?.presenterId;
  if (!hasVisibleParticipant && presenterId && actors[presenterId] !== false) {
    hasVisibleParticipant = true;
  }
  
  return hasVisibleParticipant;
};

/**
 * Filters a list of events to include only those within or overlapping a given date range.
 * @param {Array} allEvents - The full list of event objects.
 * @param {Date} viewStartDate - The start date of the current view.
 * @param {Date} viewEndDate - The end date of the current view (exclusive).
 * @returns {Array} - The filtered list of events.
 */
export const filterEventsByDateRange = (allEvents, viewStartDate, viewEndDate) => {
  if (!allEvents || !viewStartDate || !viewEndDate) return [];

  // Ensure dates are valid Date objects
  const start = new Date(viewStartDate);
  const end = new Date(viewEndDate);

  // Adjust end date to be inclusive for comparison if necessary, or handle FullCalendar's exclusive end date
  // FullCalendar's view.activeEnd is typically exclusive, so comparisons should be < end

  return allEvents.filter(event => {
    if (!event.start || !event.end) return false; // Skip events without dates

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Check for overlap: event starts before view ends AND event ends after view starts
    return eventStart < end && eventEnd > start;
  });
};

/**
 * Extracts unique actor IDs, group IDs, and color codes from a list of events.
 * @param {Array} eventsInView - List of events already filtered by date range.
 * @param {Object} groupsById - Map of group IDs to group objects (used to verify group existence if needed).
 * @returns {{actors: Set<string>, groups: Set<string>, colors: Set<string>}} - Object containing Sets of unique IDs/colors.
 */
export const extractItemsFromEvents = (eventsInView, groupsById) => {
  const actors = new Set();
  const groups = new Set();
  const colors = new Set();

  if (!eventsInView) {
    return { actors, groups, colors };
  }

  eventsInView.forEach(event => {
    // 1. Extraire la couleur de l'événement
    const eventColorName = event.eventColor || event.extendedProps?.eventColor;
    if (eventColorName) {
      colors.add(eventColorName);
    }

    // 2. Extraire le présentateur (presenterActor) - seulement si c'est un humain
    if (event.presenterActor && event.presenterActor.id && event.presenterActor.type === 'human') {
      actors.add(event.presenterActor.id);
    }

    // 3. Extraire le lieu (locationActor) - NE PAS l'ajouter aux acteurs car c'est un lieu
    // Les lieux ne doivent pas apparaître dans le ViewsPanel des acteurs
    
    // 4. Extraire les participants (acteurs et groupes)
    if (Array.isArray(event.participants)) {
      event.participants.forEach(p => {
        if (p.actor && p.actor.id && p.actor.type === 'human') {
          actors.add(p.actor.id);
        }
        
        if (p.group && p.group.id) {
          groups.add(p.group.id);
        }
      });
    }
  });



  return { actors, groups, colors };
};
