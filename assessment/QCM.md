# Partie 1 · QCM

Pour chaque question : la réponse, pourquoi, et une nuance quand l'énoncé date un peu ou simplifie. Les nuances complètent la réponse attendue, elles ne la remplacent pas.

| Q   | Réponse | Q   | Réponse |
| --- | ------- | --- | ------- |
| 1   | B       | 11  | B       |
| 2   | B       | 12  | B       |
| 3   | D       | 13  | B       |
| 4   | C       | 14  | A       |
| 5   | B       | 15  | B       |
| 6   | C       | 16  | A       |
| 7   | A et C  | 17  | A       |
| 8   | B       | 18  | B       |
| 9   | B       | 19  | A       |
| 10  | B       | 20  | A       |

---

## Navigation

### Q1 · `navigate()` et `push()` · **B**

`push` ajoute toujours une nouvelle entrée dans la pile, même si l'écran y est déjà. `navigate` évite le doublon : si l'écran est déjà affiché, il ne fait que mettre à jour ses paramètres.

_Nuance._ L'énoncé parle de la v6. En v6, `navigate` vers un écran déjà présent plus bas dans la pile **revenait** jusqu'à lui. La v7 a supprimé ce comportement jugé déroutant : `navigate` reste sur l'écran s'il est déjà au premier plan, sinon empile, et `popTo` a été ajouté pour revenir à un écran existant. B reste la meilleure réponse dans les deux versions.

### Q2 · État partagé entre navigateurs imbriqués · **B**

Un état global (Redux, Zustand, Context) se lit depuis n'importe quel écran, quel que soit le navigateur qui le contient. Les paramètres de route (A, C) servent à décrire un écran, pas à partager un état entre onglets.

### Q3 · Persister l'état de navigation · **D**

C'est la recette documentée : `onStateChange` reçoit chaque nouvel état, on le sauvegarde (AsyncStorage, MMKV), puis on le redonne au démarrage via `initialState`, en attendant la lecture avant de rendre le `NavigationContainer`.

_Pourquoi pas A ou B seules._ A ne dit pas comment l'état est réinjecté, B ne dit pas comment il est sauvegardé. C concerne le deep linking (URL vers état), pas la persistance.

---

## State management

### Q4 · Rôle d'un reducer · **C**

Un reducer est une fonction pure `(state, action) => nouvel état`. Pas d'effet de bord (A), pas de mutation (B), pas de dispatch (D).

_Nuance._ Avec Redux Toolkit, on écrit `state.items.push(x)` dans un reducer : c'est Immer qui transforme cette « mutation » d'un brouillon en nouvel objet immuable. Le principe C reste vrai.

### Q5 · `createAsyncThunk` · **B**

C'est un créateur d'action asynchrone. Il dispatche automatiquement `pending`, `fulfilled` et `rejected`, que le slice traite dans `extraReducers` avec `builder.addCase(thunk.pending, ...)`.

_Nuance._ Pour des appels API, RTK Query évite souvent d'écrire ces thunks à la main : cache, déduplication et états de chargement sont fournis. StoreTracker l'utilise.

### Q6 · Ordre du flux Redux · **C**

L'interface dispatche une action, elle traverse les middlewares (thunk, logger, persistance...), le reducer calcule le nouvel état, le store le conserve et notifie les abonnés, l'interface se re-rend.

### Q7 · Risques du Context comme état global · **A et C**

A : tous les consommateurs d'un Context sont re-rendus à chaque changement de sa valeur, même s'ils n'utilisent qu'une partie de cette valeur. C : dans une longue liste dont chaque ligne lit un Context qui change souvent, ce coût est multiplié par le nombre de lignes.

B et D sont faux : le Context fonctionne avec les hooks personnalisés et avec TypeScript.

_Nuance._ C'est la raison concrète pour laquelle les favoris de StoreTracker sont dans Redux : basculer un favori ne re-rend que la ligne concernée, grâce à un sélecteur fin.

---

## API, fetch, asynchrone

### Q8 · `useEffect + fetch` ou React Query · **B**

React Query gère le cache, le refetch en arrière-plan (au retour au premier plan, à la reconnexion), les états de chargement et d'erreur, la déduplication des requêtes identiques et le nettoyage des données inutilisées.

_Pourquoi pas A._ Le cache n'est qu'une partie. _Pourquoi pas C._ Le coût de la librairie est faible devant ce qu'il faudrait réécrire à la main.

### Q9 · Annuler un fetch au démontage · **B**

On crée un `AbortController`, on passe son `signal` à `fetch`, et on appelle `abort()` dans la fonction de nettoyage du `useEffect`. La requête réseau est réellement annulée.

_Pourquoi pas A._ Un drapeau `isMounted` ignore la réponse mais laisse la requête aller au bout. C'est l'ancien contournement. Voir l'exercice 1.

### Q10 · Synchronisation offline-first · **B**

On enregistre les mutations dans une file persistée, et on les rejoue à la reconnexion (détectée par NetInfo). L'interface reste utilisable hors ligne, rien n'est perdu si l'app est tuée.

