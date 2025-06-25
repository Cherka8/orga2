import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { thunk } from 'redux-thunk';

import actorsReducer from './slices/actorsSlice';
import groupsReducer from './slices/groupsSlice';
import calendarSettingsReducer from './slices/calendarSettingsSlice';
import viewsReducer from './slices/viewsSlice';
import eventsReducer from './slices/eventsSlice';
import authReducer from './slices/authSlice';

// Configuration de la persistance
const persistConfig = {
  key: 'organaizer',
  storage,
  whitelist: ['actors', 'groups', 'calendarSettings', 'views', 'auth'] // Seulement ces reducers seront persistés
};

const appReducer = combineReducers({
  actors: actorsReducer,
  groups: groupsReducer,
  calendarSettings: calendarSettingsReducer,
  views: viewsReducer,
  events: eventsReducer,
  auth: authReducer
});

const rootReducer = (state, action) => {
  // Si l'action est 'auth/logout', réinitialiser tout l'état
  if (action.type === 'auth/logout') {
    // On ne garde que la configuration de persistance
    storage.removeItem('persist:organaizer'); // Nettoie le localStorage
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configuration du store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    }).concat(thunk),
  devTools: process.env.NODE_ENV !== 'production'
});

export const persistor = persistStore(store);
