import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { X, Heart, Star, ChevronUp } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import type { SwipeDirection } from '../../types/property';

interface SwipeActionButtonsProps {
  onAction: (direction: SwipeDirection) => void;
}

const BUTTONS: {
  direction: SwipeDirection;
  icon: typeof X;
  size: number;
  iconSize: number;
  arcY: number;
  borderColor: string;
  iconColor: string;
  filled?: boolean;
}[] = [
  {
    direction: 'left',
    icon: X,
    size: 64,
    iconSize: 28,
    arcY: 0,
    borderColor: '#ECA9A9',
    iconColor: '#DC2626',
  },
  {
    direction: 'superlike',
    icon: Star,
    size: 44,
    iconSize: 20,
    arcY: -22,
    borderColor: '#F0CC7E',
    iconColor: '#E8960F',
    filled: true,
  },
  {
    direction: 'up',
    icon: ChevronUp,
    size: 38,
    iconSize: 17,
    arcY: -22,
    borderColor: '#B8C5C5',
    iconColor: colors.neutral[500],
  },
  {
    direction: 'right',
    icon: Heart,
    size: 64,
    iconSize: 28,
    arcY: 0,
    borderColor: '#8ECAA1',
    iconColor: '#15803D',
  },
];

const GAPS = [28, 14, 28];

export function SwipeActionButtons({ onAction }: SwipeActionButtonsProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handlePress = (direction: SwipeDirection) => {
    Haptics.impactAsync(
      direction === 'superlike'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium
    );
    onAction(direction);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {BUTTONS.map((btn, i) => {
          const Icon = btn.icon;
          const isHeart = btn.direction === 'right';

          return (
            <React.Fragment key={btn.direction}>
              <Animated.View
                style={[
                  { transform: [{ translateY: btn.arcY }] },
                  isHeart ? pulseStyle : undefined,
                ]}
              >
                {/* Outer ring: always-visible border + shadow */}
                <View
                  style={{
                    width: btn.size,
                    height: btn.size,
                    borderRadius: btn.size / 2,
                    borderWidth: 2.5,
                    borderColor: btn.borderColor,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#141E1E',
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 6,
                  }}
                >
                  <Pressable
                    onPress={() => handlePress(btn.direction)}
                    style={({ pressed }) => ({
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: btn.size / 2,
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.90 : 1 }],
                    })}
                  >
                    <Icon
                      size={btn.iconSize}
                      color={btn.iconColor}
                      {...(btn.filled ? { fill: btn.iconColor } : {})}
                    />
                  </Pressable>
                </View>
              </Animated.View>
              {i < BUTTONS.length - 1 && <View style={{ width: GAPS[i] }} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 2,
    paddingBottom: 10,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
