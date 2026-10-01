# Conformité au sujet

Le PDF du test a été relu page par page. Pour chaque exigence : où elle est implémentée, par quoi elle est testée, la preuve concrète, et le statut constaté en exécutant réellement le test ou le parcours, pas en lisant le README.

Légende des preuves : `jest` = test unitaire (`npm test`), `maestro` = parcours sur simulateur iOS 27 et émulateur Android 15 (`maestro test .maestro`), `manuel` = recette manuelle [QA-CHECKLIST.md](QA-CHECKLIST.md), `ci` = vérifié à chaque push par `.github/workflows/ci.yml`.

## Partie 1 · QCM (20 points)

| Exigence | Implémentation | Test | Preuve | Statut |
|---|---|---|---|---|
| 20 questions, une réponse chacune | [assessment/QCM.md](../assessment/QCM.md) | Relecture indépendante de chaque question contre le PDF | Tableau récapitulatif en tête du fichier, justification par question | ✅ |
| Q7, deux bonnes réponses | idem, « A et C » | idem | Mention explicite dans le tableau | ✅ |
| Nuances quand l'énoncé date | idem, paragraphes « Nuance » | n/a | Q1 (v7), Q11 (`StyleSheet.create` actuel), Q16 (threads, plus de bridge), Q20 (JSI) | ✅ |

## Partie 2 · Exercices (40 points)

| Exigence | Implémentation | Test | Preuve | Statut |
|---|---|---|---|---|
| Ex. 1 · `useFetch<T>` accepte une URL et des options optionnelles | `assessment/exercise-1-use-fetch/useFetch.ts` | `useFetch.test.tsx` « does not loop when options are passed inline » | jest, 6 tests | ✅ |
| Ex. 1 · expose `data`, `loading`, `error` | idem, `UseFetchResult<T>` | « starts loading, then exposes typed data », « turns an HTTP error status into an error » | jest | ✅ |
| Ex. 1 · annule la requête au démontage (AbortController) | idem, `controller.abort()` dans le nettoyage | « aborts the request when the component unmounts » | jest, `signal.aborted === true` | ✅ |
| Ex. 1 · `refetch` exposé | idem | « refetches on demand » | jest, deux appels `fetch` | ✅ |
| Ex. 1 · typage générique | `useFetch<User[]>('/api/users')` compile | `npm run typecheck` | ci | ✅ |
| Ex. 2 · au moins 5 problèmes identifiés | `assessment/exercise-2-flatlist/README.md` | n/a | 11 problèmes, chacun avec impact et correction | ✅ |
| Ex. 2 · composant réécrit | `ProductList.tsx` | `ProductList.test.tsx` | jest, 3 tests dont le montage partiel de 10 000 lignes | ✅ |
| Ex. 3 · ajout, suppression, quantité | `assessment/exercise-3-cart/cartSlice.ts` | `cart.test.ts` reducers | jest, 5 tests dont immutabilité | ✅ |
| Ex. 3 · total par sélecteur mémoïsé | `selectCartTotal` (`createSelector`) | « memoises the total: same input, no recomputation » | jest, `recomputations() === 1` | ✅ |
| Ex. 3 · persistance (middleware persist) | `store.ts` (redux-persist) | « writes the cart to storage and restores it in a new store » | jest | ✅ |
| Ex. 3 · typage complet | `RootState`, `AppDispatch`, `hooks.ts` | `npm run typecheck` | ci | ✅ |
| Ex. 4 · champs vides | `assessment/exercise-4-login-form/LoginForm.test.tsx` | 3 variantes (les deux, email seul, mot de passe seul) | jest | ✅ |
| Ex. 4 · soumission réussie | idem | « calls onSubmit once with the typed credentials » | jest | ✅ |
| Ex. 4 · erreur API | idem | « shows Identifiants incorrects when onSubmit rejects » | jest | ✅ |
| Ex. 4 · état loading | idem | « shows the loader while the request is pending », succès et échec | jest | ✅ |
| Ex. 4 · composant testé tel que fourni | `LoginForm.tsx` recopié, défauts signalés à part | 3 tests « additional observations » | jest | ✅ |

## Partie 3 · StoreTracker (40 points)

### Fonctionnalités demandées

