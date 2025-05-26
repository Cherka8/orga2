import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { activateFocus } from '../../redux/slices/viewsSlice';
import { getColorName } from '../../utils/colorUtils';

/**
 * Composant représentant un élément filtrable dans le panneau Views
 * Affiche un nom, une icône de visibilité (œil) et gère les interactions
 */
const ViewItem = ({ 
  id,               // ID unique de l'élément
  name,             // Nom à afficher
  type,             // Type d'élément ('actor', 'group', 'color')
  isVisible,        // Si l'élément est visible ou non
  color,            // Couleur à afficher (pour les éléments de type 'color')
  image,            // URL de l'image (pour les acteurs et groupes)
  toggleVisibility, // Fonction pour basculer la visibilité
  isFocusActive,    // Si le mode focus est actif
  isFocused         // Si cet élément est actuellement en focus
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Pour les couleurs, on veut afficher le nom de la couleur au lieu du code hex
  const displayName = type === 'color' ? getColorName(name, t) : name;



  // Gérer le clic sur l'élément (pour activer le focus)
  const handleItemClick = (e) => {
    // Éviter de déclencher si on clique sur l'icône de visibilité
    if (e.target.closest('.view-item-visibility')) return;
    
    // S'assurer que l'ID et le type sont définis avant d'activer le focus
    if (id && type) {
      dispatch(activateFocus({ id, type }));
    }
  };

  // Gérer le clic sur l'icône de visibilité
  const handleVisibilityToggle = (e) => {
    e.stopPropagation();
    console.log('ViewItem - handleVisibilityToggle called for:', { id, type, isVisible });
    if (typeof toggleVisibility === 'function' && id) {
      console.log('ViewItem - Calling toggleVisibility with id:', id);
      toggleVisibility(id);
    }
  };



  return (
    <div 
      className={`view-item ${!isVisible ? 'view-item-hidden' : ''} ${isFocused ? 'view-item-focused' : ''}`}
      onClick={handleItemClick}
    >
      {/* Indicateur de couleur ou image */}
      <div className="view-item-indicator">
        {type === 'color' && color ? (
          <div 
            className="view-item-color" 
            style={{ backgroundColor: color }}
          />
        ) : image ? (
          <div 
            className="view-item-image" 
            style={{ backgroundImage: `url(${image})` }}
          />
        ) : (
          <div className="view-item-placeholder" />
        )}
      </div>
      
      {/* Nom de l'élément */}
      <div className="view-item-name">
        {displayName || t('viewItem.fallbackName')} 
      </div>
      

      
      {/* Icône Visibilité (Oeil) - Maintenant à droite */}
      <div 
        className="view-item-visibility"
        onClick={handleVisibilityToggle}
        title={t(isVisible ? 'viewItem.hideTooltip' : 'viewItem.showTooltip')} 
      >
        {isVisible ? (
          <svg 
            className="icon-visible w-5 h-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg 
            className="icon-hidden w-5 h-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default ViewItem;
