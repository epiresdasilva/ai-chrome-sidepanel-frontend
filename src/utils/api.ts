import { Language, ResponseData } from '../shared/types';

const API_URL = 'http://ai-chrome-sidepanel-backend-alb-1513131466.us-east-1.elb.amazonaws.com';

/**
 * Sends a request to the AI backend
 */
export const sendRequest = async (
  action: string,
  content: string,
  language: Language,
  question?: string
): Promise<ResponseData> => {
  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        content,
        language,
        question,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
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
  question?: string,
  onChunk?: (chunk: string) => void
): Promise<ResponseData> => {
  try {
    const response = await fetch(`${API_URL}/ask/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        content,
        language,
        question,
      }),
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

    return { response: fullResponse };
  } catch (error) {
    console.error('Streaming API request failed:', error);
    return {
      response: 'Ocorreu um erro ao processar sua solicitação.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
