import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

/**
 * Pull-down "stretch" for a photo header. When the scroll view bounces past
 * the top, the photo grows from its top edge instead of revealing a gap.
 * Everything runs on the UI thread: no JS work per frame.
 */
export function useStretchyHeader(height: number) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  const stretchStyle = useAnimatedStyle(() => {
    const y = Math.min(scrollY.get(), 0);
    // Scaling about the centre moves the top edge by half the growth; the
    // translation covers the other half, so the top edge follows the finger.
    return {
      transform: [
        { translateY: y / 2 },
        { scale: interpolate(y, [-height, 0], [2, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  return { scrollY, scrollHandler, stretchStyle };
}
