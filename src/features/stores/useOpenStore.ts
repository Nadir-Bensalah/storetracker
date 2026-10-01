import { router } from 'expo-router';
import { useCallback } from 'react';

import { useAppDispatch } from '@/store/hooks';

import { storesApi } from './api/storesApi';
import type { Store } from './types';

/**
 * Seeds the detail query with the store we already have, so the detail
 * screen renders immediately instead of showing a skeleton for data on screen.
 */
export function useOpenStore(tab: 'stores' | 'favorites') {
  const dispatch = useAppDispatch();
  return useCallback(
    (store: Store) => {
      dispatch(storesApi.util.upsertQueryData('getStore', store.id, store));
      router.push(`/${tab}/${store.id}`);
    },
    [dispatch, tab],
  );
}
