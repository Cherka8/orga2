import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ACTOR_TYPES } from '../../../redux/slices/actorsSlice';

const ActorDetailsModal = ({ actor, onClose }) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  // Fonction pour obtenir le titre principal de l'acteur selon son type
  const getActorTitle = () => {
    switch (actor.type) {
      case ACTOR_TYPES.HUMAN:
        return `${actor.firstName} ${actor.lastName}`;
      case ACTOR_TYPES.LOCATION:
        return actor.locationName;
      default:
        return t('actorCard.unknownActor');
    }
  };

  // Fonction pour obtenir l'icône selon le type d'acteur
  const getActorIcon = () => {
    switch (actor.type) {
      case ACTOR_TYPES.HUMAN:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        );
      case ACTOR_TYPES.LOCATION:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  // Fonction pour obtenir la couleur du badge selon le type d'acteur
  const getBadgeColor = () => {
    switch (actor.type) {
      case ACTOR_TYPES.HUMAN:
        return 'bg-blue-100 text-blue-800';
      case ACTOR_TYPES.LOCATION:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div 
          ref={modalRef}
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full modal-container animate-modal-appear"
          style={{
            animation: 'appear 0.3s ease-out forwards',
            transformOrigin: 'center'
          }}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${getBadgeColor()} mr-3`}>
                  {getActorIcon()}
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">{getActorTitle()}</h3>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor()}`}>
                  {actor.type.charAt(0).toUpperCase() + actor.type.slice(1)}
                </span>
              </div>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">{t('actorDetailsModal.closeSrOnly')}</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4">
              {actor.type === ACTOR_TYPES.HUMAN && (
                <div className="space-y-4">
                  {actor.photoUrl && (
                    <div className="flex justify-center mb-4">
                      <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-md border border-gray-200">
                        <img 
                          src={`http://localhost:3001${actor.photoUrl}`} 
                          alt={`${actor.firstName} ${actor.lastName}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/150?text=${encodeURIComponent(t('actorDetailsModal.noImage'))}`;
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">{t('actorDetailsModal.detailsTitle.personalInfo')}</h4>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="text-gray-500 w-24">{t('actorDetailsModal.fields.name')}</span>
                          <span className="text-gray-900 font-medium">{actor.firstName} {actor.lastName}</span>
                        </div>
                        {actor.role && (
                          <div className="flex items-start">
                            <span className="text-gray-500 w-24">{t('actorDetailsModal.fields.role')}</span>
                            <span className="text-gray-900">{actor.role}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">{t('actorDetailsModal.detailsTitle.contactInfo')}</h4>
                      <div className="space-y-2">
                        {actor.email && (
                          <div className="flex items-start">
                            <span className="text-gray-500 w-24">{t('actorDetailsModal.fields.email')}</span>
                            <span className="text-gray-900">{actor.email}</span>
                          </div>
                        )}
                        {actor.phone && (
                          <div className="flex items-start">
                            <span className="text-gray-500 w-24">{t('actorDetailsModal.fields.phone')}</span>
                            <span className="text-gray-900">{actor.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {actor.type === ACTOR_TYPES.LOCATION && (
                <div className="space-y-4">
                  {actor.photoUrl && (
                    <div className="mb-4">
                      <div className="relative w-full h-56 rounded-lg overflow-hidden shadow-md border border-gray-200">
                        <img 
                          src={`http://localhost:3001${actor.photoUrl}`} 
                          alt={actor.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/400x200?text=${encodeURIComponent(t('actorDetailsModal.noImage'))}`;
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">{t('actorDetailsModal.detailsTitle.location')}</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-gray-500 w-24">{t('actorDetailsModal.fields.name')}</span>
                        <span className="text-gray-900 font-medium">{actor.name}</span>
                      </div>
                      {actor.address && (
                        <div className="flex items-start">
                          <span className="text-gray-500 w-24">{t('actorDetailsModal.fields.address')}</span>
                          <span className="text-gray-900">{actor.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {t('actorDetailsModal.closeButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorDetailsModal;
