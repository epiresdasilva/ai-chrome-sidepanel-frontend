/**
 * Token validation utilities - aligned with backend logic
 */

export const MAX_TOKENS = 4000;

/**
 * Estimates token count based on character count
 * Uses the same logic as the backend: Math.ceil(charCount / 4.5)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  // Simple estimation based on character count
  // This is a rough approximation, not exact
  const charCount = text.length;
  const estimatedTokens = Math.ceil(charCount / 4.5);
  
  return estimatedTokens;
}

/**
 * Truncates text to fit within token limits
 * Returns the truncated text and metadata about the operation
 */
export function truncateToTokenLimit(text: string): {
  content: string;
  wasTruncated: boolean;
  originalTokens: number;
  finalTokens: number;
  maxTokens: number;
} {
  if (!text) {
    return {
      content: '',
      wasTruncated: false,
      originalTokens: 0,
      finalTokens: 0,
      maxTokens: MAX_TOKENS
    };
  }

  const originalTokens = estimateTokens(text);
  
  // If within limits, return as is
  if (originalTokens <= MAX_TOKENS) {
    return {
      content: text,
      wasTruncated: false,
      originalTokens,
      finalTokens: originalTokens,
      maxTokens: MAX_TOKENS
    };
  }

  // Truncation indicator text
  const truncationIndicator = '\n\n[... conteúdo truncado para respeitar limite de tokens ...]';
  const indicatorTokens = estimateTokens(truncationIndicator);
  
  // Reserve tokens for the truncation indicator
  const availableTokens = MAX_TOKENS - indicatorTokens;
  
  // Calculate maximum characters allowed for the actual content
  const maxCharsForContent = Math.floor(availableTokens * 4.5);
  
  // Start with a conservative truncate
  let truncatedText = text.substring(0, maxCharsForContent);
  
  // Iteratively adjust to ensure we don't exceed token limit
  let currentTokens = estimateTokens(truncatedText + truncationIndicator);
  
  // If still too long, reduce further
  while (currentTokens > MAX_TOKENS && truncatedText.length > 100) {
    // Reduce by 10% each iteration
    const newLength = Math.floor(truncatedText.length * 0.9);
    truncatedText = truncatedText.substring(0, newLength);
    currentTokens = estimateTokens(truncatedText + truncationIndicator);
  }
  
  // Try to cut at a word boundary to avoid cutting words in half
  const lastSpaceIndex = truncatedText.lastIndexOf(' ');
  const lastNewlineIndex = truncatedText.lastIndexOf('\n');
  const lastBoundary = Math.max(lastSpaceIndex, lastNewlineIndex);
  
  // If we found a good boundary and it's not too far back, use it
  if (lastBoundary > truncatedText.length * 0.8) {
    truncatedText = truncatedText.substring(0, lastBoundary);
  }
  
  // Final content with truncation indicator
  const finalContent = truncatedText + truncationIndicator;
  const finalTokens = estimateTokens(finalContent);
  
  console.log('Truncation details:', {
    originalLength: text.length,
    originalTokens,
    truncatedLength: truncatedText.length,
    finalLength: finalContent.length,
    finalTokens,
    maxTokens: MAX_TOKENS,
    withinLimit: finalTokens <= MAX_TOKENS
  });
  
  return {
    content: finalContent,
    wasTruncated: true,
    originalTokens,
    finalTokens,
    maxTokens: MAX_TOKENS
  };
}

/**
 * Formats token count for display
 */
export function formatTokenCount(estimatedTokens: number): string {
  const percentage = (estimatedTokens / MAX_TOKENS) * 100;
  const status = percentage > 100 ? '⚠️' : percentage > 80 ? '⚡' : '✅';
  return `${status} ${estimatedTokens}/${MAX_TOKENS} tokens (${percentage.toFixed(1)}%)`;
}
