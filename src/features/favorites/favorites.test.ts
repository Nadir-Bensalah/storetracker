import { stores } from '@/features/stores/data/stores';
import { initialPreferences } from '@/features/settings/preferencesSlice';
import { createStore } from '@/store';
import { loadPersistedState } from '@/store/persistence';
import { storage } from '@/store/storage';

import { favoriteToggled, selectFavoriteIds, selectIsFavorite } from './favoritesSlice';

const [first, second] = stores as [(typeof stores)[0], (typeof stores)[0]];

beforeEach(() => storage.clearAll());

describe('favorites', () => {
  it('toggles a store in and out, newest first', () => {
    const store = createStore();
    store.dispatch(favoriteToggled(first));
    store.dispatch(favoriteToggled(second));
    expect(selectFavoriteIds(store.getState())).toEqual([second.id, first.id]);

    store.dispatch(favoriteToggled(first));
    expect(selectIsFavorite(store.getState(), first.id)).toBe(false);
    expect(selectFavoriteIds(store.getState())).toEqual([second.id]);
  });

  it('survives an app restart through MMKV', () => {
    const before = createStore();
    before.dispatch(favoriteToggled(first));

    // A new store built from storage is what the next app launch sees.
    const after = createStore(loadPersistedState(initialPreferences('fr')));
    expect(selectIsFavorite(after.getState(), first.id)).toBe(true);
    expect(after.getState().favorites.byId[first.id]?.name).toBe(first.name);
  });

  it('starts empty when the stored value is corrupted', () => {
    storage.set('favorites.v1', '{not json');
    const restored = createStore(loadPersistedState(initialPreferences('fr')));
    expect(selectFavoriteIds(restored.getState())).toEqual([]);
  });
});
