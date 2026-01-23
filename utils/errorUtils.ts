/**
 * Utility functions for classifying and handling errors.
 */

export interface ErrorClassification {
  actionableAdvice: string;
  detailedMessage: string;
  isRateLimit: boolean;
  isAuthIssue: boolean;
  isModelIssue: boolean;
  isSafetyIssue: boolean;
}

/**
 * Classifies an error message or object into categories for better UI display and handling.
 */
export const classifyError = (error: unknown): ErrorClassification => {
  let message = '';
  let status: number | undefined;

  if (error instanceof Error) {
    message = error.message.toLowerCase();
  } else if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>;
    if (typeof e.message === 'string') message = e.message.toLowerCase();
    if (typeof e.status === 'number') status = e.status;
    else if (
      typeof e.response === 'object' &&
      e.response !== null &&
      typeof (e.response as Record<string, unknown>).status === 'number'
    ) {
      status = (e.response as Record<string, unknown>).status as number;
    }
  } else if (typeof error === 'string') {
    message = error.toLowerCase();
  }

  const isRateLimit =
    status === 429 ||
    status === 503 ||
    message.includes('rate') ||
    message.includes('429') ||
    message.includes('busy') ||
    message.includes('503');

  const isAuthIssue =
    status === 403 ||
    message.includes('auth') ||
    message.includes('api key not valid') ||
    message.includes('invalid api key') ||
    message.includes('credentials');

  const isModelIssue =
    status === 404 ||
    message.includes('model') ||
    message.includes('not found') ||
    message.includes('unsupported model') ||
    message.includes('deprecated') ||
    message.includes('404');

  const isSafetyIssue = message.includes('safety') || message.includes('blocked');

  let actionableAdvice = 'An unexpected error occurred. Please try again.';
  let detailedMessage =
    typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error';

  if (isRateLimit) {
    actionableAdvice = 'Rate limit exceeded or service is busy. Please try again in a moment.';
    detailedMessage =
      'The service is experiencing high demand or a temporary outage. Please wait a few moments before trying again.';
  } else if (isAuthIssue) {
    actionableAdvice = 'Authentication issue. Please check your API key in settings.';
    detailedMessage =
      'The provided API key is either missing, invalid, or has expired. Access to the service requires a valid API key.';
  } else if (isModelIssue) {
    actionableAdvice =
      'Model unavailable or unsupported. Please try updating your model in settings or contact support.';
    detailedMessage =
      'The requested model is currently unavailable or not supported for your region/account. Please ensure your model selection is correct.';
  } else if (isSafetyIssue) {
    actionableAdvice =
      'The response was blocked due to safety settings. Please try rephrasing your prompt.';
    detailedMessage =
      'Safety settings prevented the response from being generated. This usually happens with sensitive content.';
  }

  return {
    actionableAdvice,
    detailedMessage,
    isRateLimit,
    isAuthIssue,
    isModelIssue,
    isSafetyIssue,
  };
};
