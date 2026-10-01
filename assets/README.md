# Assets

| Dossier | Contenu | Utilisé par |
|---|---|---|
| `brand/` | Identité de l'app : icône, avant-plan de l'icône adaptative Android, splash clair et sombre | `app.config.ts` |
| `fonts/` | Newsreader Medium (titres) et sa licence SIL OFL | plugin `expo-font` dans `app.config.ts`, `src/theme/tokens.ts` |
| `images/onboarding-street.webp` | Photo d'ambiance de l'onboarding et de l'accueil | `OnboardingScreen.tsx`, `StoresHeader.tsx` |
| `images/stores/` | Façades et intérieurs des enseignes fictives | `src/features/stores/data/photos.ts` |

## Identité (`brand/`)

| Fichier | Rôle |
|---|---|
| `app-icon.png` | Icône iOS et Android, 1024 × 1024, sans transparence |
| `android-adaptive-foreground.png` | Icône adaptative Android : le logo réduit à 72 % pour rester dans la zone que le système ne masque jamais. Fond blanc défini dans `app.config.ts` |
| `splash-light.png` | Logotype du splash sur fond clair (`#FFFFFF`) |
| `splash-dark.png` | Logotype du splash sur fond sombre (`#0B0D12`) |

Les logotypes du splash ont un fond transparent et sont recadrés au plus près du texte : le splash natif les centre sur la couleur de fond du mode actif. Sur Android 12 et plus, le système inscrit l'image dans un cercle ; elle y est affichée plus étroite (`android.imageWidth`).

## Photos des magasins (`images/stores/`)

Les photos ont été générées pour ce projet. Les enseignes sont fictives.

Nommage : `<enseigne>-<lieu ou type>.webp` pour la version 1200 px (galerie du détail), et `-thumb.webp` pour la version 480 px (lignes et cartes).

| Enseigne | Univers | Fichiers |
|---|---|---|
| Lestrade | Mode | `lestrade-paris`, `lestrade-lyon`, `lestrade-interior` |
| Fauvel | Livres et disques | `fauvel-librairie`, `fauvel-galerie`, `fauvel-interior` |
| Hollier | Maison | `hollier-showroom`, `hollier-interior` |
| Lauzière | Sport et montagne | `lauziere-alpes` |
| Rambert | Beauté | `rambert-parfumerie` |
| Gautrand | Épicerie fine | `gautrand-epicerie`, `gautrand-marche`, `gautrand-interior` |
| Thévenot | Chaussures et maroquinerie | `thevenot-lyon` |

Plusieurs magasins d'une même enseigne partagent une photo : l'association se fait dans `src/features/stores/data/brands.ts` (photo par défaut) et `stores.ts` (exceptions, par exemple une galerie marchande ou un marché couvert).

## Régénérer les photos

Les PNG sources ne sont pas versionnés. Pour les reconvertir :

```sh
scripts/optimize-photos.sh <dossier-des-png>
```

Le script retire le préfixe de tri (`01-`), renomme `interieur-<enseigne>` en `<enseigne>-interior`, et produit les deux tailles en WebP (qualité 72 et 70).
