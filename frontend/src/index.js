import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import './components/actors/smooth-transitions.css';
import './styles/hidden-days-indicator.css';
import './i18n'; // Import the i18n configuration
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Import the i18n instance

// Préchargement des composants principaux en arrière-plan
// Cette technique permet de charger les composants avant qu'ils ne soient nécessaires
const preloadComponents = () => {
  // Précharger les composants après le chargement initial de l'application
  setTimeout(() => {
    // Précharger les composants principaux
    import('./components/calendar/EventFormModal');
    import('./components/events/EventDetailsPopover');
  }, 2000); // Attendre 2 secondes après le chargement initial
};

// Démarrer le préchargement
preloadComponents();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);