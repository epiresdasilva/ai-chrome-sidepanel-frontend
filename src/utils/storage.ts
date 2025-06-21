import { Language } from '../shared/types';

/**
 * Gets the user's language preference from Chrome storage
 */
export const getLanguagePreference = async (): Promise<Language> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['language'], (result) => {
      resolve(result.language || 'pt-BR');
    });
  });
};

/**
 * Saves the user's language preference to Chrome storage
 */
export const saveLanguagePreference = async (language: Language): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ language }, resolve);
  });
};
