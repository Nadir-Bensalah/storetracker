import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import {
  favoriteToggled,
  type FavoritesState,
  initialFavorites,
} from '@/features/favorites/favoritesSlice';
import {
  appearanceChanged,
  languageChanged,
  onboardingCompleted,
  onboardingReset,
  type PreferencesState,
} from '@/features/settings/preferencesSlice';

import { readJSON, writeJSON } from './storage';

import type { RootState } from './index';

// MMKV reads are synchronous: persisted state is available before the first
// render, so there is no rehydration gate and no flash of default values.
// Keys are versioned so a future shape change can migrate or drop old data.
const PREFERENCES_KEY = 'preferences.v1';
const FAVORITES_KEY = 'favorites.v1';

export function loadPersistedState(defaults: PreferencesState): Partial<RootState> {
  return {
    preferences: { ...defaults, ...readJSON<Partial<PreferencesState>>(PREFERENCES_KEY) },
    favorites: readJSON<FavoritesState>(FAVORITES_KEY) ?? initialFavorites,
  };
}

export const persistenceMiddleware = createListenerMiddleware();

persistenceMiddleware.startListening({
  matcher: isAnyOf(languageChanged, appearanceChanged, onboardingCompleted, onboardingReset),
  effect: (_action, api) => {
    writeJSON(PREFERENCES_KEY, (api.getState() as RootState).preferences);
  },
});

persistenceMiddleware.startListening({
  actionCreator: favoriteToggled,
  effect: (_action, api) => {
    writeJSON(FAVORITES_KEY, (api.getState() as RootState).favorites);
  },
});
