import { useEffect, useState } from 'react';
import { Animated, type DimensionValue, StyleSheet, View, type ViewStyle } from 'react-native';

import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { useReducedMotion } from './useReducedMotion';

interface SkeletonProps {
  width?: DimensionValue;
  height: number;
  style?: ViewStyle;
}

// Skeleton blocks pulse together through a single native-driven opacity
// animation; with Reduce Motion enabled they stay static.
export function SkeletonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reducedMotion) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity, reducedMotion]);

  return (
    <Animated.View
      style={{ opacity }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      importantForAccessibility="yes"
    >
      <View importantForAccessibility="no-hide-descendants">{children}</View>
    </Animated.View>
  );
}

export function Skeleton({ width = '100%', height, style }: SkeletonProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.block, { width, height, backgroundColor: colors.skeleton }, style]} />
  );
}

const styles = StyleSheet.create({
  block: { borderRadius: radius.sm },
});
