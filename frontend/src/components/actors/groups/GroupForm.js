import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const GroupForm = ({ group, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
      });
      if (group.photo) {
        setPhotoPreview(group.photo);
      }
    } else {
      // Reset form for creation
      setFormData({ name: '', description: '' });
      setPhotoFile(null);
      setPhotoPreview('');
    }
  }, [group]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (value.trim() && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
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

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('description', formData.description);

    if (photoFile) {
      dataToSend.append('photo', photoFile);
    }
    
    onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
        <div className="mt-2 flex items-center space-x-4">
          {photoPreview && (
            <img 
              className="h-20 w-20 rounded-full object-cover"
              src={photoPreview}
              alt={t('groupForm.altPreview')}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://via.placeholder.com/150?text=${t('groupForm.altInvalidUrl')}`;
              }}
            />
          )}
          <div className="flex-1">
            <input
              type="file"
              name="photo"
              id="photo"
              onChange={handleFileChange}
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-gray-200 flex justify-end space-x-3">
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
