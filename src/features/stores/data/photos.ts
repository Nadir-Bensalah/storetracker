// Fictional storefronts generated for this demo. `thumb` variants are 480px
// wide for lists, the full ones 1200px for the detail gallery.
export const photos = {
  'lestrade-paris': {
    full: require('../../../../assets/images/stores/lestrade-paris.webp'),
    thumb: require('../../../../assets/images/stores/lestrade-paris-thumb.webp'),
  },
  'lestrade-lyon': {
    full: require('../../../../assets/images/stores/lestrade-lyon.webp'),
    thumb: require('../../../../assets/images/stores/lestrade-lyon-thumb.webp'),
  },
  'lestrade-interior': {
    full: require('../../../../assets/images/stores/lestrade-interior.webp'),
    thumb: require('../../../../assets/images/stores/lestrade-interior-thumb.webp'),
  },
  'fauvel-librairie': {
    full: require('../../../../assets/images/stores/fauvel-librairie.webp'),
    thumb: require('../../../../assets/images/stores/fauvel-librairie-thumb.webp'),
  },
  'fauvel-galerie': {
    full: require('../../../../assets/images/stores/fauvel-galerie.webp'),
    thumb: require('../../../../assets/images/stores/fauvel-galerie-thumb.webp'),
  },
  'fauvel-interior': {
    full: require('../../../../assets/images/stores/fauvel-interior.webp'),
    thumb: require('../../../../assets/images/stores/fauvel-interior-thumb.webp'),
  },
  'hollier-showroom': {
    full: require('../../../../assets/images/stores/hollier-showroom.webp'),
    thumb: require('../../../../assets/images/stores/hollier-showroom-thumb.webp'),
  },
  'hollier-interior': {
    full: require('../../../../assets/images/stores/hollier-interior.webp'),
    thumb: require('../../../../assets/images/stores/hollier-interior-thumb.webp'),
  },
  'lauziere-alpes': {
    full: require('../../../../assets/images/stores/lauziere-alpes.webp'),
    thumb: require('../../../../assets/images/stores/lauziere-alpes-thumb.webp'),
  },
  'rambert-parfumerie': {
    full: require('../../../../assets/images/stores/rambert-parfumerie.webp'),
    thumb: require('../../../../assets/images/stores/rambert-parfumerie-thumb.webp'),
  },
  'gautrand-epicerie': {
    full: require('../../../../assets/images/stores/gautrand-epicerie.webp'),
    thumb: require('../../../../assets/images/stores/gautrand-epicerie-thumb.webp'),
  },
  'gautrand-marche': {
    full: require('../../../../assets/images/stores/gautrand-marche.webp'),
    thumb: require('../../../../assets/images/stores/gautrand-marche-thumb.webp'),
  },
  'gautrand-interior': {
    full: require('../../../../assets/images/stores/gautrand-interior.webp'),
    thumb: require('../../../../assets/images/stores/gautrand-interior-thumb.webp'),
  },
  'thevenot-lyon': {
    full: require('../../../../assets/images/stores/thevenot-lyon.webp'),
    thumb: require('../../../../assets/images/stores/thevenot-lyon-thumb.webp'),
  },
} as const;

export type PhotoId = keyof typeof photos;

export function isPhotoId(id: string): id is PhotoId {
  return id in photos;
}

/** Keeps only the ids that exist; a snapshot saved by an older build may carry renamed ones. */
export function knownPhotos(ids: readonly string[]): PhotoId[] {
  return ids.filter(isPhotoId);
}
