import React, { useState, useEffect } from 'react';
import LanguageSelector from './components/LanguageSelector';
import QuickActions from './components/QuickActions';
import QuestionForm from './components/QuestionForm';
import ResponseDisplay from './components/ResponseDisplay';
import { Language } from '../shared/types';
import { sendRequest } from '../utils/api';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [pageContent, setPageContent] = useState<string>('');

  useEffect(() => {
    // Load language preference from storage
    chrome.storage.local.get(['language'], (result) => {
      if (result.language) {
        setLanguage(result.language);
      }
    });

    // Request page content from content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageContent' }, (response) => {
          if (response && response.content) {
            setPageContent(response.content);
          }
        });
      }
    });

    // Listen for content updates from background script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'contentUpdated' && message.content) {
        setPageContent(message.content);
      }
      return true;
    });
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    chrome.storage.local.set({ language: newLanguage });
  };

  const handleQuickAction = async (action: string) => {
    setLoading(true);
    try {
      const data = await sendRequest(action, pageContent, language);
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Erro ao processar a solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (question: string) => {
    setLoading(true);
    try {
      const data = await sendRequest('question', pageContent, language, question);
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Erro ao processar a pergunta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>AI Assistant</h1>
      
      <LanguageSelector 
        selectedLanguage={language} 
        onLanguageChange={handleLanguageChange} 
      />
      
      <QuickActions onActionClick={handleQuickAction} />
      
      <QuestionForm onSubmit={handleQuestionSubmit} />
      
      <ResponseDisplay 
        response={response} 
        loading={loading} 
      />
    </div>
  );
};

export default App;
