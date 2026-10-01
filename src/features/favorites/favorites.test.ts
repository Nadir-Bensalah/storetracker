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

describe('favorites saved by an older build', () => {
  it('repairs renamed photo ids instead of crashing later', () => {
    const stale = { ...first, photos: ['interieur-fauvel', 'fauvel-librairie'] };
    storage.set('favorites.v1', JSON.stringify({ ids: [first.id], byId: { [first.id]: stale } }));

    const restored = createStore(loadPersistedState(initialPreferences('fr')));

    expect(restored.getState().favorites.byId[first.id]?.photos).toEqual(['fauvel-librairie']);
  });

  it('falls back to the brand photos when none of the saved ids exist, and drops broken entries', () => {
    const stale = { ...first, photos: ['interieur-fauvel'] };
    storage.set(
      'favorites.v2',
      JSON.stringify({
        ids: [first.id, 'ghost'],
        byId: { [first.id]: stale, ghost: { id: 'ghost' } },
      }),
    );

    const restored = createStore(loadPersistedState(initialPreferences('fr')));

    expect(restored.getState().favorites.ids).toEqual([first.id]);
    expect(restored.getState().favorites.byId[first.id]?.photos.length).toBeGreaterThan(0);
  });
});
