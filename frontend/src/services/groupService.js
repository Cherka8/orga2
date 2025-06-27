import apiClient from './api';

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
