import NetInfo from '@react-native-community/netinfo';
import { setupListeners } from '@reduxjs/toolkit/query';
import { AppState } from 'react-native';

import { locationRefreshed } from '@/features/location/locationSlice';

import type { AppStore } from './index';

// RTK Query's default listeners rely on browser events. On mobile, connectivity
// comes from NetInfo and focus from AppState. Coming back to the app also
// re-reads the location permission, which may have changed in the system settings.
export function startAppListeners(store: AppStore) {
  return setupListeners(
    store.dispatch,
    (dispatch, { onOnline, onOffline, onFocus, onFocusLost }) => {
      const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        dispatch(state.isConnected === false ? onOffline() : onOnline());
      });
      const appState = AppState.addEventListener('change', (status) => {
        if (status === 'active') {
          dispatch(onFocus());
          store.dispatch(locationRefreshed());
        } else {
          dispatch(onFocusLost());
        }
      });
      return () => {
        unsubscribeNetInfo();
        appState.remove();
      };
    },
  );
}
