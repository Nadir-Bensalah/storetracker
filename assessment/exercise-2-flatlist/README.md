# Exercice 2 · FlatList de 10 000 produits

Composant corrigé : [`ProductList.tsx`](ProductList.tsx) · tests : [`ProductList.test.tsx`](ProductList.test.tsx)

## Le composant d'origine

```tsx
export const ProductList = ({ products }) => {
  const [filter, setFilter] = useState('');
  return (
    <FlatList
      data={products.filter(p => p.name.includes(filter))}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', padding: 10 }}>
          <Image source={{ uri: item.imageUrl }} style={{ width: 80, height: 80 }} />
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.price} €</Text>
          </View>
        </View>
      )}
      onEndReached={() => console.log('end')}
    />
  );
};
```

## Les problèmes, du plus coûteux au moins coûteux

### 1. Le filtre est recalculé à chaque rendu

**Impact.** `products.filter(...)` parcourt 10 000 éléments à chaque rendu du composant, et produit un nouveau tableau. Pour la FlatList, `data` change donc à chaque rendu : elle recalcule sa fenêtre et re-rend ses lignes.
**Correction.** `useMemo` sur `[products, filter]`. Les noms sont normalisés une seule fois par jeu de produits (second `useMemo`), pas à chaque frappe.

### 2. `renderItem` est une fonction en ligne et la ligne n'est pas mémoïsée

**Impact.** Chaque rendu du parent crée un nouveau `renderItem` : toutes les lignes visibles sont re-rendues, même si leur produit n'a pas changé.
**Correction.** Ligne extraite dans `ProductRow` enveloppé de `React.memo`, et `renderItem` stabilisé par `useCallback`. Les deux vont ensemble : un `memo` sans props stables ne sert à rien (Q14).

### 3. Pas de `keyExtractor`

**Impact.** Sans `key` ni `id` reconnu, la FlatList retombe sur l'index. Au moindre filtrage, les index changent : React réutilise la mauvaise ligne pour le mauvais produit et re-monte inutilement.
**Correction.** `keyExtractor` défini hors du composant, sur `product.id`.

### 4. Des objets de style créés à chaque rendu

**Impact.** Chaque ligne alloue quatre objets de style par rendu. Pour une ligne mémoïsée, des props objet recréées feraient échouer la comparaison.
**Correction.** `StyleSheet.create` hors du composant : des références stables.

### 5. Pas de `getItemLayout` alors que la hauteur est fixe

**Impact.** La FlatList doit mesurer chaque ligne pour savoir où elle se trouve. Le défilement rapide et `scrollToIndex` en souffrent.
**Correction.** La ligne fait exactement 100 px (image de 80 + 2 × 10 de padding) : `getItemLayout` donne la position de chaque ligne par calcul. _Cette optimisation n'a de sens que parce que la hauteur est fixe._ Dans StoreTracker, les lignes grandissent avec la taille de texte choisie par l'utilisateur, et je ne l'utilise donc pas.

### 6. Les images ne sont ni mises en cache ni recyclées correctement

**Impact.** `Image` de React Native a un cache limité. Avec 10 000 lignes qui défilent, les images sont rechargées, et une ligne recyclée peut afficher brièvement l'image de la précédente.
**Correction.** `expo-image` avec cache mémoire et disque, et `recyclingKey` pour qu'une ligne recyclée n'affiche pas l'ancienne image. Idéalement, le serveur fournit aussi des vignettes à la bonne taille plutôt que les images complètes.

### 7. `onEndReached` ne fait rien

**Impact.** Avec 10 000 produits reçus d'un coup, tout est déjà en mémoire et sérialisé ; le `console.log` montre que la pagination était prévue mais pas branchée. En plus, `console.log` à chaque fin de liste coûte en production.
**Correction.** `onEndReached` remonté en prop, pour que le parent charge la page suivante. La vraie correction est côté données : paginer (20 à 50 éléments par page) au lieu de transmettre 10 000 objets.

### 8. Le filtre ne peut pas être modifié

**Impact.** `setFilter` n'est jamais utilisé : il n'y a aucun champ de recherche. Ce n'est pas un problème de performance, mais la fonctionnalité est absente.
**Correction.** Un `TextInput`. La saisie reste fluide grâce à `useDeferredValue` : React traite la frappe en priorité et le filtrage de 10 000 éléments ensuite.

### 9. La recherche est sensible à la casse et aux accents

**Impact.** « echarpe » ne trouve pas « Écharpe ».
**Correction.** Comparaison sur des chaînes normalisées (minuscules, sans accents).

### 10. Le prix n'est pas formaté

**Impact.** `12.5 €` au lieu de `12,50 €`.
**Correction.** `Intl.NumberFormat` créé une fois, hors du composant.

### 11. Ni typage ni accessibilité

**Impact.** `products` est implicitement `any`. Une ligne n'a ni rôle ni libellé : un lecteur d'écran lit deux textes séparés.
**Correction.** Types `Product` et `ProductListProps`. Ligne `Pressable` avec un libellé unique « nom, prix ».

## Les réglages de virtualisation

| Prop                    | Choix                              | Pourquoi                                                                                                                                       |
| ----------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialNumToRender`    | 10                                 | Remplit un écran au premier rendu ; au-delà, on retarde l'affichage                                                                            |
| `windowSize`            | 11 (valeur par défaut, explicitée) | 5 écrans au-dessus et en dessous. Plus petit économise de la mémoire mais montre des zones blanches au défilement rapide                       |
| `maxToRenderPerBatch`   | non modifié                        | Le défaut (10) convient ; je ne règle qu'après mesure                                                                                          |
| `removeClippedSubviews` | activé                             | Détache les lignes hors écran. Vrai gain sur Android ; sur iOS il peut faire disparaître du contenu dans certains cas, à vérifier sur appareil |

Ces valeurs se règlent avec des mesures (Perf Monitor, profiler), pas à l'aveugle.

## Quand ces optimisations sont inutiles, voire nuisibles

- `useMemo` sur un calcul trivial coûte plus cher (comparaison des dépendances, mémoire) que le calcul lui-même.
- `React.memo` sur une ligne dont les props changent à chaque rendu : on ajoute une comparaison qui échoue toujours.
- `getItemLayout` avec des hauteurs variables : positions fausses, sauts au défilement.
- `windowSize` trop bas : économie de mémoire, mais zones blanches visibles.

## Et FlashList ?

Pour 10 000 éléments, `@shopify/flash-list` recycle les vues au lieu de les monter et démonter, et serait mon premier choix en production. Je reste sur `FlatList` ici parce que l'exercice porte sur elle.
