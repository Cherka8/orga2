import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import '../../styles/auth.css';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [formMessage, setFormMessage] = useState({ type: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormMessage({ type: '', content: '' });

    if (!email) {
      setFormMessage({ type: 'error', content: t('auth.forgotPassword.errors.emailRequired') });
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.forgotPassword(email);
      // On affiche toujours le message de succès pour des raisons de sécurité
      setFormMessage({ type: 'success', content: response.data.message });
    } catch (error) {
      // En cas d'erreur réseau ou serveur, on peut afficher un message générique
      const message = error.response?.data?.message || t('auth.forgotPassword.errors.genericError');
      setFormMessage({ type: 'error', content: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card" style={{ maxWidth: '500px' }}>
        <h1 className="register-title">{t('auth.forgotPassword.title')}</h1>
        <p className="auth-subtitle">{t('auth.forgotPassword.subtitle')}</p>

        {formMessage.content && (
          <div className={`form-message ${formMessage.type}`}>
            {formMessage.content}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('auth.forgotPassword.email')}</label>
            <div className="form-group">
              <EnvelopeIcon className="input-icon" width={20} height={20} />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="with-icon"
                placeholder={t('auth.forgotPassword.emailPlaceholder')}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendButton')}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="back-link">
            <ArrowLeftIcon width={16} height={16} />
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
