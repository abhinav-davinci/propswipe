import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Pressable,
  Platform,
  StyleSheet,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Compass,
  Heart,
  TrendingUp,
  User,
  Plus,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddListingSheet } from '../listing/AddListingSheet';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TAB_ICONS: Record<string, {
  icon: typeof Compass;
  label: string;
}> = {
  discover: { icon: Compass, label: 'Discover' },
  saved: { icon: Heart, label: 'Saved' },
  insights: { icon: TrendingUp, label: 'Insights' },
  profile: { icon: User, label: 'Profile' },
};

const ICON_SIZE = 22;
const ACTIVE_ICON_STROKE = 2.25;
const INACTIVE_ICON_STROKE = 1.75;
// Fixed content height (without bottom inset) so React Navigation can measure it
const TAB_BAR_CONTENT_HEIGHT = 56;

interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({ routeName, isFocused, onPress, onLongPress }: TabItemProps) {
  const tabConfig = TAB_ICONS[routeName];
  if (!tabConfig) return null;

  const { icon: Icon, label } = tabConfig;
  const scale = useSharedValue(1);
  const pillWidth = useSharedValue(isFocused ? 56 : 0);
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    pillWidth.value = withSpring(isFocused ? 56 : 0, {
      damping: 15,
      stiffness: 180,
      mass: 0.8,
    });
    pillOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.88, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    width: pillWidth.value,
    opacity: pillOpacity.value,
  }));

  const activeColor = colors.primary[600];
  const inactiveColor = colors.neutral[400];
  const iconColor = isFocused ? activeColor : inactiveColor;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tabItem, containerStyle]}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      {/* Active indicator pill */}
      <View style={styles.iconContainer}>
        <Animated.View
          style={[
            styles.activePill,
            { backgroundColor: colors.primary[50] },
            pillStyle,
          ]}
        />
        <Icon
          size={ICON_SIZE}
          color={iconColor}
          strokeWidth={isFocused ? ACTIVE_ICON_STROKE : INACTIVE_ICON_STROKE}
          fill={isFocused && routeName === 'saved' ? activeColor : 'none'}
        />
      </View>

      {/* Label */}
      <Animated.Text
        style={[
          styles.label,
          {
            color: iconColor,
            fontFamily: isFocused ? 'Inter_600SemiBold' : 'Inter_500Medium',
            opacity: isFocused ? 1 : 0.7,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

function CenterActionButton({ onPress, isSheetOpen }: { onPress: () => void; isSheetOpen: boolean }) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Breathing pulse animation when idle
  useEffect(() => {
    if (!isSheetOpen) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1000 }),
          withTiming(1.0, { duration: 1000 }),
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isSheetOpen]);

  // Rotate to X when sheet is open
  useEffect(() => {
    rotation.value = withSpring(isSheetOpen ? 45 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [isSheetOpen]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulseScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <View style={styles.centerButtonWrapper}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.centerButton, animatedStyle]}
        accessibilityRole="button"
        accessibilityLabel="Add listing"
      >
        <LinearGradient
          colors={['#E8960F', '#D97706']}
          style={styles.centerButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus size={24} color={colors.white} strokeWidth={2.5} />
        </LinearGradient>
      </AnimatedPressable>
    </View>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  const [sheetVisible, setSheetVisible] = useState(false);

  const leftTabs = state.routes.slice(0, 2);  // Discover, Saved
  const rightTabs = state.routes.slice(2);     // Insights, Profile

  const renderTab = (route: typeof state.routes[0], index: number) => {
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    return (
      <TabItem
        key={route.key}
        routeName={route.name}
        isFocused={isFocused}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    );
  };

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingBottom: bottomPadding,
            height: TAB_BAR_CONTENT_HEIGHT + bottomPadding,
            ...Platform.select({
              ios: {
                shadowColor: colors.neutral[900],
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
              },
              android: {
                elevation: 8,
              },
            }),
          },
        ]}
      >
        <View style={styles.tabRow}>
          {leftTabs.map((route, index) => renderTab(route, index))}
          <CenterActionButton
            onPress={() => setSheetVisible(true)}
            isSheetOpen={sheetVisible}
          />
          {rightTabs.map((route, index) => renderTab(route, index + 2))}
        </View>
      </View>
      <AddListingSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  iconContainer: {
    width: 56,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    height: 30,
    borderRadius: 15,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    transform: [{ translateY: -12 }],
    ...Platform.select({
      ios: {
        shadowColor: '#E8960F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  centerButtonGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
