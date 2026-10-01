import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { Appearance } from 'react-native';
import { Provider } from 'react-redux';

import i18n, { initI18n } from '@/i18n';
import { locationRefreshed } from '@/features/location/locationSlice';
import { store } from '@/store';
import { startAppListeners } from '@/store/appListeners';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/theme/useTheme';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 200 });

const { language, appearance } = store.getState().preferences;
initI18n(language);
Appearance.setColorScheme(appearance === 'system' ? 'unspecified' : appearance);
startAppListeners(store);
store.dispatch(locationRefreshed());

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

function RootNavigator() {
  const { scheme, colors } = useTheme();
  const { language, appearance, onboardingCompleted } = useAppSelector(
    (state) => state.preferences,
  );

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    Appearance.setColorScheme(appearance === 'system' ? 'unspecified' : appearance);
  }, [appearance]);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.background,
        card: colors.background,
        text: colors.textPrimary,
        border: colors.separator,
      },
    };
  }, [scheme, colors]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={onboardingCompleted}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="store-map/[id]"
            options={{ presentation: 'modal', headerShown: true, headerShadowVisible: false }}
          />
          {/* A page sheet on iOS, a full-screen modal on Android, each with its
              own native stack for the About pages. */}
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!onboardingCompleted}>
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
