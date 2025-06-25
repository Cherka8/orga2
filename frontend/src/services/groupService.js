import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor to add the auth token to every request
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

// Interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - 401. Logging out.');
      store.dispatch(logout());
      // Optionnel: rediriger vers la page de connexion
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fonction pour gérer les données de formulaire (photo)
const prepareGroupData = (groupData) => {
  const formData = new FormData();
  Object.keys(groupData).forEach(key => {
    const value = groupData[key];
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  return formData;
};

export const getGroups = async () => {
  const response = await apiClient.get('/groups');
  return response.data;
};

export const createGroup = async (formData) => {
  // formData est déjà un objet FormData préparé par le composant Form
  const response = await apiClient.post('/groups', formData);
  return response.data;
};

export const updateGroup = async (groupId, formData) => {
  // formData est déjà un objet FormData préparé par le composant Form
  const response = await apiClient.patch(`/groups/${groupId}`, formData);
  return response.data;
};

export const deleteGroup = async (groupId) => {
  const response = await apiClient.delete(`/groups/${groupId}`);
  return response.data;
};

export const addActorToGroup = async (groupId, actorId) => {
  const response = await apiClient.post(`/groups/${groupId}/members/${actorId}`);
  return response.data;
};

export const removeActorFromGroup = async (groupId, actorId) => {
  const response = await apiClient.delete(`/groups/${groupId}/members/${actorId}`);
  return response.data;
};
