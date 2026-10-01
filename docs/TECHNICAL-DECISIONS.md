# Décisions techniques

Chaque décision suit le même format : le problème, le choix, pourquoi, les alternatives, ce qu'on gagne et ce qu'on perd.

---

## 1. Expo SDK 57 avec des builds de développement

**Problème.** Choisir entre Expo et React Native CLI, et entre Expo Go et un build de développement.

**Choix.** Expo SDK 57, Expo Router, génération native continue (`ios/` et `android/` sont générés par `expo prebuild`, pas versionnés). Pas d'Expo Go.

**Pourquoi.**
- Les capacités natives nécessaires existent en modules maintenus : onglets natifs, feuilles, cartes, localisation, haptique, symboles.
- Le dépôt reste court : la configuration native est déclarative, dans `app.config.ts`.
- Expo Go ne supporte qu'un SDK à la fois. Le SDK 58 était en bêta au démarrage du projet : un reviewer qui ouvrirait le projet avec Expo Go après sa sortie ne pourrait plus le lancer.
- SDK 57 plutôt que 58 : le 58 reposait sur React Native 0.88 en release candidate.

**Alternatives.** React Native CLI : même résultat, avec des dossiers natifs à maintenir et relire. Expo Go : plus simple à lancer, mais incompatible avec MMKV et fragile dans le temps.

**Compromis.** Il faut Xcode ou Android Studio pour compiler. D'où les builds fournis dans les releases GitHub.

**Point de vigilance.** Une app SDK 57 compilée avec Xcode 27 plante au lancement sans le cycle de vie UIScene. L'option `ios.enableSceneSupport` d'`expo-build-properties` l'active ; elle est sans effet avec Xcode 26.

---

## 2. Navigation : onglets natifs et une pile par onglet

**Problème.** Le sujet demande un Tab Navigator (Liste, Favoris) et un Stack Navigator pour le détail, avec une vraie sensation native.

**Choix.**
- `src/app/(tabs)/_layout.tsx` : `NativeTabs` d'Expo Router, c'est-à-dire `UITabBarController` sur iOS et la barre de navigation Material 3 sur Android.
- `src/app/(tabs)/stores/_layout.tsx` et `favorites/_layout.tsx` : une pile native par onglet. Le détail est poussé dans la pile de l'onglet courant, la barre d'onglets reste visible.
- La recherche est un écran poussé dont la barre de recherche est celle de l'en-tête natif (`headerSearchBarOptions`) : la transition et le clavier sont ceux du système, les résultats vivent dans la liste en dessous.
- La fiche se rend d'abord depuis le cache des listes (`selectListedStore`) : pas de squelette pour une donnée déjà à l'écran.
- **Essayé puis retiré : l'aperçu au toucher long** (`Link.Preview` et `Link.Menu` d'Expo Router). Deux problèmes réels sur appareil : le `Slot` de `Link` aplatit le style du pressable et jette les styles fonction, et le déclencheur natif de l'aperçu retire la ligne de l'arbre d'accessibilité (VoiceOver ne la lit plus, l'automatisation ne la trouve plus). Un aperçu ne vaut pas une ligne muette pour VoiceOver ; les lignes gardent un `Pressable` ordinaire avec retour haptique.
- Les réglages sont présentés en modal (page sheet sur iOS, plein écran sur Android), avec leur propre pile native pour les pages « À propos ».
- La carte d'un magasin s'ouvre de la même façon, en plein écran.

**Pourquoi.** Sur iOS 26 et plus, la barre d'onglets prend Liquid Glass sans une ligne de code. Sur Android, elle suit Material 3. Une barre dessinée en `View` ne fait ni l'un ni l'autre et vieillit à chaque version d'OS.

**Alternatives.** `createBottomTabNavigator` de React Navigation : barre en JavaScript. Ses onglets natifs existent mais sont encore sous `unstable` en v7.

**Compromis.** Dans le SDK 57, l'API d'Expo Router s'appelle aussi `unstable-native-tabs` (stable en SDK 58). L'implémentation native est la même ; l'import est isolé dans un seul fichier. Avec une FlatList, l'onglet ne remonte pas en haut de liste au second appui.

---

## 3. Redux Toolkit et RTK Query

**Problème.** Gérer des données serveur paginées, un état client partagé (favoris, préférences) et leur persistance.

**Choix.** RTK Query pour les magasins (`build.infiniteQuery`), deux petites slices pour les favoris et les préférences, une slice pour la localisation.

**Pourquoi.** Ce que le produit demande :
1. un cache paginé par recherche, qui réaffiche instantanément une recherche déjà faite ;
2. ignorer une réponse arrivée trop tard ;
3. dédupliquer les appels de `onEndReached` ;
4. réessayer et rafraîchir au retour du réseau ;
5. qu'un favori basculé ne re-rende que sa ligne, pas les 120 ;
6. écrire dans le stockage à chaque changement.

