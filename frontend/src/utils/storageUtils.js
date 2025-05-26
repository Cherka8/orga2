/**
 * Utilitaires pour la persistance des événements dans localStorage
 */

// Clé utilisée pour stocker les événements dans localStorage
const EVENTS_STORAGE_KEY = 'organAIzer_events';

/**
 * Sauvegarde les événements dans localStorage
 * @param {Array} events - Liste des événements à sauvegarder
 */
export const saveEventsToLocalStorage = (events) => {
  try {
    // Filtrer les événements temporaires et préparer les dates pour la sérialisation
    const eventsToSave = events.filter(event => 
      !(event.extendedProps && event.extendedProps.isTemporary)
    ).map(event => ({
      ...event,
      // Convertir les dates en chaînes ISO pour la sérialisation
      start: event.start instanceof Date ? event.start.toISOString() : event.start,
      end: event.end instanceof Date ? event.end.toISOString() : event.end
    }));
    
    // Sauvegarder dans localStorage
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(eventsToSave));
    console.log(`${eventsToSave.length} événements sauvegardés dans localStorage`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des événements dans localStorage:', error);
    return false;
  }
};

/**
 * Charge les événements depuis localStorage
 * @returns {Array} Liste des événements chargés ou tableau vide si aucun événement trouvé
 */
export const loadEventsFromLocalStorage = () => {
  try {
    // Récupérer les événements depuis localStorage
    const eventsJson = localStorage.getItem(EVENTS_STORAGE_KEY);
    
    if (!eventsJson) {
      console.log('Aucun événement trouvé dans localStorage');
      return [];
    }
    
    // Parser les événements et reconvertir les dates
    const events = JSON.parse(eventsJson).map(event => ({
      ...event,
      // Reconvertir les chaînes ISO en objets Date
      start: new Date(event.start),
      end: event.end ? new Date(event.end) : null
    }));
    
    console.log(`${events.length} événements chargés depuis localStorage`);
    return events;
  } catch (error) {
    console.error('Erreur lors du chargement des événements depuis localStorage:', error);
    return [];
  }
};

/**
 * Supprime un événement de localStorage
 * @param {string} eventId - ID de l'événement à supprimer
 */
export const removeEventFromLocalStorage = (eventId) => {
  try {
    // Charger les événements existants
    const events = loadEventsFromLocalStorage();
    
    // Filtrer l'événement à supprimer
    const updatedEvents = events.filter(event => event.id !== eventId);
    
    // Sauvegarder les événements mis à jour
    saveEventsToLocalStorage(updatedEvents);
    
    console.log(`Événement ${eventId} supprimé de localStorage`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'événement ${eventId} de localStorage:`, error);
    return false;
  }
};

/**
 * Supprime tous les événements de localStorage
 */
export const clearEventsFromLocalStorage = () => {
  try {
    localStorage.removeItem(EVENTS_STORAGE_KEY);
    console.log('Tous les événements ont été supprimés de localStorage');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression des événements de localStorage:', error);
    return false;
  }
};
