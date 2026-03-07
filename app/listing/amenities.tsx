import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  X,
  Check,
  CheckCircle2,
  Minus,
  Plus,
  Square,
  CheckSquare,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const BOTTOM_BAR_HEIGHT = 120;

// ─── Amenity data ──────────────────────────────────────────

interface AmenityItem {
  key: string;
  label: string;
}

interface CountableAmenity {
  key: string;
  label: string;
}

const GENERAL_AMENITIES: AmenityItem[] = [
  { key: 'cctv', label: 'CCTV Surveillance' },
  { key: 'garden', label: 'Garden' },
  { key: 'natural_light', label: 'Natural Lighting' },
  { key: 'kids_play', label: 'Kids Play Area' },
  { key: 'security', label: 'Security Systems' },
  { key: 'swimming_pool', label: 'Swimming Pool' },
  { key: 'gym', label: 'Gym' },
  { key: 'clubhouse', label: 'Clubhouse' },
  { key: 'drinking_water', label: 'Drinking Water' },
  { key: 'balcony', label: 'Balcony' },
  { key: 'cafe', label: 'Cafe' },
  { key: 'prime_location', label: 'Prime Location' },
];

const PARKING_AMENITIES: CountableAmenity[] = [
  { key: 'car_parking', label: 'Car Parking' },
  { key: 'bike_parking', label: 'Bike Parking' },
  { key: 'ev_charger', label: 'EV Charger' },
];

const COUNTABLE_AMENITIES: CountableAmenity[] = [
  { key: 'washrooms', label: 'No. of Washrooms' },
];

const ADDITIONAL_AMENITIES: AmenityItem[] = [
  { key: 'spa', label: 'Spa' },
  { key: 'rooftop_garden', label: 'Rooftop Garden' },
  { key: 'billiards', label: 'Billiards Table' },
  { key: 'games_room', label: 'Games Room' },
  { key: 'snooze_room', label: 'Snooze Room' },
  { key: 'cafeteria', label: 'Cafeteria' },
  { key: 'window_coverings', label: 'Window Coverings' },
  { key: 'smart_home', label: 'Smart Home' },
  { key: 'bathtubs', label: 'Bathtubs' },
  { key: 'playground', label: 'Playground' },
  { key: 'sustainability', label: 'Sustainability' },
  { key: 'community_garden', label: 'Community Garden' },
];

// ─── Shared animated pressable ─────────────────────────────

function PressableButton({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── Amenity chip (toggle) ─────────────────────────────────

function AmenityChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
      {selected && (
        <CheckCircle2 size={14} color={colors.primary[600]} fill={colors.primary[600]} />
      )}
    </Pressable>
  );
}

// ─── Counter row (parking, washrooms) ──────────────────────