| Exigence | Implémentation | Test | Preuve | Statut |
|---|---|---|---|---|
| React Native (Expo ou CLI) | Expo SDK 57, `app.config.ts` | Build iOS et Android | Builds de développement sur simulateur et émulateur, build Release sur iPhone 14 Pro Max (iOS 27) | ✅ |
| Liste de magasins, API ou mock, 50 minimum | 120 magasins, `src/features/stores/data/stores.ts`, API simulée `api/mockServer.ts` | `mockServer.test.ts` « serves more than 50 stores, page by page » | jest : `stores.length >= 50` ; maestro « Pagination » : « 120 stores » affiché | ✅ |
| Filtrage par nom | `SearchScreen.tsx`, barre native de l'en-tête, recherche côté serveur | `mockServer.test.ts` (casse, accents, plusieurs mots) ; `SearchScreen.test.tsx` ; maestro « Search » | jest + maestro : « Gautrand Lices » trouvé avec « GAUTRAND lices » | ✅ |
| Infinite scroll | `StoresScreen.tsx` `onEndReached` + `storesApi.ts` `infiniteQuery` | `StoresScreen.test.tsx` « loads the next page » ; `mockServer.test.ts` « never returns the same store twice » ; maestro « Pagination » | jest : 20 puis 40 magasins ; maestro : « Vous avez tout vu » atteint après défilement | ✅ |
| Écran Détail : MapView | `src/features/map/StoreMap.tsx` dans `StoreDetailScreen.tsx` | manuel (rendu natif) | Apple Plans sur iOS (`react-native-maps`), MapLibre + OpenStreetMap sur Android (`AndroidMap.tsx`), aucune clé requise | ✅ |
| Écran Détail : horaires | `OpeningHoursRow.tsx`, `openingHours.ts` | `openingHours.test.ts` (7 cas) ; `StoreDetailScreen.test.tsx` « expands the opening hours » | jest | ✅ |
| Écran Détail : bouton Favori | `FavoriteButton.tsx` dans l'en-tête de la fiche | `StoreRow.test.tsx` « toggles the favorite » ; maestro « Favorites » | jest + maestro | ✅ |
| Écran Favoris persisté (AsyncStorage ou MMKV) | MMKV, `src/store/persistence.ts` | `favorites.test.ts` « survives an app restart through MMKV » ; maestro « Favorites and persistence » (`stopApp` puis `launchApp`) | jest + maestro | ✅ |
| Tab Navigator Liste / Favoris | `src/app/(tabs)/_layout.tsx` (onglets natifs) | maestro, tous les parcours tapent « Favorites » / « Stores » | maestro + manuel | ✅ |
| Stack Navigator pour le détail | `src/app/(tabs)/stores/_layout.tsx`, `favorites/_layout.tsx` | maestro « Search » et « Favorites » ouvrent une fiche depuis chaque onglet | maestro | ✅ |

### Critères d'évaluation

| Critère | Points | Implémentation | Preuve |
|---|---|---|---|
| Architecture et structure | 8 | Organisation par fonctionnalité, routes minces | README « Architecture », [TECHNICAL-DECISIONS.md](TECHNICAL-DECISIONS.md) §1, §2 |
| TypeScript strict | 6 | `strict`, `noUncheckedIndexedAccess`, aucun `any` | `npm run typecheck` en ci ; `grep -rn ": any" src` vide |
| Performance (mémoïsation, FlatList) | 6 | `StoreRow` mémoïsé, callbacks stables, horloge unique, vignettes, `getItemLayout` refusé pour Dynamic Type | §7 des décisions ; `StoreRow.tsx`, `StoresScreen.tsx`, `useNow.ts` |
| États de chargement et d'erreur | 5 | Squelettes, erreur et réessai avec spinner et toast, vide, hors ligne, fin de liste | jest : « shows a skeleton », « offers a retry when the API fails » ; maestro « Error and retry » |
| Tests unitaires (3 composants minimum) | 8 | 10 suites pour l'app : 6 écrans et composants (`StoreRow`, `StoresScreen`, `SearchResults`, `StoreDetailScreen`, `FavoritesScreen`, `SettingsScreen`, `AboutDeveloperScreen`), 4 de logique ; 4 suites d'exercices | `npm test` : 76 tests |
| UX (accessibilité, retour visuel, responsive) | 7 | Lignes lues en une phrase, rôles, 44/48 pt, Dynamic Type, Reduced Motion, haptique, animations sobres, safe areas | README « Accessibilité » ; `getByRole` dans les tests ; recette manuelle |

### Livrables

| Livrable | Preuve | Statut |
|---|---|---|
| Dépôt Git avec README clair | `github.com/Nadir-Bensalah/storetracker` (privé, accès donné aux reviewers), README avec résumé « En deux minutes » | ✅ |
| Instructions d'installation et de lancement | README « Installation et lancement », trois commandes | ✅ |
| Variables d'environnement documentées | README tableau + `.env.example` | ✅ |
| Justification des choix techniques | README « Choix techniques » + [TECHNICAL-DECISIONS.md](TECHNICAL-DECISIONS.md) (14 décisions) | ✅ |
| Délai de 48 h | Historique Git, premier au dernier commit | ✅ |

## Dernière exécution complète

| Contrôle | Commande | Résultat |
|---|---|---|
| Lint, typage, tests, fichiers privés | `npm run check` | ✅ 76 tests, 0 erreur (ci au dernier commit) |
| Parcours Maestro iOS | `maestro test .maestro` sur iPhone 18 Pro, iOS 27 | voir section « Journal QA » |
| Parcours Maestro Android | `maestro test .maestro` sur Pixel 6, API 35 | voir section « Journal QA » |
| Build Release iOS | `npx expo run:ios --configuration Release` sur iPhone 14 Pro Max | ✅ installé et lancé, aucun rapport de crash après installation |
| Build Android | `npx expo run:android` | ✅ |

## Journal QA

Mis à jour à chaque passe complète (date, plateforme, résultat, bugs trouvés et corrigés).

- 1er octobre 2026, iOS 27 simulateur et Android 15 émulateur, 6/6 parcours avant la refonte de la recherche. Bugs trouvés par la QA et corrigés : favoris d'une version antérieure qui plantaient la fiche (`sanitizeFavorites`, `ErrorBoundary` par route), anciens résultats affichés après une recherche en échec, mise en page des lignes cassée par le `Slot` de `Link`, lignes muettes pour VoiceOver avec l'aperçu natif (conteneur accessible).