Un Context échoue au point 5 (tous les consommateurs sont re-rendus). Des hooks maison obligent à réécrire et tester 1 à 4.

**Alternatives.** Zustand + TanStack Query se valent techniquement. Redux Toolkit l'emporte par un seul écosystème pour l'état serveur et l'état client, et une persistance qui s'écrit comme une règle (`listenerMiddleware`).

**Compromis.** Plus de concepts que Zustand. Store, slices, API, persistance et écouteurs tiennent en environ 350 lignes.

---

## 4. Persistance : MMKV lu de façon synchrone, sans redux-persist

**Problème.** Favoris, langue, thème et onboarding doivent survivre au redémarrage.

**Choix.** MMKV. Le store est créé avec `preloadedState` lu dans MMKV ; un `listenerMiddleware` écrit à chaque action concernée. Clés versionnées (`favorites.v1`), valeur corrompue ignorée.

**Pourquoi.** MMKV lit de façon synchrone : le thème et la langue sont connus avant le premier rendu. Pas de `PersistGate`, pas d'écran blanc, pas de flash du mauvais thème.

**Alternatives.** AsyncStorage + redux-persist : réhydratation asynchrone, donc un écran d'attente, et une librairie sans version publiée depuis 2019. C'est néanmoins la réponse de l'exercice 3, où le sujet le demande.

**Compromis.** MMKV a besoin d'un module natif (Nitro) : pas d'Expo Go, et un mock en mémoire dans Jest.

---

## 5. Favoris : un instantané du magasin, pas seulement son id

**Problème.** Hors ligne, un onglet Favoris qui ne contient que des ids est vide.

**Choix.** Le favori garde une copie du magasin. L'onglet Favoris et le détail fonctionnent sans réseau ; le détail affiche « informations enregistrées » quand la requête échoue.

**Compromis.** Un instantané peut vieillir (horaires modifiés) et il est figé par le build qui l'a écrit. Le détail préfère toujours la réponse du serveur quand elle arrive, et les instantanés sont vérifiés et réparés au chargement (`sanitizeFavorites`) : un identifiant de photo renommé entre deux versions a fait planter la fiche en release sur un appareil qui gardait des favoris de la première version. Chaque route exporte aussi un `ErrorBoundary` : une erreur de rendu affiche un écran de reprise au lieu de fermer l'app.

---

## 6. Données : un faux serveur local, déterministe

**Problème.** Le sujet autorise une API ou un mock. Il faut des états reproductibles et testables.

**Choix.** 120 magasins fictifs (7 enseignes inventées) et un faux serveur avec la forme d'une API REST : latence, taux d'erreur, hors ligne (via NetInfo), pagination par 20, recherche et tri par distance côté serveur. RTK Query l'appelle comme une vraie API.

**Pourquoi.** Un vrai réseau de 10 000 magasins ne se filtre pas sur le téléphone. Brancher une vraie API ne changerait que le corps des fonctions de `mockServer.ts`.

**Données réelles ou fictives.** Les rues et les villes sont réelles pour que la carte et les distances soient crédibles. Les enseignes sont inventées et vérifiées comme libres dans leur secteur. Les numéros viennent des plages réservées par l'ARCEP aux œuvres de fiction : aucun ne peut joindre quelqu'un.

---

## 7. La FlatList de l'accueil

**Problème.** Une liste longue, re-rendue à chaque frappe et à chaque page chargée.

**Choix.**
- `StoreRow` en `React.memo`, `renderItem` et `keyExtractor` stables.
- Recherche avec anti-rebond (300 ms) et filtrage côté serveur.
- Une seule horloge par écran (`useNow`), alignée sur la minute, pour le statut ouvert ou fermé.
- `onEndReached` protégé contre les appels pendant un chargement.
- Vignettes de 480 px en WebP via `expo-image`, avec `recyclingKey`.

**Refusé volontairement : `getItemLayout`.** La hauteur d'une ligne dépend de la taille de texte choisie par l'utilisateur. Déclarer une hauteur fixe casserait le défilement en grande police. Les réglages de fenêtre (`windowSize`, `maxToRenderPerBatch`) gardent leurs valeurs par défaut faute de mesure qui justifie de les changer.

**Alternative.** FlashList recycle les vues et serait mon choix en production ; le sujet évalue FlatList.

---

## 8. Thème : tokens sémantiques et apparence native

**Problème.** Clair, sombre et système, cohérents jusque dans les composants natifs.

**Choix.** Des tokens sémantiques (`background`, `surface`, `textSecondary`, `separator`, `success`, `warning`...) définis pour les deux modes dans `src/theme/tokens.ts`. Le choix de l'utilisateur est appliqué avec `Appearance.setColorScheme`.

