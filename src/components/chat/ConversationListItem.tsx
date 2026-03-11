import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../theme/typography';
import type { Conversation } from '../../types/chat';

interface ConversationListItemProps {
  conversation: Conversation;
  onPress: () => void;
}

function formatTimestamp(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

export function ConversationListItem({
  conversation,
  onPress,
}: ConversationListItemProps) {
  const { agent, property, lastMessage, unreadCount } = conversation;
  const hasUnread = unreadCount > 0;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {/* Agent avatar with property thumbnail overlay */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: agent.image }} style={styles.agentAvatar} />
        <Image
          source={{ uri: property.images[0] }}
          style={styles.propertyThumb}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[styles.agentName, hasUnread && styles.agentNameUnread]}
            numberOfLines={1}
          >
            {agent.name}
          </Text>
          {lastMessage && (
            <Text style={[styles.timestamp, hasUnread && styles.timestampUnread]}>
              {formatTimestamp(lastMessage.timestamp)}
            </Text>
          )}
        </View>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {property.title}
        </Text>
        {lastMessage && (
          <View style={styles.bottomRow}>
            <Text
              style={[
                styles.lastMessage,
                hasUnread && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {lastMessage.senderId === 'user' ? 'You: ' : ''}
              {lastMessage.text}
            </Text>
            {hasUnread && <View style={styles.unreadDot} />}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  avatarContainer: {
    width: 52,
    height: 52,
    position: 'relative',
  },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[200],
  },
  propertyThumb: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.neutral[200],
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agentName: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
    flex: 1,
    marginRight: 8,
  },
  agentNameUnread: {
    fontFamily: fontFamilies.heading,
  },
  timestamp: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    color: colors.neutral[400],
  },
  timestampUnread: {
    color: colors.primary[500],
  },
  propertyTitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    color: colors.neutral[400],
    marginTop: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMessage: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
  },
  lastMessageUnread: {
    fontFamily: fontFamilies.bodyMedium,
    color: colors.neutral[800],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginLeft: 8,
  },
});
