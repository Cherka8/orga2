import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const messageParam = searchParams.get('message');

    if (statusParam === 'success') {
      setStatus('success');
      setMessage('Votre e-mail a été vérifié avec succès ! Vous pouvez maintenant vous connecter.');
    } else if (statusParam === 'error') {
      setStatus('error');
      setMessage(messageParam || 'Une erreur est survenue lors de la vérification de votre e-mail.');
    } else {
      setStatus('error');
      setMessage('Lien de vérification invalide.');
    }
  }, [searchParams]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full">
            {status === 'success' ? (
              <CheckCircleIcon className="h-24 w-24 text-green-500" />
            ) : (
              <XCircleIcon className="h-24 w-24 text-red-500" />
            )}
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'success' ? 'Vérification réussie !' : 'Erreur de vérification'}
          </h2>
          
          <p className="mt-4 text-sm text-gray-600">
            {message}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {status === 'success' ? (
            <button
              onClick={handleGoToLogin}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Se connecter
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/register')}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                Réessayer l'inscription
              </button>
            </div>
          )}
          
          <button
            onClick={handleGoToHome}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
