import React, { useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '../../src/components/layout/SafeScreen';
import { ConversationListItem } from '../../src/components/chat/ConversationListItem';
import { useChatStore } from '../../src/stores/chatStore';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';

export default function MessagesScreen() {
  const router = useRouter();
  const conversations = useChatStore((s) => s.conversations);
  const markAsRead = useChatStore((s) => s.markAsRead);

  const handleConversationPress = useCallback(
    (conversationId: string) => {
      markAsRead(conversationId);
      router.push(`/chat/${conversationId}`);
    },
    [router, markAsRead]
  );

  return (
    <SafeScreen>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text
          style={{
            fontFamily: fontFamilies.headingExtrabold,
            fontSize: fontSizes['2xl'],
            lineHeight: lineHeights['2xl'],
            color: colors.neutral[900],
          }}
        >
          Messages
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {conversations.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
            <Text
              style={{
                fontFamily: fontFamilies.heading,
                fontSize: fontSizes.lg,
                color: colors.neutral[900],
                marginBottom: 8,
              }}
            >
              No conversations yet
            </Text>
            <Text
              style={{
                fontFamily: fontFamilies.body,
                fontSize: fontSizes.sm,
                color: colors.neutral[500],
                textAlign: 'center',
                paddingHorizontal: 32,
              }}
            >
              Like a property to start chatting with agents
            </Text>
          </View>
        ) : (
          conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              onPress={() => handleConversationPress(conversation.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeScreen>
  );
}
