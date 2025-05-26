import { 
  addActor, 
  updateActor, 
  deleteActor, 
  fetchActors,
  setTypeFilter,
  setSearchFilter,
  clearFilters
} from '../redux/slices/actorsSlice';

/**
 * Service pour la gestion des acteurs
 */
export const ActorsService = {
  /**
   * Récupère tous les acteurs
   */
  fetchAll: (dispatch) => {
    return dispatch(fetchActors());
  },

  /**
   * Ajoute un nouvel acteur
   * @param {Object} actor - Données de l'acteur à ajouter
   */
  create: (dispatch, actor) => {
    return dispatch(addActor(actor));
  },

  /**
   * Met à jour un acteur existant
   * @param {Object} actor - Données de l'acteur avec l'ID
   */
  update: (dispatch, actor) => {
    return dispatch(updateActor(actor));
  },

  /**
   * Supprime un acteur
   * @param {string} actorId - ID de l'acteur à supprimer
   */
  delete: (dispatch, actorId) => {
    return dispatch(deleteActor(actorId));
  },

  /**
   * Filtre les acteurs par type
   * @param {string|null} type - Type d'acteur (human, location, object) ou null pour tous
   */
  filterByType: (dispatch, type) => {
    return dispatch(setTypeFilter(type));
  },

  /**
   * Filtre les acteurs par texte de recherche
   * @param {string} searchText - Texte de recherche
   */
  search: (dispatch, searchText) => {
    return dispatch(setSearchFilter(searchText));
  },

  /**
   * Réinitialise tous les filtres
   */
  clearFilters: (dispatch) => {
    return dispatch(clearFilters());
  }
};

export default ActorsService;
