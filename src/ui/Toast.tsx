import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

const TOAST_DURATION_MS = 2500;

export interface ToastMessage {
  text: string;
  icon?: IconName;
}

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const show = useCallback((text: string, icon?: IconName) => setToast({ text, icon }), []);
  return { toast, show };
}

/** Short confirmation above the tab bar; announced to screen readers through the live region. */
export function Toast({ toast }: { toast: ToastMessage | null }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  if (!toast) return null;

  return (
    <View style={[styles.host, { bottom: insets.bottom + spacing.md }]} pointerEvents="none">
      <Animated.View
        entering={FadeInDown.duration(220)}
        exiting={FadeOutDown.duration(180)}
        style={[styles.toast, { backgroundColor: colors.accent }]}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        {toast.icon ? <Icon name={toast.icon} color={colors.onAccent} size={16} /> : null}
        <Text variant="subhead" color="onAccent">
          {toast.text}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg + 10,
    maxWidth: '88%',
  },
});
