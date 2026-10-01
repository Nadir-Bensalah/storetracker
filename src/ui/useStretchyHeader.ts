import { useMemo, useState } from 'react';
import { Animated, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

/**
 * Pull-down "stretch" for a photo header. When an iOS scroll view bounces past
 * the top, the photo grows from its top edge instead of revealing a gap.
 * Android 12+ applies its own native overscroll stretch, so nothing is needed there.
 * Runs on the native driver: no JS work per frame.
 */
export function useStretchyHeader(
  height: number,
  listener?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
) {
  const [scrollY] = useState(() => new Animated.Value(0));

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener,
      }),
    [scrollY, listener],
  );

  const stretchStyle = useMemo(
    () => ({
      transform: [
        {
          translateY: scrollY.interpolate({
            inputRange: [-height, 0],
            outputRange: [-height / 2, 0],
            extrapolateRight: 'clamp',
          }),
        },
        {
          scale: scrollY.interpolate({
            inputRange: [-height, 0],
            outputRange: [2, 1],
            extrapolateRight: 'clamp',
          }),
        },
      ],
    }),
    [scrollY, height],
  );

  return { scrollY, onScroll, stretchStyle };
}
