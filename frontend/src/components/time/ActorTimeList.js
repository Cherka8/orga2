import React from 'react';
import { useTranslation } from 'react-i18next';

const ActorTimeList = ({ 
  actors, 
  selectedActorIds = [], 
  onSelectActor, 
  searchTerm, 
  onSearchChange, 
  onSelectAll, 
  isAllSelected, 
  isIndeterminate 
}) => {
  const { t } = useTranslation();

  return (
    <div className="actor-list h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* En-tête avec style moderne */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center">
          <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {t('actorTimeList.title')}
        </h3>
      </div>
      
      {/* Ajout de la barre de recherche et du bouton "Tout sélectionner" */}
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="relative mb-2">
          <input
            type="text"
            placeholder={t('actorTimeList.searchPlaceholder')}
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="selectAllCheckbox"
            className="h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
            checked={isAllSelected}
            ref={el => el && (el.indeterminate = isIndeterminate)} // Gérer l'état indéterminé
            onChange={(e) => onSelectAll(e.target.checked)}
          />
          <label htmlFor="selectAllCheckbox" className="ml-2 text-xs text-gray-600 cursor-pointer">
            {isAllSelected ? t('actorTimeList.deselectAll') : t('actorTimeList.selectAll')} ({actors.length})
          </label>
        </div>
      </div>
      
      {/* Afficher la liste ou un message si aucun résultat */}
      <div className="divide-y divide-gray-50 overflow-y-auto flex-grow custom-scrollbar">
        {actors.length > 0 ? (
          actors.map(actor => (
            <div 
              key={actor.id} 
              className={`py-1.5 px-2 flex items-center cursor-pointer transition-all duration-200 ease-in-out
                ${selectedActorIds.includes(actor.id) 
                  ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-l-2 border-indigo-500' 
                  : 'hover:bg-gray-50 border-l-2 border-transparent'}`}
              onClick={() => onSelectActor ? onSelectActor(actor.id) : null}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && onSelectActor) {
                  onSelectActor(actor.id);
                }
              }}
            >
              {actor.photo ? (
                <div className="relative">
                  <img 
                    src={actor.photo} 
                    alt={`${actor.firstName} ${actor.lastName}`}
                    className="w-7 h-7 rounded-full mr-2 object-cover ring-1 ring-white shadow-sm"
                  />
                  {selectedActorIds.includes(actor.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-indigo-500 rounded-full w-3 h-3 flex items-center justify-center shadow-sm">
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`w-7 h-7 rounded-full mr-2 flex items-center justify-center text-white font-medium text-xs shadow-sm
                  ${selectedActorIds.includes(actor.id) ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                  {actor.firstName?.charAt(0)}{actor.lastName?.charAt(0)}
                </div>
              )}
              
              <div className="flex-grow min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate py-1.5">{`${actor.firstName} ${actor.lastName}`}</p> 
              </div>
              
              <div className="text-right">
                <div className={`font-medium px-1 py-0.5 rounded-full text-[9px] leading-none
                  ${selectedActorIds.includes(actor.id) ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-600'}`}>
                  {actor.totalHoursFormatted || '0m'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 text-center">
            <p className="text-gray-500 text-xs">
              {searchTerm 
                ? t('actorTimeList.noResultsFound') 
                : t('actorTimeList.noActorsAvailable')}
            </p>
          </div>
        )}
      </div>
      
      {/* Pied de liste avec info */}
      <div className="px-3 py-1.5 text-xxs text-gray-500 bg-gray-50 border-t border-gray-100 flex-shrink-0">
        <p>{t('actorTimeList.selectedCount', { count: selectedActorIds.length })}</p>
      </div>
    </div>
  );
};

export default ActorTimeList;
