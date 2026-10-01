# Conformité au sujet

Le PDF du test, relu de la première à la dernière page. Chaque exigence, son statut et l'endroit où la vérifier.

## Partie 1 · QCM (20 points)

| Question | Réponse | Où |
|---|---|---|
| Q1 à Q20 | Toutes répondues, avec justification et nuance quand l'énoncé date | [assessment/QCM.md](../assessment/QCM.md) |
| Q7, deux bonnes réponses | A et C | idem |

## Partie 2 · Exercices (40 points)

| Exigence | Statut | Où |
|---|---|---|
| Ex. 1 · `useFetch<T>` : URL et options optionnelles | ✅ | `assessment/exercise-1-use-fetch/useFetch.ts` |
| Ex. 1 · expose `data`, `loading`, `error` | ✅ | idem |
| Ex. 1 · annulation au démontage avec `AbortController` | ✅ | idem, test « aborts the request when the component unmounts » |
| Ex. 1 · `refetch` | ✅ | idem, test « refetches on demand » |
| Ex. 1 · typage générique, `useFetch<User[]>('/api/users')` | ✅ | idem |
| Ex. 2 · au moins 5 problèmes identifiés | ✅ 11 | `assessment/exercise-2-flatlist/README.md` |
| Ex. 2 · composant réécrit | ✅ | `ProductList.tsx`, 3 tests |
| Ex. 3 · ajout, suppression, quantité | ✅ | `assessment/exercise-3-cart/cartSlice.ts` |
| Ex. 3 · total par sélecteur mémoïsé | ✅ | `selectCartTotal`, test de mémoïsation |
| Ex. 3 · persistance (redux-persist) | ✅ | `store.ts`, test de réhydratation |
| Ex. 3 · typage complet | ✅ | `RootState`, `AppDispatch`, hooks typés |
| Ex. 4 · champs vides | ✅ | `assessment/exercise-4-login-form/LoginForm.test.tsx` |
| Ex. 4 · soumission réussie | ✅ | idem |
| Ex. 4 · erreur API | ✅ | idem |
| Ex. 4 · état de chargement | ✅ | idem, succès et échec |

## Partie 3 · StoreTracker (40 points)

### Fonctionnalités

| Exigence | Statut | Où |
|---|---|---|
| React Native (Expo ou CLI) | ✅ Expo SDK 57 | `package.json`, `app.config.ts` |
| Liste de magasins, API ou mock, 50 minimum | ✅ 120 | `src/features/stores/data`, `api/mockServer.ts` |
| Filtrage par nom | ✅ | `SearchField.tsx`, `mockServer.ts`, test et parcours Maestro 2 |
| Infinite scroll | ✅ | `StoresScreen.tsx`, `storesApi.ts`, test et parcours Maestro 6 |
| Détail : MapView | ✅ | `StoreMap.tsx`, `StoreMapScreen.tsx` |
| Détail : horaires | ✅ | `OpeningHoursRow.tsx`, test |
| Détail : bouton Favori | ✅ | `FavoriteButton.tsx`, test |
| Favoris persistés localement (AsyncStorage ou MMKV) | ✅ MMKV | `src/store/persistence.ts`, test et parcours Maestro 3 |
| Tab Navigator Liste / Favoris | ✅ | `src/app/(tabs)/_layout.tsx` |
| Stack Navigator pour le détail | ✅ | `src/app/(tabs)/stores/_layout.tsx`, `favorites/_layout.tsx` |

### Critères d'évaluation

| Critère | Points | Où le vérifier |
|---|---|---|
| Architecture et structure | 8 | README « Architecture », [TECHNICAL-DECISIONS.md](TECHNICAL-DECISIONS.md) |
| TypeScript strict | 6 | `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`), `npm run typecheck` en CI |
| Performance (mémoïsation, FlatList) | 6 | Décision 7, `StoreRow.tsx`, `StoresScreen.tsx` |
| États de chargement et d'erreur | 5 | Squelettes, erreur et réessai, vide, hors ligne ; tests et parcours Maestro 4 |
| Tests unitaires, 3 composants minimum | 8 | 10 suites pour l'app, dont 6 sur des composants et écrans |
| UX (accessibilité, retour visuel, responsive) | 7 | README « Accessibilité », [QA-CHECKLIST.md](QA-CHECKLIST.md) |

### Livrables

| Livrable | Statut | Où |
|---|---|---|
| Dépôt Git avec README clair | ✅ | dépôt GitHub privé, [README.md](../README.md) |
| Instructions d'installation et de lancement | ✅ | README « Installation et lancement » |
| Variables d'environnement documentées | ✅ | README, `.env.example` |
| Justification des choix techniques | ✅ | README « Choix techniques », [TECHNICAL-DECISIONS.md](TECHNICAL-DECISIONS.md) |
| Délai de 48 h | ✅ | historique Git |

## Vérifications finales

| Contrôle | Commande | Résultat |
|---|---|---|
| Lint | `npm run lint` | à jour au dernier commit (CI) |
| Typage | `npm run typecheck` | idem |
| Tests | `npm test` | idem |
| Fichiers privés ou secrets suivis par Git | `scripts/check-private-files.sh` | idem |
| Parcours Maestro | `maestro test .maestro` | 6/6 sur simulateur iOS 27 et émulateur Android 15 |
