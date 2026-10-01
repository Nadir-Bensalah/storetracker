import { router, Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';

import { formatDistance } from '@/i18n/format';
import { useLocaleTag } from '@/i18n/useLanguage';
import { useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { SkeletonGroup } from '@/ui/Skeleton';
import { StateView } from '@/ui/StateView';
import { Text } from '@/ui/Text';
import { useDebouncedValue } from '@/ui/useDebouncedValue';

import { useGetStoresInfiniteQuery } from './api/storesApi';
import { distanceInMeters } from './distance';
import { StoreRow } from './StoreRow';
import { StoreRowSkeleton } from './StoreRowSkeleton';
import type { Store } from './types';
import { useNow } from './useNow';
import { useOpeningStatusLabel } from './useOpeningStatusLabel';

const SEARCH_DEBOUNCE_MS = 300;
const keyExtractor = (store: Store) => store.id;

/** Search lives in the native header search bar (UISearchController / SearchView). */
export function SearchScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: t('stores.results'),
          headerLargeTitle: false,
          headerBackButtonDisplayMode: 'minimal',
          headerSearchBarOptions: {
            placeholder: t('stores.searchPlaceholder'),
            autoFocus: true,
            hideWhenScrolling: false,
            autoCapitalize: 'none',
            onChangeText: (event) => setSearch(event.nativeEvent.text),
            onCancelButtonPress: () => router.back(),
          },
        }}
      />
      <SearchResults query={query} />
    </View>
  );
}

export function SearchResults({ query }: { query: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const locale = useLocaleTag();
  const now = useNow();
  const statusLabel = useOpeningStatusLabel();
  const origin = useAppSelector((state) => state.location.coordinates);

  const { data, currentData, isError, isFetching, hasNextPage, fetchNextPage, refetch } =
    useGetStoresInfiniteQuery({ search: query, near: origin }, { skip: query.length === 0 });

  const results = currentData ?? (isError ? undefined : data);
  const stores = results?.pages.flatMap((page) => page.items) ?? [];
  const total = results?.pages[0]?.total;

  const renderItem = useCallback(
    ({ item }: { item: Store }) => (
      <StoreRow
        store={item}
        tab="stores"
        status={statusLabel(item, now)}
        distance={
          origin ? formatDistance(distanceInMeters(origin, item.coordinates), locale) : undefined
        }
      />
    ),
    [statusLabel, now, origin, locale],
  );

  let empty: React.ReactElement | null = null;
  if (query.length === 0) {
    empty = (
      <Text variant="subhead" color="textSecondary" style={styles.hint}>
        {t('stores.searchHint')}
      </Text>
    );
  } else if (isFetching && !results) {
    empty = (
      <SkeletonGroup label={t('common.loading')}>
        {Array.from({ length: 4 }, (_, index) => (
          <StoreRowSkeleton key={index} />
        ))}
      </SkeletonGroup>
    );
  } else if (isError && !results) {
    empty = (
      <StateView
        icon="warning"
        title={t('stores.errorTitle')}
        body={t('stores.errorBody')}
        action={{ title: t('common.retry'), onPress: refetch }}
      />
    );
  } else if (results && stores.length === 0) {
    empty = (
      <StateView
        icon="search"
        title={t('stores.emptySearchTitle', { search: query })}
        body={t('stores.emptySearchBody')}
      />
    );
  }

  return (
    <>
      <FlatList
        data={stores}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          total !== undefined && stores.length > 0 ? (
            <Text variant="subhead" color="textSecondary" style={styles.count}>
              {t('stores.count', { count: total })}
            </Text>
          ) : null
        }
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetching) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hint: { padding: spacing.xl, textAlign: 'center' },
  count: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg + 84 + spacing.md },
});
