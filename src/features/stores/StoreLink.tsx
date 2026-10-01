import { type Href, Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Linking, Platform } from 'react-native';

import { favoriteToggled, selectIsFavorite } from '@/features/favorites/favoritesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { directionsUrl } from './directions';
import type { Store } from './types';

interface StoreLinkProps {
  store: Store;
  tab: 'stores' | 'favorites';
  children: React.ReactElement;
}

/**
 * Wraps a row or card: the press navigates with a light haptic, and on iOS a
 * long press shows the native preview of the detail with a context menu
 * (call, directions, favorite). Android keeps the plain press.
 */
export function StoreLink({ store, tab, children }: StoreLinkProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isFavorite = useAppSelector((state) => selectIsFavorite(state, store.id));
  const href = `/${tab}/${store.id}` as Href;
  const onPress = () => void Haptics.selectionAsync();

  // With `asChild`, Link accepts exactly one child unless Preview and Menu are
  // its direct children (a fragment or a `null` would count as extra children).
  if (Platform.OS !== 'ios') {
    return (
      <Link href={href} asChild onPress={onPress}>
        {children}
      </Link>
    );
  }

  return (
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
  );
}
