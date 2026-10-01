# StoreTracker

Trouver un magasin, voir s'il est ouvert, savoir à quelle distance il est, le garder en favori. Une application iOS et Android en React Native (Expo), réalisée pour le test technique React Native Senior de WSHOP.

> Démonstration technique. Les enseignes, magasins, horaires et numéros de téléphone sont fictifs. Les photos de façades ont été générées pour ce projet.

Ce dépôt contient aussi les réponses aux parties 1 et 2 du test : [QCM et exercices](assessment/README.md).

---

## Essayer l'application

| Plateforme | Le plus rapide | En compilant |
|---|---|---|
| Android | Installer l'APK de la [dernière release](../../releases) | `npx expo run:android` |
| iOS | Glisser `StoreTracker.app` de la release sur un simulateur | `npx expo run:ios` |

## Prérequis

- Node.js 22.13 ou plus (`.nvmrc`)
- iOS : macOS, Xcode 26 ou 27, CocoaPods
- Android : Android Studio, JDK 17, un émulateur ou un appareil

## Installation et lancement

```sh
npm ci
cp .env.example .env.local     # voir « Variables d'environnement »
npx expo run:ios               # ou : npx expo run:android
```

`expo run` génère les projets natifs (`ios/`, `android/`), compile, installe et démarre Metro. Ces dossiers ne sont pas versionnés : ils sont recréés depuis `app.config.ts`.

## Variables d'environnement

| Variable | Rôle | Défaut |
|---|---|---|
| `GOOGLE_MAPS_ANDROID_API_KEY` | Carte Google sur Android. Sans elle, la carte est remplacée par un message (iOS utilise Apple Plans, sans clé). | vide |
| `EXPO_PUBLIC_API_LATENCY_MS` | Latence simulée de l'API fictive | `600` |
| `EXPO_PUBLIC_API_ERROR_RATE` | Probabilité d'échec d'un appel, de 0 à 1, pour voir les états d'erreur | `0` |
| `APPLE_TEAM_ID` | Équipe Apple, seulement pour installer sur un iPhone physique | vide |

`.env.local` n'est jamais versionné ; un contrôle en CI le vérifie.

## Vérifier le projet

```sh
npm run check      # lint, typage strict, tests (application et exercices)
```

La même commande tourne en CI sur chaque push.

---

## Couverture du sujet

