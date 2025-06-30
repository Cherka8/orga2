import apiClient from './api';

/**
 * Sends a request to the backend to share a calendar with a specific actor.
 * @param {number} actorId - The ID of the actor to share the calendar with.
 * @returns {Promise<any>} The response from the API.
 */
export const shareCalendarWithActor = async (actorId) => {
  try {
    const response = await apiClient.post(`/calendar-sharing/share/actor/${actorId}`);
    return response.data;
  } catch (error) {
    // The error will be handled by the component, but we can log it here for debugging
    console.error(`Error sharing calendar with actor ${actorId}:`, error.response?.data || error.message);
    // Re-throw the error so the component's catch block can handle it
    throw error;
  }
};

/**
 * Fetches the shared calendar data using a specific token.
 * @param {string} token - The sharing token.
 * @returns {Promise<any>} The actor and events data.
 */
export const getSharedCalendar = async (token) => {
  try {
    const response = await apiClient.get('/calendar-sharing/shared', { params: { token } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching shared calendar with token ${token}:`, error.response?.data || error.message);
    throw error;
  }
};
