import apiClient from './api';

const createActor = (actorData) => {
  console.log('Creating actor with data:', actorData);
  
  const formData = new FormData();
  
  // Add all actor data to FormData (except empty photoUrl)
  Object.keys(actorData).forEach(key => {
    if (actorData[key] !== null && actorData[key] !== undefined && actorData[key] !== '') {
      console.log(`Adding to FormData: ${key} =`, actorData[key]);
      formData.append(key, actorData[key]);
    }
  });
  
  // Log FormData contents
  console.log('FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  
  return apiClient.post('/actors', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const updateActor = async (actorId, actorData) => {
  console.log('=== UPDATE ACTOR REQUEST ===');
  console.log('Actor ID:', actorId);
  console.log('Raw actor data:', actorData);
  
  // Vérifier le token
  const token = localStorage.getItem('token');
  console.log('Token present:', !!token);
  console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
  
  const formData = new FormData();
  
  // Filtrer et ajouter les champs de l'acteur au FormData
  Object.keys(actorData).forEach(key => {
    const value = actorData[key];
    
    if (key === 'photo' && value instanceof File) {
      // Ajouter le fichier photo s'il existe
      console.log('Adding photo file:', value.name);
      formData.append('photo', value);
    } else if (key === 'photoUrl' && value && typeof value === 'string' && value.startsWith('http')) {
      // Ajouter photoUrl seulement si c'est une URL valide
      console.log(`Adding photoUrl:`, value);
      formData.append(key, value);
    } else if (key !== 'photo' && key !== 'photoUrl' && key !== 'id' && value !== null && value !== undefined && value !== '') {
      // Ajouter les autres champs non vides (sauf photo, photoUrl et id)
      console.log(`Adding field ${key}:`, value);
      formData.append(key, value);
    } else {
      console.log(`Skipping field ${key}:`, value);
    }
  });
  
  console.log('FormData contents for update:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
  }
  
  try {
    const response = await apiClient.put(`/actors/${actorId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      if (error.response.data.message && Array.isArray(error.response.data.message)) {
        console.error('Validation errors:', error.response.data.message);
      }
    }
    throw error;
  }
};

const getActors = async (filters = {}) => {
  console.log('=== GET ACTORS REQUEST ===');
  console.log('Filters:', filters);
  
  // Construction des query parameters
  const queryParams = new URLSearchParams();
  
  // Pagination
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  
  // Filtres
  if (filters.type) queryParams.append('type', filters.type);
  if (filters.search && filters.search.trim()) queryParams.append('search', filters.search.trim());
  
  // Tri
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.order) queryParams.append('order', filters.order);
  
  const queryString = queryParams.toString();
  const url = `/actors${queryString ? `?${queryString}` : ''}`;
  
  console.log('Request URL:', url);
  
  try {
    const response = await apiClient.get(url);
    console.log('Get actors response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get actors error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

const deleteActor = async (actorId) => {
  console.log('=== DELETE ACTOR REQUEST ===');
  console.log('Actor ID:', actorId);
  
  try {
    const response = await apiClient.delete(`/actors/${actorId}`);
    console.log('Delete actor response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Delete actor error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

const actorService = {
  createActor,
  updateActor,
  getActors,
  deleteActor,
};

export default actorService;
