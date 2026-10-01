import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Store } from '@/features/stores/types';

// Favorites keep a snapshot of the store, not only its id: the Favorites tab
// and the store detail must work offline, without a round trip to the API.
export interface FavoritesState {
  ids: string[];
  byId: Record<string, Store>;
}

export const initialFavorites: FavoritesState = { ids: [], byId: {} };

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: initialFavorites,
  reducers: {
    favoriteToggled(state, action: PayloadAction<Store>) {
      const store = action.payload;
      if (state.byId[store.id]) {
        delete state.byId[store.id];
        state.ids = state.ids.filter((id) => id !== store.id);
      } else {
        state.byId[store.id] = store;
        state.ids.unshift(store.id);
      }
    },
  },
  selectors: {
    selectIsFavorite: (state, id: string) => id in state.byId,
    selectFavoriteIds: (state) => state.ids,
    selectFavorite: (state, id: string) => state.byId[id],
  },
});

export const { favoriteToggled } = favoritesSlice.actions;
export const { selectIsFavorite, selectFavoriteIds, selectFavorite } = favoritesSlice.selectors;
export default favoritesSlice.reducer;
