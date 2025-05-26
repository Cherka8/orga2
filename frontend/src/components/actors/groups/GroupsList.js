import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { selectActorsByIds } from '../../../redux/slices/actorsSlice'; 
import { useTranslation } from 'react-i18next';

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
              <div className="mr-3 flex-shrink-0 bg-indigo-100 rounded-full p-2 w-10 h-10 overflow-hidden">
                {group.photo ? (
                  <img 
                    src={group.photo} 
                    alt={group.name} 
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40?text=G';
                    }}
                  />
                ) : (
                  <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                )}
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
