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
  'interieur-lestrade': {
    full: require('../../../../assets/images/stores/interieur-lestrade.webp'),
    thumb: require('../../../../assets/images/stores/interieur-lestrade-thumb.webp'),
  },
  'fauvel-librairie': {
    full: require('../../../../assets/images/stores/fauvel-librairie.webp'),
    thumb: require('../../../../assets/images/stores/fauvel-librairie-thumb.webp'),
  },
  'fauvel-galerie': {
    full: require('../../../../assets/images/stores/fauvel-galerie.webp'),
    thumb: require('../../../../assets/images/stores/fauvel-galerie-thumb.webp'),
  },
  'interieur-fauvel': {
    full: require('../../../../assets/images/stores/interieur-fauvel.webp'),
    thumb: require('../../../../assets/images/stores/interieur-fauvel-thumb.webp'),
  },
  'hollier-showroom': {
    full: require('../../../../assets/images/stores/hollier-showroom.webp'),
    thumb: require('../../../../assets/images/stores/hollier-showroom-thumb.webp'),
  },
  'interieur-hollier': {
    full: require('../../../../assets/images/stores/interieur-hollier.webp'),
    thumb: require('../../../../assets/images/stores/interieur-hollier-thumb.webp'),
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
  'interieur-gautrand': {
    full: require('../../../../assets/images/stores/interieur-gautrand.webp'),
    thumb: require('../../../../assets/images/stores/interieur-gautrand-thumb.webp'),
  },
  'thevenot-lyon': {
    full: require('../../../../assets/images/stores/thevenot-lyon.webp'),
    thumb: require('../../../../assets/images/stores/thevenot-lyon-thumb.webp'),
  },
} as const;

export type PhotoId = keyof typeof photos;
