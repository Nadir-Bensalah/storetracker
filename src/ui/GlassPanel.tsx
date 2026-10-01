import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme/useTheme';

// Liquid Glass where the system provides it (iOS 26+), a blur elsewhere, and a
// plain surface on Android where blur costs more than it brings.
export function GlassPanel({ style, children, ...props }: ViewProps) {
  const { scheme, colors } = useTheme();

  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme={scheme} style={style} {...props}>
        {children}
      </GlassView>
    );
  }
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={70} tint={scheme} style={[styles.blur, style]} {...props}>
        {children}
      </BlurView>
    );
  }
  return (
    <View style={[{ backgroundColor: colors.surfaceElevated }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ blur: { overflow: 'hidden' } });
