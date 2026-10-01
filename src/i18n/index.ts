import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './en';
import { fr } from './fr';
import { type Language, languages } from './resources';

const i18n = createInstance();

export function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return languages.find((language) => language === code) ?? 'en';
}

export function initI18n(language: Language) {
  return i18n.use(initReactI18next).init({
    lng: language,
    fallbackLng: 'fr',
    resources: { fr: { translation: fr }, en: { translation: en } },
    interpolation: { escapeValue: false },
    initAsync: false,
  });
}

export default i18n;
