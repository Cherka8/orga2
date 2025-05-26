import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addActor, updateActor, ACTOR_TYPES } from '../../../redux/slices/actorsSlice';

const LocationForm = ({ actor, onClose }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    photo: ''
  });
  const [errors, setErrors] = useState({});
  const [isFormReady, setIsFormReady] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    // Si on édite un lieu existant, initialiser le formulaire avec ses données
    if (actor) {
      setFormData({
        name: actor.name || '',
        address: actor.address || '',
        photo: actor.photo || ''
      });
    }
    
    // Ajouter une animation d'entrée en décalant légèrement l'affichage du formulaire
    setTimeout(() => {
      setIsFormReady(true);
    }, 50);
  }, [actor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si c'est le champ photo, indiquer que l'image est en cours de chargement
    if (name === 'photo' && value.trim()) {
      setImageLoading(true);
    }
    
    // Effacer l'erreur pour ce champ s'il est rempli
    if (value.trim() && errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('locationForm.error.nameRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const actorData = {
      ...formData,
      type: ACTOR_TYPES.LOCATION
    };
    
    if (actor) {
      // Mise à jour d'un lieu existant
      dispatch(updateActor({
        ...actorData,
        id: actor.id
      }));
    } else {
      // Création d'un nouveau lieu
      dispatch(addActor(actorData));
    }
    
    onClose();
  };

  // Style commun pour les champs de formulaire
  const inputClass = (fieldName) => `
    px-4 py-3 mt-2 w-full 
    bg-gray-50 border rounded-lg 
    text-gray-700 focus:outline-none 
    focus:ring-2 focus:ring-teal-500 focus:border-transparent 
    transition-all duration-300 ease-in-out
    ${errors[fieldName] ? 'border-red-500 bg-red-50' : 'border-gray-300'}
    transform hover:shadow-md focus:shadow-md
  `;

  // Classes pour l'animation des éléments du formulaire
  const formItemClass = (index) => `
    transition-all duration-300 ease-in-out
    ${isFormReady 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 translate-y-4'}
    transition-delay-${index * 100}
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-full">
      <div className="grid grid-cols-1 gap-4">
        {/* Prévisualisation de l'image et informations principales */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${formItemClass(0)}`}>
          {/* Prévisualisation de l'image */}
          <div className="w-full">
            <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-md border border-gray-200 group transition-all duration-300 hover:shadow-lg">
              {imageLoading && formData.photo && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <img 
                src={formData.photo || `https://via.placeholder.com/800x400?text=${encodeURIComponent(t('locationForm.photoPlaceholderText'))}`}
                alt={t('locationForm.photoAlt')}
                className={`w-full h-full object-cover transition-all duration-500 ${formData.photo ? '' : 'opacity-50'}`}
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  setImageLoading(false);
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/800x400?text=${encodeURIComponent(t('locationForm.photoErrorText'))}`;
                }}
              />
            </div>
          </div>
          
          {/* Informations principales */}
          <div>
            {/* Nom du lieu */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('locationForm.nameLabel')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass('name')}
                placeholder={t('locationForm.namePlaceholder')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 animate-pulse">{errors.name}</p>
              )}
            </div>
            
            {/* Photo URL */}
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                {t('locationForm.photoUrlLabel')}
              </label>
              <input
                type="text"
                name="photo"
                id="photo"
                value={formData.photo}
                onChange={handleChange}
                className={inputClass('photo')}
                placeholder={t('locationForm.photoUrlPlaceholder')}
              />
            </div>
          </div>
        </div>
        
        {/* Adresse */}
        <div className={`${formItemClass(1)}`}>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            {t('locationForm.addressLabel')}
          </label>
          <textarea
            name="address"
            id="address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
            className={inputClass('address')}
            placeholder={t('locationForm.addressPlaceholder')}
          />
        </div>
      </div>
      
      <div className={`pt-4 mt-2 border-t border-gray-200 flex justify-end space-x-4 ${formItemClass(2)}`}>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow hover:shadow-md"
        >
          {t('locationForm.cancelButton')}
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow hover:shadow-md"
        >
          {actor ? t('locationForm.updateButton') : t('locationForm.createButton')}
        </button>
      </div>
    </form>
  );
};

export default LocationForm;
