import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const GroupForm = ({ group, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Si on édite un groupe existant, initialiser le formulaire avec ses données
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        photo: group.photo || ''
      });
    }
  }, [group]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      newErrors.name = t('groupForm.errorNameRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {t('groupForm.labelName')}
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
            errors.name ? 'border-red-500' : ''
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name} {/* Error message is already translated */}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          {t('groupForm.labelDescription')}
        </label>
        <textarea
          name="description"
          id="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
          {t('groupForm.labelPhoto')}
        </label>
        <input
          type="text"
          name="photo"
          id="photo"
          value={formData.photo}
          onChange={handleChange}
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder={t('groupForm.placeholderPhotoUrl')}
        />
        {formData.photo && (
          <div className="mt-4 flex justify-center">
            <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-md border border-gray-200 mx-auto">
              <img 
                src={formData.photo} 
                alt={t('groupForm.altPreview')}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/150?text=${t('groupForm.altInvalidUrl')}`;
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t('groupForm.buttonCancel')}
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {group ? t('groupForm.buttonUpdate') : t('groupForm.buttonCreate')}
        </button>
      </div>
    </form>
  );
};

export default GroupForm;
