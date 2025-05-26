import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, HomeIcon, CalendarIcon, BriefcaseIcon, LockClosedIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

const IndividualForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    birthDate: '',
    occupation: '',
    password: '',
    confirmPassword: '',
    accountType: 'individual'
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'birthDate',
      'country', 'password', 'confirmPassword'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = t('auth.individualForm.errors.required');
      }
    });
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.individualForm.errors.invalidEmail');
    }
    
    // Phone validation
    if (formData.phone && !/^[0-9+\s()-]{8,15}$/.test(formData.phone)) {
      newErrors.phone = t('auth.individualForm.errors.invalidPhone');
    }
    
    // Postal code validation for France
    if (formData.postalCode && !/^[0-9]{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = t('auth.individualForm.errors.invalidPostalCode');
    }
    
    // Birth date validation (must be at least 18 years old)
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0) || 
          (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        newErrors.birthDate = t('auth.individualForm.errors.tooYoung');
      }
    }
    
    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = t('auth.individualForm.errors.passwordTooShort');
    }
    
    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.individualForm.errors.passwordMismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Données du formulaire particulier soumises:', formData);
      // Ici, vous enverriez normalement les données à votre backend
      
      // Pour l'instant, on simule une inscription réussie
      alert('Inscription réussie! Vous allez être redirigé vers la page de connexion.');
      navigate('/login');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>{t('auth.individualForm.title')}</h2>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-section">
          <h3>
            <UserIcon className="icon" width={24} height={24} />
            {t('auth.individualForm.personalInfo')}
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">{t('auth.individualForm.firstName')}</label>
              <div className="input-container">
                <UserIcon className="input-icon" width={20} height={20} />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`with-icon ${errors.firstName ? 'error' : ''}`}
                />
              </div>
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">{t('auth.individualForm.lastName')}</label>
              <div className="input-container">
                <UserIcon className="input-icon" width={20} height={20} />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`with-icon ${errors.lastName ? 'error' : ''}`}
                />
              </div>
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">{t('auth.individualForm.email')}</label>
              <div className="input-container">
                <EnvelopeIcon className="input-icon" width={20} height={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`with-icon ${errors.email ? 'error' : ''}`}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">{t('auth.individualForm.phone')}</label>
              <div className="input-container">
                <PhoneIcon className="input-icon" width={20} height={20} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`with-icon ${errors.phone ? 'error' : ''}`}
                />
              </div>
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthDate">{t('auth.individualForm.birthDate')}</label>
              <div className="input-container">
                <CalendarIcon className="input-icon" width={20} height={20} />
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className={`with-icon ${errors.birthDate ? 'error' : ''}`}
                />
              </div>
              {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="occupation">{t('auth.individualForm.occupation')}</label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>
            <HomeIcon className="icon" width={24} height={24} />
            {t('auth.individualForm.address')}
          </h3>
          
          <div className="form-group">
            <label htmlFor="address">{t('auth.individualForm.addressTitle')}</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">{t('auth.individualForm.city')}</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? 'error' : ''}
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="postalCode">{t('auth.individualForm.postalCode')}</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className={errors.postalCode ? 'error' : ''}
              />
              {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="country">{t('auth.individualForm.country')}</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={errors.country ? 'error' : ''}
              />
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>
            <LockClosedIcon className="icon" width={24} height={24} />
            {t('auth.individualForm.security')}
          </h3>
          
          <div className="form-group">
            <label htmlFor="password">{t('auth.individualForm.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.individualForm.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-button">
            {t('auth.individualForm.registerButton')}
            <CheckIcon className="icon" width={20} height={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default IndividualForm;
