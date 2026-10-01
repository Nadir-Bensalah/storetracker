import NetInfo from '@react-native-community/netinfo';

import { stores } from '../data/stores';
import { ApiError, getStore, listStores, normalize, PAGE_SIZE } from './mockServer';

const paris = { latitude: 48.8712, longitude: 2.333 };

describe('mock stores API', () => {
  it('serves more than 50 stores, page by page', async () => {
    expect(stores.length).toBeGreaterThanOrEqual(50);

    const first = await listStores({ search: '', near: null, page: 1 });
    expect(first.items).toHaveLength(PAGE_SIZE);
    expect(first.total).toBe(stores.length);
    expect(first.nextPage).toBe(2);

    const lastPage = Math.ceil(stores.length / PAGE_SIZE);
    const last = await listStores({ search: '', near: null, page: lastPage });
    expect(last.nextPage).toBeNull();
  });

  it('never returns the same store twice across pages', async () => {
    const ids = new Set<string>();
    let page: number | null = 1;
    while (page) {
      const result = await listStores({ search: '', near: null, page });
      result.items.forEach((store) => ids.add(store.id));
      page = result.nextPage;
    }
    expect(ids.size).toBe(stores.length);
  });

  it('searches by name, ignoring case and accents', async () => {
    const result = await listStores({ search: 'LAUZIERE', near: null, page: 1 });
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((store) => normalize(store.name).includes('lauziere'))).toBe(true);
  });

  it('matches every word of the query, across name and city', async () => {
    const result = await listStores({ search: 'fauvel lyon', near: null, page: 1 });
    expect(result.items.map((store) => store.name)).toEqual(
      expect.arrayContaining(['Fauvel Vieux Lyon', 'Fauvel Part-Dieu']),
    );
    expect(result.items.every((store) => store.brandId === 'fauvel' && store.city === 'Lyon')).toBe(
      true,
    );
  });

  it('sorts by distance when a position is given', async () => {
    const result = await listStores({ search: '', near: paris, page: 1 });
    expect(result.items[0]?.name).toBe('Lestrade Opéra');
  });

  it('reports an unknown store as not found', async () => {
    await expect(getStore('does-not-exist')).rejects.toEqual(new ApiError('notFound'));
  });

  it('fails with an offline error when the device has no connection', async () => {
    jest.mocked(NetInfo.fetch).mockResolvedValueOnce({ isConnected: false } as never);
    await expect(listStores({ search: '', near: null, page: 1 })).rejects.toMatchObject({
      kind: 'offline',
    });
  });
});
