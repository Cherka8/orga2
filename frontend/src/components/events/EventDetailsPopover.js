import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ACTOR_TYPES } from '../../redux/slices/actorsSlice';
import { selectGroupMembers } from '../../redux/slices/groupsSlice';
import '../../styles/event-popover.css';

/**
 * Composant pour afficher les détails d'un événement dans une popover
 * @param {Object} event - L'événement FullCalendar
 * @param {Object} position - Position {x, y} où afficher la popover
 * @param {Function} onClose - Fonction à appeler pour fermer la popover
 * @param {Boolean} isOpen - Si la popover est ouverte ou non
 * @param {Function} onEdit - Fonction à appeler pour éditer l'événement
 * @param {Function} onDelete - Fonction à appeler pour supprimer l'événement
 */
const EventDetailsPopover = ({ event, position, onClose, isOpen, onEdit, onDelete }) => {
  const { t, i18n } = useTranslation();
  const popoverRef = useRef(null);
  const [locationActor, setLocationActor] = useState(null);
  const [otherParticipants, setOtherParticipants] = useState([]);
  const [presenterActor, setPresenterActor] = useState(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Récupérer les données des acteurs et des groupes
  const actorsById = useSelector(state => state.actors.byId || {});
  const groupsById = useSelector(state => state.groups.byId || {});
  
  // Extraire les participants de l'événement
  useEffect(() => {
    if (event) {
      // Récupérer l'acteur lieu directement depuis extendedProps.location
      if (event.extendedProps && event.extendedProps.location) {
        setLocationActor(event.extendedProps.location);
      } else {
        setLocationActor(null);
      }
      
      // Récupérer les autres participants depuis extendedProps.participants
      if (event.extendedProps && event.extendedProps.participants) {
        const participants = event.extendedProps.participants || [];
        
        // Enrichir les participants de type GROUP avec les données complètes du groupe
        const enrichedParticipants = participants.map(participant => {
          if (participant.type === ACTOR_TYPES.GROUP && participant.id) {
            // Récupérer les données complètes du groupe depuis le store Redux
            const fullGroupData = groupsById[participant.id];
            if (fullGroupData) {
              return { ...participant, ...fullGroupData };
            }
          }
          return participant;
        });
        
        // Récupérer l'intervenant (presenter) si présent
        if (event.extendedProps.presenterId) {
          const presenter = enrichedParticipants.find(p => p.id === event.extendedProps.presenterId);
          setPresenterActor(presenter || null);
          
          // Filtrer l'intervenant de la liste des participants
          const filteredParticipants = enrichedParticipants.filter(p => p.id !== event.extendedProps.presenterId);
          setOtherParticipants(filteredParticipants);
        } else {
          setPresenterActor(null);
          setOtherParticipants(enrichedParticipants);
        }
      } else {
        setOtherParticipants([]);
        setPresenterActor(null);
      }
    }
  }, [event, groupsById]);
  
  // Fermer la popover si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Ajuster la position pour éviter que la popover ne sorte de l'écran
  const adjustPosition = () => {
    if (!popoverRef.current) return { x: position.x, y: position.y };
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Dimensions de la popover
    const popoverWidth = popoverRef.current.offsetWidth;
    const popoverHeight = popoverRef.current.offsetHeight;
    
    // Marge de sécurité
    const margin = 15;
    
    // Espace supplémentaire pour les listes déroulantes et boutons
    const extraBottomSpace = 150; // Espace supplémentaire pour les boutons et listes déroulantes
    
    // Position initiale (celle de l'événement)
    let x = position.x;
    let y = position.y;
    
    // Récupérer les dimensions de l'événement si disponibles
    let eventRect = null;
    if (event && event.el) {
      eventRect = event.el.getBoundingClientRect();
    }
    
    // Si on a les dimensions de l'événement, on peut faire un positionnement plus intelligent
    if (eventRect) {
      const eventWidth = eventRect.width;
      const eventHeight = eventRect.height;
      const eventLeft = eventRect.left;
      const eventTop = eventRect.top;
      const eventRight = eventRect.right;
      const eventBottom = eventRect.bottom;
      
      // Espace disponible de chaque côté
      const spaceRight = windowWidth - eventRight - margin;
      const spaceLeft = eventLeft - margin;
      const spaceTop = eventTop - margin;
      const spaceBottom = windowHeight - eventBottom - margin;
      
      // Déterminer si l'événement est près du bas de l'écran
      // Si l'espace en bas est inférieur à 200px ou moins de 30% de la hauteur de l'écran
      const bottomThreshold = Math.min(200, windowHeight * 0.3);
      const isBottomEvent = spaceBottom < bottomThreshold;
      setIsNearBottom(isBottomEvent);
      
      // Par défaut, on essaie de positionner à droite de l'événement
      if (spaceRight >= popoverWidth) {
        x = eventRight + margin;
        
        // Si l'événement est près du bas, on place la popover plus haut
        if (isBottomEvent) {
          // Placer la popover plus haut pour laisser de l'espace pour les boutons
          y = Math.max(margin, eventBottom - popoverHeight - extraBottomSpace);
        } else {
          // Centrer verticalement si possible
          y = eventTop + (eventHeight / 2) - (popoverHeight / 2);
        }
      }
      // Sinon, on essaie à gauche
      else if (spaceLeft >= popoverWidth) {
        x = eventLeft - popoverWidth - margin;
        
        // Si l'événement est près du bas, on place la popover plus haut
        if (isBottomEvent) {
          // Placer la popover plus haut pour laisser de l'espace pour les boutons
          y = Math.max(margin, eventBottom - popoverHeight - extraBottomSpace);
        } else {
          // Centrer verticalement si possible
          y = eventTop + (eventHeight / 2) - (popoverHeight / 2);
        }
      }
      // Si ni droite ni gauche ne fonctionnent, on essaie en dessous si suffisamment d'espace
      else if (spaceBottom >= popoverHeight + extraBottomSpace) {
        x = eventLeft + (eventWidth / 2) - (popoverWidth / 2);
        y = eventBottom + margin;
      }
      // En dernier recours, on essaie au-dessus
      else if (spaceTop >= popoverHeight) {
        x = eventLeft + (eventWidth / 2) - (popoverWidth / 2);
        y = eventTop - popoverHeight - margin;
      }
      // Si aucune option ne fonctionne, on place la popover là où il y a le plus d'espace
      else {
        const spaces = [
          { dir: 'right', space: spaceRight, x: eventRight + margin, y: isBottomEvent ? Math.max(margin, eventBottom - popoverHeight - extraBottomSpace) : eventTop + (eventHeight / 2) - (popoverHeight / 2) },
          { dir: 'left', space: spaceLeft, x: eventLeft - popoverWidth - margin, y: isBottomEvent ? Math.max(margin, eventBottom - popoverHeight - extraBottomSpace) : eventTop + (eventHeight / 2) - (popoverHeight / 2) },
          { dir: 'bottom', space: spaceBottom, x: eventLeft + (eventWidth / 2) - (popoverWidth / 2), y: eventBottom + margin },
          { dir: 'top', space: spaceTop, x: eventLeft + (eventWidth / 2) - (popoverWidth / 2), y: eventTop - popoverHeight - margin }
        ];
        
        // Trier par espace disponible (du plus grand au plus petit)
        spaces.sort((a, b) => b.space - a.space);
        
        // Utiliser la direction avec le plus d'espace
        x = spaces[0].x;
        y = spaces[0].y;
      }
    }
    
    // S'assurer que la popover reste dans les limites de l'écran
    if (x < margin) x = margin;
    if (x + popoverWidth > windowWidth - margin) x = windowWidth - popoverWidth - margin;
    if (y < margin) y = margin;
    if (y + popoverHeight > windowHeight - margin) y = windowHeight - popoverHeight - margin;
    
    return { x, y };
  };
  
  // Calculer la position ajustée lorsque la popover est ouverte ou que la position change
  useEffect(() => {
    if (isOpen && popoverRef.current) {
      // Réinitialiser l'état de positionnement
      setIsPositioned(false);
      
      // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
      requestAnimationFrame(() => {
        // Attendre un peu pour s'assurer que le DOM est complètement rendu
        setTimeout(() => {
          const newPosition = adjustPosition();
          setAdjustedPosition(newPosition);
          
          // Marquer comme positionné après un court délai pour permettre l'animation
          setTimeout(() => {
            setIsPositioned(true);
          }, 50);
        }, 10);
      });
    } else {
      setIsPositioned(false);
    }
  }, [isOpen, position, event]);
  
  // Fonction pour basculer l'expansion d'un groupe
  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => {
      const newState = {
        ...prev,
        [groupId]: !prev[groupId]
      };
      
      // Programmer un recalcul de la position après le rendu
      setTimeout(() => {
        if (popoverRef.current) {
          // Recalculer la position après que le DOM ait été mis à jour
          const newPosition = adjustPosition();
          setAdjustedPosition(newPosition);
        }
      }, 50); // Petit délai pour s'assurer que le DOM est mis à jour
      
      return newState;
    });
  };
  
  // Effet pour surveiller les changements de taille de la popover
  useEffect(() => {
    if (!popoverRef.current || !isOpen) return;
    
    // Créer un observateur de mutations pour détecter les changements de taille
    const resizeObserver = new ResizeObserver(() => {
      // Recalculer la position lorsque la taille change
      const newPosition = adjustPosition();
      setAdjustedPosition(newPosition);
    });
    
    // Observer la popover
    resizeObserver.observe(popoverRef.current);
    
    return () => {
      // Nettoyer l'observateur
      resizeObserver.disconnect();
    };
  }, [isOpen, popoverRef.current]);
  
  // Ajouter une classe pour les animations fluides
  useEffect(() => {
    if (!popoverRef.current || !isOpen) return;
    
    // Ajouter une classe pour activer les animations après le premier rendu
    setTimeout(() => {
      if (popoverRef.current) {
        popoverRef.current.classList.add('event-details-popover-animated');
      }
    }, 100);
    
    return () => {
      if (popoverRef.current) {
        popoverRef.current.classList.remove('event-details-popover-animated');
      }
    };
  }, [isOpen]);
  
  // Afficher la description avec possibilité de l'étendre
  const renderDescription = () => {
    if (!event.extendedProps?.description) return null;
    
    const description = event.extendedProps.description;
    const isLongDescription = description.length > 150;
    
    return (
      <div className="event-details-popover-section">
        <div className="event-details-popover-section-icon" style={{ color: eventColor }}>📝</div>
        <div className="event-details-popover-section-content">
          <div className="event-details-popover-section-title">{t('eventDetailsPopover.descriptionTitle', 'Description')}</div>
          <div className={`event-details-popover-description ${isLongDescription ? 'event-details-popover-description-collapsible' : ''} ${isDescriptionExpanded ? 'event-details-popover-description-expanded' : ''}`}>
            {description}
            {isLongDescription && !isDescriptionExpanded && (
              <div className="event-details-popover-description-fade"></div>
            )}
          </div>
          {isLongDescription && (
            <div 
              className="event-details-popover-description-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setIsDescriptionExpanded(!isDescriptionExpanded);
                
                // Si on referme la description, recalculer la position de la popover
                if (isDescriptionExpanded) {
                  setTimeout(() => {
                    if (popoverRef.current) {
                      adjustPosition();
                    }
                  }, 50);
                }
              }}
            >
              {isDescriptionExpanded ? t('common.showLess', 'Réduire') : t('common.showMore', 'Voir plus')}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Ne rien afficher si la popover n'est pas ouverte
  if (!isOpen) return null;
  
  // Obtenir la locale actuelle (ex: 'fr', 'en') et la normaliser si besoin
  const currentLocale = i18n.language.split('-')[0]; // Prend 'fr' de 'fr-FR'

  // Formater la date et l'heure en utilisant la locale dynamique
  const formatDate = (date) => {
    if (!date) return '';
    // Utiliser une option de formatage pour obtenir le jour de la semaine, le jour, le mois et l'année
    try {
      return date.toLocaleDateString(currentLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date with locale:", currentLocale, e);
      // Fallback to default locale if error occurs
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    try {
      return date.toLocaleTimeString(currentLocale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Use 24-hour format
      });
    } catch (e) {
      console.error("Error formatting time with locale:", currentLocale, e);
      // Fallback to default locale
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  };
  
  // Calculer la durée de l'événement et la traduire
  const getDuration = () => {
    if (!event.start || !event.end) return '';

    const durationMs = event.end - event.start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
      return t('eventDetailsPopover.durationMinutes', { defaultValue: '{{minutes}}min', minutes });
    } else if (minutes === 0) {
      return t('eventDetailsPopover.durationHours', { defaultValue: '{{hours}}h', hours });
    } else {
      return t('eventDetailsPopover.durationHoursMinutes', { defaultValue: '{{hours}}h{{minutes}}min', hours, minutes });
    }
  };

  // Fonction pour obtenir les initiales d'un participant
  const getInitials = (participant) => {
    if (!participant) return '';
    
    if (participant.type === ACTOR_TYPES.HUMAN) {
      return `${participant.firstName?.[0] || ''}${participant.lastName?.[0] || ''}`.toUpperCase();
    } else if (participant.type === ACTOR_TYPES.GROUP || participant.type === ACTOR_TYPES.LOCATION) {
      return participant.name?.substring(0, 2).toUpperCase() || '';
    }
    return '';
  };
  
  // Afficher l'image de l'acteur lieu
  const renderLocationImage = () => {
    if (!locationActor) return null;
    
    // Vérifier si l'acteur a une photo ou un avatar
    const hasImage = locationActor.photo || locationActor.avatar;
    
    return (
      <div className="event-location-image" style={{
        backgroundImage: hasImage ? `url(${locationActor.photo || locationActor.avatar})` : 'none',
        backgroundColor: !hasImage ? '#e5e7eb' : 'transparent'
      }}>
        {!hasImage && (
          <div className="event-location-initials">
            {locationActor.name ? locationActor.name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </div>
    );
  };
  
  // Afficher l'image de l'intervenant
  const renderPresenterImage = () => {
    if (!presenterActor) return null;
    
    // Vérifier si l'intervenant a une photo ou un avatar
    const hasImage = presenterActor.photo || presenterActor.avatar;
    
    // Préparer le nom à afficher
    const presenterName = presenterActor.type === ACTOR_TYPES.HUMAN 
      ? `${presenterActor.firstName || ''} ${presenterActor.lastName || ''}`.trim() 
      : presenterActor.name || t('common.unnamed', 'Sans nom');
    
    return (
      <div className="event-presenter-image-container">
        <div className="event-presenter-image" style={{
          backgroundImage: hasImage ? `url(${presenterActor.photo || presenterActor.avatar})` : 'none',
          backgroundColor: !hasImage ? '#e5e7eb' : 'transparent'
        }}>
          {!hasImage && (
            <div className="event-presenter-initials">
              {presenterActor.type === ACTOR_TYPES.HUMAN 
                ? `${presenterActor.firstName?.charAt(0) || ''}${presenterActor.lastName?.charAt(0) || ''}` 
                : presenterActor.name?.charAt(0) || '?'}
            </div>
          )}
        </div>
        <div className="event-presenter-name">{presenterName}</div>
        <div className="event-presenter-label">{t('eventDetailsPopover.organizerLabel', 'Organisateur')}</div>
      </div>
    );
  };
  
  // Afficher les participants
  const renderParticipants = () => {
    if (!otherParticipants || otherParticipants.length === 0) {
      return <div className="event-details-popover-section-text">{t('eventDetailsPopover.noParticipants', 'Aucun participant')}</div>;
    }
    
    return (
      <div className="event-details-popover-participants">
        {otherParticipants.map(participant => {
          // Vérifier si c'est un groupe
          const isGroup = participant.type === ACTOR_TYPES.GROUP;
          const isExpanded = expandedGroups[participant.id] || false;
          
          // Déterminer la source de l'image (photo, avatar ou image du groupe)
          const imageSource = participant.photo || participant.avatar || participant.image || null;
          
          return (
            <div key={participant.id} className="event-details-popover-participant-container">
              {/* Liste des membres du groupe (conditionnellement affichée au-dessus si près du bas) */}
              {isGroup && isExpanded && isNearBottom && (
                <div className="event-details-popover-group-members event-details-popover-group-members-top event-details-popover-group-members-animated">
                  {renderGroupMembers(participant)}
                </div>
              )}
              
              {/* Participant principal (personne ou groupe) */}
              <div 
                className={`event-details-popover-participant ${isGroup ? 'is-group' : ''}`}
                onClick={isGroup ? () => toggleGroupExpansion(participant.id) : undefined}
              >
                <div 
                  className="event-details-popover-participant-avatar"
                  style={{
                    backgroundImage: imageSource ? `url(${imageSource})` : 'none',
                    backgroundColor: !imageSource ? '#e5e7eb' : 'transparent'
                  }}
                >
                  {!imageSource && (
                    participant.type === ACTOR_TYPES.HUMAN 
                      ? `${participant.firstName?.charAt(0) || ''}${participant.lastName?.charAt(0) || ''}` 
                      : participant.name?.charAt(0) || '?'
                  )}
                </div>
                <div className="event-details-popover-participant-name">
                  {participant.type === ACTOR_TYPES.HUMAN 
                    ? `${participant.firstName || ''} ${participant.lastName || ''}`.trim() 
                    : participant.name || t('common.unnamed', 'Sans nom')}
                  
                  {/* Flèche de dropdown pour les groupes (à côté du nom) */}
                  {isGroup && (
                    <span 
                      className={`event-details-popover-group-toggle ${isExpanded ? 'expanded' : ''} ${isNearBottom ? 'upside-down' : ''}`}
                      aria-label={isExpanded ? "Réduire le groupe" : "Développer le groupe"}
                    >
                      ▼
                    </span>
                  )}
                </div>
              </div>
              
              {/* Liste des membres du groupe (conditionnellement affichée en-dessous si pas près du bas) */}
              {isGroup && isExpanded && !isNearBottom && (
                <div className="event-details-popover-group-members event-details-popover-group-members-animated">
                  {renderGroupMembers(participant)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Fonction pour afficher les membres d'un groupe
  const renderGroupMembers = (group) => {
    // Vérifier si le groupe a des membres directement dans ses props
    if (group.members && Array.isArray(group.members)) {
      // Si les membres sont des objets complets (avec propriétés comme firstName, lastName, etc.)
      if (group.members.length > 0 && typeof group.members[0] === 'object') {
        return group.members.map(member => {
          // Déterminer la source de l'image (photo, avatar ou image)
          const imageSource = member.photo || member.avatar || member.image || null;
          
          return (
            <div key={member.id} className="event-details-popover-group-member">
              <div 
                className="event-details-popover-group-member-avatar"
                style={{
                  backgroundImage: imageSource ? `url(${imageSource})` : 'none',
                  backgroundColor: !imageSource ? '#e5e7eb' : 'transparent'
                }}
              >
                {!imageSource && (
                  member.type === ACTOR_TYPES.HUMAN 
                    ? `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}` 
                    : member.name?.charAt(0) || '?'
                )}
              </div>
              <div className="event-details-popover-group-member-name">
                {member.type === ACTOR_TYPES.HUMAN 
                  ? `${member.firstName || ''} ${member.lastName || ''}`.trim() 
                  : member.name || t('common.unnamed', 'Sans nom')}
              </div>
            </div>
          );
        });
      } 
      // Si les membres sont des IDs, récupérer les acteurs correspondants dans le store
      else {
        const members = group.members
          .map(memberId => actorsById[memberId])
          .filter(Boolean);
        
        if (members.length === 0) {
          return <div className="event-details-popover-group-member-empty">{t('eventDetailsPopover.noMembers', 'Aucun membre')}</div>;
        }
        
        return members.map(member => {
          // Déterminer la source de l'image (photo, avatar ou image)
          const imageSource = member.photo || member.avatar || member.image || null;
          
          return (
            <div key={member.id} className="event-details-popover-group-member">
              <div 
                className="event-details-popover-group-member-avatar"
                style={{
                  backgroundImage: imageSource ? `url(${imageSource})` : 'none',
                  backgroundColor: !imageSource ? '#e5e7eb' : 'transparent'
                }}
              >
                {!imageSource && (
                  member.type === ACTOR_TYPES.HUMAN 
                    ? `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}` 
                    : member.name?.charAt(0) || '?'
                )}
              </div>
              <div className="event-details-popover-group-member-name">
                {member.type === ACTOR_TYPES.HUMAN 
                  ? `${member.firstName || ''} ${member.lastName || ''}`.trim() 
                  : member.name || t('common.unnamed', 'Sans nom')}
              </div>
            </div>
          );
        });
      }
    }
    
    // Essayer de récupérer les membres depuis le store Redux si le groupe y existe
    const groupData = groupsById[group.id];
    if (groupData && groupData.members && groupData.members.length > 0) {
      const members = groupData.members
        .map(memberId => actorsById[memberId])
        .filter(Boolean);
      
      if (members.length === 0) {
        return <div className="event-details-popover-group-member-empty">{t('eventDetailsPopover.noMembers', 'Aucun membre')}</div>;
      }
      
      return members.map(member => {
        // Déterminer la source de l'image (photo, avatar ou image)
        const imageSource = member.photo || member.avatar || member.image || null;
        
        return (
          <div key={member.id} className="event-details-popover-group-member">
            <div 
              className="event-details-popover-group-member-avatar"
              style={{
                backgroundImage: imageSource ? `url(${imageSource})` : 'none',
                backgroundColor: !imageSource ? '#e5e7eb' : 'transparent'
              }}
            >
              {!imageSource && (
                member.type === ACTOR_TYPES.HUMAN 
                  ? `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}` 
                  : member.name?.charAt(0) || '?'
              )}
            </div>
            <div className="event-details-popover-group-member-name">
              {member.type === ACTOR_TYPES.HUMAN 
                ? `${member.firstName || ''} ${member.lastName || ''}`.trim() 
                : member.name || t('common.unnamed', 'Sans nom')}
            </div>
          </div>
        );
      });
    }
    
    // Si aucun membre n'est trouvé
    return <div className="event-details-popover-group-member-empty">{t('eventDetailsPopover.noMembers', 'Aucun membre')}</div>;
  };
  
  // Fonction pour déterminer la classe du titre en fonction de sa longueur
  const getTitleClass = (title) => {
    if (!title) return '';
    
    if (title.length > 50) {
      return 'very-long-title';
    } else if (title.length > 30) {
      return 'long-title';
    }
    return '';
  };

  // Couleur de l'événement (utiliser la couleur de l'événement ou une couleur par défaut)
  const eventColor = event?.backgroundColor || event?.borderColor || '#3788d8';
  
  // Calculer la position ajustée
  const adjustedPos = adjustedPosition;
  
  return (
    <>
      {/* Overlay pour capturer les clics en dehors de la popover */}
      <div 
        className="event-details-popover-overlay"
        onClick={onClose}
      />
      
      <div 
        className={`event-details-popover ${isPositioned ? 'event-details-popover-visible' : ''}`}
        ref={popoverRef}
        style={{
          left: `${adjustedPos.x}px`,
          top: `${adjustedPos.y}px`,
        }}
      >
        {/* Header avec photo du lieu */}
        <div 
          className="event-details-popover-header"
          style={{ 
            backgroundColor: (locationActor?.photo || locationActor?.avatar) ? 'transparent' : eventColor,
            backgroundImage: (locationActor?.photo || locationActor?.avatar) ? `url(${locationActor.photo || locationActor.avatar})` : 'none'
          }}
        >
          {/* Badge de couleur */}
          <div 
            className="event-details-popover-badge"
            style={{ backgroundColor: eventColor }}
          />
          
          {/* Bouton de fermeture */}
          <button 
            className="event-details-popover-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
          
          {/* Titre de l'événement */}
          <div className="event-details-popover-title-container">
            <h3 className={`event-details-popover-title ${getTitleClass(event.title)}`}>{event.title}</h3>
            {locationActor && (
              <div className="event-details-popover-location">
                <span className="event-details-popover-location-icon">📍</span>
                <span>{locationActor.name}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Photo de l'intervenant */}
        {presenterActor && renderPresenterImage()}
        
        {/* Contenu */}
        <div className="event-details-popover-content" style={{ borderColor: eventColor }}>
          {/* Date et heure */}
          <div className="event-details-popover-section">
            <div className="event-details-popover-section-icon" style={{ color: eventColor }}>🕒</div>
            <div className="event-details-popover-section-content">
              <div className="event-details-popover-date">{formatDate(event.start)}</div>
              <div className="event-details-popover-time">
                {formatTime(event.start)} - {formatTime(event.end)} ({getDuration()})
              </div>
            </div>
          </div>
          
          {/* Participants */}
          {otherParticipants.length > 0 && (
            <div className="event-details-popover-section">
              <div className="event-details-popover-section-icon" style={{ color: eventColor }}>👥</div>
              <div className="event-details-popover-section-content">
                <div className="event-details-popover-section-title">{t('eventDetailsPopover.participantsTitle', 'Participants')}</div>
                {renderParticipants()}
              </div>
            </div>
          )}
          
          {/* Description */}
          {event.extendedProps?.description && renderDescription()}
          
          {/* Actions */}
          <div className="event-details-popover-actions">
            <button 
              className="event-details-popover-button event-details-popover-button-edit"
              style={{ backgroundColor: `${eventColor}15`, color: eventColor }}
              onClick={() => {
                onClose();
                onEdit(event);
              }}
            >
              Modifier
            </button>
            <button 
              className="event-details-popover-button event-details-popover-button-delete"
              onClick={() => {
                onClose();
                if (window.confirm(`Voulez-vous supprimer l'événement "${event.title}" ?`)) {
                  onDelete(event);
                }
              }}
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetailsPopover;
