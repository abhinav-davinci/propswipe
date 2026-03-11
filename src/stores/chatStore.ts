import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Property } from '../types/property';
import type { Conversation, Message } from '../types/chat';
import { generateAgentReply } from '../mocks/chatResponses';

interface ChatState {
  conversations: Conversation[];

  createConversation: (property: Property, firstMessage?: string) => string;
  sendMessage: (conversationId: string, text: string) => void;
  getConversationByPropertyId: (propertyId: string) => Conversation | undefined;
  getConversationById: (id: string) => Conversation | undefined;
  markAsRead: (conversationId: string) => void;
  totalUnread: () => number;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],

      createConversation: (property, firstMessage) => {
        const existing = get().conversations.find((c) => c.propertyId === property.id);
        if (existing) {
          if (firstMessage) {
            get().sendMessage(existing.id, firstMessage);
          }
          return existing.id;
        }

        const conversationId = generateId();
        const now = Date.now();
        const messages: Message[] = [];
        let lastMessage: Message | null = null;

        if (firstMessage) {
          const msg: Message = {
            id: generateId(),
            conversationId,
            senderId: 'user',
            text: firstMessage,
            timestamp: now,
            status: 'sent',
            type: 'text',
          };
          messages.push(msg);
          lastMessage = msg;
        }

        const conversation: Conversation = {
          id: conversationId,
          propertyId: property.id,
          property,
          agent: property.agent,
          messages,
          lastMessage,
          unreadCount: 0,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          conversations: [conversation, ...state.conversations],
        }));

        // Trigger mock agent reply if first message was sent
        if (firstMessage) {
          scheduleAgentReply(conversationId, property);
        }

        return conversationId;
      },

      sendMessage: (conversationId, text) => {
        const now = Date.now();
        const msg: Message = {
          id: generateId(),
          conversationId,
          senderId: 'user',
          text,
          timestamp: now,
          status: 'sent',
          type: 'text',
        };

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, msg],
                  lastMessage: msg,
                  updatedAt: now,
                }
              : c
          ),
        }));

        // Schedule mock agent reply
        const conversation = get().conversations.find((c) => c.id === conversationId);
        if (conversation) {
          scheduleAgentReply(conversationId, conversation.property);
        }
      },

      getConversationByPropertyId: (propertyId) => {
        return get().conversations.find((c) => c.propertyId === propertyId);
      },

      getConversationById: (id) => {
        return get().conversations.find((c) => c.id === id);
      },

      markAsRead: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  unreadCount: 0,
                  messages: c.messages.map((m) =>
                    m.senderId !== 'user' && m.status !== 'read'
                      ? { ...m, status: 'read' as const }
                      : m
                  ),
                }
              : c
          ),
        }));
      },

      totalUnread: () => {
        return get().conversations.reduce((sum, c) => sum + c.unreadCount, 0);
      },
    }),
    {
      name: 'propswipe-chat',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Mock agent reply with delay
function scheduleAgentReply(conversationId: string, property: Property) {
  const delay = 2000 + Math.random() * 2000; // 2-4 seconds
  setTimeout(() => {
    const state = useChatStore.getState();
    const conversation = state.conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    const lastUserMsg = [...conversation.messages]
      .reverse()
      .find((m) => m.senderId === 'user');
    if (!lastUserMsg) return;

    const replyText = generateAgentReply(lastUserMsg.text, property);
    const now = Date.now();
    const reply: Message = {
      id: generateId(),
      conversationId,
      senderId: property.agent.id,
      text: replyText,
      timestamp: now,
      status: 'delivered',
      type: 'text',
    };

    useChatStore.setState((prev) => ({
      conversations: prev.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, reply],
              lastMessage: reply,
              unreadCount: c.unreadCount + 1,
              updatedAt: now,
            }
          : c
      ),
    }));
  }, delay);
}
