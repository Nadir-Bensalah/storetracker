import NetInfo from '@react-native-community/netinfo';

import { stores } from '../data/stores';
import { distanceInMeters } from '../distance';
import type { Coordinates, Store, StoresPage } from '../types';

// Stands in for a REST backend (`GET /stores`, `GET /stores/:id`). Everything
// a real network brings is reproduced: latency, failures, offline, pagination
// and server-side search, so the UI states can be exercised deterministically.

export class ApiError extends Error {
  constructor(readonly kind: 'offline' | 'server' | 'notFound') {
    super(kind);
  }
}

export const mockServerConfig = {
  latencyMs: Number(process.env.EXPO_PUBLIC_API_LATENCY_MS ?? 600),
  errorRate: Number(process.env.EXPO_PUBLIC_API_ERROR_RATE ?? 0),
};

export const PAGE_SIZE = 20;
const NEARBY_RADIUS_METERS = 30_000;
const NEARBY_LIMIT = 10;

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
    });
  });
}

async function simulateNetwork(signal?: AbortSignal) {
  const { isConnected } = await NetInfo.fetch();
  if (isConnected === false) throw new ApiError('offline');
  await wait(mockServerConfig.latencyMs, signal);
  if (Math.random() < mockServerConfig.errorRate) throw new ApiError('server');
}

export function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').toLowerCase().trim();
}

function matches(store: Store, search: string) {
  const haystack = normalize(`${store.name} ${store.city}`);
  return normalize(search)
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

export interface ListStoresParams {
  search: string;
  near: Coordinates | null;
  page: number;
}

export async function listStores(
  { search, near, page }: ListStoresParams,
  signal?: AbortSignal,
): Promise<StoresPage> {
  await simulateNetwork(signal);

  const filtered = search ? stores.filter((store) => matches(store, search)) : stores;
  const sorted = near
    ? filtered
        .map((store) => ({ store, distance: distanceInMeters(near, store.coordinates) }))
        .sort((a, b) => a.distance - b.distance)
        .map(({ store }) => store)
    : [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  const start = (page - 1) * PAGE_SIZE;
  const items = sorted.slice(start, start + PAGE_SIZE);
  return {
    items,
    total: sorted.length,
    nextPage: start + PAGE_SIZE < sorted.length ? page + 1 : null,
  };
}

export async function listNearbyStores(near: Coordinates, signal?: AbortSignal) {
  await simulateNetwork(signal);
  return stores
    .map((store) => ({ store, distance: distanceInMeters(near, store.coordinates) }))
    .filter(({ distance }) => distance <= NEARBY_RADIUS_METERS)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, NEARBY_LIMIT)
    .map(({ store }) => store);
}

export async function getStore(id: string, signal?: AbortSignal) {
  await simulateNetwork(signal);
  const store = stores.find((candidate) => candidate.id === id);
  if (!store) throw new ApiError('notFound');
  return store;
}
