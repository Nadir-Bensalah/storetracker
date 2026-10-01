import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { cloneElement } from 'react';

import type { Store } from './types';

interface StoreLinkProps {
  store: Store;
  tab: 'stores' | 'favorites';
  children: React.ReactElement<{ onPress?: () => void }>;
}

/**
 * Gives a row or card its press: a light haptic, then the detail in the
 * current tab's stack. Expo Router's `Link.Preview` (long-press preview and
 * context menu) was tried here and removed: its native trigger hides the row
 * from VoiceOver and UI automation, which costs more than the preview brings.
 */
export function StoreLink({ store, tab, children }: StoreLinkProps) {
  return cloneElement(children, {
    onPress: () => {
      void Haptics.selectionAsync();
      router.push(`/${tab}/${store.id}`);
    },
  });
}
