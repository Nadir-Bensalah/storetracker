import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { storesApi } from '@/features/stores/api/storesApi';
import { type AppStore, createStore, type RootState } from '@/store';

const stores: AppStore[] = [];

// RTK Query keeps unused cache entries alive with timers; resetting the API
// state clears them so Jest can exit as soon as the tests are done.
afterEach(() => {
  stores.splice(0).forEach((store) => store.dispatch(storesApi.util.resetApiState()));
});

export async function renderWithStore(ui: React.ReactElement, preloadedState?: Partial<RootState>) {
  const store = createStore(preloadedState);
  stores.push(store);
  const result = await render(<Provider store={store}>{ui}</Provider>);
  return { store, ...result };
}
