import { screen } from '@testing-library/react-native';

import { renderWithStore } from '@/test/render';

import { AboutDeveloperScreen } from './AboutDeveloperScreen';
import { developer } from './developer';

describe('AboutDeveloperScreen', () => {
  it('shows a link only when its value has been provided', async () => {
    await renderWithStore(<AboutDeveloperScreen />);

    expect(screen.getByRole('header', { name: developer.name })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'LinkedIn' }) !== null).toBe(
      !!developer.linkedInUrl,
    );
    expect(screen.queryByRole('button', { name: 'GitHub' }) !== null).toBe(!!developer.gitHubUrl);
    expect(screen.queryByRole('button', { name: 'Voir mes applications' }) !== null).toBe(
      developer.apps.length > 0,
    );
  });
});
