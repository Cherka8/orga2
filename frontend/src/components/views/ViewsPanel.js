import React, { useMemo, useCallback, useState } from 'react';
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

/**
 * Composant principal du panneau Views
 * Affiche les trois sections (Acteurs, Groupes, Couleurs) et gère le mode focus
 */
const ViewsPanel = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // État pour le terme de recherche des acteurs
  const [actorSearchTerm, setActorSearchTerm] = useState('');

  // Récupérer l'état de visibilité depuis le store
  const actorsVisibility = useSelector(selectAllVisibleActors);
  const groupsVisibility = useSelector(selectAllVisibleGroups);
  const colorsVisibility = useSelector(selectAllVisibleColors);
  
  // Récupérer les données des acteurs et groupes depuis le store
  const actorsData = useSelector(selectActorsByIdMap);
  const groupsData = useSelector(selectGroupsByIdMap);
  
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
    return participant.photo || participant.image || participant.profilePicture || participant.avatar || null;
  }, []);

  // Préparer les éléments pour la section Acteurs en utilisant les IDs des filtres de visibilité
  // et les informations récupérées depuis le store acteurs (actorsData)
  const actorItems = useMemo(() => {
    // Créer la liste complète des acteurs
    const allActorItems = Object.keys(actorsVisibility).map(actorId => {
      const actor = actorsData[actorId];
      
      if (!actor) {
        return {
          id: actorId,
          name: `${t('viewsPanel.fallbackActorName')} ${actorId.toString().slice(-4)}`,
          image: null
        };
      }
      
      return {
        id: actorId,
        name: formatActorName(actor),
        image: getActorAvatar(actor)
      };
    });

    // Filtrer les acteurs si un terme de recherche est présent
    if (actorSearchTerm.trim() === '') {
      return allActorItems;
    }
    
    // Filtrer par nom d'acteur (insensible à la casse)
    return allActorItems.filter(actor => 
      actor.name.toLowerCase().includes(actorSearchTerm.toLowerCase())
    );
  }, [actorsVisibility, actorsData, formatActorName, getActorAvatar, t, actorSearchTerm]);

  // Préparer les éléments pour la section Groupes en utilisant les IDs des filtres de visibilité
  // et les informations récupérées depuis le store groupes (groupsData)
  const groupItems = useMemo(() => {
    return Object.keys(groupsVisibility).map(groupId => {
      const group = groupsData[groupId];
      
      if (!group) {
        return {
          id: groupId,
          name: `${t('viewsPanel.fallbackGroupName')} ${groupId.toString().slice(-4)}`,
          image: null
        };
      }
      
      return {
        id: groupId,
        name: group.name,
        image: group.image
      };
    });
  }, [groupsVisibility, groupsData, t]);

  // Extraire les couleurs des filtres de visibilité
  const colorItems = useMemo(() => {
    return Object.keys(colorsVisibility).map(color => ({
      id: color,
      name: getColorName(color),
      color: color
    }));
  }, [colorsVisibility]);

  // Fonctions pour basculer la visibilité
  const toggleActorVisibilityHandler = (actorId) => {
    dispatch(toggleActorVisibility(actorId));
  };

  const toggleGroupVisibilityHandler = (groupId) => {
    dispatch(toggleGroupVisibility(groupId));
  };

  const toggleColorVisibilityHandler = (color) => {
    dispatch(toggleColorVisibility(color));
  };

  // Fonction utilitaire pour obtenir un nom lisible à partir d'un code couleur
  function getColorName(hexColor) {
    // Map hex codes to translation keys
    const colorKeys = {
      '#FF0000': 'red',
      '#00FF00': 'green',
      '#0000FF': 'blue',
      '#FFFF00': 'yellow',
      '#FF00FF': 'magenta',
      '#00FFFF': 'cyan',
      '#FFA500': 'orange',
      '#800080': 'purple',
      '#008000': 'darkGreen',
      '#800000': 'maroon',
      '#000080': 'navy',
      '#808080': 'gray',
      '#C0C0C0': 'silver',
      '#FFD700': 'gold'
    };
    
    const key = colorKeys[hexColor?.toUpperCase()];
    
    // Try to get the translation, fallback to hex code
    return key ? t(`colors.${key}`) : hexColor;
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
