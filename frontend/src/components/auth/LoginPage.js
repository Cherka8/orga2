import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { EnvelopeIcon, LockClosedIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { loginUser, selectAuthLoading, selectAuthError, selectIsAuthenticated, clearError, fetchUserProfile } from '../../redux/slices/authSlice';
import authService from '../../services/authService';
import '../../styles/auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState({ type: '', content: '' });
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Gérer les erreurs Redux
  useEffect(() => {
    if (error) {
      if (error.includes('vérifié') || error.includes('verify')) {
        setEmailNotVerified(true);
      }
      setFormMessage({ type: 'error', content: error });
    }
  }, [error]);

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
    setFormMessage({ type: '', content: '' });
    setEmailNotVerified(false);
    dispatch(clearError());
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ type: '', content: '' });
    setEmailNotVerified(false);
    dispatch(clearError());

    if (validateForm()) {
      try {
        const result = await dispatch(loginUser({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        })).unwrap();
        
        // Récupérer le profil utilisateur après connexion réussie
        await dispatch(fetchUserProfile());
        
        // Redirection sera gérée par useEffect
      } catch (error) {
        // L'erreur sera gérée par useEffect via le state Redux
      }
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setFormMessage({ type: 'error', content: t('auth.login.errors.emailRequiredForResend', 'Veuillez laisser votre e-mail dans le champ ci-dessus.') });
      return;
    }
    setIsResending(true);
    try {
      const response = await authService.resendVerificationEmail(formData.email);
      setFormMessage({ type: 'success', content: response.data.message });
      setEmailNotVerified(false); // Cache le bouton après l'envoi réussi
    } catch (error) {
      const message = error.response?.data?.message || t('auth.login.errors.resendFailed');
      setFormMessage({ type: 'error', content: message });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card" style={{ maxWidth: '500px' }}>
        <h1 className="register-title">{t('auth.login.title')}</h1>

        {formMessage.content && (
          <div className={`form-message ${formMessage.type}`}>
            {formMessage.content}
          </div>
        )}
        
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
          
          {emailNotVerified && (
            <div className="form-actions">
              <button type="button" onClick={handleResendVerification} disabled={isResending} className="secondary-button" style={{ width: '100%' }}>
                {isResending ? t('auth.login.resending', 'Envoi en cours...') : t('auth.login.resendButton', 'Renvoyer l\'e-mail de vérification')}
              </button>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? t('auth.login.loggingIn', 'Connexion...') : t('auth.login.loginButton')}
              {!loading && <ArrowRightOnRectangleIcon className="icon" width={20} height={20} />}
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
