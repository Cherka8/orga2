import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { BuildingOfficeIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, UserIcon, LockClosedIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

const CompanyForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    email: '', // Contact's email
    phone: '', // Company's phone
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    contactFirstName: '',
    contactLastName: '',
    contactPosition: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
    const [formMessage, setFormMessage] = useState({ type: '', content: '' });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    setFormMessage({ type: '', content: '' });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const requiredFields = [
      'companyName', 'email', 'phone', 'address', 
      'city', 'postalCode', 'country', 'contactFirstName', 
      'contactLastName', 'password', 'confirmPassword'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = t('auth.companyForm.errors.required');
      }
    });
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.companyForm.errors.invalidEmail');
    }
    
    if (formData.phone && !/^[0-9+\s()-]{8,15}$/.test(formData.phone)) {
      newErrors.phone = t('auth.companyForm.errors.invalidPhone');
    }
    
    if (formData.postalCode && !/^[0-9]{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = t('auth.companyForm.errors.invalidPostalCode');
    }
    
    if (formData.password && formData.password.length < 8) {
      newErrors.password = t('auth.companyForm.errors.passwordTooShort');
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.companyForm.errors.passwordMismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setFormMessage({ type: '', content: '' });

      const payload = {
        companyInformation: {
          companyName: formData.companyName,
          industry: formData.industry,
          companyPhone: formData.phone,
          companyAddress: formData.address,
          companyCity: formData.city,
          companyPostalCode: formData.postalCode,
          companyCountry: formData.country,
        },
        primaryContact: {
          firstName: formData.contactFirstName,
          lastName: formData.contactLastName,
          contactPosition: formData.contactPosition,
          email: formData.email,
          password: formData.password,
          country: formData.country,
        }
      };

      try {
        await axios.post('http://localhost:3000/api/auth/register/company', payload);
        setRegistrationSuccess(true);
      } catch (error) {
        console.error('Erreur lors de l\'inscription de l\'entreprise:', error);
        if (error.response && error.response.data) {
          const message = Array.isArray(error.response.data.message) 
                          ? error.response.data.message.join(', ') 
                          : error.response.data.message;
          setFormMessage({ type: 'error', content: message || t('auth.companyForm.errors.genericError') });
        } else {
          setFormMessage({ type: 'error', content: t('auth.companyForm.errors.networkError') });
        }
      }
    }
  };

  return (
    <div className="auth-form-container">
      <h2>{t('auth.companyForm.title')}</h2>

      {formMessage.content && (
        <div className={`form-message ${formMessage.type}`}>
          {formMessage.content}
        </div>
      )}
      
      {registrationSuccess ? (
        <div className="registration-success" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <CheckIcon className="icon success-icon" width={60} height={60} style={{ color: 'green', margin: '0 auto 20px', display: 'block' }} />
          <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>{t('auth.register.successTitle')}</h2>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>{t('auth.register.successMessage')}</p>
          <p style={{ fontSize: '14px', color: '#666' }}>{t('auth.register.checkSpam')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>
              <BuildingOfficeIcon className="icon" width={24} height={24} />
              {t('auth.companyForm.companyInfo')}
            </h3>
            <div className="form-group">
              <label htmlFor="companyName">{t('auth.companyForm.companyName')}</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={errors.companyName ? 'error' : ''}
              />
              {errors.companyName && <span className="error-message">{errors.companyName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="industry">{t('auth.companyForm.industry')}</label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">{t('auth.companyForm.email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">{t('auth.companyForm.phone')}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>
              <MapPinIcon className="icon" width={24} height={24} />
              {t('auth.companyForm.address')}
            </h3>
            
            <div className="form-group">
              <label htmlFor="address">{t('auth.companyForm.addressTitle')}</label>
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
                <label htmlFor="city">{t('auth.companyForm.city')}</label>
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
                <label htmlFor="postalCode">{t('auth.companyForm.postalCode')}</label>
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
                <label htmlFor="country">{t('auth.companyForm.country')}</label>
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
              <UserIcon className="icon" width={24} height={24} />
              {t('auth.companyForm.contactInfo')}
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactFirstName">{t('auth.companyForm.contactFirstName')}</label>
                <input
                  type="text"
                  id="contactFirstName"
                  name="contactFirstName"
                  value={formData.contactFirstName}
                  onChange={handleChange}
                  className={errors.contactFirstName ? 'error' : ''}
                />
                {errors.contactFirstName && <span className="error-message">{errors.contactFirstName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="contactLastName">{t('auth.companyForm.contactLastName')}</label>
                <input
                  type="text"
                  id="contactLastName"
                  name="contactLastName"
                  value={formData.contactLastName}
                  onChange={handleChange}
                  className={errors.contactLastName ? 'error' : ''}
                />
                {errors.contactLastName && <span className="error-message">{errors.contactLastName}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="contactPosition">{t('auth.companyForm.contactPosition')}</label>
              <input
                type="text"
                id="contactPosition"
                name="contactPosition"
                value={formData.contactPosition}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>
              <LockClosedIcon className="icon" width={24} height={24} />
              {t('auth.companyForm.security')}
            </h3>
            
            <div className="form-group">
              <label htmlFor="password">{t('auth.companyForm.password')}</label>
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
              <label htmlFor="confirmPassword">{t('auth.companyForm.confirmPassword')}</label>
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
              {t('auth.companyForm.registerButton')}
              <CheckIcon className="icon" width={20} height={20} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CompanyForm;
