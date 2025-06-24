import React, { useState, useEffect } from 'react';
import LanguageSelector from './components/LanguageSelector';
import QuickActions from './components/QuickActions';
import QuestionForm from './components/QuestionForm';
import ResponseDisplay from './components/ResponseDisplay';
import TokenInfo from './components/TokenInfo';
import { Language } from '../shared/types';
import { sendRequest } from '../utils/api';
import { testApiConnection, testTruncateFunction } from '../utils/debugApi';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [pageContent, setPageContent] = useState<string>('');
  const [truncationInfo, setTruncationInfo] = useState<any>(null);

  // Fallback function to get content directly if content script fails
  const getContentFallback = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return '';

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Simple content extraction
          const title = document.title;
          const url = window.location.href;
          
          // Remove script and style elements
          const clone = document.body.cloneNode(true) as HTMLElement;
          const scripts = clone.querySelectorAll('script, style');
          scripts.forEach(el => el.remove());
          
          const content = clone.innerText
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();
          
          return `URL: ${url}\nTitle: ${title}\n\nContent:\n${content}`;
        }
      });

      return results[0]?.result || '';
    } catch (error) {
      console.error('Fallback content extraction failed:', error);
      return '';
    }
  };

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
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageContent' }, async (response) => {
          console.log('Content script response:', response);
          if (response && response.content) {
            console.log('Setting page content:', response.content.substring(0, 100) + '...');
            setPageContent(response.content);
          } else {
            console.log('No content received from content script, trying fallback');
            // Try fallback method
            const fallbackContent = await getContentFallback();
            if (fallbackContent) {
              console.log('Fallback content obtained:', fallbackContent.substring(0, 100) + '...');
              setPageContent(fallbackContent);
            }
          }
        });
      }
    });

    // Listen for content updates from background script
    chrome.runtime.onMessage.addListener((message) => {
      console.log('Message received in panel:', message);
      if (message.action === 'contentUpdated' && message.content) {
        console.log('Updating page content from background:', message.content.substring(0, 100) + '...');
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
    console.log('Quick action triggered:', action);
    console.log('Page content length:', pageContent.length);
    console.log('Page content preview:', pageContent.substring(0, 200));
    
    if (!pageContent.trim()) {
      console.warn('No page content available');
      setResponse('Nenhum conteúdo da página foi encontrado. Tente recarregar a página.');
      return;
    }
    
    setLoading(true);
    setTruncationInfo(null);
    
    try {
      const data = await sendRequest(action, pageContent, language);
      setResponse(data.response);
      
      // Store truncation info if content was truncated
      if (data.truncationInfo) {
        setTruncationInfo(data.truncationInfo);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('Erro ao processar a solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (question: string) => {
    setLoading(true);
    setTruncationInfo(null);
    
    try {
      const data = await sendRequest('pergunta', pageContent, language, question);
      setResponse(data.response);
      
      // Store truncation info if content was truncated
      if (data.truncationInfo) {
        setTruncationInfo(data.truncationInfo);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('Erro ao processar a pergunta.');
    } finally {
      setLoading(false);
    }
  };

  const refreshContent = async () => {
    console.log('Refreshing content...');
    const fallbackContent = await getContentFallback();
    if (fallbackContent) {
      console.log('Content refreshed:', fallbackContent.substring(0, 100) + '...');
      setPageContent(fallbackContent);
    }
  };

  const testApi = async () => {
    console.log('Testing API...');
    const result = await testApiConnection();
    console.log('API test result:', result);
    if (result.success) {
      setResponse('✅ API funcionando: ' + result.response);
    } else {
      setResponse('❌ Erro na API: ' + result.error);
    }
  };

  const testTruncate = () => {
    if (!pageContent) {
      setResponse('❌ Nenhum conteúdo para testar truncate');
      return;
    }
    
    console.log('Testing truncate with current content...');
    const result = testTruncateFunction(pageContent);
    
    const message = `🔧 Teste de Truncate:
Original: ${result.originalTokens} tokens
Final: ${result.finalTokens} tokens
Truncado: ${result.wasTruncated ? 'Sim' : 'Não'}
Dentro do limite: ${result.finalTokens <= result.maxTokens ? 'Sim' : 'Não'}`;
    
    setResponse(message);
  };

  return (
    <div className="app">
      <h1>AI Assistant</h1>
      
      <LanguageSelector 
        selectedLanguage={language} 
        onLanguageChange={handleLanguageChange} 
      />
      
      {/* Token information */}
      {pageContent && (
        <TokenInfo 
          content={pageContent} 
          truncationInfo={truncationInfo}
        />
      )}
      
      {/* Debug info - can be removed in production */}
      <div style={{ fontSize: '12px', color: '#666', margin: '10px 0', padding: '5px', backgroundColor: '#f5f5f5' }}>
        Conteúdo: {pageContent.length > 0 ? `${pageContent.length} caracteres` : 'Nenhum conteúdo'}
        <button 
          onClick={refreshContent}
          style={{ marginLeft: '10px', fontSize: '10px', padding: '2px 6px' }}
        >
          Atualizar
        </button>
        <button 
          onClick={testApi}
          style={{ marginLeft: '5px', fontSize: '10px', padding: '2px 6px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
        >
          Testar API
        </button>
        <button 
          onClick={testTruncate}
          style={{ marginLeft: '5px', fontSize: '10px', padding: '2px 6px', backgroundColor: '#28a745', color: 'white', border: 'none' }}
        >
          Testar Truncate
        </button>
      </div>
      
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
