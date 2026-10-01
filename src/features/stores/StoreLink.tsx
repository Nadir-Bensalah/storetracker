import { type Href, Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, View, type ViewStyle } from 'react-native';

import { favoriteToggled, selectIsFavorite } from '@/features/favorites/favoritesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { directionsUrl } from './directions';
import type { Store } from './types';

interface StoreLinkProps {
  store: Store;
  tab: 'stores' | 'favorites';
  /** Read by screen readers for the whole row or card. */
  accessibilityLabel: string;
  style?: ViewStyle;
  children: React.ReactElement;
}

/**
 * Wraps a row or card: the press navigates with a light haptic, and on iOS a
 * long press shows the native preview of the detail with a context menu
 * (call, directions, favorite). The native preview trigger hides its content
 * from assistive technologies, so the accessible element is this wrapper.
 */
export function StoreLink({ store, tab, accessibilityLabel, style, children }: StoreLinkProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isFavorite = useAppSelector((state) => selectIsFavorite(state, store.id));
  const href = `/${tab}/${store.id}` as Href;
  const onPress = () => void Haptics.selectionAsync();

  const link =
    Platform.OS === 'ios' ? (
      <Link href={href} asChild onPress={onPress}>
        <Link.Trigger>{children}</Link.Trigger>
        <Link.Preview />
        <Link.Menu>
          <Link.MenuAction
            title={t('detail.callShort')}
            icon="phone.fill"
            onPress={() => Linking.openURL(`tel:${store.phone.replace(/\s/g, '')}`)}
          />
          <Link.MenuAction
            title={t('detail.directions')}
            icon="arrow.triangle.turn.up.right.diamond.fill"
            onPress={() => Linking.openURL(directionsUrl(store))}
          />
          <Link.MenuAction
            title={isFavorite ? t('detail.removeFavorite') : t('detail.addFavorite')}
            icon={isFavorite ? 'heart.slash' : 'heart'}
            destructive={isFavorite}
            onPress={() => dispatch(favoriteToggled(store))}
          />
        </Link.Menu>
      </Link>
    ) : (
      <Link href={href} asChild onPress={onPress}>
        {children}
      </Link>
    );

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      {link}
    </View>
  );
}
