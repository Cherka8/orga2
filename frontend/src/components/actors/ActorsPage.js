import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  selectFilteredActors, 
  setTypeFilter, 
  setSearchFilter,
  ACTOR_TYPES
} from '../../redux/slices/actorsSlice';
import ActorsToolbar from './ActorsToolbar';
import ActorsList from './list/ActorsList';
import GroupsTab from './groups/GroupsTab';
import ActorFormModal from './forms/ActorFormModal';
import TimeView from './TimeView';
import ActorEventsView from './ActorEventsView';
import ShareView from './ShareView'; // Importer la nouvelle vue de partage

const ActorsPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const filteredActors = useSelector(selectFilteredActors);
  
  // Utiliser l'URL comme source unique de vérité pour l'onglet actif
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  // Déterminer l'onglet actif directement à partir de l'URL
  const activeTab = tabParam === 'groups' ? 'groups' : 
                   tabParam === 'time' ? 'time' : 
                   tabParam === 'events' ? 'events' : 
                   tabParam === 'share' ? 'share' : 
                   'actors';
                   
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActorType, setCurrentActorType] = useState(null);
  const [editingActor, setEditingActor] = useState(null);
  // État pour l'animation de transition
  const [tabFading, setTabFading] = useState(false);
  // Référence pour stocker l'ID du timer
  const fadeTimerRef = React.useRef(null);

  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, []);

  // Gestionnaires d'événements
  const handleTabChange = (tab) => {
    // Vérifier si l'onglet est différent de l'onglet actuel
    if (tab !== activeTab) {
      // Démarrer l'animation de transition
      setTabFading(true);
      
      // Nettoyer tout timer existant
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
      
      // Mettre à jour l'URL immédiatement (source unique de vérité)
      if (tab === 'groups') {
        navigate('/actors?tab=groups');
      } else if (tab === 'time') {
        navigate('/actors?tab=time');
      } else if (tab === 'events') {
        navigate('/actors?tab=events');
      } else if (tab === 'share') {
        navigate('/actors?tab=share');
      } else {
        navigate('/actors');
      }
      
      // Rétablir l'opacité après un court délai
      fadeTimerRef.current = setTimeout(() => {
        setTabFading(false);
      }, 150);
    }
  };

  const handleFilterChange = (type) => {
    dispatch(setTypeFilter(type));
  };

  const handleSearch = (searchText) => {
    dispatch(setSearchFilter(searchText));
  };

  const handleAddActor = (type) => {
    setCurrentActorType(type);
    setEditingActor(null);
    setIsModalOpen(true);
  };

  const handleEditActor = (actor) => {
    setCurrentActorType(actor.type);
    setEditingActor(actor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingActor(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ActorsToolbar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onAddActor={handleAddActor}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div 
          className={`tab-content ${tabFading ? 'opacity-0' : 'opacity-100'}`} 
          style={{ transition: 'opacity 0.15s ease-in-out' }}
          key={activeTab} // Forcer le remontage du composant lors du changement d'onglet
        >
          {activeTab === 'actors' ? (
            <ActorsList 
              actors={filteredActors}
              onEditActor={handleEditActor}
            />
          ) : activeTab === 'time' ? (
            <TimeView />
          ) : activeTab === 'events' ? (
            <ActorEventsView />
          ) : activeTab === 'share' ? (
            <ShareView />
          ) : (
            <GroupsTab />
          )}
        </div>
      </div>

      {isModalOpen && (
        <ActorFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          actorType={currentActorType}
          actor={editingActor}
        />
      )}
    </div>
  );
};

export default ActorsPage;
