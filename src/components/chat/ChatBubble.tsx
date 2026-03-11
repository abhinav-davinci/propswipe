import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, CheckCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../theme/typography';
import type { Message } from '../../types/chat';

interface ChatBubbleProps {
  message: Message;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.senderId === 'user';
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <View style={styles.systemContainer}>
        <Text style={styles.systemText}>{message.text}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.row,
        isUser ? styles.rowRight : styles.rowLeft,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAgent,
        ]}
      >
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAgent]}>
          {message.text}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAgent]}>
            {formatTime(message.timestamp)}
          </Text>
          {isUser && (
            message.status === 'read' ? (
              <CheckCheck size={14} color={colors.primary[400]} />
            ) : (
              <Check size={14} color={colors.neutral[300]} />
            )
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 12,
    marginVertical: 3,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  bubbleUser: {
    backgroundColor: colors.primary[50],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  text: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
  },
  textUser: {
    color: colors.neutral[900],
  },
  textAgent: {
    color: colors.neutral[800],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  time: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
  },
  timeUser: {
    color: colors.neutral[400],
  },
  timeAgent: {
    color: colors.neutral[400],
  },
  systemContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  systemText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    color: colors.neutral[400],
    textAlign: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
