/**
 * Utility functions for time-related operations
 */

import { differenceInMilliseconds, isWithinInterval, parseISO, startOfDay, endOfDay, isFuture, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale'; 
import { ACTOR_TYPES } from '../redux/slices/actorsSlice'; // Assurez-vous que le chemin est correct

/**
 * Formats a date object to display time according to the locale
 * @param {Date} date - The date object to format
 * @param {Locale} locale - The date-fns locale object (e.g., fr, enUS)
 * @returns {string} Formatted time string (e.g., "14:30" or "2:30 PM")
 */
export const formatTime = (date, locale) => {
  if (!date || !locale) return ''; // Sécurité
  try {
    // Force HH:mm format for <input type="time">
    return format(date, 'HH:mm', { locale }); 
  } catch (error) {
    console.error("Error formatting time:", error, { date, locale });
    // Fallback très basique si le formatage échoue
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
};

/**
 * Formats a date object to display date in long format according to the locale
 * @param {Date} date - The date object to format
 * @param {Locale} locale - The date-fns locale object (e.g., fr, enUS)
 * @returns {string} Formatted date string (e.g., "1 janv. 2024" or "Jan 1, 2024")
 */
export const formatDate = (date, locale) => {
  if (!date || !locale) return ''; // Sécurité
  try {
    return format(date, 'PPP', { locale }); 
  } catch (error) {
    console.error("Error formatting date:", error, { date, locale });
    // Fallback très basique
    return date.toLocaleDateString(); // Utilise la locale du navigateur par défaut
  }
};

/**
 * Generates time options for time selectors (15-minute intervals)
 * @returns {Array} Array of time options with value and label
 */
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = new Date();
      time.setHours(hour, minute, 0);
      options.push({
        value: time,
        label: formatTime(time, enUS) // Utiliser formatTime avec la locale enUS
      });
    }
  }
  return options;
};

/**
 * Pre-calculated time options to avoid recalculating on each render
 */
export const TIME_OPTIONS = generateTimeOptions();

/**
 * Filtre les acteurs pour ne garder que les humains
 * @param {Object} actorsState - État Redux des acteurs ({byId, allIds})
 * @returns {Array} Tableau d'acteurs humains
 */
export const getHumanActors = (actorsState) => {
  if (!actorsState?.byId || !actorsState?.allIds) return [];
  
  // Assurons-nous que ACTOR_TYPES.HUMAN est défini
  if (!ACTOR_TYPES?.HUMAN) {
    console.error("ACTOR_TYPES.HUMAN is not defined!");
    return [];
  }

  return actorsState.allIds
    .map(id => actorsState.byId[id])
    // Ajout d'une vérification pour s'assurer que l'acteur existe avant de vérifier son type
    .filter(actor => actor && actor.type === ACTOR_TYPES.HUMAN);
};

/**
 * Calcule la durée d'un événement en millisecondes
 * @param {Object} event - Événement avec start et end (ISO strings)
 * @returns {number} Durée en millisecondes, 0 si invalide
 */
export const calculateEventDuration = (event) => {
  if (!event?.start || !event?.end) {
    return 0;
  }
  try {
    const startTime = new Date(event.start);
    const endTime = new Date(event.end);

    // Check if dates are valid
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.warn("Invalid date format in event:", event);
      return 0;
    }

    const duration = differenceInMilliseconds(endTime, startTime);
    return duration > 0 ? duration : 0; // Return 0 for negative or zero durations
  } catch (error) {
    console.error("Error calculating event duration:", error, "Event:", event);
    return 0;
  }
};

/**
 * Formate une durée en millisecondes en texte lisible
 * @param {number} ms - Durée en millisecondes
 * @returns {string} Texte formaté (ex: "5h 30m" ou "15m")
 */
export const formatDuration = (ms) => {
  if (typeof ms !== 'number' || ms <= 0 || isNaN(ms)) {
    return "0m";
  }

  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let formatted = "";
  if (hours > 0) {
    formatted += `${hours}h`;
  }
  if (minutes > 0) {
    if (hours > 0) formatted += " "; // Add space if hours are present
    formatted += `${minutes}m`;
  }
  
  // If duration is less than a minute but non-zero, maybe show '< 1m'? 
  // For now, if both hours and minutes are 0 after calculation, return 0m.
  return formatted || "0m"; 
};

/**
 * Vérifie si un acteur participe à un événement, en considérant les groupes.
 * @param {string} actorId - ID de l'acteur
 * @param {Object} event - Événement à vérifier
 * @param {Object} groupsById - Map des groupes par ID depuis Redux
 * @returns {boolean} Vrai si l'acteur participe
 */
