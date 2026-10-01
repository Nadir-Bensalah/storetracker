import { fr } from './fr';

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Translations = Widen<typeof fr>;

export const languages = ['fr', 'en'] as const;
export type Language = (typeof languages)[number];

export const languageNames: Record<Language, string> = {
  fr: 'Français',
  en: 'English',
};

// Used by Intl for dates, times, numbers and distances.
export const localeTags: Record<Language, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
};
