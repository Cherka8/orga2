import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { selectActorsByIds } from '../../../redux/slices/actorsSlice'; 
import { useTranslation } from 'react-i18next';

const API_BASE_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:3001';

const GroupsList = ({ 
  groups, 
  selectedGroupId, 
  onSelectGroup, 
  onEditGroup, 
  onDeleteGroup 
}) => {
  const { t } = useTranslation();
  const memberIds = new Set(groups.flatMap(group => group.members || []));

  if (groups.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>{t('groupsList.noGroupsYet')}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {groups.map(group => (
        <li 
          key={group.id}
          className={`py-3 px-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors ${
            selectedGroupId === group.id ? 'bg-indigo-50' : ''
          }`}
          onClick={() => onSelectGroup(group.id)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="mr-3 flex-shrink-0 w-10 h-10">
                <img 
                  src={group.photo ? `${API_BASE_URL}${group.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name.charAt(0))}&background=random&color=fff&size=40`}
                  alt={group.name} 
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.onerror = null; // prevent infinite loops
                    // En cas d'erreur de chargement de la photo principale, on se rabat sur l'avatar généré.
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name.charAt(0))}&background=random&color=fff&size=40`;
                  }}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">{group.name}</h3>
                <p className="text-xs text-gray-500">
                  {t('groupsList.member', { count: group.members?.length || 0 })}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditGroup(group);
                }}
                className="text-gray-400 hover:text-gray-500"
                aria-label={t('groupsList.ariaLabelEdit')}
              >
                <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGroup(group.id);
                }}
                className="text-gray-400 hover:text-red-500"
                aria-label={t('groupsList.ariaLabelDelete')}
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GroupsList;
