import type { ConfigContext, ExpoConfig } from 'expo/config';

const paper = '#F7F4EF';
const ink = '#111215';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'StoreTracker',
  slug: 'storetracker',
  scheme: 'storetracker',
  version: '1.0.0',
  orientation: 'default',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  locales: {
    fr: './locales/fr.json',
    en: './locales/en.json',
  },
  ios: {
    bundleIdentifier: 'app.capmedia.storetracker',
    // Only needed to sign a build for a physical iPhone (see README).
    appleTeamId: process.env.APPLE_TEAM_ID,
    supportsTablet: true,
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
    },
  },
  android: {
    package: 'app.capmedia.storetracker',
    adaptiveIcon: {
      backgroundColor: ink,
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    blockedPermissions: ['ACCESS_BACKGROUND_LOCATION'],
    predictiveBackGestureEnabled: true,
  },
  plugins: [
    'expo-router',
    'expo-localization',
    'expo-image',
    ['expo-font', { fonts: ['./assets/fonts/Newsreader16pt-Medium.ttf'] }],
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 96,
        backgroundColor: paper,
        dark: { image: './assets/splash-icon-dark.png', backgroundColor: ink },
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'StoreTracker uses your location to show nearby stores and their distance. It is never stored or shared.',
        // Foreground only: false removes the keys the plugin would add by default.
        locationAlwaysAndWhenInUsePermission: false,
        locationAlwaysPermission: false,
        motionUsagePermission: false,
        isIosBackgroundLocationEnabled: false,
        isAndroidBackgroundLocationEnabled: false,
      },
    ],
    ['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY }],
    // Builds made with Xcode 27 crash at launch without the UIScene life cycle.
    // No effect with Xcode 26; becomes the default in SDK 58.
    ['expo-build-properties', { ios: { enableSceneSupport: true } }],
  ],
  extra: {
    hasGoogleMapsKey: Boolean(process.env.GOOGLE_MAPS_ANDROID_API_KEY),
  },
  experiments: {
    typedRoutes: true,
  },
});
