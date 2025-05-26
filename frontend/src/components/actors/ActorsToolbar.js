import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ACTOR_TYPES } from '../../redux/slices/actorsSlice';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

const ActorsToolbar = ({ 
  activeTab, 
  onTabChange, 
  onFilterChange, 
  onSearch, 
  onAddActor 
}) => {
  const [searchText, setSearchText] = useState('');
  const { t } = useTranslation();
  
  // Récupérer l'état du filtre actuel depuis Redux
  const currentFilter = useSelector(state => state.actors.filter.type);

  const handleSearchChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
    onSearch(text);
  };

  const handleAddActorClick = (type) => {
    onAddActor(type);
  };

  return (
    <div className="border-b border-gray-200 bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 pl-10">{t('actorsToolbar.title')}</h1>
        
        <div className="flex gap-2">
          {activeTab === 'actors' && (
            <div className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  id="add-actor-menu"
                  aria-expanded="true"
                  aria-haspopup="true"
                  onClick={() => handleAddActorClick(ACTOR_TYPES.HUMAN)}
                >
                  <PlusCircleIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                  {t('actorsToolbar.addHuman')}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'actors' && (
            <div className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  id="add-location-menu"
                  aria-expanded="true"
                  aria-haspopup="true"
                  onClick={() => handleAddActorClick(ACTOR_TYPES.LOCATION)}
                >
                  <PlusCircleIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                  {t('actorsToolbar.addLocation')}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'groups' && (
            <div className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  id="add-group-menu"
                  aria-expanded="true"
                  aria-haspopup="true"
                >
                  {t('actorsToolbar.addGroup')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-4" data-testid="actors-tabs">
          <button
            className={`px-4 py-2 font-medium text-sm rounded-md transition-all duration-200 ${
              activeTab === 'actors'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
            onClick={(e) => {
              // Éviter les clics multiples rapides
              e.preventDefault();
              if (activeTab !== 'actors') {
                onTabChange('actors');
              }
            }}
            disabled={activeTab === 'actors'}
          >
            {t('actorsToolbar.tabs.allActors')}
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-md transition-all duration-200 ${
              activeTab === 'groups'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
            onClick={(e) => {
              e.preventDefault();
              if (activeTab !== 'groups') {
                onTabChange('groups');
              }
            }}
            disabled={activeTab === 'groups'}
          >
            {t('actorsToolbar.tabs.groups')}
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-md transition-all duration-200 ${
              activeTab === 'time'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
            onClick={(e) => {
              e.preventDefault();
              if (activeTab !== 'time') {
                onTabChange('time');
              }
            }}
            disabled={activeTab === 'time'}
          >
            {t('actorsToolbar.tabs.time')}
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-md transition-all duration-200 ${
              activeTab === 'events'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
            onClick={(e) => {
              e.preventDefault();
              if (activeTab !== 'events') {
                onTabChange('events');
              }
            }}
            disabled={activeTab === 'events'}
          >
            {t('actorsToolbar.tabs.events')}
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-md transition-all duration-200 ${
              activeTab === 'share'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
            onClick={(e) => {
              e.preventDefault();
              if (activeTab !== 'share') {
                onTabChange('share');
              }
            }}
            disabled={activeTab === 'share'}
          >
            {t('actorsToolbar.tabs.share')}
          </button>
        </div>
        
        {activeTab === 'actors' && (
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2" data-component-name="ActorsToolbar">
              <button
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                  currentFilter === null ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                onClick={() => onFilterChange(null)}
                aria-pressed={currentFilter === null}
              >
                {t('actorsToolbar.filters.all')}
              </button>
              <button
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                  currentFilter === ACTOR_TYPES.HUMAN ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                onClick={() => onFilterChange(ACTOR_TYPES.HUMAN)}
                aria-pressed={currentFilter === ACTOR_TYPES.HUMAN}
              >
                {t('actorsToolbar.filters.humans')}
              </button>
              <button
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                  currentFilter === ACTOR_TYPES.LOCATION ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                onClick={() => onFilterChange(ACTOR_TYPES.LOCATION)}
                aria-pressed={currentFilter === ACTOR_TYPES.LOCATION}
              >
                {t('actorsToolbar.filters.locations')}
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                placeholder={t('actorsToolbar.searchPlaceholder')}
                value={searchText}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActorsToolbar;
