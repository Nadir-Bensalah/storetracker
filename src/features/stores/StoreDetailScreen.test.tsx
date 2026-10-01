import NetInfo from '@react-native-community/netinfo';
import { fireEvent, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { renderWithStore } from '@/test/render';

import { stores } from './data/stores';
import { StoreDetailScreen } from './StoreDetailScreen';

const store = stores[0]!;

beforeEach(() => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: store.id });
});

describe('StoreDetailScreen', () => {
  it('loads the store, then shows its address, services and phone', async () => {
    await renderWithStore(<StoreDetailScreen />);

    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    expect(await screen.findByRole('header', { name: 'Lestrade Opéra' })).toBeOnTheScreen();
    expect(screen.getByText('24 boulevard Haussmann, 75009 Paris')).toBeOnTheScreen();
    expect(screen.getByText('Click & Collect')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: `Téléphone, ${store.phone}` })).toBeOnTheScreen();
  });

  it('expands the opening hours to the whole week', async () => {
    await renderWithStore(<StoreDetailScreen />);
    const hours = await screen.findByRole('button', { name: /^Horaires/ });

    expect(screen.queryByText('dimanche')).toBeNull();
    await fireEvent.press(hours);

    expect(screen.getByText('dimanche')).toBeOnTheScreen();
    expect(hours).toBeExpanded();
  });

  it('falls back to the favorite snapshot when offline', async () => {
    jest.mocked(NetInfo.fetch).mockResolvedValueOnce({ isConnected: false } as never);
    await renderWithStore(<StoreDetailScreen />, {
      favorites: { ids: [store.id], byId: { [store.id]: store } },
    });

    expect(await screen.findByText(/Hors connexion : informations enregistrées/)).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Lestrade Opéra' })).toBeOnTheScreen();
  });

  it('says so when the store does not exist', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: 'unknown' });
    await renderWithStore(<StoreDetailScreen />);
    expect(await screen.findByText('Magasin introuvable')).toBeOnTheScreen();
  });
});

it('renders a favorite whose saved photo ids no longer exist', async () => {
  jest.mocked(NetInfo.fetch).mockResolvedValueOnce({ isConnected: false } as never);
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: store.id });
  const stale = { ...store, photos: ['interieur-lestrade' as never] };
  await renderWithStore(<StoreDetailScreen />, {
    favorites: { ids: [store.id], byId: { [store.id]: stale } },
  });

  expect(await screen.findByRole('header', { name: store.name })).toBeOnTheScreen();
});
