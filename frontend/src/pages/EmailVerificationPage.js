import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const verificationAttemptedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage(t('auth.verification.noToken', 'Aucun jeton de vérification fourni.'));
      return;
    }

    const verifyToken = async () => {
      if (verificationAttemptedRef.current) return;
      verificationAttemptedRef.current = true;
      try {
        const response = await axios.get(`http://localhost:3000/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || t('auth.verification.success', 'Votre e-mail a été vérifié avec succès !'));
      } catch (error) {
        setStatus('error');
        console.error('Erreur complète lors de la vérification:', error);
        if (error.response && error.response.data && error.response.data.message) {
          setMessage(error.response.data.message);
        } else if (error.response && error.response.statusText) {
          setMessage(`${t('auth.verification.genericError', 'Une erreur est survenue lors de la vérification.')} (${error.response.status} ${error.response.statusText})`);
        } else if (error.request) {
          setMessage(t('auth.verification.networkErrorNoResponse', 'Erreur de réseau : Aucune réponse du serveur.'));
        } else {
          setMessage(t('auth.verification.setupError', 'Erreur lors de la configuration de la requête.') + error.message);
        }
      }
    };

    verifyToken();
  }, [searchParams, t]);

  const renderStatus = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <ArrowPathIcon className="status-icon animate-spin" />
            <h2>{t('auth.verification.verifyingTitle', 'Vérification en cours...')}</h2>
            <p>{t('auth.verification.verifyingMessage', 'Nous vérifions vos informations.')}</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircleIcon className="status-icon success" />
            <h2>{t('auth.verification.successTitle', 'Vérification réussie !')}</h2>
            <p>{message}</p>
            <Link to="/login" className="login-link">{t('auth.verification.loginLink', 'Aller à la page de connexion')}</Link>
          </>
        );
      case 'error':
        return (
          <>
            <XCircleIcon className="status-icon error" />
            <h2>{t('auth.verification.errorTitle', 'Erreur de vérification')}</h2>
            <p>{message}</p>
            <Link to="/login" className="login-link">{t('auth.verification.backToLogin', 'Retour à la connexion')}</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="verification-container">
      <style>{`
        .verification-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          text-align: center;
          padding: 20px;
          font-family: sans-serif;
        }
        .status-icon {
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
        }
        .status-icon.success {
          color: #28a745;
        }
        .status-icon.error {
          color: #dc3545;
        }
        .status-icon.animate-spin {
          color: #007bff;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 2rem;
        }
        .login-link {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          transition: background-color 0.3s;
        }
        .login-link:hover {
          background-color: #0056b3;
        }
      `}</style>
      {renderStatus()}
    </div>
  );
};

export default EmailVerificationPage;
