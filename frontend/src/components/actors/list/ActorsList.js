import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { deleteActor } from '../../../redux/slices/actorsSlice';
import ActorCard from './ActorCard';
import ActorDetailsModal from '../details/ActorDetailsModal';

const ActorsList = ({ actors, onEditActor }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [selectedActor, setSelectedActor] = useState(null);

  const handleDeleteActor = (actorId) => {
    if (window.confirm(t('actorsList.deleteConfirm'))) {
      dispatch(deleteActor(actorId));
    }
  };

  const handleViewDetails = (actor) => {
    setSelectedActor(actor);
  };

  const handleCloseModal = () => {
    setSelectedActor(null);
  };

  if (actors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        <p className="text-lg font-medium">{t('actorsList.empty.title')}</p>
        <p className="text-sm">{t('actorsList.empty.description')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actors.map(actor => (
          <ActorCard
            key={actor.id}
            actor={actor}
            onViewDetails={handleViewDetails}
            onEdit={() => onEditActor(actor)}
            onDelete={() => handleDeleteActor(actor.id)}
          />
        ))}
      </div>

      {selectedActor && (
        <ActorDetailsModal
          actor={selectedActor}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ActorsList;
