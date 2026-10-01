import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as Location from 'expo-location';

import type { Coordinates } from '@/features/stores/types';

export type LocationPermission = 'unknown' | 'granted' | 'denied' | 'blocked';

export interface LocationState {
  permission: LocationPermission;
  servicesEnabled: boolean;
  coordinates: Coordinates | null;
  status: 'idle' | 'locating' | 'unavailable';
}

const initialState: LocationState = {
  permission: 'unknown',
  servicesEnabled: true,
  coordinates: null,
  status: 'idle',
};

function toPermission(response: Location.LocationPermissionResponse): LocationPermission {
  if (response.granted) return 'granted';
  if (response.status === Location.PermissionStatus.UNDETERMINED) return 'unknown';
  // Android and iOS both stop showing the system prompt after a refusal; from
  // then on only the system settings can grant it.
  return response.canAskAgain ? 'denied' : 'blocked';
}

// Rounded to ~100 m: precise enough for distances, and stable enough not to
// invalidate the cached store list every time the GPS fix moves a few metres.
const round = (value: number) => Math.round(value * 1000) / 1000;

const POSITION_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Location timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Reads the position once permission is granted. Never blocks the UI: callers don't await it. */
export const positionRead = createAsyncThunk('location/positionRead', async () => {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) return { servicesEnabled, coordinates: null };
  // Both calls can stall without a GPS fix (seen on Android emulators), hence one overall timeout.
  const position = await withTimeout(
    Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 }).then(
      (lastKnown) =>
        lastKnown ?? Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    ),
    POSITION_TIMEOUT_MS,
  );
  return {
    servicesEnabled,
    coordinates: {
      latitude: round(position.coords.latitude),
      longitude: round(position.coords.longitude),
    },
  };
});

/** Reads the current permission without prompting; locates if already granted. */
export const locationRefreshed = createAsyncThunk('location/refreshed', async (_, { dispatch }) => {
  const permission = toPermission(await Location.getForegroundPermissionsAsync());
  if (permission === 'granted') dispatch(positionRead());
  return permission;
});

/** Shows the system permission prompt. Only called after an explicit user action. */
export const locationRequested = createAsyncThunk('location/requested', async (_, { dispatch }) => {
  const permission = toPermission(await Location.requestForegroundPermissionsAsync());
  if (permission === 'granted') dispatch(positionRead());
  return permission;
});

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(locationRefreshed.fulfilled, (state, action) => {
        state.permission = action.payload;
      })
      .addCase(locationRequested.fulfilled, (state, action) => {
        state.permission = action.payload;
      })
      .addCase(positionRead.pending, (state) => {
        state.status = 'locating';
      })
      .addCase(positionRead.fulfilled, (state, action) => {
        state.servicesEnabled = action.payload.servicesEnabled;
        state.coordinates = action.payload.coordinates ?? state.coordinates;
        state.status = action.payload.coordinates ? 'idle' : 'unavailable';
      })
      .addCase(positionRead.rejected, (state) => {
        state.status = 'unavailable';
      });
  },
});

export default locationSlice.reducer;
