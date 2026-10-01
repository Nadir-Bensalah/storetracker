import { cleanup, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { storesApi } from '@/features/stores/api/storesApi';
import { type AppStore, createStore, type RootState } from '@/store';

const stores: AppStore[] = [];

// Unmounting releases RTK Query subscriptions, which starts its cache timers;
// resetting the API state clears them.
afterEach(async () => {
  await cleanup();
  stores.splice(0).forEach((store) => store.dispatch(storesApi.util.resetApiState()));
});

// RTK Query also syncs subscriptions to the store (for DevTools) at most every
// 500 ms. Let the last sync run before Jest tears the environment down.
afterAll(() => new Promise((resolve) => setTimeout(resolve, 700)));

export async function renderWithStore(ui: React.ReactElement, preloadedState?: Partial<RootState>) {
  const store = createStore(preloadedState);
  stores.push(store);
  const result = await render(<Provider store={store}>{ui}</Provider>);
  return { store, ...result };
}
