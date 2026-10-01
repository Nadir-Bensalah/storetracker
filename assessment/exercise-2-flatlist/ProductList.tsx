import { Image } from 'expo-image';
import { memo, useCallback, useDeferredValue, useMemo, useState } from 'react';
import {
  FlatList,
  type ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface ProductListProps {
  products: Product[];
  onEndReached?: () => void;
  onPressProduct?: (product: Product) => void;
}

const ROW_HEIGHT = 100; // 80 px image + 2 × 10 px padding
const SEPARATOR_HEIGHT = StyleSheet.hairlineWidth;
const ITEM_HEIGHT = ROW_HEIGHT + SEPARATOR_HEIGHT;

const priceFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const ProductRow = memo(function ProductRow({
  product,
  onPress,
}: {
  product: Product;
  onPress?: (product: Product) => void;
}) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress ? () => onPress(product) : undefined}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${priceFormatter.format(product.price)}`}
    >
      <Image
        source={product.imageUrl}
        style={styles.image}
        contentFit="cover"
        recyclingKey={product.id}
        cachePolicy="memory-disk"
      />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text>{priceFormatter.format(product.price)}</Text>
      </View>
    </Pressable>
  );
});

const keyExtractor = (product: Product) => product.id;

const getItemLayout = (_: ArrayLike<Product> | null | undefined, index: number) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

const Separator = () => <View style={styles.separator} />;

export function ProductList({ products, onEndReached, onPressProduct }: ProductListProps) {
  const [filter, setFilter] = useState('');
  // Typing stays responsive: filtering 10,000 items runs at a lower priority.
  const deferredFilter = useDeferredValue(filter);

  const searchIndex = useMemo(
    () => products.map((product) => ({ product, key: normalize(product.name) })),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const query = normalize(deferredFilter.trim());
    if (!query) return products;
    return searchIndex.filter((entry) => entry.key.includes(query)).map((entry) => entry.product);
  }, [products, searchIndex, deferredFilter]);

  const renderItem = useCallback<ListRenderItem<Product>>(
    ({ item }) => <ProductRow product={item} onPress={onPressProduct} />,
    [onPressProduct],
  );

  return (
    <View style={styles.container}>
      <TextInput
        value={filter}
        onChangeText={setFilter}
        placeholder="Rechercher un produit"
        accessibilityLabel="Rechercher un produit"
        autoCorrect={false}
        style={styles.search}
      />
      <FlatList
        data={visibleProducts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ItemSeparatorComponent={Separator}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        keyboardDismissMode="on-drag"
        initialNumToRender={10}
        windowSize={11}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 10, padding: 10, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  row: { height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  image: { width: 80, height: 80, borderRadius: 6 },
  text: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  separator: { height: SEPARATOR_HEIGHT, backgroundColor: '#ddd' },
});
