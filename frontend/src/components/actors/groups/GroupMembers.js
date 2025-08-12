import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  addActorToGroup, 
  removeActorFromGroup 
} from '../../../redux/slices/groupsSlice';
import { ACTOR_TYPES } from '../../../redux/slices/actorsSlice';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/solid';

// Composant d'élément sortable
const SortableItem = ({ actor, type, onRemove }) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: actor.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  // Fonction pour obtenir le titre de l'acteur
  const getActorTitle = (actor) => {
    if (actor.type === ACTOR_TYPES.HUMAN) {
      return `${actor.firstName || ''} ${actor.lastName || ''}`;
    } else {
      return actor.name || '';
    }
  };

  // Fonction pour obtenir l'avatar de l'acteur
  const getActorAvatar = (actor) => {
    if (actor.photo) {
      return (
        <img 
          src={actor.photo} 
          alt={getActorTitle(actor)} 
          className="w-5 h-5 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/40?text=A';
          }}
        />
      );
    }
    return getActorIcon(actor);
  };

  // Fonction pour obtenir l'icône selon le type d'acteur
  const getActorIcon = (actor) => {
    switch (actor.type) {
      case ACTOR_TYPES.HUMAN:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        );
      case ACTOR_TYPES.LOCATION:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  // Fonction pour obtenir la couleur du badge selon le type d'acteur
  const getBadgeColor = (actor) => {
    switch (actor.type) {
      case ACTOR_TYPES.HUMAN:
        return 'bg-blue-100 text-blue-800';
      case ACTOR_TYPES.LOCATION:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const actorTitle = getActorTitle(actor);
  const actorTypeKey = `actorTypes.${actor?.type?.toLowerCase() || 'unknown'}`;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="p-2 rounded-md border bg-white border-gray-200 cursor-grab"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center">
        <div className={`p-1 rounded-full ${getBadgeColor(actor)} mr-2`}>
          {getActorAvatar(actor)}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">
            {actorTitle}
          </div>
          <div className="text-xs text-gray-500">
            {t(actorTypeKey, actor?.type)}
          </div>
        </div>
        <div className="ml-auto pl-2 flex items-center"> 
          {type === 'member' && (
            <button
              type="button"
              className="p-1 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 rounded-full"
              onClick={() => onRemove(actor.id)}
              aria-label={t('groupMembers.ariaLabelRemoveMember', { actorName: actorTitle })}
            >
              <MinusCircleIcon className="h-5 w-5" aria-hidden="true" /> 
            </button>
          )}
          {type === 'available' && (
            <button
              type="button"
              className="p-1 text-green-500 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 rounded-full"
              onClick={() => onRemove(actor.id)} 
              aria-label={t('groupMembers.ariaLabelAddMember', { actorName: actorTitle })}
            >
              <PlusCircleIcon className="h-5 w-5" aria-hidden="true" /> 
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

// Composant de zone de dépôt
const DroppableContainer = ({ id, children, className }) => {
  const { setNodeRef, isOver } = useDroppable({
    id
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`${className} ${isOver ? 'bg-indigo-50 border-indigo-300' : ''}`}
    >
      {children}
    </div>
  );
};

const GroupMembers = ({ group, allActors }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [availableActors, setAvailableActors] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [filter, setFilter] = useState('');
  const [activeId, setActiveId] = useState(null);

  // Capteurs pour le drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum de 5px de déplacement pour activer le drag
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Récupérer les acteurs du groupe et les acteurs disponibles
  useEffect(() => {
    if (group && allActors) {
      const memberActors = allActors.filter(actor => 
        group.members && group.members.includes(actor.id)
      );
      
      const nonMemberActors = allActors.filter(actor => 
        (!group.members || !group.members.includes(actor.id)) && actor.type !== ACTOR_TYPES.LOCATION
      );
      
      // Utiliser des fonctions de mise à jour pour éviter les problèmes de dépendances
      setGroupMembers(current => {
        // Si les longueurs sont différentes ou si les IDs ont changé, mettre à jour
        if (current.length !== memberActors.length || 
            !current.every(actor => memberActors.some(a => a.id === actor.id))) {
          return memberActors;
        }
        return current;
      });
      
      setAvailableActors(current => {
        // Si les longueurs sont différentes ou si les IDs ont changé, mettre à jour
        if (current.length !== nonMemberActors.length || 
            !current.every(actor => nonMemberActors.some(a => a.id === actor.id))) {
          return nonMemberActors;
        }
        return current;
      });
    }
  }, [group, allActors]);

  // Filtrer les acteurs disponibles
  const filteredAvailableActors = availableActors.filter(actor => {
    if (!filter) return true;
    
    const filterLower = filter.toLowerCase();
    
    if (actor.type === ACTOR_TYPES.HUMAN) {
      return `${actor.firstName || ''} ${actor.lastName || ''}`.toLowerCase().includes(filterLower);
    } else {
      return (actor.name || '').toLowerCase().includes(filterLower);
    }
  });

  // Gérer le début du drag
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Gérer la fin du drag
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const actorId = active.id;
    const isInGroup = group.members && group.members.includes(actorId);
    
    // Si on déplace vers la zone des membres et que l'acteur n'est pas déjà dans le groupe
    if (over.id === 'members-container' && !isInGroup) {
      // On trouve l'acteur dans la liste des disponibles
      const actorIndex = availableActors.findIndex(a => a.id === actorId);
      if (actorIndex !== -1) {
        // On le retire manuellement de la liste des disponibles
        const newAvailableActors = [...availableActors];
        const [movedActor] = newAvailableActors.splice(actorIndex, 1);
        setAvailableActors(newAvailableActors);
        
        // On l'ajoute manuellement à la liste des membres
        setGroupMembers([...groupMembers, movedActor]);
        
        // Puis on met à jour Redux (qui déclenchera un useEffect, mais l'UI est déjà mise à jour)
        dispatch(addActorToGroup({ groupId: group.id, actorId }));
      }
    }
    
    // Si on déplace vers la zone des disponibles et que l'acteur est dans le groupe
    if (over.id === 'available-container' && isInGroup) {
      // On trouve l'acteur dans la liste des membres
      const actorIndex = groupMembers.findIndex(a => a.id === actorId);
      if (actorIndex !== -1) {
        // On le retire manuellement de la liste des membres
        const newGroupMembers = [...groupMembers];
        const [movedActor] = newGroupMembers.splice(actorIndex, 1);
        setGroupMembers(newGroupMembers);
        
        // On l'ajoute manuellement à la liste des disponibles
        setAvailableActors([...availableActors, movedActor]);
        
        // Puis on met à jour Redux (qui déclenchera un useEffect, mais l'UI est déjà mise à jour)
        dispatch(removeActorFromGroup({ groupId: group.id, actorId }));
      }
    }
    
    setActiveId(null);
  };

  // Ajouter un acteur au groupe
  const handleAddToGroup = (actorId) => {
    dispatch(addActorToGroup({ groupId: group.id, actorId }));
  };

  // Retirer un acteur du groupe
  const handleRemoveFromGroup = (actorId) => {
    dispatch(removeActorFromGroup({ groupId: group.id, actorId }));
  };

  // Fonction pour obtenir le titre de l'acteur (pour l'overlay)
  const getActorTitle = (actor) => {
    if (actor.type === ACTOR_TYPES.HUMAN) {
      return `${actor.firstName || ''} ${actor.lastName || ''}`;
    } else {
      return actor.name || '';
    }
  };

  // Fonction pour obtenir l'avatar de l'acteur (pour l'overlay)
  const getActorAvatar = (actor) => {
    if (actor.photo) {
      return (
        <img 
          src={actor.photo} 
          alt={getActorTitle(actor)} 
          className="w-5 h-5 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/40?text=A';
          }}
        />
      );
    }
    return getActorIcon(actor);
  };

  // Fonction pour obtenir l'icône selon le type d'acteur (pour l'overlay)
  const getActorIcon = (actor) => {
    switch (actor.type) {
      case ACTOR_TYPES.HUMAN:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        );
      case ACTOR_TYPES.LOCATION:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  // Fonction pour obtenir la couleur du badge selon le type d'acteur (pour l'overlay)
  const getBadgeColor = (actor) => {
    switch (actor.type) {
      case ACTOR_TYPES.HUMAN:
        return 'bg-blue-100 text-blue-800';
      case ACTOR_TYPES.LOCATION:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pour s'assurer que les clés de traduction existent pour les types
  const getTranslatedActorType = (actor) => {
    if (!actor || !actor.type) return '';
    const key = `actorTypes.${actor.type.toLowerCase()}`;
    // Fournir une valeur par défaut si la clé n'existe pas
    return t(key, actor.type.charAt(0).toUpperCase() + actor.type.slice(1));
  };

  // Trouver l'acteur actif
  const activeActor = [...groupMembers, ...availableActors].find(actor => actor.id === activeId);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900 mb-1">{group.name}</h2>
        {group.description && (
          <p className="text-sm text-gray-500">{group.description}</p>
        )}
      </div>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4">
          <div className="w-1/2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">{t('groupMembers.membersSectionTitle')}</h3>
              <span className="text-xs text-gray-500">{t('groupMembers.membersCount', { count: groupMembers.length })}</span>
            </div>
            
            <DroppableContainer
              id="members-container"
              className="border rounded-md p-2 min-h-[300px] bg-white transition-colors"
            >
              {groupMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm p-4 text-center">
                  <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <p>{t('groupMembers.emptyMembersDroppable')}</p>
                </div>
              ) : (
                <SortableContext 
                  items={groupMembers.map(actor => actor.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-2">
                    {groupMembers.map((actor) => (
                      <SortableItem 
                        key={actor.id} 
                        actor={actor} 
                        type="member" 
                        onRemove={handleRemoveFromGroup} 
                      />
                    ))}
                  </ul>
                </SortableContext>
              )}
            </DroppableContainer>
          </div>
          
          <div className="w-1/2">
            <div className="mb-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">{t('groupMembers.availableSectionTitle')}</h3>
                <span className="text-xs text-gray-500">{t('groupMembers.availableCount', { count: filteredAvailableActors.length })}</span>
              </div>
              
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="filter"
                  id="filter"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-1 sm:text-sm border-gray-300 rounded-md"
                  placeholder={t('groupMembers.filterPlaceholder')}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  aria-label={t('groupMembers.filterPlaceholder')}
                />
              </div>
            </div>
            
            <DroppableContainer
              id="available-container"
              className="border rounded-md p-2 min-h-[300px] overflow-y-auto bg-white transition-colors"
            >
              {filteredAvailableActors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm p-4 text-center">
                  <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <p>{t('groupMembers.emptyAvailableDroppable')}</p>
                </div>
              ) : (
                <SortableContext 
                  items={filteredAvailableActors.map(actor => actor.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-2">
                    {filteredAvailableActors.map((actor) => (
                      <SortableItem 
                        key={actor.id} 
                        actor={actor} 
                        type="available" 
                        onRemove={handleAddToGroup} 
                      />
                    ))}
                  </ul>
                </SortableContext>
              )}
            </DroppableContainer>
          </div>
        </div>

        <DragOverlay>
          {activeId && activeActor ? (
            <div className="p-2 rounded-md border bg-white border-indigo-200 shadow-md">
              <div className="flex items-center">
                <div className={`p-1 rounded-full ${getBadgeColor(activeActor)} mr-2`}>
                  {getActorAvatar(activeActor)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {getActorTitle(activeActor)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getTranslatedActorType(activeActor)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default GroupMembers;
