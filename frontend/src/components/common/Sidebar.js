import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectFocusActive, deactivateFocus } from '../../redux/slices/viewsSlice';
import { selectUser, selectIsAuthenticated, fetchUserProfile, logout } from '../../redux/slices/authSlice';
import DaySelector from './DaySelector';
import BusinessHoursSelector from './BusinessHoursSelector';
import ViewsPanel from '../views/ViewsPanel';
import '../../styles/views-panel.css';

const Sidebar = ({ width, setWidth, isOpen, setIsOpen, isLoading }) => {
  // État pour gérer l'ouverture/fermeture des menus déroulants
  const [viewsOpen, setViewsOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [actorsMenuOpen, setActorsMenuOpen] = useState(false);
  
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language.split('-')[0]; // Obtenir 'fr' ou 'en'

  const dispatch = useDispatch();
  const focusActive = useSelector(selectFocusActive);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const location = useLocation();
  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  // Récupérer le profil utilisateur au chargement si authentifié mais pas de données utilisateur
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  // Données utilisateur par défaut si pas connecté ou en cours de chargement
  const defaultUser = {
    firstName: 'Invité',
    lastName: '',
    email: 'Non connecté'
  };

  const currentUser = user || defaultUser;

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    dispatch(logout());
  };

  // Fonction pour basculer l'état des menus déroulants
  const toggleViews = () => setViewsOpen(!viewsOpen);
  const toggleConfig = () => setConfigOpen(!configOpen);
  const toggleActorsMenu = () => setActorsMenuOpen(!actorsMenuOpen);

  // Gestionnaire pour le changement de langue
  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const isResizing = useRef(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isResizing.current) return;
    // Calculate new width based on mouse position
    let newWidth = e.clientX;
    // Apply constraints (e.g., min 200px, max 600px)
    if (newWidth < 200) newWidth = 200;
    if (newWidth > 600) newWidth = 600;
    setWidth(newWidth);
  }, [setWidth]); // Depend on setWidth

  const handleMouseUp = () => {
    if (isResizing.current) {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  };

  // Cleanup listeners on component unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]); // Add handleMouseMove to dependency array

  // Added handler for back button
  const handleDeactivateFocus = () => {
    dispatch(deactivateFocus());
  };

  // Si la sidebar est fermée, on affiche juste le bouton pour la rouvrir
  if (!isOpen) {
    return (
      <div className="sidebar-collapsed" style={{ width: '0px' }}>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none"
          aria-label="Ouvrir le menu"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    );
  }
  
  // Si la sidebar est ouverte, on affiche la sidebar complète
  return (
    <div 
      className="sidebar bg-white border-r border-gray-200 flex flex-col relative dark:bg-gray-900 dark:border-gray-700 transition-all duration-300 ease-in-out"
      style={{ 
        width: `${width}px`,
        height: '100vh'
      }}
    >
      {/* Logo avec bouton de fermeture */}
      <div className="px-5 pb-6 border-b border-gray-200 mb-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 m-0">Organaizer</h1>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Fermer le menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Navigation Links - Main Scrolling Area */}
      <nav className="flex-1" style={{ overflowY: 'auto' }}>
        {/* Sticky Header for Focus Mode Back Button */}
        {focusActive && (
          <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 px-5 py-2 border-b border-gray-200 dark:border-gray-700">
            <button
              className="focus-back-button flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={handleDeactivateFocus}
              title={t('viewsPanel.focusBackTooltip')}
            >
              <svg
                className="w-4 h-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {t('viewsPanel.focusBackButton')}
            </button>
          </div>
        )}

        {/* Actual Navigation List */}
        <ul className="list-none p-0 m-0">
          <li>
            <Link 
              to="/" 
              className={`flex items-center py-3 px-5 text-gray-900 font-medium no-underline border-l-3 ${
                currentPath === '/' ? 'border-blue-500 text-gray-900 font-medium' : 'border-transparent text-gray-500 font-normal'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {t('sidebar.calendar')} 
            </Link>
          </li>
          <li>
            <button 
              onClick={toggleActorsMenu}
              className={`flex items-center justify-between w-full py-3 px-5 text-left bg-transparent border-0 cursor-pointer border-l-3 ${
                currentPath.startsWith('/actors') ? 'border-blue-500 text-gray-900 font-medium' : 'border-transparent text-gray-500 font-normal'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <span>{t('sidebar.actors')}</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ease-in-out ${actorsMenuOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div 
              className="overflow-hidden transition-all duration-300 ease-in-out" 
              style={{ 
                maxHeight: actorsMenuOpen ? '200px' : '0',
                opacity: actorsMenuOpen ? 1 : 0
              }}
            >
              <ul className="list-none pl-7 pr-0 py-1 m-0">
                <li>
                  <Link 
                    to="/actors" 
                    className={`flex items-center py-2 px-3 text-sm ${
                      currentPath === '/actors' && !currentTab ? 'text-blue-600 font-medium' : 'text-gray-500 font-normal'
                    } no-underline hover:text-blue-500 transition-colors duration-200`}
                  >
                    {t('sidebar.allActorsLink')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/actors?tab=groups" 
                    className={`flex items-center py-2 px-3 text-sm ${
                      currentPath === '/actors' && currentTab === 'groups' ? 'text-blue-600 font-medium' : 'text-gray-500 font-normal'
                    } no-underline hover:text-blue-500 transition-colors duration-200`}
                  >
                    {t('sidebar.groupsLink')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/actors?tab=time" 
                    className={`flex items-center py-2 px-3 text-sm ${
                      currentPath === '/actors' && currentTab === 'time' ? 'text-blue-600 font-medium' : 'text-gray-500 font-normal'
                    } no-underline hover:text-blue-500 transition-colors duration-200`}
                  >
                    {t('sidebar.timeLink')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/actors?tab=events" 
                    className={`flex items-center py-2 px-3 text-sm ${ 
                      currentPath === '/actors' && currentTab === 'events' ? 'text-blue-600 font-medium' : 'text-gray-500 font-normal'
                    } no-underline hover:text-blue-500 transition-colors duration-200`}
                  >
                    {t('sidebar.eventsLink')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/actors?tab=share" 
                    className={`flex items-center py-2 px-3 text-sm ${ 
                      currentPath === '/actors' && currentTab === 'share' ? 'text-blue-600 font-medium' : 'text-gray-500 font-normal'
                    } no-underline hover:text-blue-500 transition-colors duration-200`}
                  >
                    {t('sidebar.shareLink')}
                  </Link>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <button 
              onClick={toggleViews}
              className={`flex items-center justify-between w-full py-3 px-5 text-left bg-transparent border-0 cursor-pointer border-l-3 ${
                currentPath.startsWith('/views') ? 'border-blue-500 text-gray-900 font-medium' : 'border-transparent text-gray-500 font-normal'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
                </svg>
                <span>{t('sidebar.views')}</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ease-in-out ${viewsOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {/* Contenu dépliable de Vues */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: viewsOpen ? '1000px' : '0', // Augmenté pour accommoder ViewsPanel
                opacity: viewsOpen ? 1 : 0
              }}
            >
              <ViewsPanel isLoading={isLoading} /> { /* ViewsPanel rendu ici */ }
            </div>
          </li>
          <li>
            <button 
              onClick={toggleConfig}
              className={`flex items-center justify-between w-full py-3 px-5 text-left bg-transparent border-0 cursor-pointer border-l-3 ${
                currentPath.startsWith('/config') ? 'border-blue-500 text-gray-900 font-medium' : 'border-transparent text-gray-500 font-normal'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>{t('sidebar.configuration')}</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ease-in-out ${configOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div 
              className="overflow-hidden transition-all duration-300 ease-in-out" 
              style={{ 
                maxHeight: configOpen ? '300px' : '0',
                opacity: configOpen ? 1 : 0
              }}
            >
              <ul className="list-none pl-7 pr-0 py-1 m-0">
                <li className="mb-2">
                  <div className="py-2 px-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">{t('sidebar.config.visibleDays')}</p>
                    <DaySelector />
                  </div>
                </li>
                <li className="mb-2">
                  <div className="py-2 px-3">
                    <BusinessHoursSelector />
                  </div>
                </li>
                <li className="mb-2">
                  <div className="py-2 px-3">
                    <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('sidebar.config.languageLabel')}
                    </label>
                    <select
                      id="language-select"
                      value={currentLanguage}
                      onChange={handleLanguageChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    >
                      <option value="fr">{t('sidebar.config.languageFrench')}</option>
                      <option value="en">{t('sidebar.config.languageEnglish')}</option>
                    </select>
                  </div>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>

      {/* Resizer Handle */}
      <div 
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '5px', // Width of the handle
          height: '100%',
          cursor: 'col-resize', // Indicate resizability
          backgroundColor: 'rgba(0,0,0,0.1)', // Slight visibility
          zIndex: 100 // Ensure handle is clickable
        }}
      />

      {/* User Info */}
      <div className="mt-auto p-4 border-t border-gray-200">
        {isAuthenticated && user ? (
          <Link to="/profile" className="user-profile-link">
            <div className="flex items-center cursor-pointer transition-all duration-300 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?')}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 m-0">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : (user.email ? user.email.split('@')[0] : 'Utilisateur')}
                </p>
                <p className="text-xs text-gray-500 m-0">{user.email || ''}</p>
              </div>
              <svg className="w-5 h-5 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </Link>
        ) : isAuthenticated ? (
          <div className="flex items-center p-2">
            <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center mr-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 m-0">Chargement...</p>
              <p className="text-xs text-gray-500 m-0">Récupération du profil</p>
            </div>
          </div>
        ) : (
          <Link to="/login" className="user-profile-link">
            <div className="flex items-center cursor-pointer transition-all duration-300 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 m-0">Se connecter</p>
                <p className="text-xs text-gray-500 m-0">Accédez à votre compte</p>
              </div>
              <svg className="w-5 h-5 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
