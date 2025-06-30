import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { selectAllActors, ACTOR_TYPES } from '../../redux/slices/actorsSlice';
import { shareCalendarWithActor } from '../../services/calendarSharingService';

const ShareView = () => {
  const { t } = useTranslation();
  const allActors = useSelector(selectAllActors);
  
  // État pour les acteurs humains (filtrer les lieux)
  const [humanActors, setHumanActors] = useState([]);
  
  // État pour les acteurs sélectionnés
  const [selectedActors, setSelectedActors] = useState([]);
  
  // État pour le terme de recherche
  const [searchTerm, setSearchTerm] = useState('');
  
  // État pour afficher les messages de succès/erreur
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  // État pour le chargement
  const [isLoading, setIsLoading] = useState(false);
  
  // État pour stocker les acteurs sans email lors d'une tentative d'envoi
  const [actorsWithoutEmail, setActorsWithoutEmail] = useState([]);

  // Filtrer les acteurs humains au chargement
  useEffect(() => {
    const humans = allActors.filter(actor => actor.type === ACTOR_TYPES.HUMAN);
    setHumanActors(humans);
  }, [allActors]);

  // Filtrer les acteurs en fonction du terme de recherche
  const filteredActors = searchTerm.trim() === '' 
    ? humanActors 
    : humanActors.filter(actor => 
        `${actor.firstName || ''} ${actor.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Gérer la sélection d'un acteur
  const handleSelectActor = (actorId) => {
    if (selectedActors.includes(actorId)) {
      setSelectedActors(selectedActors.filter(id => id !== actorId));
    } else {
      setSelectedActors([...selectedActors, actorId]);
    }
  };

  // Sélectionner tous les acteurs
  const handleSelectAll = () => {
    if (selectedActors.length === filteredActors.length) {
      setSelectedActors([]);
    } else {
      setSelectedActors(filteredActors.map(actor => actor.id));
    }
  };

  // Partager le calendrier avec un acteur spécifique via l'API
  const handleShareWithActor = async (actorId) => {
    setIsLoading(true);
    setNotification({ type: '', message: '' }); // Reset notification

    const actor = humanActors.find(a => a.id === actorId);

    try {
      const response = await shareCalendarWithActor(actorId);
      setNotification({
        type: 'success',
        message: response.message || t('shareView.successSingle', { name: `${actor.firstName} ${actor.lastName}` })
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('shareView.errorGeneric');
      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
      // Effacer la notification après 3 secondes
      setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 3000);
    }
  };

  // Simuler l'envoi du calendrier à tous les acteurs sélectionnés
  const handleShareWithSelected = () => {
    if (selectedActors.length === 0) {
      setNotification({ type: 'error', message: t('shareView.errorNoSelection') });
      return;
    }

    setIsLoading(true);
    setNotification({ type: '', message: '' }); // Reset notification
    setActorsWithoutEmail([]); // Reset warning state

    const allSelectedFullActors = selectedActors.map(id => humanActors.find(a => a.id === id)).filter(Boolean);

    const actorsWithEmail = allSelectedFullActors.filter(actor => actor.email);
    const actorsWithoutEmail = allSelectedFullActors.filter(actor => !actor.email);

    if (actorsWithoutEmail.length > 0) {
      // Set a warning about actors without an email, but don't stop the process.
      setActorsWithoutEmail(actorsWithoutEmail);
      const names = actorsWithoutEmail.map(a => `${a.firstName} ${a.lastName}`).join(', ');
      setNotification({
        type: 'warning',
        message: t('shareView.warningSomeNoEmail', { count: actorsWithoutEmail.length, names })
      });
    }

    if (actorsWithEmail.length > 0) {
      // Proceed to send emails to the actors who have an address.
      sendToActorsWithEmail(actorsWithEmail.map(a => a.id));
    } else {
      // If no selected actors had an email, stop the loading indicator.
      setIsLoading(false);
    }
  };

  // Fonction pour envoyer aux acteurs qui ont un email
  const sendToActorsWithEmail = async (actorIds) => {
    // isLoading is already set to true by the calling function.

    const results = await Promise.allSettled(
      actorIds.map(id => shareCalendarWithActor(id))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.filter(r => r.status === 'rejected').length;

    let finalMessage = '';
    // The notification for actors without email might already be set. We will append to it.
    let currentMessage = notification.message;

    if (successCount > 0) {
      finalMessage += t('shareView.successMultiple', { count: successCount });
    }

    if (errorCount > 0) {
      finalMessage += ` ${t('shareView.errorMultiple', { count: errorCount })}`;
    }

    setNotification({
      type: errorCount > 0 ? 'warning' : 'success',
      message: [currentMessage, finalMessage.trim()].filter(Boolean).join(' | ')
    });

    setIsLoading(false);
    setSelectedActors([]); // Deselect actors after the operation

    // Clear notification after a longer period to allow reading the summary
    setTimeout(() => {
      setNotification({ type: '', message: '' });
      setActorsWithoutEmail([]);
    }, 7000);
  };

  return (
    <div className="share-view">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 pl-10">{t('shareView.title')}</h1>
        <p className="text-gray-600">{t('shareView.description')}</p>
      </div>
      
      {/* Notification */}
      {notification.message && (
        <div className={`mb-4 p-4 rounded-md ${
          notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
          notification.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : ''
        }`}>
          <div className="flex justify-between items-center">
            <div>{notification.message}</div>
            {notification.showSendAnyway && (
              <button 
                onClick={() => sendToActorsWithEmail(selectedActors)}
                className="ml-4 px-4 py-1 text-sm font-medium rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              >
                {t('shareView.sendAnyway')}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Actions globales */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
            placeholder={t('shareView.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          >
            {selectedActors.length === filteredActors.length && filteredActors.length > 0
              ? t('shareView.deselectAll')
              : t('shareView.selectAll')}
          </button>
          
          <button
            onClick={handleShareWithSelected}
            disabled={isLoading || selectedActors.length === 0}
            className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
              isLoading || selectedActors.length === 0
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? t('shareView.sending') : t('shareView.shareWithSelected')}
          </button>
        </div>
      </div>
      
      {/* Liste des acteurs */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredActors.length === 0 ? (
          <div className="py-10 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('shareView.noActors')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('shareView.noActorsDescription')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredActors.map(actor => (
              <li key={actor.id} className="px-6 py-4 flex items-center hover:bg-gray-50">
                <div className="flex items-center flex-1">
                  <input
                    id={`actor-${actor.id}`}
                    name={`actor-${actor.id}`}
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={selectedActors.includes(actor.id)}
                    onChange={() => handleSelectActor(actor.id)}
                  />
                  <label htmlFor={`actor-${actor.id}`} className="ml-3 flex items-center cursor-pointer">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {actor.photo ? (
                        <img src={actor.photo} alt={`${actor.firstName} ${actor.lastName}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-500 font-medium text-lg">
                          {actor.firstName?.[0] || ''}
                          {actor.lastName?.[0] || ''}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{`${actor.firstName || ''} ${actor.lastName || ''}`}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        {actor.email ? (
                          <>
                            <svg className="h-4 w-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {actor.email}
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {t('shareView.noEmailWarning')}
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
                
                <div>
                  <button
                    onClick={() => handleShareWithActor(actor.id)}
                    disabled={isLoading || !actor.email}
                    className={`ml-4 px-3 py-1 text-xs font-medium rounded-md ${
                      isLoading || !actor.email
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    {t('shareView.shareButton')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Informations supplémentaires */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">{t('shareView.noteTitle')}</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>{t('shareView.noteDescription')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareView;
