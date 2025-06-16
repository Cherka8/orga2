import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import '../../styles/auth.css';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState({ type: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setFormMessage({ type: 'error', content: t('auth.resetPassword.errors.noToken') });
    }
  }, [searchParams, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = t('auth.resetPassword.errors.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth.resetPassword.errors.passwordTooShort');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.resetPassword.errors.passwordsMismatch');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setFormMessage({ type: '', content: '' });

    try {
      const response = await authService.resetPassword(token, formData.password, formData.confirmPassword);
      setFormMessage({ type: 'success', content: response.data.message });
      setIsSuccess(true);
    } catch (error) {
      const message = error.response?.data?.message || t('auth.resetPassword.errors.genericError');
      setFormMessage({ type: 'error', content: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="register-container">
        <div className="register-card text-center">
          <CheckCircleIcon className="success-icon" />
          <h1 className="register-title">{t('auth.resetPassword.success.title')}</h1>
          <p>{formMessage.content}</p>
          <Link to="/login" className="submit-button" style={{ marginTop: '20px', textDecoration: 'none' }}>
            {t('auth.resetPassword.success.loginButton')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card" style={{ maxWidth: '500px' }}>
        <h1 className="register-title">{t('auth.resetPassword.title')}</h1>
        <p className="auth-subtitle">{t('auth.resetPassword.subtitle')}</p>

        {formMessage.content && (
          <div className={`form-message ${formMessage.type}`}>
            {formMessage.content}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">{t('auth.resetPassword.newPassword')}</label>
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

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.resetPassword.confirmPassword')}</label>
            <div className="form-group">
              <LockClosedIcon className="input-icon" width={20} height={20} />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`with-icon ${errors.confirmPassword ? 'error' : ''}`}
              />
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isLoading || !token}>
              {isLoading ? t('auth.resetPassword.saving') : t('auth.resetPassword.saveButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
