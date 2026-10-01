# Exercice 4 · Tests du LoginForm

Composant testé, recopié tel quel : [`LoginForm.tsx`](LoginForm.tsx) · tests : [`LoginForm.test.tsx`](LoginForm.test.tsx)

Outils : Jest et React Native Testing Library 14. Dans cette version, `render` et `fireEvent` sont asynchrones et s'utilisent avec `await`.

## Les tests demandés

| Cas                                                                      | Ce que le test démontre                                                                                                                                                                                   |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Champs vides** (3 variantes : les deux, email seul, mot de passe seul) | Le message « Champs obligatoires » s'affiche **et** l'API n'est pas appelée, sans loader. Un test qui vérifierait seulement le message ne verrait pas une régression qui enverrait quand même la requête. |
| **Soumission réussie**                                                   | `onSubmit` est appelé **une fois**, avec exactement l'email et le mot de passe saisis. Puis le loader disparaît et aucune erreur n'est affichée.                                                          |
| **Erreur API**                                                           | Quand `onSubmit` rejette, l'utilisateur voit « Identifiants incorrects » et le loader disparaît.                                                                                                          |
| **État de chargement** (succès et échec)                                 | Le loader est visible **pendant** la requête et disparaît **après**, dans les deux issues. C'est le `finally` du composant qui est protégé.                                                               |

## Comment on observe l'état intermédiaire

Pour voir le loader, la requête doit rester en suspens. Le test crée une promesse qu'il contrôle lui-même (`deferred()`), la passe comme `onSubmit`, déclenche l'appui, vérifie le loader, puis résout ou rejette la promesse.

Point propre à RNTL 14 : `fireEvent.press` attend la promesse renvoyée par le gestionnaire. Si l'on faisait `await fireEvent.press(...)` alors que la requête est en suspens, le test attendrait indéfiniment. L'appui est donc lancé sans `await`, et l'état est observé avec `findByTestId` puis `waitFor`.

## Les choix de méthode

- **`findBy*` et `waitFor`**, jamais de `setTimeout` : le test attend que l'interface change, ni plus, ni moins.
- **`act`** n'apparaît pas : `render`, `fireEvent` et les requêtes asynchrones de RNTL l'appliquent déjà.
- **Des mocks minimaux.** `onSubmit` est un `jest.fn()` ; rien d'autre n'est simulé. On teste le composant par ce qu'il affiche, pas par son état interne.
- **Les `testID` du composant** sont utilisés, puisqu'ils sont fournis. Dans un composant que j'écrirais, je préférerais `getByRole` et `getByLabelText`, qui vérifient au passage l'accessibilité.
- **Pas de snapshot** : il casserait au moindre changement de mise en page sans rien dire du comportement.

## Observations supplémentaires

En écrivant les tests, trois comportements du composant m'ont semblé à signaler. Ils sont décrits par trois tests dans un bloc séparé, qui documentent le comportement actuel ; avec les corrections proposées, ils seraient inversés.

**1. Une erreur reste affichée après une connexion réussie.**
`error` n'est jamais remis à vide. Après « Champs obligatoires », une soumission correcte et réussie laisse le message à l'écran.
_Correction :_ `setError('')` au début de `handleSubmit`.

**2. Double soumission possible pendant le chargement.**
Le bouton reste actif pendant la requête : deux appuis rapides envoient deux requêtes.
_Correction :_ `disabled={loading}` sur le bouton, et un retour anticipé si `loading` est vrai.

**3. Des champs faits d'espaces passent la validation.**
`'   '` est une chaîne non vide, donc considérée comme remplie.
_Correction :_ valider `email.trim()` (idéalement aussi son format) avant l'envoi.

Deux remarques plus mineures : la variable `e` du `catch` n'est pas utilisée (toutes les erreurs deviennent « Identifiants incorrects », y compris une panne réseau), et si `onSubmit` déclenche une navigation qui démonte le formulaire, le `finally` met à jour l'état d'un composant démonté.
