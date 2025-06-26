import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
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
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized! Logging out.');
      // Supprimer les informations de l'utilisateur du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
