import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface StateViewProps {
  icon: IconName;
  title: string;
  body?: string;
  action?: { title: string; onPress: () => void; loading?: boolean };
}

/** Empty, error and offline states share one layout so they read consistently. */
export function StateView({ icon, title, body, action }: StateViewProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Icon name={icon} color={colors.textTertiary} size={28} />
      <View style={styles.text}>
        <Text variant="headline" style={styles.center} accessibilityRole="header">
          {title}
        </Text>
        {body ? (
          <Text variant="subhead" color="textSecondary" style={styles.center}>
            {body}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Button
          title={action.title}
          variant="secondary"
          onPress={action.onPress}
          loading={action.loading}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  text: { gap: spacing.xs, alignItems: 'center' },
  center: { textAlign: 'center' },
});
