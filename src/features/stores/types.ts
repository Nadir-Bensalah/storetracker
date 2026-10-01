import type { PhotoId } from './data/photos';

export type BrandId =
  'lestrade' | 'fauvel' | 'hollier' | 'lauziere' | 'rambert' | 'gautrand' | 'thevenot';

export type ServiceId =
  'clickAndCollect' | 'reserveOnline' | 'inStoreReturns' | 'giftCards' | 'wheelchairAccess';

/** Minutes since midnight, local store time. */
export interface TimeRange {
  open: number;
  close: number;
}

/** Index 0 is Monday. An empty array means closed that day. */
export type WeeklyHours = [
  TimeRange[],
  TimeRange[],
  TimeRange[],
  TimeRange[],
  TimeRange[],
  TimeRange[],
  TimeRange[],
];

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Store {
  id: string;
  brandId: BrandId;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  coordinates: Coordinates;
  phone: string;
  timeZone: string;
  hours: WeeklyHours;
  services: ServiceId[];
  transit?: { mode: 'metro' | 'rer' | 'tram'; station: string };
  photos: PhotoId[];
}

export type StoreSort = 'distance' | 'name';

export interface StoresQuery {
  search: string;
  near: Coordinates | null;
}

export interface StoresPage {
  items: Store[];
  nextPage: number | null;
  total: number;
}
