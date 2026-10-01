import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Language } from '@/i18n/resources';

export type AppearancePreference = 'system' | 'light' | 'dark';

export interface PreferencesState {
  language: Language;
  appearance: AppearancePreference;
  onboardingCompleted: boolean;
}

export function initialPreferences(language: Language): PreferencesState {
  return { language, appearance: 'system', onboardingCompleted: false };
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: initialPreferences('fr'),
  reducers: {
    languageChanged(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    appearanceChanged(state, action: PayloadAction<AppearancePreference>) {
      state.appearance = action.payload;
    },
    onboardingCompleted(state) {
      state.onboardingCompleted = true;
    },
    onboardingReset(state) {
      state.onboardingCompleted = false;
    },
  },
});

export const { languageChanged, appearanceChanged, onboardingCompleted, onboardingReset } =
  preferencesSlice.actions;
export default preferencesSlice.reducer;
