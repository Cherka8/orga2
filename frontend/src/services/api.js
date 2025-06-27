import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const apiClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
});

// Intercepteur pour ajouter le token JWT à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    // Essayer de récupérer le token depuis le state Redux en premier
    let token = store.getState().auth.token;
    
    // Si non disponible, essayer depuis le localStorage (en fallback)
    if (!token) {
      const authData = localStorage.getItem('auth');
      if (authData) {
        try {
          const parsedAuthData = JSON.parse(authData);
          token = parsedAuthData.token;
        } catch (e) {
          console.error("Erreur lors du parsing des données d'authentification du localStorage", e);
        }
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (Non autorisé)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Vérifie si l'erreur est une réponse 401 et que ce n'est pas la page de login elle-même qui échoue
    if (error.response && error.response.status === 401 && !error.config.url.endsWith('/auth/login')) {
      console.log('Interceptor API : Erreur 401. Déconnexion en cours.');
      // Dispatch l'action de déconnexion pour nettoyer le state et le localStorage
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default apiClient;