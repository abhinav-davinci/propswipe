import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Send, ShieldCheck, ChevronLeft, Phone } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatCurrency';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Property } from '../../types/property';
import type { Message } from '../../types/chat';

interface QuickMessageSheetProps {
  visible: boolean;
  property: Property | null;
  onSend: (message: string) => void;
  onClose: () => void;
  /** If provided, shows live messages in expanded mode */
  messages?: Message[];
  /** Whether agent is "typing" */
  isTyping?: boolean;
}

const TEMPLATES = [
  'Is this still available?',
  'Can I schedule a visit?',
  "What's the lowest price?",
  'Tell me about the society',
];

// Spring config for snapping — feels like Apple Maps / Uber sheets
const SNAP_SPRING = { damping: 28, stiffness: 300, mass: 0.8 };

export function QuickMessageSheet({
  visible,
  property,
  onSend,
  onClose,
  messages = [],
  isTyping = false,
}: QuickMessageSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Snap points: 0 = half (default), 1 = full screen
  // translateY: 0 = full screen top, HALF_SNAP = half position, screenHeight = dismissed
  const FULL_SNAP = insets.top; // full-screen position (respect safe area)
  const HALF_SNAP = screenHeight * 0.52; // roughly bottom half of screen
  const DISMISSED = screenHeight;

  const translateY = useSharedValue(DISMISSED);
  const backdropOpacity = useSharedValue(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const contextYRef = useSharedValue(HALF_SNAP); // tracks current snap for gesture start

  // Open to half-sheet on visible
  useEffect(() => {
    if (visible) {
      setIsExpanded(false);
      translateY.value = withSpring(HALF_SNAP, SNAP_SPRING);
      contextYRef.value = HALF_SNAP;
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(DISMISSED, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
      setMessageText('');
      setIsExpanded(false);
    }
  }, [visible]);

  // Scroll messages to bottom when new ones arrive
  useEffect(() => {
    if (messages.length > 0 && isExpanded) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isExpanded]);

  const expandToFull = useCallback(() => {
    setIsExpanded(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const collapseToHalf = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const dismissSheet = useCallback(() => {
    onClose();
  }, [onClose]);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(DISMISSED, { duration: 250 });
    backdropOpacity.value = withTiming(0, { duration: 250 });
    setTimeout(() => onClose(), 260);
  }, [onClose, DISMISSED]);

  const handleSend = useCallback(() => {
    if (!messageText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = messageText.trim();
    onSend(text);
    setMessageText('');

    // If not expanded yet, expand to show the conversation
    if (!isExpanded) {
      translateY.value = withSpring(FULL_SNAP, SNAP_SPRING);
      contextYRef.value = FULL_SNAP;
      setIsExpanded(true);
    }
  }, [messageText, onSend, isExpanded, FULL_SNAP]);

  const handleTemplate = useCallback((template: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessageText(template);
  }, []);

  // Pan gesture: drag up → expand, drag down → collapse/dismiss
  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextYRef.value = translateY.value;
    })
    .onUpdate((e) => {
      const newY = contextYRef.value + e.translationY;
      // Clamp between full snap and a bit below dismissed
      translateY.value = Math.max(FULL_SNAP - 20, Math.min(newY, DISMISSED));
      // Backdrop fades based on position
      backdropOpacity.value = interpolate(
        translateY.value,
        [FULL_SNAP, DISMISSED],
        [1, 0],
        Extrapolation.CLAMP
      );
    })
    .onEnd((e) => {
      const currentY = translateY.value;
      const velocity = e.velocityY;

      // Determine target snap based on position + velocity
      const midFull = (FULL_SNAP + HALF_SNAP) / 2;
      const midDismiss = (HALF_SNAP + DISMISSED) / 2;

      // Strong velocity overrides position
      if (velocity < -800) {
        // Fast drag up → full screen
        translateY.value = withSpring(FULL_SNAP, SNAP_SPRING);
        contextYRef.value = FULL_SNAP;
        runOnJS(expandToFull)();
        return;
      }
      if (velocity > 800) {
        // Fast drag down
        if (currentY < HALF_SNAP) {
          // From full → snap to half
          translateY.value = withSpring(HALF_SNAP, SNAP_SPRING);
          contextYRef.value = HALF_SNAP;
          runOnJS(collapseToHalf)();
        } else {
          // From half → dismiss
          translateY.value = withTiming(DISMISSED, { duration: 250 });
          backdropOpacity.value = withTiming(0, { duration: 250 });
          runOnJS(dismissSheet)();
        }
        return;
      }

      // Position-based snapping
      if (currentY < midFull) {
        // Closer to full
        translateY.value = withSpring(FULL_SNAP, SNAP_SPRING);
        contextYRef.value = FULL_SNAP;
        runOnJS(expandToFull)();
      } else if (currentY < midDismiss) {
        // Closer to half
        translateY.value = withSpring(HALF_SNAP, SNAP_SPRING);
        contextYRef.value = HALF_SNAP;
        runOnJS(collapseToHalf)();
      } else {
        // Closer to dismissed
        translateY.value = withTiming(DISMISSED, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 250 });
        runOnJS(dismissSheet)();
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    top: translateY.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Animate border radius: round at half, flat at full
  const borderRadiusStyle = useAnimatedStyle(() => {
    const radius = interpolate(
      translateY.value,
      [FULL_SNAP, HALF_SNAP],
      [0, 24],
      Extrapolation.CLAMP
    );
    return {
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
    };
  });

  if (!visible || !property) return null;

  const priceDisplay =
    property.transactionType === 'rent'
      ? `₹${(property.price / 1000).toFixed(0)}K/mo`
      : formatCurrency(property.price);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        {/* Sheet */}
        <Animated.View
          style={[styles.sheet, sheetStyle, borderRadiusStyle]}
        >
          {/* Drag handle zone — the pan gesture lives here */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={styles.dragZone}>
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>

              {/* Expanded header (replaces property context in full mode) */}
              {isExpanded ? (
                <View style={styles.expandedHeader}>
                  <Pressable onPress={dismiss} hitSlop={12} style={styles.backBtn}>
                    <ChevronLeft size={22} color={colors.neutral[800]} />
                  </Pressable>
                  <Image
                    source={{ uri: property.agent.image }}
                    style={styles.headerAvatar}
                  />
                  <View style={styles.headerInfo}>
                    <Text style={styles.headerName} numberOfLines={1}>
                      {property.agent.name}
                    </Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>
                      {property.title}
                    </Text>
                  </View>
                </View>
              ) : (
                <View>
                  {/* Property context (half mode) */}
                  <View style={styles.propertyRow}>
                    <Image
                      source={{ uri: property.images[0] }}
                      style={styles.propertyThumb}
                    />
                    <View style={styles.propertyInfo}>
                      <Text style={styles.propertyTitle} numberOfLines={1}>
                        {property.title}
                      </Text>
                      <Text style={styles.propertyMeta} numberOfLines={1}>
                        {property.location.area} · {priceDisplay}
                      </Text>
                    </View>
                  </View>

                  {/* Agent row */}
                  <View style={styles.agentRow}>
                    <Image
                      source={{ uri: property.agent.image }}
                      style={styles.agentAvatar}
                    />
                    <View style={styles.agentInfo}>
                      <View style={styles.agentNameRow}>
                        <Text style={styles.agentName}>{property.agent.name}</Text>
                        {property.agent.verified && (
                          <ShieldCheck size={14} color={colors.primary[600]} />
                        )}
                      </View>
                      <Text style={styles.agentReplyTime}>
                        Typically replies in ~15 min
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          </GestureDetector>

          {/* Content area — scrollable, NOT part of the pan gesture */}
          <View style={styles.contentArea}>
            {/* Messages list (visible in expanded mode, or if messages exist) */}
            {isExpanded && messages.length > 0 ? (
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={({ item }) => <ChatBubble message={item} />}
                keyExtractor={(item) => item.id}
                style={styles.messageList}
                contentContainerStyle={styles.messageListContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }}
                ListFooterComponent={isTyping ? <TypingIndicator /> : null}
              />
            ) : (
              <View>
                {/* Template chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.templateContainer}
                  style={styles.templateScroll}
                >
                  {TEMPLATES.map((template) => (
                    <Pressable
                      key={template}
                      onPress={() => handleTemplate(template)}
                      style={[
                        styles.templateChip,
                        messageText === template && styles.templateChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.templateText,
                          messageText === template && styles.templateTextActive,
                        ]}
                      >
                        {template}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Input row */}
            <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={colors.neutral[400]}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={handleSend}
                disabled={!messageText.trim()}
                style={[
                  styles.sendButton,
                  !messageText.trim() && styles.sendButtonDisabled,
                ]}
              >
                <Send
                  size={18}
                  color={messageText.trim() ? colors.white : colors.neutral[400]}
                />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  dragZone: {
    // This is the draggable area — handle + header content
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[300],
  },
  // --- Expanded header ---
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: 10,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.neutral[200],
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
  },
  headerSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    color: colors.neutral[400],
    marginTop: 1,
  },
  // --- Half-mode content ---
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  propertyThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.neutral[200],
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
  },
  propertyMeta: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[200],
  },
  agentInfo: {
    flex: 1,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  agentName: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    color: colors.neutral[900],
  },
  agentReplyTime: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    color: colors.neutral[400],
    marginTop: 2,
  },
  // --- Content area ---
  contentArea: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 8,
  },
  templateScroll: {
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  templateContainer: {
    gap: 8,
    paddingRight: 4,
  },
  templateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  templateChipActive: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  templateText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.neutral[700],
  },
  templateTextActive: {
    color: colors.primary[700],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    backgroundColor: colors.white,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral[200],
  },
});
