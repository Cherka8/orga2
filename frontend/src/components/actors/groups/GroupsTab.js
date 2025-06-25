import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchGroups, 
  selectFilteredGroups, 
  selectSelectedGroup, 
  selectGroup, 
  addGroup, 
  updateGroup, 
  deleteGroup
} from '../../../redux/slices/groupsSlice';
import { selectAllActors } from '../../../redux/slices/actorsSlice';
import GroupsList from './GroupsList';
import GroupForm from './GroupForm';
import GroupMembers from './GroupMembers';
import { useTranslation } from 'react-i18next';

const GroupsTab = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const groups = useSelector(selectFilteredGroups);
  const actors = useSelector(selectAllActors);
  const selectedGroup = useSelector(selectSelectedGroup);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const handleAddGroup = () => {
    setEditingGroup(null);
    setIsFormOpen(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setIsFormOpen(true);
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm(t('groupsTab.confirmDelete'))) {
      dispatch(deleteGroup(groupId));
    }
  };

  const handleSelectGroup = (groupId) => {
    dispatch(selectGroup(groupId));
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGroup(null);
  };

  const handleSubmitGroup = (formData) => {
    if (editingGroup) {
      dispatch(updateGroup({ id: editingGroup.id, formData }));
    } else {
      dispatch(addGroup(formData))
        .unwrap()
        .then((newGroup) => {
          console.log('Groupe créé avec succès:', newGroup);
          // TODO: Ici, on pourrait appeler une action pour ajouter les membres
          // en utilisant newGroup.id si nécessaire.
        })
        .catch((error) => {
          console.error('Échec de la création du groupe:', error);
        });
    }
    setIsFormOpen(false);
    setEditingGroup(null);
  };

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-200 pr-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">{t('groupsTab.listTitle')}</h2>
          <button
            type="button"
            onClick={handleAddGroup}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('groupsTab.addGroupButton')}
          </button>
        </div>
        
        <GroupsList 
          groups={groups}
          selectedGroupId={selectedGroup?.id}
          onSelectGroup={handleSelectGroup}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
        />
      </div>
      
      <div className="w-2/3 pl-4 overflow-auto">
        {selectedGroup ? (
          <GroupMembers 
            group={selectedGroup}
            allActors={actors}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 className="text-lg font-semibold mb-2">{t('groupsTab.noGroupSelectedTitle')}</h3>
            <p className="text-sm text-center">{t('groupsTab.noGroupSelectedDescription')}</p>
          </div>
        )}
      </div>
      
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {editingGroup ? t('groupsTab.modalTitleEdit') : t('groupsTab.modalTitleAdd')}
                    </h3>
                    <div className="mt-4">
                      <GroupForm 
                        group={editingGroup}
                        onSubmit={handleSubmitGroup}
                        onCancel={handleCloseForm}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsTab;
