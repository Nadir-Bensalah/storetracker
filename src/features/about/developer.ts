// Filled in by the author before delivery. Empty values are simply not shown:
// nothing here is placeholder data presented as real.

export interface PublishedApp {
  name: string;
  /** One sentence at most, in French and English. */
  description?: { fr: string; en: string };
  appStoreUrl?: string;
  playStoreUrl?: string;
}

export const developer = {
  name: 'Nadir Ben Salah',
  initials: 'NB',
  publishedAppsCount: 8,
  email: null as string | null,
  linkedInUrl: null as string | null,
  gitHubUrl: null as string | null,
  websiteUrl: null as string | null,
  apps: [] as PublishedApp[],
};
