import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EnvelopeIcon, LockClosedIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import '../../styles/auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.email) {
      newErrors.email = t('auth.login.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.login.errors.invalidEmail');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.login.errors.passwordRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Tentative de connexion avec:', formData.email);
      // Ici, vous enverriez normalement les données à votre backend
      
      // Pour l'instant, on simule une connexion réussie
      navigate('/');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card" style={{ maxWidth: '500px' }}>
        <h1 className="register-title">{t('auth.login.title')}</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('auth.login.email')}</label>
            <div className="form-group">
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
            <label htmlFor="password">{t('auth.login.password')}</label>
            <div className="form-group">
              <LockClosedIcon className="input-icon" width={20} height={20} />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`with-icon ${errors.password ? 'error' : ''}`}
              />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              style={{ width: 'auto', marginRight: '10px' }}
            />
            <label htmlFor="rememberMe" style={{ margin: 0 }}>{t('auth.login.rememberMe')}</label>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-button">
              {t('auth.login.loginButton')}
              <ArrowRightOnRectangleIcon className="icon" width={20} height={20} />
            </button>
          </div>
        </form>
        
        <div className="auth-footer">
          <p>{t('auth.login.noAccount')} <Link to="/register">{t('auth.login.registerLink')}</Link></p>
          <p style={{ marginTop: '10px' }}><Link to="/forgot-password">{t('auth.login.forgotPassword')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
