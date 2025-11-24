import type { SavedChatSession, ChatMessage } from '../types.ts';

/**
 * Generates a concise knowledge context string from an array of saved chat sessions.
 * This context is intended to "prime" new AI chat sessions with relevant historical information.
 *
 * @param sessions An array of SavedChatSession objects.
 * @returns A string containing aggregated knowledge context.
 */
export function generateKnowledgeContext(sessions: SavedChatSession[]): string {
  if (!sessions || sessions.length === 0) {
    return '';
  }

  const contextParts: string[] = [];
  const MAX_CONTEXT_LENGTH = 1500; // Define a reasonable maximum length for the context string

  // Sort sessions by timestamp (newest first) to prioritize more recent information
  const sortedSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp);

  for (const session of sortedSessions) {
    // For each session, take a few recent messages to include in the context
    // We'll take up to the last 4 messages, alternating user/model if possible
    const recentMessages: ChatMessage[] = [];
    for (let i = session.messages.length - 1; i >= 0 && recentMessages.length < 4; i--) {
      recentMessages.unshift(session.messages[i]);
    }

    if (recentMessages.length > 0) {
      contextParts.push(`--- Context from session: "${session.name}" (ID: ${session.id}) ---`);
      for (const msg of recentMessages) {
        contextParts.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`);
      }
    }
  }

  // Aggregate and truncate if necessary
  let fullContext = contextParts.join('\n');
  if (fullContext.length > MAX_CONTEXT_LENGTH) {
    // Truncate from the end, which means older session context might be dropped first
    fullContext = fullContext.substring(0, MAX_CONTEXT_LENGTH) + '\n... (context truncated)';
  }

  if (fullContext) {
    return `Previous knowledge from saved chats:\n${fullContext}\n---\n`;
  }
  return '';
}
