/**
 * Efficient chat message state management
 * Provides optimized operations for chat message updates
 */

import type { ChatMessage } from '../types';
import { createMessageIdGenerator } from '../utils/storeUtils';

export interface ChatMessageState {
  messages: ChatMessage[];
  messageMap: Map<string, number>; // messageId -> index mapping for O(1) lookups
  idGenerator: () => string;
}

/**
 * Creates an optimized chat message state with O(1) message lookups
 */
export function createChatMessageState(initialMessages: ChatMessage[] = []): ChatMessageState {
  const messageMap = new Map<string, number>();
  initialMessages.forEach((msg, index) => {
    messageMap.set(msg.id, index);
  });

  return {
    messages: initialMessages,
    messageMap,
    idGenerator: createMessageIdGenerator(),
  };
}

/**
 * Updates a message in the state with O(1) performance
 */
export function updateChatMessage(
  state: ChatMessageState,
  messageId: string,
  updates: Partial<ChatMessage>,
): ChatMessageState {
  const messageIndex = state.messageMap.get(messageId);

  if (messageIndex === undefined) {
    return state; // Message not found, no change
  }

  const targetMessage = state.messages[messageIndex];

  // Check if updates would actually change anything
  const hasChanges = Object.keys(updates).some((key) => {
    const typedKey = key as keyof ChatMessage;
    return targetMessage[typedKey] !== updates[typedKey];
  });

  if (!hasChanges) {
    return state; // No actual changes, return original state
  }

  // Create new messages array with updated message
  const newMessages = [...state.messages];
  newMessages[messageIndex] = { ...targetMessage, ...updates };

  return {
    ...state,
    messages: newMessages,
  };
}

/**
 * Adds a new message to the state
 */
export function addChatMessage(state: ChatMessageState, message: ChatMessage): ChatMessageState {
  const newMessages = [...state.messages, message];
  const newMessageMap = new Map(state.messageMap);
  newMessageMap.set(message.id, newMessages.length - 1);

  return {
    ...state,
    messages: newMessages,
    messageMap: newMessageMap,
  };
}

/**
 * Gets a message by ID with O(1) performance
 */
export function getChatMessageById(
  state: ChatMessageState,
  messageId: string,
): ChatMessage | undefined {
  const index = state.messageMap.get(messageId);
  return index !== undefined ? state.messages[index] : undefined;
}

/**
 * Creates a new user message
 */
export function createUserMessage(
  state: ChatMessageState,
  content: string,
  role: 'user' = 'user',
): ChatMessage {
  return {
    id: state.idGenerator(),
    role,
    content,
  };
}

/**
 * Creates a new model message
 */
export function createModelMessage(
  state: ChatMessageState,
  content: string = '',
  role: 'model' = 'model',
): ChatMessage {
  return {
    id: state.idGenerator(),
    role,
    content,
  };
}
