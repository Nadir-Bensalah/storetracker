# Exercice 1 · Hook `useFetch<T>`

Code : [`useFetch.ts`](useFetch.ts) · tests : [`useFetch.test.tsx`](useFetch.test.tsx)

```ts
const { data, loading, error, refetch } = useFetch<User[]>('/api/users');
```

## Ce que le hook doit garantir

1. Le type `T` traverse jusqu'à `data` : l'appelant n'écrit jamais de cast.
2. Une réponse ne peut pas modifier un composant démonté.
3. Une réponse ancienne ne peut pas écraser une réponse récente.
4. `refetch` relance la même requête, et sa référence est stable.
5. Des options passées en ligne ne provoquent pas de boucle.

## Les choix

**Générique.** `useFetch<T>` renvoie `data: T | null`. `null` tant qu'aucune réponse n'est arrivée, plutôt que `undefined`, pour distinguer « rien encore » d'une propriété oubliée.

**AbortController.** Chaque exécution de l'effet crée son contrôleur et l'annule dans le nettoyage. Le nettoyage s'exécute au démontage, mais aussi avant chaque nouvelle exécution : quand l'URL change, la requête précédente est annulée. C'est ce qui règle à la fois les points 2 et 3, sans drapeau `isMounted`.

**L'annulation n'est pas une erreur.** Un `abort()` fait rejeter `fetch` avec une `AbortError`. On vérifie `controller.signal.aborted` pour l'ignorer : c'est nous qui avons annulé, l'utilisateur n'a pas à voir d'erreur.

**HTTP 4xx et 5xx.** `fetch` ne rejette que sur une erreur réseau. Un 500 est une réponse « réussie » : on teste `response.ok` et on lève une erreur nous-mêmes.

**`loading` est dérivé, pas stocké.** Chaque requête a une clé (`compteur:url`). La réponse est enregistrée avec sa clé ; `loading` vaut vrai tant que la clé courante n'a pas reçu de réponse. On évite ainsi un `setLoading(true)` synchrone au début de l'effet, qui provoquerait un rendu supplémentaire (et que la règle de lint du React Compiler signale), et l'état ne peut pas se désynchroniser.

**`refetch`.** Il incrémente un compteur qui fait partie de la clé, donc des dépendances de l'effet. Le même mécanisme gère donc l'annulation de la requête en cours. `useCallback` sans dépendance : la référence ne change jamais, on peut la passer à un composant mémoïsé ou à `onRefresh`.

**Les options.** `useFetch(url, { headers })` crée un nouvel objet à chaque rendu. Le mettre dans les dépendances relancerait la requête à chaque rendu, donc en boucle puisque la réponse provoque un rendu. Les options sont gardées dans une ref mise à jour à chaque rendu : la requête utilise toujours les dernières, mais seuls l'URL et `refetch` la déclenchent. Le compromis est assumé : changer uniquement les options ne relance pas la requête, il faut appeler `refetch`.

**Données conservées pendant un rechargement.** Quand l'URL change ou au `refetch`, `data` garde l'ancienne valeur pendant que `loading` repasse à `true`. L'écran peut afficher l'ancienne liste avec un indicateur, plutôt qu'un écran vide.

## Alternatives envisagées

| Option                                            | Pourquoi je ne l'ai pas retenue ici                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Drapeau `isMounted`                               | Ignore la réponse mais laisse la requête aller au bout, et ne règle pas la course entre deux URL |
| `useReducer` pour les trois états                 | Plus explicite au-delà de trois champs ; ici trois `useState` restent lisibles                   |
| Union discriminée (`{ status: 'success', data }`) | Plus sûre, mais le sujet impose l'interface `data`, `loading`, `error`                           |
| `JSON.stringify(options)` dans les dépendances    | Coût de sérialisation à chaque rendu, et échoue avec un `AbortSignal` ou un `FormData`           |

En production, je ne réécrirais pas ce hook : TanStack Query ou RTK Query apportent le cache, la déduplication et le refetch au retour au premier plan. StoreTracker utilise RTK Query.

## Erreurs fréquentes

- Oublier `response.ok` et afficher une page d'erreur HTML comme si c'étaient des données.
- Afficher l'`AbortError` à l'utilisateur.
- Mettre `options` dans les dépendances et provoquer une boucle de requêtes.
- Faire du callback d'effet une fonction `async` : il doit renvoyer la fonction de nettoyage, pas une promesse.

## Ce que prouvent les tests

| Test             | Comportement protégé                                   |
| ---------------- | ------------------------------------------------------ |
| données typées   | le chemin nominal et l'état de chargement initial      |
| HTTP 500         | un statut d'erreur devient une erreur, pas des données |
| démontage        | le signal de la requête est bien annulé                |
| changement d'URL | la requête précédente est annulée, la nouvelle gagne   |
| `refetch`        | une seconde requête part et le chargement se termine   |
| options en ligne | une seule requête, avec les bonnes options             |
