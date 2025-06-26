import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized! Session may have expired. Logging out.');
      // Supprimer les informations de l'utilisateur du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Rediriger vers la page de connexion pour une nouvelle authentification
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Crée un nouvel événement.
 * @param {object} eventData - Les données de l'événement à créer.
 * @returns {Promise<object>} La réponse de l'API.
 */
export const createEvent = (eventData) => {
  return apiClient.post('/events', eventData);
};

// Fonction pour récupérer tous les événements
export const getEvents = async () => {
  try {
    const response = await apiClient.get('/events');
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch events');
  }
};

const eventService = {
  createEvent,
  getEvents,
};

export default eventService;
