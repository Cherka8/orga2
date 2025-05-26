import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { thunk } from 'redux-thunk';

import actorsReducer from './slices/actorsSlice';
import groupsReducer from './slices/groupsSlice';
import calendarSettingsReducer from './slices/calendarSettingsSlice';
import viewsReducer from './slices/viewsSlice';
import eventsReducer from './slices/eventsSlice';

// Configuration de la persistance
const persistConfig = {
  key: 'organaizer',
  storage,
  whitelist: ['actors', 'groups', 'calendarSettings', 'views'] // Seulement ces reducers seront persistés
};

const rootReducer = combineReducers({
  actors: actorsReducer,
  groups: groupsReducer,
  calendarSettings: calendarSettingsReducer,
  views: viewsReducer,
  events: eventsReducer
});

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
