import React from 'react';
import { useTranslation } from 'react-i18next';

const SelectableActorList = ({ 
  actors, 
  selectedActorId = null,
  onSelectActor,
  searchTerm, 
  onSearchChange 
}) => {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* En-tête avec dégradé - fixe */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-white flex items-center">
          <svg className="w-4 h-4 mr-2 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {t('selectableActorList.title', { count: actors.length })}
        </h3>
      </div>
      
      {/* Barre de recherche avec style amélioré - fixe */}
      <div className="px-3 py-3 bg-indigo-50 flex-shrink-0 border-b border-indigo-100">
        <div className="relative"> 
          <input
            type="text"
            placeholder={t('selectableActorList.searchPlaceholder')}
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full pl-9 pr-3 py-2 border border-indigo-200 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-white"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Liste des acteurs avec défilement indépendant - prend tout l'espace restant */}
      <div className="overflow-y-auto flex-grow custom-scrollbar h-0 min-h-0">
        {actors.length > 0 ? (
          <div className="divide-y divide-indigo-50">
            {actors.map(actor => (
              <div 
                key={actor.id} 
                className={`py-3 px-4 flex items-center cursor-pointer transition-all duration-200 ease-in-out
                  ${selectedActorId === actor.id 
                    ? 'bg-gradient-to-r from-indigo-100 to-blue-50 border-l-4 border-indigo-600' 
                    : 'hover:bg-indigo-50 border-l-4 border-transparent'}`}
                onClick={() => onSelectActor ? onSelectActor(actor.id) : null}
                role="button"
                aria-pressed={selectedActorId === actor.id}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && onSelectActor) {
                    onSelectActor(actor.id);
                  }
                }}
              >
                {actor.photo ? (
                  <img 
                    src={actor.photo} 
                    alt={`${actor.firstName} ${actor.lastName}`}
                    className={`w-10 h-10 rounded-full mr-3 object-cover shadow-sm ${selectedActorId === actor.id ? 'ring-2 ring-indigo-400' : 'ring-1 ring-indigo-100'}`}
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white font-semibold text-sm shadow-sm
                    ${selectedActorId === actor.id ? 'bg-indigo-600' : 'bg-indigo-400'}`}>
                    {actor.firstName?.charAt(0)}{actor.lastName?.charAt(0)}
                  </div>
                )}
                
                <div className="flex-grow min-w-0">
                  <div className={`text-sm font-medium truncate ${selectedActorId === actor.id ? 'text-indigo-900' : 'text-gray-800'}`}>
                    {actor.firstName} {actor.lastName}
                  </div>
                  {actor.role && (
                    <div className={`text-xs truncate ${selectedActorId === actor.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {actor.role}
                    </div>
                  )}
                </div>
                
                {/* Indicateur de sélection */}
                {selectedActorId === actor.id && (
                  <svg className="w-5 h-5 text-indigo-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <svg className="mx-auto h-10 w-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-2 text-indigo-900 font-medium">
              {searchTerm ? t('selectableActorList.noResults') : t('selectableActorList.noActorsAvailable')}
            </p>
            <p className="mt-1 text-sm text-indigo-500">
              {searchTerm ? t('selectableActorList.tryAnotherSearch') : t('selectableActorList.addActorsHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectableActorList;
