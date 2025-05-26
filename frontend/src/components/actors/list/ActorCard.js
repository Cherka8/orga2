import React from 'react';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import { ACTOR_TYPES } from '../../../redux/slices/actorsSlice';
import { useTranslation } from 'react-i18next';

const ActorCard = ({ actor, onViewDetails, onEdit, onDelete }) => {
  const { t } = useTranslation();

  // Fonction pour obtenir le titre principal de l'acteur selon son type
  const getActorTitle = () => {
    switch (actor.type) {
      case ACTOR_TYPES.HUMAN:
        return `${actor.firstName} ${actor.lastName}`;
      case ACTOR_TYPES.LOCATION:
        return actor.name;
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

  // Fonction pour obtenir la couleur de fond selon le type d'acteur
  const getCardColor = () => {
    switch (actor.type) {
      case ACTOR_TYPES.HUMAN:
        return 'bg-blue-50 border-blue-200';
      case ACTOR_TYPES.LOCATION:
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
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
    <div className={`border rounded-lg overflow-hidden shadow-sm actor-card ${getCardColor()}`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${getBadgeColor()} mr-3`}>
              {getActorIcon()}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{getActorTitle()}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor()} mt-1`} data-component-name="ActorCard">
                {t(`actorTypes.${actor.type}`)}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onViewDetails(actor)}
              className="text-gray-400 hover:text-gray-500"
              aria-label={t('actorCard.ariaLabels.viewDetails')}
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={onEdit}
              className="text-gray-400 hover:text-gray-500"
              aria-label={t('actorCard.ariaLabels.edit')}
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={onDelete}
              className="text-gray-400 hover:text-red-500"
              aria-label={t('actorCard.ariaLabels.delete')}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorCard;
