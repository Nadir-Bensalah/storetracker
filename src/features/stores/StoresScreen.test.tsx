import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { renderWithStore } from '@/test/render';

import { mockServerConfig, PAGE_SIZE } from './api/mockServer';
import { StoresScreen } from './StoresScreen';

afterEach(() => {
  mockServerConfig.errorRate = 0;
});

describe('StoresScreen', () => {
  it('shows a skeleton, then the first page of stores', async () => {
    await renderWithStore(<StoresScreen />);

    expect(screen.getByRole('progressbar', { name: 'Chargement…' })).toBeOnTheScreen();
    expect(await screen.findByText('Fauvel Abbesses')).toBeOnTheScreen();
    expect(screen.getByText('120 magasins')).toBeOnTheScreen();
  });

  it('loads the next page when the end of the list is reached', async () => {
    const { store } = await renderWithStore(<StoresScreen />);
    await screen.findByText('Fauvel Abbesses');
    const loadedStores = () =>
      Object.values(store.getState().storesApi.queries).flatMap((query) =>
        query?.endpointName === 'getStores'
          ? (query.data as { pages: { items: unknown[] }[] }).pages.flatMap((page) => page.items)
          : [],
      );
    expect(loadedStores()).toHaveLength(PAGE_SIZE);

    await act(() => screen.getByTestId('stores-list').props.onEndReached());

    await waitFor(() => expect(loadedStores()).toHaveLength(PAGE_SIZE * 2));
  });

  it('offers a retry when the API fails, and recovers', async () => {
    mockServerConfig.errorRate = 1;
    await renderWithStore(<StoresScreen />);

    expect(await screen.findByText('Impossible de charger les magasins')).toBeOnTheScreen();

    mockServerConfig.errorRate = 0;
    await fireEvent.press(screen.getByRole('button', { name: 'Réessayer' }));

    expect(await screen.findByText('Fauvel Abbesses')).toBeOnTheScreen();
  });

  it('opens the detail of the pressed store', async () => {
    await renderWithStore(<StoresScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: /^Fauvel Abbesses/ }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/stores/21'));
  });

  it('opens the search screen from the hero', async () => {
    await renderWithStore(<StoresScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Rechercher un magasin' }));
    expect(router.push).toHaveBeenCalledWith('/stores/search');
  });
});
