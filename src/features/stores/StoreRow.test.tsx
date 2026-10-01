import { fireEvent, screen } from '@testing-library/react-native';

import { selectIsFavorite } from '@/features/favorites/favoritesSlice';
import { renderWithStore } from '@/test/render';

import { stores } from './data/stores';
import { StoreRow } from './StoreRow';

const store = stores[0]!;
const status = { label: 'Ouvert jusqu’à 19:30', tone: 'success' as const };

describe('StoreRow', () => {
  it('exposes one complete label to screen readers', async () => {
    await renderWithStore(
      <StoreRow store={store} status={status} distance="240 m" onPress={jest.fn()} />,
    );
    expect(
      screen.getByRole('button', {
        name: 'Lestrade Opéra, 24 boulevard Haussmann, Paris, Ouvert jusqu’à 19:30, 240 m',
      }),
    ).toBeOnTheScreen();
  });

  it('opens the store it represents', async () => {
    const onPress = jest.fn();
    await renderWithStore(<StoreRow store={store} status={status} onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: /Lestrade Opéra/ }));
    expect(onPress).toHaveBeenCalledWith(store);
  });

  it('toggles the favorite without opening the store', async () => {
    const onPress = jest.fn();
    const { store: appStore } = await renderWithStore(
      <StoreRow store={store} status={status} onPress={onPress} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Ajouter aux favoris' }));

    expect(selectIsFavorite(appStore.getState(), store.id)).toBe(true);
    expect(screen.getByRole('button', { name: 'Retirer des favoris' })).toBeSelected();
    expect(onPress).not.toHaveBeenCalled();
  });
});
