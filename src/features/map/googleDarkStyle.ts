import type { MapStyleElement } from 'react-native-maps';

// Google Maps has no automatic dark mode on Android; Apple Maps follows the
// system appearance on its own. Palette derived from Google's "Night" style.
export const googleDarkStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d1e21' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8f8a83' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1e21' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2d31' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212226' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3b40' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#26272b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#14181f' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e5560' }] },
];