_Nuance._ En vrai, il faut aussi gérer l'ordre, les conflits (le serveur a changé entre-temps) et l'idempotence (une mutation rejouée deux fois). C ne protège de rien : la connexion peut tomber après la vérification. D perd tout si l'app n'est pas relancée.

---

## Interface et style

### Q11 · `StyleSheet.create()` ou objet inline · **B** (réponse attendue)

C'est la réponse historique : `StyleSheet.create` validait les styles et envoyait des identifiants numériques au natif pour limiter les échanges sur le bridge.

_Nuance, la plus importante du QCM._ Ce n'est plus vrai. Dans les versions actuelles, `StyleSheet.create` renvoie l'objet tel quel ; en développement, il le gèle seulement (`Object.freeze`). Il n'y a ni validation au build, ni identifiants, et le bridge n'existe plus avec la New Architecture. Son intérêt aujourd'hui : un typage strict, des références stables (pas de nouvel objet à chaque rendu, ce qui compte pour `React.memo`), et des styles regroupés hors du JSX.

### Q12 · Safe areas · **B**

`react-native-safe-area-context` lit les marges réelles de l'appareil (encoche, Dynamic Island, barre de navigation Android) et les expose via `SafeAreaView` ou `useSafeAreaInsets()`.

_Nuance._ Le `SafeAreaView` de React Native lui-même est déprécié et ne gérait qu'iOS. Avec l'affichage bord à bord imposé depuis Android 15, cette gestion est devenue indispensable sur Android aussi.

---

## Performance

### Q13 · `FlatList` ou `SectionList` · **B**

Les deux reposent sur la même virtualisation. `SectionList` ajoute des sections avec en-têtes (éventuellement collants). On la choisit seulement quand les données sont groupées.

### Q14 · `React.memo` · **A**

`React.memo` évite de re-rendre un composant si ses props sont identiques (comparaison superficielle). Il devient contre-productif si une prop change à chaque rendu, typiquement un objet ou une fonction créés en ligne : on paie la comparaison pour rien.

_Nuance._ C'est pour ça que `React.memo` va de pair avec `useCallback` et `useMemo` côté parent. Le React Compiler, quand il est activé, automatise une bonne partie de cette mémoïsation.

### Q15 · `useCallback` ou `useMemo` · **B**

`useCallback(fn, deps)` mémoïse la fonction elle-même ; `useMemo(() => valeur, deps)` mémoïse le résultat d'un calcul. `useCallback(fn, deps)` équivaut bien à `useMemo(() => fn, deps)`.

### Q16 · Thread JS et thread UI · **A** (réponse attendue)

Le thread JS exécute React et la logique, le thread UI (principal) dessine et gère les gestes. Une animation pilotée image par image depuis le JS saute des images dès que le thread JS est occupé.

_Nuance._ Ce sont des threads d'un même processus, pas deux processus. Et le bridge asynchrone a disparu avec la New Architecture, obligatoire depuis RN 0.82. Le fond reste juste : pour des animations fluides, on les fait tourner côté natif (`useNativeDriver`, Reanimated et ses worklets).

---

## Tests

### Q17 · Mocker un module natif · **A**

Un fichier `__mocks__/react-native-camera.js` à la racine, ou `jest.mock('react-native-camera', ...)` dans le test ou dans un fichier de setup. Le code JS qui appelle le module natif est remplacé par un faux.

_Nuance._ L'énoncé contient une coquille (`react-nativecamera`), et `react-native-camera` est abandonné depuis longtemps au profit de `react-native-vision-camera` ou `expo-camera`. Le principe ne change pas : StoreTracker mocke ainsi MMKV, les cartes, la localisation et NetInfo dans `jest.setup.tsx`.

### Q18 · Tester un appel asynchrone avec RTL · **B**

`findBy*` et `waitFor` attendent que l'interface reflète le résultat, sans durée arbitraire. On teste ce que voit l'utilisateur.

_Nuance._ C n'est pas faux en soi : la bibliothèque enveloppe déjà ses rendus et événements dans `act`. Mais ce n'est pas ce qui permet d'attendre un résultat asynchrone. A est fragile, D ne teste plus le comportement asynchrone.

---

## Transversal

### Q19 · Hermes · **A**

Hermes est le moteur JavaScript conçu pour React Native. Le JS est compilé en bytecode au build, ce qui réduit le temps de démarrage (TTI), la mémoire et la taille à charger.

_Nuance._ Il est le moteur par défaut depuis RN 0.70, en debug comme en release : D est faux.

### Q20 · Ancienne architecture et New Architecture · **A**

La New Architecture remplace le bridge asynchrone, qui sérialisait les messages en JSON, par JSI : le JS appelle directement des objets C++. Fabric (rendu) et TurboModules (modules natifs chargés à la demande) s'appuient dessus, et les fonctionnalités concurrentes de React deviennent possibles.

_Nuance._ JSI **permet** les appels synchrones, il ne les impose pas : la plupart des modules restent asynchrones. D est faux : la New Architecture est arrivée en option avec RN 0.68, par défaut en 0.76, et elle est obligatoire depuis 0.82.
