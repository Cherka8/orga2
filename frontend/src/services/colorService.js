import apiClient from '../api/apiClient';

/**
 * Service pour gérer les couleurs via l'API
 */
class ColorService {
  
  /**
   * Récupère la palette complète des couleurs
   * @returns {Promise<Object>} La palette de couleurs avec noms et codes hex
   */
  async getPalette() {
    try {
      const response = await apiClient.get('/colors/palette');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la palette de couleurs:', error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les noms des couleurs
   * @returns {Promise<string[]>} Liste des noms de couleurs
   */
  async getColorNames() {
    try {
      const response = await apiClient.get('/colors/names');
      return response.data.names;
    } catch (error) {
      console.error('Erreur lors de la récupération des noms de couleurs:', error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les codes hexadécimaux
   * @returns {Promise<string[]>} Liste des codes hexadécimaux
   */
  async getHexCodes() {
    try {
      const response = await apiClient.get('/colors/hex-codes');
      return response.data.hexCodes;
    } catch (error) {
      console.error('Erreur lors de la récupération des codes hex:', error);
      throw error;
    }
  }
}

export default new ColorService();
