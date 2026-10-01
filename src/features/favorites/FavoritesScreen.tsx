import { router, Stack } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { shallowEqual } from 'react-redux';

import { distanceInMeters } from '@/features/stores/distance';
import { StoreRow } from '@/features/stores/StoreRow';
import type { Store } from '@/features/stores/types';
import { useNow } from '@/features/stores/useNow';
import { useOpeningStatusLabel } from '@/features/stores/useOpeningStatusLabel';
import { formatDistance } from '@/i18n/format';
import { useLocaleTag } from '@/i18n/useLanguage';
import { useAppSelector } from '@/store/hooks';
import { minTouchTarget, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';
import { OfflineBanner } from '@/ui/OfflineBanner';
import { StateView } from '@/ui/StateView';
import { Text } from '@/ui/Text';

const keyExtractor = (store: Store) => store.id;

export function FavoritesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const locale = useLocaleTag();
  const now = useNow();
  const statusLabel = useOpeningStatusLabel();
  const origin = useAppSelector((state) => state.location.coordinates);
  const favorites = useAppSelector(
    (state) =>
      state.favorites.ids
        .map((id) => state.favorites.byId[id])
        .filter((store) => store !== undefined),
    shallowEqual,
  );

  const renderItem = useCallback(
    ({ item }: { item: Store }) => (
      <StoreRow
        store={item}
        tab="favorites"
        status={statusLabel(item, now)}
        distance={
          origin ? formatDistance(distanceInMeters(origin, item.coordinates), locale) : undefined
        }
      />
    ),
    [statusLabel, now, origin, locale],
  );

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <OfflineBanner />
        {favorites.length > 0 ? (
          <Text variant="subhead" color="textSecondary">
            {t('favorites.subtitle', { count: favorites.length })}
          </Text>
        ) : null}
      </View>
    ),
    [favorites.length, t],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t('favorites.title'),
          headerLargeTitle: true,
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel={t('common.settings')}
              style={styles.settings}
            >
              <Icon name="settings" color={colors.textPrimary} size={20} />
            </Pressable>
          ),
        }}
      />
      <Animated.FlatList
        data={favorites}
        itemLayoutAnimation={LinearTransition.duration(240)}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: colors.background }}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
        )}
        ListEmptyComponent={
          <StateView
            icon="heart"
            title={t('favorites.emptyTitle')}
            body={t('favorites.emptyBody')}
            action={{ title: t('favorites.browse'), onPress: () => router.navigate('/stores') }}
          />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg + 84 + spacing.md },
  settings: {
    width: minTouchTarget,
    height: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
