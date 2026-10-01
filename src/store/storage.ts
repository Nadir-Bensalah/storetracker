import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'storetracker' });

export function readJSON<T>(key: string): T | undefined {
  const raw = storage.getString(key);
  if (raw === undefined) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // A corrupted value must not prevent the app from starting.
    storage.remove(key);
    return undefined;
  }
}

export function writeJSON(key: string, value: unknown) {
  storage.set(key, JSON.stringify(value));
}
