import React, { useRef, useState, useCallback } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { SafeScreen } from '../../src/components/layout/SafeScreen';
import { SwipeableCard } from '../../src/components/swipe/SwipeableCard';
import { SwipeActionButtons } from '../../src/components/swipe/SwipeActionButtons';
import { ImmersiveReelViewer } from '../../src/components/reels/ImmersiveReelViewer';
import { MessagePromptToast } from '../../src/components/chat/MessagePromptToast';
import { QuickMessageSheet } from '../../src/components/chat/QuickMessageSheet';
import { Toast } from '../../src/components/ui/Toast';
import { useCardDeck } from '../../src/hooks/useCardDeck';
import { useChatStore } from '../../src/stores/chatStore';
import { colors } from '../../src/theme/colors';
import type { SwipeDirection, Property } from '../../src/types/property';
import type { VideoReel } from '../../src/types/insight';

export default function DiscoverScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { currentCard, nextCards, currentIndex, totalCards, handleSwipe, getLastSwipedProperty } = useCardDeck();
  const createConversation = useChatStore((s) => s.createConversation);
  const programmaticSwipeRef = useRef<((direction: SwipeDirection) => void) | null>(null);
  const [immersiveReel, setImmersiveReel] = useState<VideoReel | null>(null);

  // Message prompt state
  const [promptProperty, setPromptProperty] = useState<Property | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const [showSentToast, setShowSentToast] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Live messages for the active conversation in the sheet
  const activeConversation = useChatStore((s) =>
    activeConversationId ? s.conversations.find((c) => c.id === activeConversationId) : undefined
  );
  const sheetMessages = activeConversation?.messages ?? [];
  // Show typing when last message is from user (agent reply incoming)
  const sheetIsTyping = sheetMessages.length > 0 && sheetMessages[sheetMessages.length - 1]?.senderId === 'user';

  const cardWidth = width - 32;

  const onSwipe = useCallback(
    (direction: SwipeDirection) => {
      handleSwipe(direction);
      // Show message prompt after swipe-right on a property
      if (direction === 'right') {
        // Small delay to let the swipe animation complete
        setTimeout(() => {
          const swipedProperty = getLastSwipedProperty();
          if (swipedProperty) {
            setPromptProperty(swipedProperty);
            setShowPrompt(true);
          }
        }, 300);
      }
    },
    [handleSwipe, getLastSwipedProperty]
  );

  const handlePromptMessage = useCallback(() => {
    setShowPrompt(false);
    setShowQuickMessage(true);
  }, []);

  const handlePromptDismiss = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const sendMessage = useChatStore((s) => s.sendMessage);

  const handleQuickMessageSend = useCallback(
    (message: string) => {
      if (!promptProperty) return;

      if (activeConversationId) {
        // Conversation already exists — send follow-up message
        sendMessage(activeConversationId, message);
      } else {
        // First message — create conversation, store its ID for live updates
        const convId = createConversation(promptProperty, message);
        setActiveConversationId(convId);
      }
    },
    [promptProperty, activeConversationId, createConversation, sendMessage]
  );

  const handleQuickMessageClose = useCallback(() => {
    setShowQuickMessage(false);
    if (activeConversationId) {
      // Show success toast when closing after having sent messages
      setShowSentToast(true);
    }
    setActiveConversationId(null);
  }, [activeConversationId]);

  const onCardTap = useCallback(() => {
    if (currentCard?.type === 'property') {
      router.push(`/property/${currentCard.data.id}`);
    } else if (currentCard?.type === 'video_reel') {
      setImmersiveReel(currentCard.data);
    }
  }, [currentCard, router]);

  // Immersive reel navigation — swipe advances the feed card
  const handleReelClose = useCallback(() => {
    setImmersiveReel(null);
  }, []);

  const handleReelNext = useCallback(() => {
    handleSwipe('left');
    setImmersiveReel(null);
  }, [handleSwipe]);

  const handleReelPrev = useCallback(() => {
    // No going back in the feed — just close
    setImmersiveReel(null);
  }, []);

  const onActionButton = useCallback(
    (direction: SwipeDirection) => {
      // Detail button navigates directly without animating card away
      if (direction === 'up' && currentCard?.type === 'property') {
        router.push(`/property/${currentCard.data.id}`);
        return;
      }
      if (programmaticSwipeRef.current) {
        programmaticSwipeRef.current(direction);
      }
    },
    [currentCard, router]
  );

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 bg-primary-600 rounded-md items-center justify-center">
            <Text className="text-sm font-heading-extrabold text-white">P</Text>
          </View>
          <Text className="text-xl font-heading-extrabold text-neutral-900">PropSwipe</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-neutral-100 items-center justify-center">
            <Bell size={18} color={colors.neutral[600]} />
          </View>
        </View>
      </View>

      {/* Card Stack */}
      <View className="flex-1 items-center justify-center px-4">
        {currentCard ? (
          <View className="flex-1 w-full items-center justify-center">
            {/* Background cards (next 2) */}
            {nextCards.map((card, index) => (
              <View
                key={`bg-${currentIndex + index + 1}`}
                className="absolute self-center bg-neutral-200 rounded-lg"
                style={{
                  width: cardWidth - (index + 1) * 16,
                  height: '80%',
                  transform: [
                    { scale: 1 - (index + 1) * 0.04 },
                    { translateY: (index + 1) * 6 },
                  ],
                  opacity: 1 - (index + 1) * 0.25,
                  zIndex: -index - 1,
                }}
              />
            ))}

            {/* Active card */}
            <SwipeableCard
              key={`card-${currentIndex}`}
              item={currentCard}
              onSwipe={onSwipe}
              onTap={onCardTap}
              onProgrammaticSwipe={(fn) => { programmaticSwipeRef.current = fn; }}
            />
          </View>
        ) : (
          <View className="items-center px-8">
            <Text className="text-6xl mb-4">🏡</Text>
            <Text className="text-xl font-heading text-neutral-900 mb-2 text-center">
              You've seen all properties!
            </Text>
            <Text className="text-base font-body text-neutral-500 text-center">
              Check back soon for new matches, or refine your preferences.
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {currentCard?.type === 'property' && (
        <SwipeActionButtons onAction={onActionButton} />
      )}

      {/* Swipe hint for non-property cards */}
      {currentCard && currentCard.type !== 'property' && (
        <View className="items-center py-3">
          <Text className="text-xs font-body text-neutral-400">
            {currentCard.type === 'video_reel' ? 'Tap to watch · Swipe to continue' : 'Swipe to continue'}
          </Text>
        </View>
      )}

      {/* Immersive Reel Viewer */}
      {immersiveReel && (
        <ImmersiveReelViewer
          reel={immersiveReel}
          visible={!!immersiveReel}
          onClose={handleReelClose}
          onSwipeNext={handleReelNext}
          onSwipePrev={handleReelPrev}
          hasNext={currentIndex < totalCards - 1}
          hasPrev={false}
        />
      )}

      {/* Message prompt after swipe-right */}
      <MessagePromptToast
        visible={showPrompt}
        property={promptProperty}
        onMessage={handlePromptMessage}
        onDismiss={handlePromptDismiss}
      />

      {/* Quick message sheet */}
      <QuickMessageSheet
        visible={showQuickMessage}
        property={promptProperty}
        onSend={handleQuickMessageSend}
        onClose={handleQuickMessageClose}
        messages={sheetMessages}
        isTyping={sheetIsTyping}
      />

      {/* Sent confirmation toast */}
      <Toast
        visible={showSentToast}
        message="Message sent! Check your conversations."
        variant="success"
        onDismiss={() => setShowSentToast(false)}
      />
    </SafeScreen>
  );
}
