import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser, fetchUserProfile } from '../../redux/slices/authSlice';

/**
 * Composant pour initialiser l'authentification au démarrage de l'application
 * Vérifie si un token existe et récupère le profil utilisateur si nécessaire
 */
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  useEffect(() => {
    console.log('AuthInitializer - isAuthenticated:', isAuthenticated);
    console.log('AuthInitializer - user:', user);
    console.log('AuthInitializer - token in localStorage:', localStorage.getItem('token'));
    
    // Si l'utilisateur est authentifié (token présent) mais pas de données utilisateur
    if (isAuthenticated && !user) {
      console.log('AuthInitializer - Dispatching fetchUserProfile...');
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  // Toujours rendre les enfants - l'authentification se fait en arrière-plan
  return children;
};

export default AuthInitializer;
