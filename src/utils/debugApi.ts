/**
 * Debug utilities for API testing
 */

import { truncateToTokenLimit, estimateTokens } from './tokenValidation';

/**
 * Gets the current backend URL from storage
 */
const getBackendUrl = async (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['backendUrl'], (result) => {
      resolve(result.backendUrl || 'http://localhost:3000');
    });
  });
};

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Get current backend URL
    const API_URL = await getBackendUrl();
    console.log('Testing API at:', API_URL);
    
    const testPayload = {
      action: 'resumir',
      language: 'pt-BR',
      content: 'Este é um teste simples para verificar se a API está funcionando corretamente.'
    };
    
    console.log('Sending test payload:', testPayload);
    
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return { success: false, error: errorText };
    }
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    return { success: true, response: responseText };
    
  } catch (error) {
    console.error('API test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

export const testTruncateFunction = (content: string) => {
  console.log('Testing truncate function...');
  
  const originalTokens = estimateTokens(content);
  console.log('Original content tokens:', originalTokens);
  
  const result = truncateToTokenLimit(content);
  console.log('Truncate result:', {
    wasTruncated: result.wasTruncated,
    originalTokens: result.originalTokens,
    finalTokens: result.finalTokens,
    maxTokens: result.maxTokens,
    withinLimit: result.finalTokens <= result.maxTokens,
    contentLength: result.content.length
  });
  
  // Verify the truncated content doesn't exceed limits
  const backendEstimate = Math.ceil(result.content.length / 4.5);
  console.log('Backend would estimate:', backendEstimate, 'tokens');
  
  return result;
};

// Add to window for manual testing in console
if (typeof window !== 'undefined') {
  (window as any).testApiConnection = testApiConnection;
  (window as any).testTruncateFunction = testTruncateFunction;
}
