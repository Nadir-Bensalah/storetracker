import type { BrandId, ServiceId, TimeRange, WeeklyHours } from '../types';

import type { PhotoId } from './photos';

export type Category = 'fashion' | 'books' | 'home' | 'outdoor' | 'beauty' | 'grocery' | 'shoes';

interface Brand {
  name: string;
  category: Category;
  hours: WeeklyHours;
  services: ServiceId[];
  photos: PhotoId[];
}

const toMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** `range('10:00-12:30, 14:00-19:00')` */
export function range(spec: string): TimeRange[] {
  if (spec === 'closed') return [];
  return spec.split(',').map((part) => {
    const [open = '', close = ''] = part.trim().split('-');
    return { open: toMinutes(open), close: toMinutes(close) };
  });
}

/** Monday first. */
export function week(...days: string[]): WeeklyHours {
  const [mon, tue, wed, thu, fri, sat, sun] = days.map(range);
  return [mon ?? [], tue ?? [], wed ?? [], thu ?? [], fri ?? [], sat ?? [], sun ?? []];
}

export const brands: Record<BrandId, Brand> = {
  lestrade: {
    name: 'Lestrade',
    category: 'fashion',
    hours: week(
      '10:00-19:30',
      '10:00-19:30',
      '10:00-19:30',
      '10:00-21:00',
      '10:00-19:30',
      '10:00-20:00',
      'closed',
    ),
    services: [
      'clickAndCollect',
      'reserveOnline',
      'inStoreReturns',
      'giftCards',
      'wheelchairAccess',
    ],
    photos: ['lestrade-paris', 'interieur-lestrade'],
  },
  fauvel: {
    name: 'Fauvel',
    category: 'books',
    hours: week(
      '14:00-19:00',
      '10:00-19:00',
      '10:00-19:00',
      '10:00-19:00',
      '10:00-19:00',
      '10:00-19:30',
      'closed',
    ),
    services: ['clickAndCollect', 'reserveOnline', 'giftCards'],
    photos: ['fauvel-librairie', 'interieur-fauvel'],
  },
  hollier: {
    name: 'Hollier',
    category: 'home',
    hours: week(
      '10:30-19:00',
      '10:30-19:00',
      '10:30-19:00',
      '10:30-19:00',
      '10:30-19:00',
      '10:00-19:30',
      '11:00-18:00',
    ),
    services: ['clickAndCollect', 'inStoreReturns', 'giftCards', 'wheelchairAccess'],
    photos: ['hollier-showroom', 'interieur-hollier'],
  },
  lauziere: {
    name: 'Lauzière',
    category: 'outdoor',
    hours: week(
      '09:30-12:30, 14:00-19:00',
      '09:30-12:30, 14:00-19:00',
      '09:30-12:30, 14:00-19:00',
      '09:30-12:30, 14:00-19:00',
      '09:30-12:30, 14:00-19:00',
      '09:00-19:00',
      'closed',
    ),
    services: ['clickAndCollect', 'reserveOnline', 'inStoreReturns'],
    photos: ['lauziere-alpes'],
  },
  rambert: {
    name: 'Rambert',
    category: 'beauty',
    hours: week(
      '10:00-20:00',
      '10:00-20:00',
      '10:00-20:00',
      '10:00-20:00',
      '10:00-20:00',
      '10:00-20:00',
      'closed',
    ),
    services: ['clickAndCollect', 'giftCards', 'wheelchairAccess'],
    photos: ['rambert-parfumerie'],
  },
  gautrand: {
    name: 'Gautrand',
    category: 'grocery',
    hours: week(
      'closed',
      '09:00-20:00',
      '09:00-20:00',
      '09:00-20:00',
      '09:00-20:00',
      '09:00-20:00',
      '09:00-13:00',
    ),
    services: ['clickAndCollect', 'giftCards'],
    photos: ['gautrand-epicerie', 'interieur-gautrand'],
  },
  thevenot: {
    name: 'Thévenot',
    category: 'shoes',
    hours: week(
      '14:00-19:00',
      '10:00-19:00',
      '10:00-19:00',
      '10:00-19:00',
      '10:00-19:00',
      '10:00-19:00',
      'closed',
    ),
    services: ['reserveOnline', 'inStoreReturns', 'wheelchairAccess'],
    photos: ['thevenot-lyon'],
  },
};
