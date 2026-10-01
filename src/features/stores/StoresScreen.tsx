import { skipToken } from '@reduxjs/toolkit/query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatDistance } from '@/i18n/format';
import { useLocaleTag } from '@/i18n/useLanguage';
import { useAppSelector } from '@/store/hooks';
import { minTouchTarget, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';
import { SkeletonGroup } from '@/ui/Skeleton';
import { StateView } from '@/ui/StateView';
import { Text } from '@/ui/Text';
import { useDebouncedValue } from '@/ui/useDebouncedValue';
import { useStretchyHeader } from '@/ui/useStretchyHeader';

import { useGetNearbyStoresQuery, useGetStoresInfiniteQuery } from './api/storesApi';
import { distanceInMeters } from './distance';
import { HERO_HEIGHT, StoresHeader } from './StoresHeader';
import { StoreRow } from './StoreRow';
import { StoreRowSkeleton } from './StoreRowSkeleton';
import type { Store, StoreSort } from './types';
import { useNow } from './useNow';
import { useOpeningStatusLabel } from './useOpeningStatusLabel';
import { useOpenStore } from './useOpenStore';

const SEARCH_DEBOUNCE_MS = 300;
const keyExtractor = (store: Store) => store.id;

export function StoresScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const locale = useLocaleTag();
  const now = useNow();
  const statusLabel = useOpeningStatusLabel();
  const openStore = useOpenStore('stores');
  const origin = useAppSelector((state) => state.location.coordinates);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<StoreSort>('distance');
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const searching = debouncedSearch.length > 0;

  const query = useMemo(
    () => ({ search: debouncedSearch, near: sort === 'distance' ? origin : null }),
    [debouncedSearch, sort, origin],
  );
  const {
    data: lastData,
    currentData,
    error,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetStoresInfiniteQuery(query);
  const nearby = useGetNearbyStoresQuery(origin ?? skipToken);

  // While a new search loads, the previous results stay on screen (`data`);
  // if that search fails, they must not pass for its results.
  const data = currentData ?? (isError ? undefined : lastData);
  const stores = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = data?.pages[0]?.total;

  const describe = useCallback(
    (store: Store) => ({
      status: statusLabel(store, now),
      distance: origin
        ? formatDistance(distanceInMeters(origin, store.coordinates), locale)
        : undefined,
    }),
    [statusLabel, now, origin, locale],
  );

  const renderItem = useCallback(
    ({ item }: { item: Store }) => (
      <StoreRow store={item} onPress={openStore} {...describe(item)} />
    ),
    [describe, openStore],
  );

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetching) fetchNextPage();
  }, [hasNextPage, isFetching, fetchNextPage]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const chooseSort = useCallback(() => {
    const options: [StoreSort, string][] = [
      ['distance', t('stores.sortDistance')],
      ['name', t('stores.sortName')],
    ];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t('stores.sortLabel'),
          options: [...options.map(([, label]) => label), t('common.close')],
          cancelButtonIndex: options.length,
        },
        (index) => {
          const choice = options[index];
          if (choice) setSort(choice[0]);
        },
      );
    } else {
      Alert.alert(
        t('stores.sortLabel'),
        undefined,
        options.map(([value, label]) => ({ text: label, onPress: () => setSort(value) })),
        { cancelable: true },
      );
    }
  }, [t]);

  const sortControl = origin ? (
    <Pressable
      onPress={chooseSort}
      accessibilityRole="button"
      accessibilityLabel={`${t('stores.sortLabel')}: ${sort === 'distance' ? t('stores.sortDistance') : t('stores.sortName')}`}
      style={styles.sort}
    >
      <Text variant="subhead">
        {sort === 'distance' ? t('stores.sortDistance') : t('stores.sortName')}
      </Text>
      <Icon name="sort" color={colors.textPrimary} size={14} />
    </Pressable>
  ) : null;

  let empty: React.ReactElement | null = null;
  if (isLoading || (isFetching && !data)) {
    empty = (
      <SkeletonGroup label={t('common.loading')}>
        {Array.from({ length: 6 }, (_, index) => (
          <StoreRowSkeleton key={index} />
        ))}
      </SkeletonGroup>
    );
  } else if (isError && !data) {
    const offline = 'kind' in (error ?? {}) && (error as { kind: string }).kind === 'offline';
    empty = (
      <StateView
        icon={offline ? 'wifiOff' : 'warning'}
        title={offline ? t('stores.offlineTitle') : t('stores.errorTitle')}
        body={offline ? t('stores.offlineBody') : t('stores.errorBody')}
        action={{ title: t('common.retry'), onPress: refetch }}
      />
    );
  } else if (data && stores.length === 0) {
    empty = (
      <StateView
        icon="search"
        title={t('stores.emptySearchTitle', { search: debouncedSearch })}
        body={t('stores.emptySearchBody')}
      />
    );
  }

  let footer: React.ReactElement | null = null;
  if (isFetchingNextPage) {
    footer = (
      <View style={styles.footer}>
        <ActivityIndicator accessibilityLabel={t('stores.loadingMore')} />
      </View>
    );
  } else if (isError && data) {
    footer = (
      <View style={styles.footer}>
        <Text variant="footnote" color="textSecondary">
          {t('stores.loadMoreError')}
        </Text>
        <Pressable
          onPress={() => fetchNextPage()}
          accessibilityRole="button"
          style={styles.footerAction}
        >
          <Text variant="subhead" style={{ textDecorationLine: 'underline' }}>
            {t('common.retry')}
          </Text>
        </Pressable>
      </View>
    );
  } else if (data && !hasNextPage && stores.length > 0) {
    footer = (
      <Text variant="footnote" color="textTertiary" style={styles.end}>
        {t('stores.endOfList')}
      </Text>
    );
  }

  // The status bar sits over the hero photo: light text there, then the
  // regular scheme once the photo has scrolled away under a solid strip.
  const [pastHero, setPastHero] = useState(false);
  const threshold = HERO_HEIGHT - spacing.xxl;
  const onScrollPosition = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) =>
      setPastHero(event.nativeEvent.contentOffset.y > threshold),
    [threshold],
  );
  const { scrollY, onScroll, stretchStyle } = useStretchyHeader(
    HERO_HEIGHT + insets.top,
    onScrollPosition,
  );

  const header = (
    <StoresHeader
      search={search}
      onSearchChange={setSearch}
      searching={searching}
      origin={origin}
      nearby={{ stores: nearby.data, loading: nearby.isLoading }}
      describe={describe}
      onOpenStore={openStore}
      listTitle={searching ? t('stores.results') : t('stores.all')}
      listCount={total !== undefined ? t('stores.count', { count: total }) : null}
      sortControl={sortControl}
      heroStretchStyle={stretchStyle}
    />
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false, title: t('tabs.stores') }} />
      <StatusBar style={pastHero ? 'auto' : 'light'} animated />
      <Animated.FlatList
        testID="stores-list"
        data={stores}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={footer}
        ItemSeparatorComponent={Separator}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        // The hero runs under the status bar; safe-area insets inside a tab
        // screen already include the tab bar, so they give the bottom padding.
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={insets.top}
          />
        }
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.statusStrip,
          {
            height: insets.top,
            backgroundColor: colors.background,
            opacity: scrollY.interpolate({
              inputRange: [threshold - 40, threshold],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />
    </View>
  );
}

function Separator() {
  const { colors } = useTheme();
  return <View style={[styles.separator, { backgroundColor: colors.separator }]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg + 84 + spacing.md },
  sort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: minTouchTarget,
  },
  footer: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  footerAction: { minHeight: minTouchTarget, justifyContent: 'center' },
  end: { textAlign: 'center', paddingVertical: spacing.xl },
  statusStrip: { position: 'absolute', top: 0, left: 0, right: 0 },
});
