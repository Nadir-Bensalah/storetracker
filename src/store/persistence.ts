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

import { brands } from '@/features/stores/data/brands';
import { knownPhotos } from '@/features/stores/data/photos';

import { readJSON, writeJSON } from './storage';

import type { RootState } from './index';

// MMKV reads are synchronous: persisted state is available before the first
// render, so there is no rehydration gate and no flash of default values.
// Keys are versioned so a future shape change can migrate or drop old data.
const PREFERENCES_KEY = 'preferences.v1';
const FAVORITES_KEY = 'favorites.v2';
const LEGACY_FAVORITES_KEY = 'favorites.v1';

export function loadPersistedState(defaults: PreferencesState): Partial<RootState> {
  return {
    preferences: { ...defaults, ...readJSON<Partial<PreferencesState>>(PREFERENCES_KEY) },
    favorites: sanitizeFavorites(
      readJSON<FavoritesState>(FAVORITES_KEY) ?? readJSON<FavoritesState>(LEGACY_FAVORITES_KEY),
    ),
  };
}

// A favorite is a snapshot taken by whichever build saved it. Anything the
// current build cannot render (missing fields, photo ids that were renamed)
// is repaired from the brand's defaults, or dropped. A stale snapshot must
// never be able to crash the app at launch or on the detail screen.
export function sanitizeFavorites(stored: FavoritesState | undefined): FavoritesState {
  if (!stored || !Array.isArray(stored.ids) || typeof stored.byId !== 'object' || !stored.byId) {
    return initialFavorites;
  }
  const byId: FavoritesState['byId'] = {};
  for (const id of stored.ids) {
    const store = stored.byId[id];
    const brand = store && brands[store.brandId];
    if (!store || !brand || typeof store.name !== 'string' || !Array.isArray(store.photos))
      continue;
    const photos = knownPhotos(store.photos);
    byId[id] = { ...store, photos: photos.length > 0 ? photos : brand.photos };
  }
  return {
    ids: Object.keys(byId).length === stored.ids.length ? stored.ids : Object.keys(byId),
    byId,
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
