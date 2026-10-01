# Exercice 3 · Store Redux du panier

Code : [`cartSlice.ts`](cartSlice.ts), [`store.ts`](store.ts), [`hooks.ts`](hooks.ts) · tests : [`cart.test.ts`](cart.test.ts)

## Forme de l'état

```ts
interface CartState {
  lines: Record<string, { product: Product; quantity: number }>;
}
```

- **Indexé par id de produit.** Ajouter un produit déjà présent incrémente sa quantité au lieu de créer une seconde ligne. Mise à jour et suppression se font sans parcourir de tableau.
- **Prix en centimes.** `0.1 + 0.2 !== 0.3` en JavaScript. Les montants sont des entiers, le formatage en euros se fait à l'affichage.
- **Le produit est copié dans la ligne.** Le panier reste lisible sans aller rechercher le catalogue, et il est sérialisable tel quel pour la persistance.

## Reducers

| Action                                     | Règle                                                                      |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| `itemAdded({ product, quantity? })`        | Crée la ligne ou additionne la quantité, plafonnée à 99                    |
| `itemRemoved(productId)`                   | Supprime la ligne                                                          |
| `quantityUpdated({ productId, quantity })` | 0 ou moins supprime la ligne ; plafond à 99 ; un produit absent est ignoré |
| `cartCleared()`                            | Vide le panier                                                             |

**Immutabilité.** Les reducers de Redux Toolkit semblent muter `state` : c'est un brouillon Immer. Immer enregistre les modifications et produit un nouvel objet, en partageant tout ce qui n'a pas changé. Un test vérifie que l'état précédent n'est jamais modifié.

## Sélecteurs mémoïsés

```ts
export const selectCartLines = createSelector([selectLines], (lines) => Object.values(lines));
export const selectCartTotal = createSelector([selectCartLines], (lines) =>
  lines.reduce((total, line) => total + line.product.unitPrice * line.quantity, 0),
);
```

`createSelector` (Reselect, intégré à RTK) ne recalcule que si ses entrées changent de référence. Deux bénéfices :

1. le calcul n'est pas refait à chaque action sans rapport avec le panier ;
2. surtout, `selectCartLines` renvoie **le même tableau** tant que `lines` ne change pas. Sans mémoïsation, `Object.values` créerait un nouveau tableau à chaque appel, et `useSelector` re-rendrait le composant à chaque action du store.

Un test le vérifie avec `recomputations()`.

## Persistance avec redux-persist

Le sujet demande un « middleware adapté (persist) ». redux-persist n'est pas un middleware au sens Redux : c'est un **reducer enveloppant** (`persistReducer`) plus un **orchestrateur** (`persistStore`) qui sauvegarde l'état et le réinjecte au démarrage avec l'action `REHYDRATE`.

- **`whitelist: ['cart']`** : on ne persiste que ce qui doit survivre au redémarrage.
- **`version`** : prépare une migration si la forme du panier change.
- **`serializableCheck`** : RTK avertit quand une action contient une valeur non sérialisable. Les actions internes de redux-persist transportent des fonctions ; on les ignore explicitement, et seulement elles.
- **Stockage injecté** : `createCartStore(storage)` reçoit le stockage. AsyncStorage dans l'app (ou un adaptateur MMKV), un stockage en mémoire dans les tests.

**Point d'attention vérifié par les tests.** La réhydratation est asynchrone. Une action dispatchée avant la fin de `REHYDRATE` peut être écrasée par l'état restauré. C'est le rôle de `<PersistGate>` : ne pas rendre l'app avant la réhydratation. Les tests attendent `bootstrapped` pour la même raison.

## Pourquoi Redux Toolkit, et pas une autre solution

- C'est la manière recommandée d'écrire du Redux : moins de code, Immer, `createSelector` et des types inférés.
- Les `RootState` et `AppDispatch` sont déduits du store ; les hooks typés évitent de répéter les types à chaque `useSelector`.
- Pour un panier seul, Zustand avec son middleware `persist` serait plus court. Redux se justifie quand le panier partage le store avec d'autres domaines et des middlewares (analytics, synchronisation serveur).

## Responsabilités

Le store calcule et conserve l'état. Il ne connaît ni l'interface, ni le réseau. Dans une vraie app, la synchronisation avec un panier serveur passerait par RTK Query ou des thunks, pas par les reducers.

## Ce que je n'ai pas fait

redux-persist n'a plus de version publiée depuis 2019. Il reste très répandu, mais sur un projet neuf avec un stockage synchrone (MMKV), une hydratation par `preloadedState` et une écriture dans un `listenerMiddleware` suffisent, sans `PersistGate`. C'est ce que fait StoreTracker : voir `src/store/persistence.ts`.