export const isActorInEvent = (actorId, event, groupsById) => {
  // DEBUG: Vérifier les données reçues
  console.log(`[isActorInEvent] Checking actorId: ${actorId} in event:`, event.id);
  console.log(`[isActorInEvent] Event participants:`, event?.extendedProps?.participants);
  console.log(`[isActorInEvent] Groups data:`, groupsById);
  
  const participantsInEvent = event?.extendedProps?.participants;
  if (Array.isArray(participantsInEvent)) {
    let foundDirect = false;
    let foundInGroup = false;
    let groupId = null;

    // Vérifier si l'acteur est un participant direct
    foundDirect = participantsInEvent.some(participant => {
      if (!participant || !participant.id) return false;
      if (participant.id === actorId) {
        console.log(`[isActorInEvent] Actor ${actorId} is a direct participant in event ${event.id}`);
        return true;
      }
      return false;
    });

    // Vérifier si l'acteur est membre d'un groupe participant
    if (!foundDirect) {
      // Trouver tous les groupes participants
      const groupParticipants = participantsInEvent.filter(p => p && p.type === 'group');
      console.log(`[isActorInEvent] Found ${groupParticipants.length} group participants in event ${event.id}:`, 
        groupParticipants.map(g => g.id));
      
      // Vérifier chaque groupe
      foundInGroup = groupParticipants.some(groupParticipant => {
        if (!groupParticipant || !groupParticipant.id) return false;
        
        const group = groupsById && groupsById[groupParticipant.id];
        console.log(`[isActorInEvent] Checking group ${groupParticipant.id}:`, group);
        
        if (group && Array.isArray(group.members)) {
          console.log(`[isActorInEvent] Group ${groupParticipant.id} members:`, group.members);
          if (group.members.includes(actorId)) {
            groupId = group.id;
            console.log(`[isActorInEvent] Actor ${actorId} found in group ${group.id} for event ${event.id}`);
            return true;
          }
        }
        return false;
      });
    }
    
    const found = foundDirect || foundInGroup;
    console.log(`[isActorInEvent] Actor ${actorId} ${found ? 'found' : 'NOT found'} in event ${event.id}`);
    if (foundInGroup) {
      console.log(`[isActorInEvent] Actor ${actorId} is part of group ${groupId} in event ${event.id}`);
    }
    
    return found;
  }
  
  console.log(`[isActorInEvent] extendedProps.participants is not an array or undefined for event ${event?.id}`);
  return false;
};

/**
 * Calcule les heures totales d'un acteur pour une période donnée.
 * @param {string} actorId - ID de l'acteur
 * @param {Array} events - Tableau d'événements
 * @param {Object} groupsById - Map des groupes par ID depuis Redux
 * @param {Date | null} startDate - Date de début de la période (inclusive)
 * @param {Date | null} endDate - Date de fin de la période (inclusive)
 * @returns {number} Durée totale en millisecondes
 */
