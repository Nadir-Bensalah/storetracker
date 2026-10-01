import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Coordinates, Store, StoresPage, StoresQuery } from '../types';

import { ApiError, getStore, listNearbyStores, listStores } from './mockServer';

export type StoresApiError = { kind: ApiError['kind'] };

async function run<T>(request: () => Promise<T>): Promise<{ data: T } | { error: StoresApiError }> {
  try {
    return { data: await request() };
  } catch (error) {
    return { error: { kind: error instanceof ApiError ? error.kind : 'server' } };
  }
}

export const storesApi = createApi({
  reducerPath: 'storesApi',
  baseQuery: fakeBaseQuery<StoresApiError>(),
  // Matches what a store list tolerates: hours change rarely, the list is
  // refetched on reconnect, and cached searches stay instant for 5 minutes.
  keepUnusedDataFor: 300,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    getStores: build.infiniteQuery<StoresPage, StoresQuery, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
      },
      queryFn: ({ queryArg, pageParam }, { signal }) =>
        run(() => listStores({ ...queryArg, page: pageParam }, signal)),
    }),
    getNearbyStores: build.query<Store[], Coordinates>({
      queryFn: (near, { signal }) => run(() => listNearbyStores(near, signal)),
    }),
    getStore: build.query<Store, string>({
      queryFn: (id, { signal }) => run(() => getStore(id, signal)),
    }),
  }),
});

export const { useGetStoresInfiniteQuery, useGetNearbyStoresQuery, useGetStoreQuery } = storesApi;
