import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ACTOR_TYPES } from '../../../redux/slices/actorsSlice';
import HumanForm from './HumanForm';
import LocationForm from './LocationForm';

const ActorFormModal = ({ isOpen, onClose, actorType, actor }) => {
  const [formTitle, setFormTitle] = useState('');
  const [animationState, setAnimationState] = useState('closed');
  const { t } = useTranslation();
  const modalRef = useRef(null);

  useEffect(() => {
    // Définir le titre du formulaire en utilisant les clés de traduction
    const mode = actor ? 'edit' : 'add';
    const typeKey = actorType.charAt(0).toUpperCase() + actorType.slice(1);
    const titleKey = `actorFormModal.title.${mode}${typeKey}`;
    setFormTitle(t(titleKey));
  }, [actor, actorType, t]);

  useEffect(() => {
    if (isOpen) {
      // Déclencher l'animation d'ouverture
      setAnimationState('opening');
      // Attendre que l'animation de transition soit terminée
      setTimeout(() => {
        setAnimationState('open');
      }, 50);
    } else {
      // Animation de fermeture
      setAnimationState('closing');
      // Attendre que l'animation de fermeture soit terminée avant de retirer complètement le modal
      setTimeout(() => {
        setAnimationState('closed');
      }, 300);
    }
  }, [isOpen]);

  // Gérer le clic en dehors du modal pour le fermer
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Sélectionner le formulaire approprié en fonction du type d'acteur
  const renderForm = () => {
    switch (actorType) {
      case ACTOR_TYPES.HUMAN:
        return <HumanForm actor={actor} onClose={onClose} />;
      case ACTOR_TYPES.LOCATION:
        return <LocationForm actor={actor} onClose={onClose} />;
      default:
        return null;
    }
  };

  if (animationState === 'closed' && !isOpen) return null;

  // Déterminer les classes CSS en fonction de l'état d'animation
  const overlayClasses = `fixed inset-0 z-50 overflow-y-auto bg-gray-600 transition-opacity duration-300 ease-in-out flex items-center justify-center ${
    animationState === 'opening' || animationState === 'open' 
      ? 'bg-opacity-50' 
      : 'bg-opacity-0'
  }`;

  const modalClasses = `inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all duration-300 ease-in-out sm:my-8 sm:align-middle ${
    actorType === ACTOR_TYPES.HUMAN ? 'sm:max-w-2xl' : 'sm:max-w-3xl'
  } sm:w-full ${
    animationState === 'opening' || animationState === 'open'
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-4'
  }`;

  return (
    <div 
      className={overlayClasses}
      onClick={handleOutsideClick}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className={`absolute inset-0 bg-gray-500 ${
            animationState === 'opening' || animationState === 'open' 
              ? 'opacity-75' 
              : 'opacity-0'
          } transition-opacity duration-300 ease-in-out`}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          ref={modalRef}
          className={modalClasses}
        >
          <div className="bg-white px-6 pt-5 pb-6 sm:p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl leading-6 font-medium text-gray-900" id="modal-title">
                {formTitle}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div>
              {renderForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorFormModal;
