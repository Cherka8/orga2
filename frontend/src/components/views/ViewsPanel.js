import React, { useMemo, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ViewsSection from './ViewsSection';
import { 
  toggleActorVisibility, 
  toggleGroupVisibility, 
  toggleColorVisibility,
  deactivateFocus,
  selectAllVisibleActors,
  selectAllVisibleGroups,
  selectAllVisibleColors,
  selectFocusActive,
  selectFocusTarget,
} from '../../redux/slices/viewsSlice';
import { ACTOR_TYPES, selectActorsByIdMap } from '../../redux/slices/actorsSlice';
import { selectGroupsByIdMap } from '../../redux/slices/groupsSlice';
import { getColorName, getColorNameFromHex, getHexFromColorName } from '../../utils/colorUtils';

/**
 * Composant principal du panneau Views
 * Affiche les trois sections (Acteurs, Groupes, Couleurs) et gère le mode focus
 */
const ViewsPanel = ({ isLoading }) => {

  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // État pour le terme de recherche des acteurs
  const [actorSearchTerm, setActorSearchTerm] = useState('');

  // Récupérer l'état de visibilité depuis les sélecteurs
  const actorsVisibility = useSelector(selectAllVisibleActors);
  const groupsVisibility = useSelector(selectAllVisibleGroups);
  const colorsVisibility = useSelector(selectAllVisibleColors);
  const actorsById = useSelector(selectActorsByIdMap);
  const groupsById = useSelector(selectGroupsByIdMap);
  

  
  // Récupérer l'état du mode focus
  const focusActive = useSelector(selectFocusActive);
  const focusTarget = useSelector(selectFocusTarget);
  
  const focusState = useMemo(() => ({
    active: focusActive,
    target: focusTarget || { id: null, type: null }
  }), [focusActive, focusTarget]);

  // Fonction utilitaire pour formater le nom d'un acteur en fonction de son type
  const formatActorName = useCallback((participant) => {
    if (!participant) return '';
    
    if (participant.type === ACTOR_TYPES.HUMAN) {
      return `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || participant.name || `${t('viewsPanel.fallbackActorName')} ${participant.id.toString().slice(-4)}`;
    } else {
      return participant.name || `${participant.type === ACTOR_TYPES.GROUP ? t('viewsPanel.fallbackGroupName') : t('viewsPanel.fallbackActorName')} ${participant.id.toString().slice(-4)}`;
    }
  }, [t]);

  // Fonction utilitaire pour récupérer l'avatar d'un acteur
  const getActorAvatar = useCallback((participant) => {
    if (!participant) return null;
    
    // Vérifier les différentes propriétés possibles pour les images
    // photoUrl est la propriété principale utilisée par les acteurs
    const imageUrl = participant.photoUrl || participant.photo || participant.image || participant.profilePicture || participant.avatar;
    
    // Si on a une URL d'image, construire l'URL complète
    if (imageUrl) {
      // Si l'URL commence par '/', c'est une URL relative - ajouter l'URL de base du serveur
      if (imageUrl.startsWith('/')) {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        return `${baseUrl}${imageUrl}`;
      }
      // Sinon, retourner l'URL telle quelle (URL absolue)
      return imageUrl;
    }
    
    return null;
  }, []);

  // Fonction utilitaire pour récupérer l'avatar d'un groupe
  const getGroupAvatar = useCallback((group) => {
    if (!group) return null;
    
    // Vérifier les différentes propriétés possibles pour les images
    // image est la propriété principale utilisée par les groupes
    const imageUrl = group.image || group.photo || group.photoUrl || group.profilePicture || group.avatar;
    
    // Si on a une URL d'image, construire l'URL complète
    if (imageUrl) {
      // Si l'URL commence par '/', c'est une URL relative - ajouter l'URL de base du serveur
      if (imageUrl.startsWith('/')) {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        return `${baseUrl}${imageUrl}`;
      }
      // Sinon, retourner l'URL telle quelle (URL absolue)
      return imageUrl;
    }
    
    return null;
  }, []);

  // Préparer les éléments pour la section Acteurs en utilisant les IDs des filtres de visibilité
  // et les informations récupérées depuis le store acteurs (actorsData)
  const actorItems = useMemo(() => {
    // Créer la liste complète des acteurs
    const allActorItems = Object.keys(actorsVisibility).map(actorId => {
      const actor = actorsById[actorId];

      
      if (!actor) {
        return {
          id: actorId,
          name: `${t('viewsPanel.fallbackActorName')} ${actorId.toString().slice(-4)}`,
          image: null
        };
      }
      
      return {
        id: Number(actorId),
        name: formatActorName(actor),
        image: getActorAvatar(actor)
      };
    });



    // Filtrer les acteurs si un terme de recherche est présent
    if (actorSearchTerm.trim() === '') {
      return allActorItems;
    }
    
    // Filtrer par nom d'acteur (insensible à la casse)
    const filteredItems = allActorItems.filter(actor => 
      actor.name.toLowerCase().includes(actorSearchTerm.toLowerCase())
    );
    console.log(' [ViewsPanel] actorItems filtrés:', filteredItems);
    return filteredItems;
  }, [actorsVisibility, actorsById, formatActorName, getActorAvatar, t, actorSearchTerm]);

  // Préparer les éléments pour la section Groupes en utilisant les IDs des filtres de visibilité
  // et les informations récupérées depuis le store groupes (groupsData)
  const groupItems = useMemo(() => {
    // console.log(' [ViewsPanel] Création groupItems avec groupsVisibility:', groupsVisibility);
    const allGroupItems = Object.keys(groupsVisibility).map(groupId => {
      const group = groupsById[groupId];
      // console.log(` [ViewsPanel] Group ${groupId}:`, group);
      
      if (!group) {
        return {
          id: groupId,
          name: `${t('viewsPanel.fallbackGroupName')} ${groupId.toString().slice(-4)}`,
          image: null
        };
      }
      
      return {
        id: Number(groupId),
        name: group.name,
        image: getGroupAvatar(group)
      };
    });
    // console.log(' [ViewsPanel] allGroupItems créés:', allGroupItems);
    return allGroupItems;
  }, [groupsVisibility, groupsById, getGroupAvatar, t]);

  // Extraire les couleurs des filtres de visibilité
  const colorItems = useMemo(() => {
    return Object.keys(colorsVisibility).map(color => {
      // Si c'est un code hexadécimal, on récupère le nom français
      // Si c'est déjà un nom, on le garde tel quel
      const isHexColor = color.startsWith('#');
      const displayName = isHexColor ? getColorNameFromHex(color) : color;
      const hexColor = isHexColor ? color : getHexFromColorName(color);
      
      return {
        id: color, // Garde l'ID original (hex ou nom selon ce qui est stocké)
        name: displayName, // Nom à afficher
        color: hexColor // Code hex pour l'affichage visuel
      };
    });
  }, [colorsVisibility]);

  // Fonctions pour basculer la visibilité
  const toggleActorVisibilityHandler = useCallback((actorId) => {
    console.log('👁️ [TOGGLE ACTOR] ID:', actorId, 'Type:', typeof actorId);
    dispatch(toggleActorVisibility(actorId));
  }, [dispatch]);

  const toggleGroupVisibilityHandler = useCallback((groupId) => {

    dispatch(toggleGroupVisibility(groupId));
  }, [dispatch]);

  const toggleColorVisibilityHandler = useCallback((color) => {
    dispatch(toggleColorVisibility(color));
  }, [dispatch]);



    if (isLoading) {
    return (
      <div className="views-panel-loading">
        {/* Vous pouvez utiliser un composant Spinner ici si vous en avez un */}
        <div className="spinner"></div> 
        <p>{t('viewsPanel.loading', 'Chargement des données...')}</p>
      </div>
    );
  }

  return (
    <div className="views-panel">
      {/* Indicateur de mode focus */}
      {focusActive && (
        <div className="views-panel-header">
          <div className="focus-indicator">
            {t('viewsPanel.focusIndicator')}
          </div>
          <button 
            className="focus-back-button" 
            onClick={() => dispatch(deactivateFocus())}
            title={t('viewsPanel.focusBackTooltip')}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {t('viewsPanel.focusBackButton')}
          </button>
        </div>
      )}
      
      {/* Sections du panneau */}
      <div className="views-panel-sections">
        {/* Section Acteurs avec barre de recherche */}
        <div className="views-section-container">
          <div className="views-panel-search-bar-container">
            <input 
              type="text"
              placeholder={t('viewsPanel.searchActorPlaceholder')}
              value={actorSearchTerm}
              onChange={(e) => setActorSearchTerm(e.target.value)}
              className="views-panel-search-input"
            />
          </div>
          <ViewsSection
            title={t('sidebar.actors')}
            type="actor"
            items={actorItems}
            visibilityState={actorsVisibility}
            toggleVisibility={toggleActorVisibilityHandler}
            focusState={focusState}
            initialExpanded={true}
          />
        </div>
        
        <ViewsSection
          title={t('sidebar.groupsLink')}
          type="group"
          items={groupItems}
          visibilityState={groupsVisibility}
          toggleVisibility={toggleGroupVisibilityHandler}
          focusState={focusState}
          initialExpanded={true}
        />
        
        <ViewsSection
          title={t('viewsPanel.colorsSectionTitle')}
          type="color"
          items={colorItems}
          visibilityState={colorsVisibility}
          toggleVisibility={toggleColorVisibilityHandler}
          focusState={focusState}
          initialExpanded={true}
        />
      </div>
    </div>
  );
};

export default ViewsPanel;
