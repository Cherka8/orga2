import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next'; 
import { selectAllActors, ACTOR_TYPES } from '../../redux/slices/actorsSlice';
import { selectVisibleEvents } from '../../redux/slices/eventsSlice';
import { selectGroupsByIdMap } from '../../redux/slices/groupsSlice';
import SelectableActorList from './SelectableActorList';
import ActorEventList from './ActorEventList';

const ActorEventsView = () => {
  const { t } = useTranslation(); 
  const allActors = useSelector(selectAllActors);
    const allEvents = useSelector(selectVisibleEvents);
  const groupsById = useSelector(selectGroupsByIdMap);

  const humanActors = useMemo(() => 
    allActors.filter(actor => actor.type === ACTOR_TYPES.HUMAN)
  , [allActors]);

  const [selectedActorId, setSelectedActorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActors = useMemo(() => 
    humanActors.filter(actor => 
      `${actor.firstName} ${actor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  , [humanActors, searchTerm]);

  useEffect(() => {
    if (!selectedActorId && filteredActors.length > 0) {
      setSelectedActorId(filteredActors[0].id);
    }
    if (selectedActorId && !filteredActors.some(actor => actor.id === selectedActorId)) {
        setSelectedActorId(filteredActors.length > 0 ? filteredActors[0].id : null);
    }
  }, [filteredActors, selectedActorId]);

  const handleSelectActor = (actorId) => {
    setSelectedActorId(actorId);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const selectedActor = useMemo(() => 
      humanActors.find(actor => actor.id === selectedActorId)
  , [humanActors, selectedActorId]);

  // Fonction pour vérifier si un acteur est membre d'un groupe
  const isActorInGroup = useCallback((actorId, groupId) => {
    const group = groupsById[groupId];
    // Les membres sont des objets, on doit donc vérifier la propriété actor_id
    return group && group.members && group.members.some(member => member.actor_id === actorId);
  }, [groupsById]);

  useEffect(() => {
    console.log('--- Debug ActorEventsView ---');
    console.log('Selected Actor ID:', selectedActorId);
    console.log('Total Events Count:', allEvents.length);
    
    // Compter les événements directs et via groupes pour le débogage
    if (selectedActorId) {
      // La logique de filtrage est maintenant alignée avec la structure de données aplatie.
      const directEvents = allEvents.filter(event => 
        event.participants?.some(p => p.actor?.id === selectedActorId && !p.group)
      );
      
      const groupEvents = allEvents.filter(event => 
        event.participants?.some(p => p.group && isActorInGroup(selectedActorId, p.group.id))
      );
      
      console.log('Direct Events Count:', directEvents.length);
      console.log('Group Events Count:', groupEvents.length);
    }
  }, [selectedActorId, allEvents, isActorInGroup]);

  const actorEvents = useMemo(() => {
    if (!selectedActorId) {
      return [];
    }

    // Logique de filtrage unifiée et corrigée
    return allEvents.filter(event => {
      if (!event.participants) return false;

      return event.participants.some(p => {
        // L'acteur participe directement (et non via un groupe pour cette entrée)
        if (p.actor?.id === selectedActorId && !p.group) {
          return true;
        }
        // L'acteur participe via un groupe
        if (p.group) {
          return isActorInGroup(selectedActorId, p.group.id);
        }
        return false;
      });
    });
  }, [allEvents, selectedActorId, isActorInGroup]);

  useEffect(() => {
    console.log('Filtered Actor Events Count:', actorEvents.length);
    // Optionnel: loguer les events filtrés si peu nombreux
    // if (actorEvents.length < 10) console.log('Filtered Events:', actorEvents);
    console.log('----------------------------');
  }, [actorEvents]);

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Colonne principale pour les événements - avec défilement indépendant */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* En-tête fixe */}
        <div className="flex items-center p-4 bg-white bg-opacity-70 border-b border-indigo-100 shadow-sm">
          <div className="flex-shrink-0 mr-3">
            {selectedActor && (
              selectedActor.photo ? (
                <img 
                  src={selectedActor.photo} 
                  alt={`${selectedActor.firstName} ${selectedActor.lastName}`}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-300 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm bg-indigo-600">
                  {selectedActor.firstName?.charAt(0)}{selectedActor.lastName?.charAt(0)}
                </div>
              )
            )}
            {!selectedActor && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-indigo-900">
              {selectedActor ? `${selectedActor.firstName} ${selectedActor.lastName}` : t('actorEventsView.selectActorPrompt')}
            </h2>
            {selectedActor?.role && (
              <p className="text-sm text-indigo-600">{selectedActor.role}</p>
            )}
          </div>
        </div>
        
        {/* Zone de défilement pour les événements - prend tout l'espace restant */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="bg-white bg-opacity-80 rounded-lg shadow-md p-4 border border-indigo-100">
            <ActorEventList events={actorEvents} />
          </div>
        </div>
      </div>

      {/* Colonne de droite pour la liste des acteurs - hauteur fixe indépendante */}
      <div className="w-72 h-screen flex-shrink-0 border-l border-indigo-100 shadow-inner bg-white bg-opacity-90 overflow-hidden flex flex-col">
        <SelectableActorList 
          actors={filteredActors} 
          selectedActorId={selectedActorId} 
          onSelectActor={handleSelectActor} 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />
      </div>
    </div>
  );
};

export default ActorEventsView;
