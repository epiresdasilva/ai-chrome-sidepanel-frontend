import { Language, ResponseData } from '../shared/types';
import { truncateToTokenLimit } from './tokenValidation';

const API_URL = 'http://ai-chrome-sidepanel-backend-alb-1513131466.us-east-1.elb.amazonaws.com';

/**
 * Sends a request to the AI backend
 */
export const sendRequest = async (
  action: string,
  content: string,
  language: Language,
  userInput?: string
): Promise<ResponseData & { truncationInfo?: any }> => {
  try {
    // Truncate content if it exceeds token limits
    const truncationResult = truncateToTokenLimit(content);
    
    const requestBody: any = {
      action,
      language,
      content: truncationResult.content,
    };

    // Only add userInput if it's provided
    if (userInput) {
      requestBody.userInput = userInput;
    }

    console.log('Sending request with token info:', {
      action,
      originalTokens: truncationResult.originalTokens,
      finalTokens: truncationResult.finalTokens,
      wasTruncated: truncationResult.wasTruncated
    });

    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
          if (errorData.estimatedTokens && errorData.maxTokens) {
            errorMessage += ` (${errorData.estimatedTokens}/${errorData.maxTokens} tokens)`;
          }
        }
      } catch (e) {
        // If can't parse error as JSON, try as text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (e2) {
          // Use default error message
        }
      }
      throw new Error(errorMessage);
    }

    // Check if response is streaming (SSE format)
    const contentType = response.headers.get('content-type');
    console.log('Response content-type:', contentType);
    
    if (contentType && (contentType.includes('text/stream') || contentType.includes('text/plain') || contentType.includes('text/event-stream'))) {
      // Handle streaming response
      const text = await response.text();
      console.log('Raw streaming response:', text.substring(0, 200) + '...');
      
      // Parse SSE format: extract JSON from "data: {...}" lines
      const lines = text.split('\n');
      let jsonData = '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataContent = line.substring(6).trim(); // Remove "data: " prefix
          if (dataContent && dataContent !== '[DONE]') {
            try {
              const parsed = JSON.parse(dataContent);
              console.log('Parsed SSE chunk:', parsed);
              if (parsed.text) {
                jsonData += parsed.text;
              } else if (parsed.response) {
                jsonData += parsed.response;
              } else if (typeof parsed === 'string') {
                jsonData += parsed;
              }
            } catch (e) {
              // If not JSON, treat as plain text
              console.log('Non-JSON SSE content:', dataContent);
              jsonData += dataContent;
            }
          }
        } else if (line.trim() && !line.startsWith('event:') && !line.startsWith('id:')) {
          // Handle lines that might not have "data: " prefix
          try {
            const parsed = JSON.parse(line.trim());
            if (parsed.text || parsed.response) {
              jsonData += parsed.text || parsed.response;
            }
          } catch (e) {
            // Ignore non-JSON lines
          }
        }
      }
      
      console.log('Final parsed content:', jsonData.substring(0, 200) + '...');
      const result = { response: jsonData || 'Resposta recebida mas não foi possível processar o conteúdo.' };
      
      // Add truncation info to the response if content was truncated
      return {
        ...result,
        truncationInfo: truncationResult.wasTruncated ? {
          wasTruncated: true,
          originalTokens: truncationResult.originalTokens,
          finalTokens: truncationResult.finalTokens,
          message: `Conteúdo foi reduzido de ${truncationResult.originalTokens} para ${truncationResult.finalTokens} tokens.`
        } : undefined
      };
    } else {
      // Handle regular JSON response
      const result = await response.json();
      
      // Add truncation info to the response if content was truncated
      return {
        ...result,
        truncationInfo: truncationResult.wasTruncated ? {
          wasTruncated: true,
          originalTokens: truncationResult.originalTokens,
          finalTokens: truncationResult.finalTokens,
          message: `Conteúdo foi reduzido de ${truncationResult.originalTokens} para ${truncationResult.finalTokens} tokens.`
        } : undefined
      };
    }
  } catch (error) {
    console.error('API request failed:', error);
    return {
      response: 'Ocorreu um erro ao processar sua solicitação.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Sends a streaming request to the AI backend
 */
export const sendStreamingRequest = async (
  action: string,
  content: string,
  language: Language,
  userInput?: string,
  onChunk?: (chunk: string) => void
): Promise<ResponseData & { truncationInfo?: any }> => {
  try {
    // Truncate content if it exceeds token limits
    const truncationResult = truncateToTokenLimit(content);
    
    const requestBody: any = {
      action,
      language,
      content: truncationResult.content,
    };

    // Only add userInput if it's provided
    if (userInput) {
      requestBody.userInput = userInput;
    }

    console.log('Sending streaming request with token info:', {
      action,
      originalTokens: truncationResult.originalTokens,
      finalTokens: truncationResult.finalTokens,
      wasTruncated: truncationResult.wasTruncated
    });

    const response = await fetch(`${API_URL}/ask/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    let fullResponse = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      
      if (onChunk) {
        onChunk(chunk);
      }
    }

    // Add truncation info to the response if content was truncated
    return { 
      response: fullResponse,
      truncationInfo: truncationResult.wasTruncated ? {
        wasTruncated: true,
        originalTokens: truncationResult.originalTokens,
        finalTokens: truncationResult.finalTokens,
        message: `Conteúdo foi reduzido de ${truncationResult.originalTokens} para ${truncationResult.finalTokens} tokens.`
      } : undefined
    };
  } catch (error) {
    console.error('Streaming API request failed:', error);
    return {
      response: 'Ocorreu um erro ao processar sua solicitação.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