| Exigence | Où |
|---|---|
| Liste de 50 magasins minimum, API ou mock | 120 magasins, API simulée : `src/features/stores/data`, `src/features/stores/api` |
| Filtrage par nom | Champ de recherche de l'accueil, anti-rebond, recherche côté serveur, insensible aux accents |
| Infinite scroll | Pages de 20 : `StoresScreen.tsx` (`onEndReached`), `storesApi.ts` (`infiniteQuery`) |
| Détail : MapView | `src/features/map/StoreMap.tsx` |
| Détail : horaires | `OpeningHoursRow.tsx` : aujourd'hui, puis la semaine dépliable |
| Détail : bouton Favori | En-tête du détail, lignes de liste, cartes « Autour de vous » |
| Favoris persistés localement | MMKV : `src/store/persistence.ts` |
| Tab Navigator (Liste, Favoris) | `src/app/(tabs)/_layout.tsx` (onglets natifs) |
| Stack Navigator pour le détail | `src/app/(tabs)/stores/_layout.tsx`, `src/app/(tabs)/favorites/_layout.tsx` |
| TypeScript strict | `strict` et `noUncheckedIndexedAccess`, aucun `any` |
| Performance, mémoïsation, FlatList | [Décision 7](docs/TECHNICAL-DECISIONS.md#7-la-flatlist-de-laccueil) |
| États de chargement et d'erreur | Squelettes, erreur et réessai, liste vide, hors ligne, fin de liste |
| Tests unitaires, 3 composants minimum | 9 suites pour l'app, dont 6 sur des composants et écrans |
| Accessibilité, retour visuel, responsive | Sections ci-dessous |
| README, installation, variables, choix techniques | Ce fichier et [docs/TECHNICAL-DECISIONS.md](docs/TECHNICAL-DECISIONS.md) |

## Architecture

```
src/
  app/            routes Expo Router : chaque fichier ne fait qu'importer un écran
  features/
    stores/       accueil, détail, données, API simulée, horaires
    favorites/    slice, écran, bouton favori
    location/     permission et position
    map/          carte et style sombre Android
    settings/     préférences et écran de réglages
    onboarding/   accueil en deux étapes
  store/          store Redux, persistance MMKV, écouteurs réseau et premier plan
  theme/          tokens clair et sombre, typographie
  i18n/           français, anglais, formatage
  ui/             composants partagés : texte, bouton, icône, squelette, états
assessment/       QCM et exercices du test
```

Le code est organisé par fonctionnalité. Ce qui sert à plusieurs fonctionnalités va dans `ui/`, `theme/` ou `i18n/`. Il n'y a pas de dossier `utils/` ni de fichiers `index.ts` de réexport.

## Choix techniques

Le détail, avec les alternatives et les compromis, est dans [docs/TECHNICAL-DECISIONS.md](docs/TECHNICAL-DECISIONS.md). En résumé :

- **Expo SDK 57**, Expo Router et des builds de développement. Pas d'Expo Go, qui ne supporte qu'un SDK à la fois.
- **Navigation native** : `UITabBarController` sur iOS (Liquid Glass sur iOS 26+), barre Material 3 sur Android, une pile native par onglet.
- **Redux Toolkit et RTK Query** : cache paginé, réponses périmées ignorées, réessai, et des favoris qui ne re-rendent que la ligne concernée.
- **MMKV** lu de façon synchrone : thème, langue et favoris sont là avant le premier rendu, sans `PersistGate`.
- **Favoris en instantanés** : ils restent lisibles hors ligne.
- **API simulée** avec latence, erreurs, hors ligne, pagination et recherche côté serveur.

## Au-delà du sujet

Chaque ajout répond à une question qu'un client se pose devant un magasin.

| Ajout | Pourquoi |
|---|---|
| Ouvert, ferme bientôt, fermé, prochaine ouverture | La première question avant de se déplacer. Calculé dans le fuseau du magasin. |
| Distance, tri par proximité, « Autour de vous » | C'est le cœur d'un localisateur de magasins |
| Services (Click & Collect, e-réservation, retours, PMR) | Affichés, sans faux parcours d'achat |
| Itinéraire, appel, partage | Passent la main aux apps du système |
| Clair, sombre, système | Préférence persistante, appliquée aussi aux composants natifs |
| Français et anglais | Choisi à l'onboarding, modifiable dans les réglages |
| Hors ligne | Bandeau discret, favoris et leur détail disponibles sans réseau |

Volontairement écartés : un tableau de bord d'indicateurs, un parcours de réservation et une disponibilité produit, qui auraient éloigné l'app de son sujet ou présenté de fausses données comme réelles.

## Tests

```sh
npm test
```

- **Logique** : horaires (pause déjeuner, minute de fermeture, jours fermés, fuseau horaire), distances, API simulée (pagination sans doublon, recherche, tri, hors ligne), favoris et leur persistance.
- **Écrans** : accueil (squelette, pagination, recherche vide, erreur puis réessai, navigation), détail (chargement, horaires dépliables, instantané hors ligne, magasin introuvable), favoris, réglages, ligne de magasin.
- Pas de snapshot, pas de `setTimeout`. Les modules natifs sont mockés une seule fois dans `jest.setup.tsx`.

## Accessibilité

- Chaque ligne de magasin est un seul élément lu : nom, adresse, statut, distance. Le bouton favori reste séparé, avec son état « sélectionné », et son changement est annoncé.
- Le statut n'est jamais porté par la couleur seule : le texte le dit, la pastille le renforce.
- Cibles tactiles de 44 pt sur iOS et 48 dp sur Android.
- Tailles de texte dynamiques respectées : aucune hauteur de ligne n'est figée.
- Réduction des animations respectée : les squelettes ne pulsent plus, les dépliages ne s'animent plus.
- La carte n'est jamais la seule source d'information : adresse en texte et bouton d'itinéraire.

## Expérience native

| | iOS | Android |
|---|---|---|
| Onglets | `UITabBarController`, Liquid Glass sur iOS 26+ | Barre de navigation Material 3 |
| Piles | `UINavigationController`, retour par glissement | Pile native, retour système et prédictif |
| Réglages | Feuille native avec poignée et crans | Feuille Material |
| Choix uniques | Coche, comme dans Réglages | Boutons radio |
| Retour tactile | Haptique d'impact | Haptique système (`performHapticFeedback`) et ripple |
| Carte | Apple Plans | Google Maps, style sombre fourni |
| Icônes | SF Symbols | Material Symbols |
| Demande de position | Alerte système, texte traduit | Boîte de dialogue système |

Aucun composant système n'est imité en JavaScript.

Il n'y a pas de module Swift ou Kotlin : aucun besoin du produit ne le justifiait. La [décision 13](docs/TECHNICAL-DECISIONS.md#13-pas-de-module-swift-ou-kotlin) cite deux cas où j'en écrirais un.

## Développement assisté par IA

J'ai développé ce projet avec Claude Code, comme je travaille au quotidien. L'outil a accéléré l'exploration, l'écriture du code et des tests et la rédaction. Les choix d'architecture et de produit, la relecture de chaque changement et la vérification sur iOS et Android sont de mon fait.

Je considère que savoir utiliser ces outils fait partie du métier aujourd'hui, à une condition : comprendre et assumer chaque ligne livrée. Je peux expliquer n'importe quelle partie de ce dépôt.

## Crédits

- Police Newsreader, Production Type, licence SIL OFL (`assets/fonts/OFL.txt`).
- Photos de façades et d'intérieurs générées pour ce projet.
- Numéros de téléphone issus des plages que l'ARCEP réserve aux œuvres de fiction.
