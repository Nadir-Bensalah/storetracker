import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithStore } from '@/test/render';

import { mockServerConfig } from './api/mockServer';
import { SearchResults } from './SearchScreen';

afterEach(() => {
  mockServerConfig.errorRate = 0;
});

// The query comes from the native header search bar, which Jest does not
// render; the results list is tested with the debounced query it receives.
describe('SearchResults', () => {
  it('waits for a query before searching', async () => {
    await renderWithStore(<SearchResults query="" />);
    expect(screen.getByText('Tapez le nom d’une enseigne ou d’une ville.')).toBeOnTheScreen();
  });

  it('lists the stores matching the query, ignoring accents and case', async () => {
    await renderWithStore(<SearchResults query="GAUTRAND lices" />);
    expect(await screen.findByText('Gautrand Lices')).toBeOnTheScreen();
    expect(screen.getByText('1 magasin')).toBeOnTheScreen();
  });

  it('explains an empty result', async () => {
    await renderWithStore(<SearchResults query="zzz" />);
    expect(await screen.findByText('Aucun résultat pour « zzz »')).toBeOnTheScreen();
  });

  it('offers a retry when the search fails', async () => {
    mockServerConfig.errorRate = 1;
    await renderWithStore(<SearchResults query="Rambert" />);
    expect(await screen.findByText('Impossible de charger les magasins')).toBeOnTheScreen();

    mockServerConfig.errorRate = 0;
    await fireEvent.press(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText('Rambert Annecy')).toBeOnTheScreen();
  });
});
