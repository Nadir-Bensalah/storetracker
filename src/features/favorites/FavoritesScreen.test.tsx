import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { stores } from '@/features/stores/data/stores';
import { renderWithStore } from '@/test/render';

import { FavoritesScreen } from './FavoritesScreen';

const store = stores[0]!;

describe('FavoritesScreen', () => {
  it('explains the empty state and leads back to the stores', async () => {
    await renderWithStore(<FavoritesScreen />);

    expect(screen.getByText('Pas encore de favori')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Parcourir les magasins' }));
    expect(router.navigate).toHaveBeenCalledWith('/stores');
  });

  it('lists saved stores from local state, without any network call', async () => {
    await renderWithStore(<FavoritesScreen />, {
      favorites: { ids: [store.id], byId: { [store.id]: store } },
    });

    expect(screen.getByText('Lestrade Opéra')).toBeOnTheScreen();
    expect(screen.getByText('1 magasin enregistré')).toBeOnTheScreen();
  });

  it('removes a store as soon as its heart is untoggled', async () => {
    await renderWithStore(<FavoritesScreen />, {
      favorites: { ids: [store.id], byId: { [store.id]: store } },
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Retirer des favoris' }));

    expect(screen.queryByText('Lestrade Opéra')).toBeNull();
    expect(screen.getByText('Pas encore de favori')).toBeOnTheScreen();
  });
});
