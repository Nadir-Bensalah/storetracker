# Parties 1 et 2 du test

| Partie                                   | Document                                  | Code et tests                       |
| ---------------------------------------- | ----------------------------------------- | ----------------------------------- |
| QCM (20 questions)                       | [QCM.md](QCM.md)                          |                                     |
| Exercice 1 · `useFetch<T>`               | [README](exercise-1-use-fetch/README.md)  | `useFetch.ts`, 6 tests              |
| Exercice 2 · FlatList de 10 000 produits | [README](exercise-2-flatlist/README.md)   | `ProductList.tsx`, 3 tests          |
| Exercice 3 · Store Redux du panier       | [README](exercise-3-cart/README.md)       | `cartSlice.ts`, `store.ts`, 8 tests |
| Exercice 4 · Tests du LoginForm          | [README](exercise-4-login-form/README.md) | 10 tests                            |

Les exercices sont indépendants de l'application : ils partagent seulement l'outillage du dépôt. Ils sont typés par `npm run typecheck` et exécutés par `npm test`, comme le reste.

```sh
npx jest assessment
```
