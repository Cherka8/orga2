import apiClient from './api';

// Fonction pour récupérer tous les événements
const getEvents = async () => {
  try {
    console.log('Fetching events...');
    const response = await apiClient.get('/events');
    console.log('Events fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour créer un nouvel événement
const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour mettre à jour un événement existant
const updateEvent = async (id, eventData) => {
  try {
    const response = await apiClient.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'événement ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour supprimer un événement
const deleteEvent = async (id) => {
  try {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'événement ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour récupérer un événement par son ID
const getEventById = async (id) => {
  try {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'événement ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

const eventService = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

export default eventService;
