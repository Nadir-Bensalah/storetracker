import { StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/theme/tokens';
import { Skeleton } from '@/ui/Skeleton';

import { STORE_ROW_THUMB } from './StoreRow';

export function StoreRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton
        width={STORE_ROW_THUMB}
        height={STORE_ROW_THUMB}
        style={{ borderRadius: radius.md }}
      />
      <View style={styles.text}>
        <Skeleton width="70%" height={17} />
        <Skeleton width="90%" height={13} />
        <Skeleton width="55%" height={13} />
        <Skeleton width="40%" height={11} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: { flex: 1, gap: spacing.sm },
});
