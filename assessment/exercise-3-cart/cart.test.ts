import type { Storage } from 'redux-persist';

import {
  cartReducer,
  itemAdded,
  itemRemoved,
  MAX_QUANTITY,
  quantityUpdated,
  selectCartCount,
  selectCartLines,
  selectCartTotal,
} from './cartSlice';
import { createCartStore } from './store';

const shirt = { id: 'shirt', name: 'Chemise', unitPrice: 4990 };
const socks = { id: 'socks', name: 'Chaussettes', unitPrice: 1250 };

const reduce = (...actions: Parameters<typeof cartReducer>[1][]) => ({
  cart: actions.reduce(cartReducer, cartReducer(undefined, { type: 'init' })),
});

function memoryStorage(): Storage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: async (key: string) => data.get(key) ?? null,
    setItem: async (key: string, value: string) => void data.set(key, value),
    removeItem: async (key: string) => void data.delete(key),
  };
}

describe('cart reducer', () => {
  it('adds an item, and merges quantities when it is already in the cart', () => {
    const state = reduce(itemAdded({ product: shirt }), itemAdded({ product: shirt, quantity: 2 }));
    expect(state.cart.lines.shirt?.quantity).toBe(3);
    expect(selectCartLines(state)).toHaveLength(1);
  });

  it('removes an item', () => {
    const state = reduce(itemAdded({ product: shirt }), itemRemoved('shirt'));
    expect(selectCartLines(state)).toEqual([]);
  });

  it('updates a quantity, removes the line at 0 and caps it', () => {
    let state = reduce(
      itemAdded({ product: shirt }),
      quantityUpdated({ productId: 'shirt', quantity: 4 }),
    );
    expect(state.cart.lines.shirt?.quantity).toBe(4);

    state = {
      cart: cartReducer(state.cart, quantityUpdated({ productId: 'shirt', quantity: 500 })),
    };
    expect(state.cart.lines.shirt?.quantity).toBe(MAX_QUANTITY);

    state = { cart: cartReducer(state.cart, quantityUpdated({ productId: 'shirt', quantity: 0 })) };
    expect(state.cart.lines.shirt).toBeUndefined();
  });

  it('ignores a quantity update for an item that is not in the cart', () => {
    const before = reduce(itemAdded({ product: shirt }));
    const after = cartReducer(before.cart, quantityUpdated({ productId: 'socks', quantity: 3 }));
    expect(after).toBe(before.cart);
  });

  it('never mutates the previous state', () => {
    const before = reduce(itemAdded({ product: shirt }));
    const snapshot = JSON.stringify(before);
    cartReducer(before.cart, itemAdded({ product: shirt }));
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});

describe('selectors', () => {
  it('computes the total in cents and the item count', () => {
    const state = reduce(
      itemAdded({ product: shirt, quantity: 2 }),
      itemAdded({ product: socks, quantity: 3 }),
    );
    expect(selectCartTotal(state)).toBe(2 * 4990 + 3 * 1250);
    expect(selectCartCount(state)).toBe(5);
  });

  it('memoises the total: same input, no recomputation', () => {
    const state = reduce(itemAdded({ product: shirt }));
    selectCartTotal.resetRecomputations();

    selectCartTotal(state);
    selectCartTotal(state);
    selectCartTotal({ cart: { ...state.cart } }); // new root, same `lines` reference

    expect(selectCartTotal.recomputations()).toBe(1);
  });
});

function bootstrapped({ persistor }: ReturnType<typeof createCartStore>) {
  return new Promise<void>((resolve) => {
    if (persistor.getState().bootstrapped) return resolve();
    const unsubscribe = persistor.subscribe(() => {
      if (persistor.getState().bootstrapped) {
        unsubscribe();
        resolve();
      }
    });
  });
}

describe('persistence', () => {
  // persistReducer arms a 5 s rehydration timeout; fake timers keep it from
  // outliving the test.
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('writes the cart to storage and restores it in a new store', async () => {
    const storage = memoryStorage();
    const first = createCartStore(storage);
    await bootstrapped(first);
    first.store.dispatch(itemAdded({ product: shirt, quantity: 2 }));
    await first.persistor.flush();

    const second = createCartStore(storage);
    await bootstrapped(second);

    expect(selectCartTotal(second.store.getState())).toBe(2 * 4990);
  });
});