export const calculateActorHours = (actorId, events, groupsById, startDate = null, endDate = null) => {
  // DEBUG: Log des entrées incluant les dates
  console.log(`[calculateActorHours] Calculating hours for actorId: ${actorId}`, `with ${events?.length || 0} events.`);
  console.log(`[calculateActorHours] StartDate:`, startDate, 'EndDate:', endDate);
  
  // Vérification des données d'entrée
  if (!actorId || !Array.isArray(events)) {
    console.warn("[calculateActorHours] actorId ou events invalides.");
    return 0;
  }
  
  // Vérification spécifique pour groupsById
  if (!groupsById) {
    console.warn("[calculateActorHours] groupsById est null ou undefined.");
    console.log("[calculateActorHours] groupsById:", groupsById);
  } else {
    console.log(`[calculateActorHours] Found ${Object.keys(groupsById).length} groups in groupsById.`);
    
    // Vérifier si l'acteur est membre d'un groupe
    let actorGroups = [];
    Object.keys(groupsById).forEach(groupId => {
      const group = groupsById[groupId];
      if (group && Array.isArray(group.members) && group.members.includes(actorId)) {
        actorGroups.push({ id: groupId, name: group.name });
      }
    });
    
    if (actorGroups.length > 0) {
      console.log(`[calculateActorHours] Actor ${actorId} is a member of ${actorGroups.length} groups:`, actorGroups);
    } else {
      console.log(`[calculateActorHours] Actor ${actorId} is not a member of any group.`);
    }
  }

  // Filtrer les événements par date AVANT de vérifier la participation de l'acteur
  const filteredEvents = events.filter(event => {
    if (!event?.start) return false; // Ignorer les événements sans date de début

    try {
      const eventStartDate = parseISO(event.start); // Convertir la string ISO en objet Date

      // Si startDate et/ou endDate sont fournis, vérifier si l'événement est dans l'intervalle
      if (startDate || endDate) {
        // Créer l'intervalle de filtrage. Utiliser startOfDay/endOfDay pour inclure toute la journée.
        const interval = {
          start: startDate ? startOfDay(startDate) : new Date(0), // Si pas de startDate, considérer le début des temps
          end: endDate ? endOfDay(endDate) : new Date(8640000000000000) // Si pas de endDate, considérer la fin des temps
        };
        // Vérifier si le début de l'événement est dans l'intervalle
        // Assurez-vous que eventStartDate est un objet Date valide avant d'appeler isWithinInterval
        if (isNaN(eventStartDate.getTime())) {
            console.warn("Invalid event start date encountered:", event.start);
            return false;
        }
        return isWithinInterval(eventStartDate, interval);
      }

      // Si ni startDate ni endDate ne sont fournis, inclure tous les événements valides
      return true;
    } catch (error) {
      console.error("Error parsing event date or checking interval:", error, "Event:", event);
      return false; // Exclure l'événement en cas d'erreur de date
    }
  });

  // DEBUG: Log du nombre d'événements après filtrage par date
  console.log(`[calculateActorHours] Found ${filteredEvents.length} events within the date range for actor ${actorId}.`);
  
  // Vérifier les participants des événements filtrés
  let eventsWithGroups = 0;
  filteredEvents.forEach(event => {
    const participants = event?.extendedProps?.participants || [];
    const groupParticipants = participants.filter(p => p && p.type === 'group');
    if (groupParticipants.length > 0) {
      eventsWithGroups++;
      console.log(`[calculateActorHours] Event ${event.id} has ${groupParticipants.length} group participants:`, 
        groupParticipants.map(g => g.id));
    }
  });
  console.log(`[calculateActorHours] ${eventsWithGroups} out of ${filteredEvents.length} events have group participants.`);

  let totalDurationMs = 0;
  let directEvents = 0;
  let groupEvents = 0;
  
  // Itérer sur les événements FILTRÉS par date
  filteredEvents.forEach(event => {
    // Vérifier si l'acteur est un participant direct
    const isDirectParticipant = event?.extendedProps?.participants?.some(
      p => p && p.id === actorId
    );
    
    // Vérifier si l'acteur est membre d'un groupe participant
    let isGroupMember = false;
    const groupParticipants = event?.extendedProps?.participants?.filter(p => p && p.type === 'group') || [];
    
    for (const groupParticipant of groupParticipants) {
      const group = groupsById && groupsById[groupParticipant.id];
      if (group && Array.isArray(group.members) && group.members.includes(actorId)) {
        isGroupMember = true;
        console.log(`[calculateActorHours] Actor ${actorId} is part of group ${group.id} in event ${event.id}`);
        break;
      }
    }
    
    // Comptabiliser l'événement si l'acteur y participe directement ou via un groupe
    if (isDirectParticipant || isGroupMember) {
      const duration = calculateEventDuration(event);
      totalDurationMs += duration;
      
      if (isDirectParticipant) directEvents++;
      if (isGroupMember) groupEvents++;
      
      console.log(`[calculateActorHours] Adding event ${event.id} with duration ${duration}ms to actor ${actorId}.`);
      console.log(`[calculateActorHours] Participation type: ${isDirectParticipant ? 'Direct' : ''} ${isGroupMember ? 'Group' : ''}`);
    }
  });

  // DEBUG: Log du résultat final
  console.log(`[calculateActorHours] Total duration for actor ${actorId}: ${totalDurationMs}ms`);
  console.log(`[calculateActorHours] Direct events: ${directEvents}, Group events: ${groupEvents}`);
  return totalDurationMs;
};

/**
 * Filters events to return only those starting in the future.
 * @param {Array} events - Array of event objects (assuming event.start is an ISO string).
 * @returns {Array} Filtered array of future events.
 */
export const getFutureEvents = (events) => {
  if (!Array.isArray(events)) {
    console.error("getFutureEvents expects an array, received:", events);
    return [];
  }
  return events.filter(event => {
    try {
      const startDate = parseISO(event.start);
      return isFuture(startDate);
    } catch (error) {
      console.error(`Error parsing date for event ID ${event.id}:`, event.start, error);
      return false; // Exclude events with invalid dates
    }
  });
};

/**
 * Filters events based on a date range (inclusive).
 * @param {Array} events - Array of event objects (assuming event.start is an ISO string).
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDate - The end date of the range.
 * @returns {Array} Filtered array of events within the date range.
 */
export const filterEventsByDateRange = (events, startDate, endDate) => {
  if (!Array.isArray(events)) {
    console.error("filterEventsByDateRange expects an array, received:", events);
    return [];
  }
  if (!startDate || !endDate) {
    console.warn("filterEventsByDateRange requires both startDate and endDate.");
    return events; // Return all events if range is incomplete, or maybe [] ? Decide based on expected behavior
  }

  const interval = {
    start: startOfDay(startDate),
    end: endOfDay(endDate)
  };

  return events.filter(event => {
    try {
      const eventStartDate = parseISO(event.start);
      return isWithinInterval(eventStartDate, interval);
    } catch (error) {
      console.error(`Error parsing date for event ID ${event.id}:`, event.start, error);
      return false; // Exclude events with invalid dates
    }
  });
};
