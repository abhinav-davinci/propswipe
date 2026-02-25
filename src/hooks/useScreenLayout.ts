import { useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Responsive layout hook — provides screen-aware dimensions
 * that react to orientation changes, split-screen, etc.
 *
 * All card/image sizes adapt to the actual available space.
 */
export function useScreenLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Available height after safe area insets
  const safeHeight = height - insets.top - insets.bottom;

  // Card width: screen width - 2×16px horizontal padding
  const cardWidth = width - 32;

  // Discover screen budget:
  //   header ~52px, action buttons ~72px, tab bar ~56px content + bottom inset
  const discoverHeaderHeight = 52;
  const actionButtonsHeight = 72;
  const tabBarContentHeight = 56;
  const discoverAvailableHeight =
    safeHeight - discoverHeaderHeight - actionButtonsHeight - tabBarContentHeight;

  // Property card image height: ~45% of available card height, clamped
  const cardImageHeight = Math.min(
    Math.max(Math.round(discoverAvailableHeight * 0.45), 160),
    280
  );

  // Total card max height (image + content area)
  const cardMaxHeight = Math.min(discoverAvailableHeight - 8, 520);

  // Neighbourhood card hero height
  const neighbourhoodHeroHeight = Math.min(Math.round(height * 0.2), 180);

  // Small device flag (iPhone SE, etc.)
  const isSmallDevice = height < 700;
  // Large device flag (Pro Max, tablets)
  const isLargeDevice = height > 900;

  return {
    // Raw dimensions
    screenWidth: width,
    screenHeight: height,
    insets,
    safeHeight,

    // Card sizing
    cardWidth,
    cardImageHeight,
    cardMaxHeight,
    neighbourhoodHeroHeight,

    // Device category
    isSmallDevice,
    isLargeDevice,

    // Adaptive spacing
    horizontalPadding: 16,
    cardBorderRadius: 16,
  };
}
