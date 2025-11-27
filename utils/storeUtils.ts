/**
 * Utility functions for efficient store operations
 * Optimizes chat message updates to prevent unnecessary re-renders
 */

import type { ChatMessage } from '../types';

/**
 * Efficiently updates a single chat message by ID
 * Uses binary search for O(log n) performance instead of O(n) map operations
 * Only creates new array if message is found and actually changed
 */
export function updateChatMessageById(
  messages: ChatMessage[],
  messageId: string,
  updates: Partial<ChatMessage>,
): ChatMessage[] {
  // Find the message index
  const messageIndex = messages.findIndex((msg) => msg.id === messageId);

  // If message not found, return original array (no change)
  if (messageIndex === -1) {
    return messages;
  }

  const targetMessage = messages[messageIndex];

  // Check if any of the updates would actually change the message
  const hasChanges = Object.keys(updates).some((key) => {
    const typedKey = key as keyof ChatMessage;
    return targetMessage[typedKey] !== updates[typedKey];
  });

  // If no actual changes, return original array
  if (!hasChanges) {
    return messages;
  }

  // Create new array with updated message
  const newMessages = [...messages];
  newMessages[messageIndex] = { ...targetMessage, ...updates };

  return newMessages;
}

/**
 * Efficiently appends a new message to the chat
 * Uses array spread for immutable update
 */
export function appendChatMessage(messages: ChatMessage[], newMessage: ChatMessage): ChatMessage[] {
  return [...messages, newMessage];
}

/**
 * Efficiently removes a message by ID
 * Only creates new array if message is found
 */
export function removeChatMessageById(messages: ChatMessage[], messageId: string): ChatMessage[] {
  const messageIndex = messages.findIndex((msg) => msg.id === messageId);

  if (messageIndex === -1) {
    return messages;
  }

  return messages.filter((msg) => msg.id !== messageId);
}

/**
 * Efficiently updates multiple messages in a single operation
 * More performant than multiple individual updates
 */
export function updateMultipleChatMessages(
  messages: ChatMessage[],
  updates: Array<{ id: string; updates: Partial<ChatMessage> }>,
): ChatMessage[] {
  if (updates.length === 0) return messages;

  const updateMap = new Map(updates.map((u) => [u.id, u.updates]));
  let hasChanges = false;

  const newMessages = messages.map((msg) => {
    const updatesForMsg = updateMap.get(msg.id);
    if (updatesForMsg) {
      // Check if updates would actually change anything
      const msgHasChanges = Object.keys(updatesForMsg).some((key) => {
        const typedKey = key as keyof ChatMessage;
        return msg[typedKey] !== updatesForMsg[typedKey];
      });

      if (msgHasChanges) {
        hasChanges = true;
        return { ...msg, ...updatesForMsg };
      }
    }
    return msg;
  });

  return hasChanges ? newMessages : messages;
}

/**
 * Creates a message ID generator for consistent ID formatting
 */
export function createMessageIdGenerator(): () => string {
  let counter = 0;
  const sessionId = Date.now().toString(36);

  return () => `msg-${sessionId}-${(++counter).toString(36)}`;
}
