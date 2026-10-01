import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  /** In cents, to avoid floating-point rounding on totals. */
  unitPrice: number;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface CartState {
  /** Lines keyed by product id: O(1) updates, no duplicate lines possible. */
  lines: Record<string, CartLine>;
}

const initialState: CartState = { lines: {} };

export const MAX_QUANTITY = 99;

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Immer lets reducers "mutate" a draft; Redux still receives a new object.
    itemAdded(state, action: PayloadAction<{ product: Product; quantity?: number }>) {
      const { product, quantity = 1 } = action.payload;
      const line = state.lines[product.id];
      if (line) {
        line.quantity = Math.min(line.quantity + quantity, MAX_QUANTITY);
      } else {
        state.lines[product.id] = { product, quantity: Math.min(quantity, MAX_QUANTITY) };
      }
    },
    itemRemoved(state, action: PayloadAction<string>) {
      delete state.lines[action.payload];
    },
    quantityUpdated(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const { productId, quantity } = action.payload;
      const line = state.lines[productId];
      if (!line) return;
      if (quantity <= 0) {
        delete state.lines[productId];
      } else {
        line.quantity = Math.min(Math.floor(quantity), MAX_QUANTITY);
      }
    },
    cartCleared() {
      return initialState;
    },
  },
});

export const { itemAdded, itemRemoved, quantityUpdated, cartCleared } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

type StateWithCart = { cart: CartState };

const selectLines = (state: StateWithCart) => state.cart.lines;

// Memoised: recomputed only when `lines` changes, and returns the same array
// reference otherwise, so components using it do not re-render for nothing.
export const selectCartLines = createSelector([selectLines], (lines) => Object.values(lines));

export const selectCartTotal = createSelector([selectCartLines], (lines) =>
  lines.reduce((total, line) => total + line.product.unitPrice * line.quantity, 0),
);

export const selectCartCount = createSelector([selectCartLines], (lines) =>
  lines.reduce((count, line) => count + line.quantity, 0),
);