function CounterRow({
  label,
  count,
  onIncrement,
  onDecrement,
}: {
  label: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const isActive = count > 0;

  return (
    <View style={[styles.counterRow, isActive && styles.counterRowActive]}>
      <Text style={[styles.counterLabel, isActive && styles.counterLabelActive]}>
        {label}
      </Text>
      {isActive && (
        <CheckCircle2 size={16} color={colors.primary[600]} fill={colors.primary[600]} style={{ marginRight: 4 }} />
      )}
      <View style={styles.counterControls}>
        <Pressable
          style={[styles.counterBtn, !isActive && styles.counterBtnDisabled]}
          onPress={() => {
            if (count > 0) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDecrement();
            }
          }}
        >
          <Minus size={14} color={count > 0 ? colors.neutral[700] : colors.neutral[300]} strokeWidth={2.5} />
        </Pressable>
        <View style={styles.counterDivider} />
        <Text style={[styles.counterValue, isActive && styles.counterValueActive]}>
          {count}
        </Text>
        <View style={styles.counterDivider} />
        <Pressable
          style={styles.counterBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onIncrement();
          }}
        >
          <Plus size={14} color={colors.neutral[700]} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Checkbox row (additional amenities) ───────────────────

function CheckboxRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      style={styles.checkboxRow}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
    >
      {checked ? (
        <CheckSquare size={20} color={colors.primary[600]} fill={colors.primary[50]} />
      ) : (
        <Square size={20} color={colors.neutral[300]} />
      )}
      <Text style={[styles.checkboxLabel, checked && styles.checkboxLabelChecked]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Main screen ───────────────────────────────────────────

export default function AmenitiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});

  const toggleAmenity = useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const increment = useCallback((key: string) => {
    setCounts((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    setSelected((prev) => new Set([...prev, key]));
  }, []);

  const decrement = useCallback((key: string) => {
    setCounts((prev) => {
      const newVal = Math.max(0, (prev[key] || 0) - 1);
      return { ...prev, [key]: newVal };
    });
    setCounts((prev) => {
      if (prev[key] === 0) {
        setSelected((s) => {
          const next = new Set(s);
          next.delete(key);
          return next;
        });
      }
      return prev;
    });
  }, []);

  const removeAmenity = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setCounts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const allKeys = GENERAL_AMENITIES.map((a) => a.key);
    setSelected((prev) => new Set([...prev, ...allKeys]));
  }, []);

  const handleClearAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(new Set());
    setCounts({});
  }, []);

  const handleConfirm = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: save amenities to store
    router.back();
  }, [router]);

  // Build selected labels for the chips area
  const allAmenities = [...GENERAL_AMENITIES, ...PARKING_AMENITIES, ...COUNTABLE_AMENITIES, ...ADDITIONAL_AMENITIES];
  const selectedList = allAmenities.filter((a) => selected.has(a.key));
  const selectedCount = selected.size;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.neutral[800]} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Amenities</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_BAR_HEIGHT + insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected amenities chips */}
        {selectedCount > 0 && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.selectedSection}>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedCount}>
                Added {selectedCount} Amenit{selectedCount === 1 ? 'y' : 'ies'}
              </Text>
              <Pressable onPress={handleClearAll} hitSlop={8}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </Pressable>
            </View>
            <View style={styles.selectedChips}>
              {selectedList.map((item) => (
                <Animated.View
                  key={item.key}
                  layout={Layout.springify().damping(18).stiffness(150)}
                  style={styles.selectedChip}
                >
                  <Text style={styles.selectedChipText}>{item.label}</Text>
                  <Pressable onPress={() => removeAmenity(item.key)} hitSlop={6}>
                    <X size={14} color={colors.neutral[500]} />
                  </Pressable>
                </Animated.View>
              ))}
            </View>
            <View style={styles.divider} />
          </Animated.View>
        )}

        {/* Select Amenities */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Amenities</Text>
          <Pressable style={styles.selectAllBtn} onPress={handleSelectAll}>
            <Text style={styles.selectAllText}>Select All</Text>
          </Pressable>
        </View>

        <View style={styles.amenityGrid}>
          {GENERAL_AMENITIES.map((item) => (
            <AmenityChip
              key={item.key}
              label={item.label}
              selected={selected.has(item.key)}
              onToggle={() => toggleAmenity(item.key)}
            />
          ))}
        </View>

        {/* Countable: Washrooms */}
        {COUNTABLE_AMENITIES.map((item) => (
          <CounterRow
            key={item.key}
            label={item.label}
            count={counts[item.key] || 0}
            onIncrement={() => increment(item.key)}
            onDecrement={() => decrement(item.key)}
          />
        ))}

        {/* Parking & Transport */}
        <Text style={styles.sectionSubtitle}>Parking & Transport</Text>

        {PARKING_AMENITIES.map((item) => (
          <CounterRow
            key={item.key}
            label={item.label}
            count={counts[item.key] || 0}
            onIncrement={() => increment(item.key)}
            onDecrement={() => decrement(item.key)}
          />
        ))}

        {/* Additional amenities */}
        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Add More Amenities</Text>
            <Text style={styles.sectionDesc}>
              Explore additional amenities and select what applies to this property.
            </Text>
          </View>
        </View>

        {ADDITIONAL_AMENITIES.map((item) => (
          <CheckboxRow
            key={item.key}
            label={item.label}
            checked={selected.has(item.key)}
            onToggle={() => toggleAmenity(item.key)}
          />
        ))}
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <PressableButton onPress={handleConfirm} style={styles.confirmBtnWrapper}>
          <LinearGradient
            colors={[colors.primary[600], colors.primary[800]]}
            style={styles.confirmBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Check size={18} color={colors.white} strokeWidth={2.5} />
            <Text style={styles.confirmBtnText}>
              {selectedCount > 0
                ? `Confirm ${selectedCount} Amenities`
                : 'Confirm Amenities'}
            </Text>
          </LinearGradient>
        </PressableButton>
        <Text style={styles.bottomHint}>
          You can always update amenities later
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 14,
  },

  // Selected section
  selectedSection: {
    gap: 12,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCount: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
  },
  clearAllText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  selectedChipText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[700],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginVertical: 4,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.neutral[900],
  },
  sectionDesc: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
    marginTop: 2,
    maxWidth: '80%',
  },
  sectionSubtitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[800],
    marginTop: 6,
  },
  selectAllBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
  },
  selectAllText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[700],
  },

  // Amenity grid (chips)
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
  },
  chipSelected: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  chipText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[600],
  },
  chipTextSelected: {
    color: colors.primary[700],
  },

  // Counter row
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
  },
  counterRowActive: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  counterLabel: {
    flex: 1,
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[600],
  },
  counterLabelActive: {
    color: colors.primary[700],
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
  },
  counterBtnDisabled: {
    opacity: 0.5,
  },
  counterDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.neutral[200],
  },
  counterValue: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[400],
    minWidth: 24,
    textAlign: 'center',
  },
  counterValueActive: {
    color: colors.primary[700],
  },

  // Checkbox row
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[50],
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[600],
  },
  checkboxLabelChecked: {
    color: colors.neutral[900],
    fontFamily: fontFamilies.bodyMedium,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  confirmBtnWrapper: {
    alignSelf: 'stretch',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 14,
  },
  confirmBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.white,
    letterSpacing: 0.3,
  },
  bottomHint: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[400],
    marginTop: 10,
  },
});
