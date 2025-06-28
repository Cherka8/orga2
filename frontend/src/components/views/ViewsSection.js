import React, { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ViewItem from './ViewItem';

/**
 * Composant optimisé pour rendre une liste d'items avec mémorisation
 */
const ItemsList = ({ items, visibilityState, focusState, toggleVisibility, type }) => {
  // Mémoriser la liste des items pour éviter les re-rendus inutiles
  const renderedItems = useMemo(() => {

    return items.map(item => {
      const isVisible = visibilityState[item.id] !== false;

      return (
        <ViewItem
          key={item.id}
          id={item.id}
          name={item.name}
          type={type}
          isVisible={isVisible}
          color={item.color}
          image={item.image}
          toggleVisibility={toggleVisibility}
          isFocusActive={focusState.active}
          isFocused={
            focusState.active && 
            focusState.target.id === item.id && 
            focusState.target.type === type
          }
        />
      );
    });
  }, [items, visibilityState, focusState, toggleVisibility, type]);
  
  return <>{renderedItems}</>;
};

/**
 * Composant représentant une section du panneau Views (Acteurs, Groupes ou Couleurs)
 * Affiche un titre, une liste d'éléments et gère l'état d'expansion
 */
const ViewsSection = ({
  title,            // Titre de la section
  type,             // Type de la section ('actor', 'group', 'color')
  items,            // Liste des éléments à afficher
  visibilityState,  // État de visibilité des éléments
  toggleVisibility, // Fonction pour basculer la visibilité d'un élément
  focusState,       // État du mode focus
  initialExpanded = true // Si la section est initialement développée
}) => {

  // État local pour l'expansion de la section
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const { t } = useTranslation();
  
  // Référence pour le contenu
  const contentRef = useRef(null);
  
  // État pour suivre si le contenu doit être rendu
  const [shouldRenderContent, setShouldRenderContent] = useState(initialExpanded);
  
  // Gérer le rendu conditionnel du contenu
  useEffect(() => {
    if (isExpanded) {
      // Si on ouvre la section, rendre le contenu immédiatement
      setShouldRenderContent(true);
    } else {
      // Si on ferme la section, attendre la fin de l'animation avant de ne plus rendre le contenu
      const timer = setTimeout(() => {
        setShouldRenderContent(false);
      }, 300); // Durée de l'animation
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Gérer le clic sur le titre pour développer/réduire la section
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Vérifier si des éléments sont disponibles
  const hasItems = items && items.length > 0;

  return (
    <div className={`views-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* En-tête de la section */}
      <div className="views-section-header" onClick={toggleExpand}>
        <div className="views-section-title">{title}</div>
        <div className="views-section-toggle">
          {isExpanded ? (
            <svg 
              className="w-4 h-4" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg 
              className="w-4 h-4" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Conteneur pour l'animation optimisée */}
      <div className="views-section-content-wrapper">
        {/* Contenu de la section (rendu conditionnellement pour économiser des ressources) */}
        {shouldRenderContent && (
          <div className="views-section-content" ref={contentRef}>
            {hasItems ? (
              <div className="views-section-items">
                {/* Rendu optimisé des items */}
                <ItemsList 
                  items={items}
                  visibilityState={visibilityState}
                  focusState={focusState}
                  toggleVisibility={toggleVisibility}
                  type={type}
                />
              </div>
            ) : (
              <div className="views-section-empty">
                {t('viewsSection.noItemsAvailable')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ViewsSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  type: PropTypes.oneOf(['actor', 'group', 'color']).isRequired,
  visibilityState: PropTypes.object.isRequired,
  toggleVisibility: PropTypes.func.isRequired,
  focusState: PropTypes.object.isRequired,
  initialExpanded: PropTypes.bool
};

ViewsSection.defaultProps = {
  initialExpanded: true
};

export default ViewsSection;
