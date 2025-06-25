import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addActor, updateActor, ACTOR_TYPES } from '../../../redux/slices/actorsSlice';

const HumanForm = ({ actor, onClose }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    phone: '',
    photoUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [isFormReady, setIsFormReady] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    // Si on édite un acteur existant, initialiser le formulaire avec ses données
    if (actor) {
      setFormData({
        firstName: actor.firstName || '',
        lastName: actor.lastName || '',
        role: actor.role || '',
        email: actor.email || '',
        phone: actor.phone || '',
        photoUrl: actor.photoUrl || ''
      });
      
      // Initialiser la preview avec la photo existante
      if (actor.photoUrl) {
        setPhotoPreview(`http://localhost:3001${actor.photoUrl}`);
      }
    }
    setIsFormReady(true);
  }, [actor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si c'est le champ photo, indiquer que l'image est en cours de chargement
    if (name === 'photoUrl' && value.trim()) {
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setImageLoading(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('humanForm.error.firstNameRequired');
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('humanForm.error.lastNameRequired');
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = t('humanForm.error.invalidEmail');
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
      type: ACTOR_TYPES.HUMAN
    };
    
    if (photoFile) {
      actorData.photo = photoFile;
    }
    
    if (actor) {
      // Mise à jour d'un acteur existant
      dispatch(updateActor({
        ...actorData,
        id: actor.id
      }));
    } else {
      // Création d'un nouvel acteur
      dispatch(addActor(actorData));
    }
    
    onClose();
  };

  // Style commun pour les champs de formulaire
  const inputClass = (fieldName) => `
    px-4 py-3 mt-2 w-full 
    bg-gray-50 border rounded-lg 
    text-gray-700 focus:outline-none 
    focus:ring-2 focus:ring-blue-500 focus:border-transparent 
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
    ${index > 0 ? `delay-${index * 100}` : ''}
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête du formulaire avec photo */}
      <div className={`flex flex-col md:flex-row gap-6 items-center ${formItemClass(0)}`}>
        <div className="w-full md:w-1/3 flex justify-center">
          <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg border-2 border-gray-200 group transition-all duration-300 hover:shadow-xl">
            {imageLoading && photoPreview && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            <img 
              src={photoPreview || 'https://st4.depositphotos.com/6672868/22336/v/450/depositphotos_223369166-stock-illustration-user-avatar-profile-picture-icon.jpg'}
              alt={t('humanForm.photoAlt')}
              className={`w-full h-full object-cover transition-all duration-500 ${photoPreview ? '' : 'opacity-50'}`}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
                e.target.onerror = null;
                e.target.src = 'https://st4.depositphotos.com/6672868/22336/v/450/depositphotos_223369166-stock-illustration-user-avatar-profile-picture-icon.jpg';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-300">
              <div className="text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <span className="mx-auto text-xl font-bold">{t('humanForm.photoText')}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-2/3">
          <div className="mb-4">
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
              {t('humanForm.photoLabel')}
            </label>
            <input
              type="file"
              name="photo"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className={inputClass('photo')}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                {t('humanForm.firstNameLabel')}
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={inputClass('firstName')}
                placeholder={t('humanForm.firstNamePlaceholder')}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 animate-pulse">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                {t('humanForm.lastNameLabel')}
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={inputClass('lastName')}
                placeholder={t('humanForm.lastNamePlaceholder')}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 animate-pulse">{errors.lastName}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Rôle */}
      <div className={formItemClass(1)}>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          {t('humanForm.roleLabel')}
        </label>
        <input
          type="text"
          name="role"
          id="role"
          value={formData.role}
          onChange={handleChange}
          className={inputClass('role')}
          placeholder={t('humanForm.rolePlaceholder')}
        />
      </div>
      
      {/* Coordonnées */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${formItemClass(2)}`}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('humanForm.emailLabel')}
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass('email')}
            placeholder={t('humanForm.emailPlaceholder')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 animate-pulse">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            {t('humanForm.phoneLabel')}
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClass('phone')}
            placeholder={t('humanForm.phonePlaceholder')}
          />
        </div>
      </div>
      
      {/* Boutons d'action */}
      <div className={`pt-5 border-t border-gray-200 flex justify-end space-x-4 ${formItemClass(3)}`}>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center shadow hover:shadow-md"
        >
          {t('humanForm.cancelButton')}
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center shadow hover:shadow-md transform hover:-translate-y-0.5"
        >
          {actor ? t('humanForm.updateButton') : t('humanForm.createButton')}
        </button>
      </div>
    </form>
  );
};

export default HumanForm;
