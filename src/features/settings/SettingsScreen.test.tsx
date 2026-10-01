import { fireEvent, screen } from '@testing-library/react-native';

import i18n from '@/i18n';
import { renderWithStore } from '@/test/render';

import { SettingsScreen } from './SettingsScreen';

afterEach(() => i18n.changeLanguage('fr'));

describe('SettingsScreen', () => {
  it('switches the language and stores the choice', async () => {
    const { store } = await renderWithStore(<SettingsScreen />);

    await fireEvent.press(screen.getByRole('radio', { name: 'English' }));

    expect(store.getState().preferences.language).toBe('en');
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
  });

  it('records the appearance preference', async () => {
    const { store } = await renderWithStore(<SettingsScreen />);

    await fireEvent.press(screen.getByRole('radio', { name: 'Sombre' }));

    expect(store.getState().preferences.appearance).toBe('dark');
    expect(screen.getByRole('radio', { name: 'Sombre' })).toBeChecked();
  });

  it('shows the location permission state with the matching action', async () => {
    await renderWithStore(<SettingsScreen />, {
      location: { permission: 'blocked', servicesEnabled: true, coordinates: null, status: 'idle' },
    });

    expect(
      screen.getByLabelText('Accès à la position, Refusée dans les réglages'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ouvrir les réglages' })).toBeOnTheScreen();
  });
});
