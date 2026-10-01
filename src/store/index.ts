import { combineReducers, configureStore } from '@reduxjs/toolkit';

import favorites from '@/features/favorites/favoritesSlice';
import location from '@/features/location/locationSlice';
import preferences, { initialPreferences } from '@/features/settings/preferencesSlice';
import { storesApi } from '@/features/stores/api/storesApi';
import { deviceLanguage } from '@/i18n';

import { loadPersistedState, persistenceMiddleware } from './persistence';

const rootReducer = combineReducers({
  preferences,
  favorites,
  location,
  [storesApi.reducerPath]: storesApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) =>
      getDefault().prepend(persistenceMiddleware.middleware).concat(storesApi.middleware),
  });
}

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];

export const store = createStore(loadPersistedState(initialPreferences(deviceLanguage())));
