import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
  type Storage,
} from 'redux-persist';

import { cartReducer } from './cartSlice';

const rootReducer = combineReducers({ cart: cartReducer });

/**
 * `storage` is injected: AsyncStorage in the app (or an MMKV adapter), an
 * in-memory implementation in tests.
 */
export function createCartStore(storage: Storage) {
  const persistedReducer = persistReducer(
    { key: 'root', version: 1, storage, whitelist: ['cart'] },
    rootReducer,
  );

  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefault) =>
      getDefault({
        serializableCheck: {
          // redux-persist dispatches actions carrying functions (register, rehydrate callbacks).
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

  return { store, persistor: persistStore(store) };
}

export type CartStore = ReturnType<typeof createCartStore>['store'];
export type RootState = ReturnType<CartStore['getState']>;
export type AppDispatch = CartStore['dispatch'];
