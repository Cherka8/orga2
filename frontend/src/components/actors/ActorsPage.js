import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  selectFilteredActors, 
  fetchActors,
  setTypeFilter, 
  setSearchFilter,
  setPage,
  selectPagination,
  ACTOR_TYPES
} from '../../redux/slices/actorsSlice';
import { selectActorsLoading, selectActorsError } from '../../redux/slices/actorsSlice';
import Pagination from '../common/Pagination';
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
  const loading = useSelector(selectActorsLoading);
  const error = useSelector(selectActorsError);
  const pagination = useSelector(selectPagination);
  const filter = useSelector(state => state.actors.filter);

  
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

  // Chargement des acteurs en fonction des filtres et de l'onglet actif
  useEffect(() => {
    console.log('ActorsPage useEffect triggered. Dependencies:', { activeTab, filter, page: pagination.page });
    dispatch(fetchActors({ ...filter, page: pagination.page, limit: pagination.limit }));
  }, [dispatch, activeTab, filter, pagination.page]);



  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

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
            <>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Erreur lors du chargement des acteurs
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        {error}
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => dispatch(fetchActors())}
                          className="bg-red-100 px-3 py-1 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                        >
                          Réessayer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Chargement des acteurs...</p>
                  </div>
                </div>
              ) : (
                <ActorsList 
                  actors={filteredActors}
                  onEditActor={handleEditActor}
                />
              )}
              <Pagination 
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
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
