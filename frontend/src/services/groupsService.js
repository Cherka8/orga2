import {
  fetchGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  addActorToGroup,
  removeActorFromGroup,
  selectGroup
} from '../redux/slices/groupsSlice';

/**
 * Service pour la gestion des groupes d'acteurs
 */
export const GroupsService = {
  /**
   * Récupère tous les groupes
   */
  fetchAll: (dispatch) => {
    return dispatch(fetchGroups());
  },

  /**
   * Ajoute un nouveau groupe
   * @param {Object} group - Données du groupe à ajouter
   */
  create: (dispatch, group) => {
    return dispatch(addGroup(group));
  },

  /**
   * Met à jour un groupe existant
   * @param {Object} group - Données du groupe avec l'ID
   */
  update: (dispatch, group) => {
    return dispatch(updateGroup(group));
  },

  /**
   * Supprime un groupe
   * @param {string} groupId - ID du groupe à supprimer
   */
  delete: (dispatch, groupId) => {
    return dispatch(deleteGroup(groupId));
  },

  /**
   * Ajoute un acteur à un groupe
   * @param {string} groupId - ID du groupe
   * @param {string} actorId - ID de l'acteur à ajouter
   */
  addActor: (dispatch, groupId, actorId) => {
    return dispatch(addActorToGroup({ groupId, actorId }));
  },

  /**
   * Retire un acteur d'un groupe
   * @param {string} groupId - ID du groupe
   * @param {string} actorId - ID de l'acteur à retirer
   */
  removeActor: (dispatch, groupId, actorId) => {
    return dispatch(removeActorFromGroup({ groupId, actorId }));
  },

  /**
   * Sélectionne un groupe pour l'édition
   * @param {string|null} groupId - ID du groupe à sélectionner ou null pour désélectionner
   */
  select: (dispatch, groupId) => {
    return dispatch(selectGroup(groupId));
  }
};

export default GroupsService;
