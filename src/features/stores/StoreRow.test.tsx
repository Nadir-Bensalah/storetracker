import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { selectIsFavorite } from '@/features/favorites/favoritesSlice';
import { renderWithStore } from '@/test/render';

import { stores } from './data/stores';
import { StoreRow } from './StoreRow';

const store = stores[0]!;
const status = { label: 'Ouvert jusqu’à 19:30', tone: 'success' as const };

describe('StoreRow', () => {
  it('exposes one complete label to screen readers', async () => {
    await renderWithStore(<StoreRow store={store} status={status} distance="240 m" tab="stores" />);
    expect(
      screen.getByRole('button', {
        name: 'Lestrade Opéra, 24 boulevard Haussmann, Paris, Ouvert jusqu’à 19:30, 240 m',
      }),
    ).toBeOnTheScreen();
  });

  it('opens the store it represents, in the tab it belongs to', async () => {
    await renderWithStore(<StoreRow store={store} status={status} tab="favorites" />);
    // The accessible element is the wrapper; the press lands on its content.
    await fireEvent.press(screen.getByText('Lestrade Opéra'));
    expect(router.push).toHaveBeenCalledWith(`/favorites/${store.id}`);
  });

  it('toggles the favorite without opening the store', async () => {
    jest.mocked(router.push).mockClear();
    const { store: appStore } = await renderWithStore(
      <StoreRow store={store} status={status} tab="stores" />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Ajouter aux favoris' }));

    expect(selectIsFavorite(appStore.getState(), store.id)).toBe(true);
    expect(screen.getByRole('button', { name: 'Retirer des favoris' })).toBeSelected();
    expect(router.push).not.toHaveBeenCalled();
  });
});
