import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ChevronLeft, Phone } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';
import { useChatStore } from '../../src/stores/chatStore';
import { ChatBubble } from '../../src/components/chat/ChatBubble';
import { ChatInput } from '../../src/components/chat/ChatInput';
import { PropertyContextCard } from '../../src/components/chat/PropertyContextCard';
import { TypingIndicator } from '../../src/components/chat/TypingIndicator';
import type { Message } from '../../src/types/chat';

const QUICK_REPLIES = [
  'Is this still available?',
  'Can I visit this weekend?',
  'Send me the floor plan',
  'What are the charges?',
];

function DaySeparator({ timestamp }: { timestamp: number }) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  let label: string;
  if (diffDays === 0) label = 'Today';
  else if (diffDays === 1) label = 'Yesterday';
  else
    label = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <View style={styles.daySeparator}>
      <Text style={styles.daySeparatorText}>{label}</Text>
    </View>
  );
}

export default function ChatThreadScreen() {
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const conversation = useChatStore((s) =>
    s.conversations.find((c) => c.id === conversationId)
  );
  const sendMessage = useChatStore((s) => s.sendMessage);
  const markAsRead = useChatStore((s) => s.markAsRead);

  const [isTyping, setIsTyping] = useState(false);
  const prevMessageCount = useRef(conversation?.messages.length ?? 0);

  // Mark as read on mount
  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [conversationId]);

  // Detect typing indicator: show when waiting for agent reply
  useEffect(() => {
    if (!conversation) return;
    const msgs = conversation.messages;
    const lastMsg = msgs[msgs.length - 1];

    if (lastMsg?.senderId === 'user') {
      // User just sent — show typing after a brief delay
      const timer = setTimeout(() => setIsTyping(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [conversation?.messages.length]);

  // Mark new incoming messages as read
  useEffect(() => {
    if (!conversation) return;
    if (conversation.messages.length > prevMessageCount.current) {
      markAsRead(conversationId!);
    }
    prevMessageCount.current = conversation.messages.length;
  }, [conversation?.messages.length]);

  const handleSend = useCallback(
    (text: string) => {
      if (!conversationId) return;
      sendMessage(conversationId, text);
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [conversationId, sendMessage]
  );

  const handleCall = useCallback(() => {
    if (!conversation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${conversation.agent.phone}`);
  }, [conversation]);

  if (!conversation) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>Conversation not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  // Build list items with day separators
  const listItems: { type: 'separator' | 'message'; data: any; key: string }[] =
    [];
  let lastDateStr = '';
  for (const msg of conversation.messages) {
    const dateStr = new Date(msg.timestamp).toDateString();
    if (dateStr !== lastDateStr) {
      listItems.push({
        type: 'separator',
        data: msg.timestamp,
        key: `sep-${dateStr}`,
      });
      lastDateStr = dateStr;
    }
    listItems.push({ type: 'message', data: msg, key: msg.id });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.neutral[800]} />
        </Pressable>
        <Image
          source={{ uri: conversation.agent.image }}
          style={styles.headerAvatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {conversation.agent.name}
          </Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <Pressable onPress={handleCall} style={styles.phoneBtn}>
          <Phone size={20} color={colors.primary[600]} />
        </Pressable>
      </View>

      {/* Property context card */}
      <PropertyContextCard property={conversation.property} />

      {/* Quick reply chips */}
      {conversation.messages.length <= 1 && (
        <View style={styles.quickRepliesContainer}>
          {QUICK_REPLIES.map((text) => (
            <Pressable
              key={text}
              onPress={() => handleSend(text)}
              style={styles.quickReplyChip}
            >
              <Text style={styles.quickReplyText}>{text}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={listItems}
        renderItem={({ item }) =>
          item.type === 'separator' ? (
            <DaySeparator timestamp={item.data} />
          ) : (
            <ChatBubble message={item.data as Message} />
          )
        }
        keyExtractor={(item) => item.key}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      {/* Input bar */}
      <View style={{ paddingBottom: insets.bottom }}>
        <ChatInput onSend={handleSend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  headerStatus: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    color: colors.success,
  },
  phoneBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 8,
  },
  daySeparator: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  daySeparatorText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    color: colors.neutral[400],
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  quickReplyChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  quickReplyText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.primary[700],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
  },
  emptyText: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    color: colors.neutral[700],
    marginBottom: 12,
  },
  goBackText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    color: colors.primary[600],
  },
});