**Pourquoi.** `Appearance.setColorScheme` force le mode au niveau natif : la barre d'onglets, les feuilles, les alertes et Apple Plans suivent sans configuration. `useColorScheme()` reflète alors le choix, et un seul hook (`useTheme`) suffit, sans Context.

**Compromis.** Sur Android, Google Maps n'a pas de mode sombre automatique : un style sombre lui est passé explicitement.

---

## 9. Localisation FR et EN

**Choix.** i18next avec des clés typées : `en.ts` doit avoir exactement les clés de `fr.ts`, sinon la compilation échoue. Les dates, heures et nombres passent par `Intl`, avec `fr-FR` et `en-GB`. Langue du téléphone par défaut, choix persistant dans l'onboarding et les réglages. Le texte de la demande de permission iOS est lui aussi traduit.

**Piège rencontré.** Le style `unit` d'`Intl.NumberFormat` est délégué à Foundation sur iOS, qui convertit les unités à sa façon : 240 m devenait « 0,24 km ». Les distances sont donc formatées comme des nombres, avec l'unité ajoutée.

---

## 10. Localisation (position) : une demande au bon moment

**Choix.** La permission n'est jamais demandée au lancement. L'onboarding explique à quoi elle sert, puis déclenche la vraie demande système. Chaque état a son message et son action : jamais demandée, refusée, refusée définitivement (ouvrir les réglages), service désactivé, position indisponible. L'app reste complète sans position : tri alphabétique, pas de distance.

**Détails.** La permission est relue au retour au premier plan (elle a pu changer dans les réglages). La lecture de position est bornée à 10 secondes : sans fix GPS, certains appareils n'y répondent jamais. Les coordonnées sont arrondies à environ 100 m pour ne pas invalider le cache à chaque déplacement de quelques mètres.

---

## 11. Carte : react-native-maps

**Choix.** Apple Plans sur iOS (sans clé), Google Maps sur Android (clé requise).

**Pourquoi pas une autre.** `expo-maps` a la même contrainte de clé sur Android. MapLibre se passe de clé mais retire Apple Plans sur iOS.

**Sans clé sur Android.** Le SDK Google lève une exception à la création de la carte. L'app détecte l'absence de clé au build et affiche un message à la place de la carte, au lieu de planter. Voir le README pour fournir la clé.

---

## 12. Tests

**Choix.** Jest + React Native Testing Library 14. On teste ce que l'utilisateur voit et fait : squelette puis données, pagination, recherche, erreur puis réessai, favoris, hors ligne, horaires. La logique pure (horaires, distances, faux serveur) a ses propres tests. Les modules natifs sont mockés une fois, dans `jest.setup.tsx`.

**Écartés.** Les snapshots, qui cassent au moindre changement visuel sans rien dire du comportement. Les `setTimeout` dans les tests.

**Non couvert par Jest.** Les layouts de navigation natifs, vérifiés à la main sur iOS et Android.

---

## 13. Animations

**Choix.** Les transitions de pile et de feuille restent natives. Le reste est volontairement limité : apparition en fondu des lignes et des cartes, réorganisation quand un favori est retiré (Reanimated, sur le thread UI), rebond du SF Symbol du cœur sur iOS et pulsation équivalente sur Android, photo d'en-tête qui s'étire au rebond iOS (`Animated` avec le driver natif : aucun calcul JS par image).

**Pourquoi Reanimated.** Les animations d'entrée, de sortie et de mise en page de liste n'existent pas dans `Animated`, et l'étirement de l'en-tête se calcule dans un `useAnimatedScrollHandler` sur le thread UI. Reanimated était de toute façon déjà embarqué par Expo Router.

**Le panneau de la carte.** `GlassView` d'`expo-glass-effect` quand le système fournit Liquid Glass (iOS 26+), `BlurView` sur les iOS antérieurs, surface opaque sur Android où le flou coûte plus qu'il n'apporte. Aucun verre n'est imité.

**Estimations de trajet.** Sans service d'itinéraire, la distance en voiture et les durées sont des estimations à partir de la ligne droite (détour de 30 %, 25 km/h en ville, 80 m par minute à pied), et affichées comme telles ; l'itinéraire réel est délégué à Plans ou Google Maps.

**Accessibilité.** « Réduire les animations » coupe tout : Reanimated le respecte par défaut, les squelettes et le dépliage des horaires le vérifient explicitement.

---

## 14. Pas de module Swift ou Kotlin

Aucun besoin du produit ne le justifiait : tout ce qu'il fallait existe en modules maintenus. J'en écrirais un, avec l'Expo Modules API, pour :
- intégrer un SDK de guidage en magasin (positionnement intérieur par balises), qui n'existe qu'en natif ;
- émettre une carte de fidélité dans Wallet ou Google Wallet, avec des API de signature propres à chaque plateforme.
