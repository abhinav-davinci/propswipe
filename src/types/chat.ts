export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string; // 'user' or agent.id
  text: string;
  timestamp: number;
  status: MessageStatus;
  type: MessageType;
}

export interface Conversation {
  id: string;
  propertyId: string;
  property: import('./property').Property; // snapshot at creation time
  agent: import('./property').Agent;
  messages: Message[];
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
}
