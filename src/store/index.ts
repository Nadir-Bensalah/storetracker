import { combineReducers, configureStore } from '@reduxjs/toolkit';

import preferences, { initialPreferences } from '@/features/settings/preferencesSlice';
import { deviceLanguage } from '@/i18n';

import { loadPersistedState, persistenceMiddleware } from './persistence';

const rootReducer = combineReducers({ preferences });

export type RootState = ReturnType<typeof rootReducer>;

export function createStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().prepend(persistenceMiddleware.middleware),
  });
}

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];

export const store = createStore(loadPersistedState(initialPreferences(deviceLanguage())));
