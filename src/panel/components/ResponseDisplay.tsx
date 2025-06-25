import React, { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface ResponseDisplayProps {
  response: string;
  loading: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, loading }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) {
    return (
      <div className="response-container">
        <div className="loading-spinner" style={{
          padding: '20px',
          textAlign: 'center',
          color: '#666',
          fontStyle: 'italic'
        }}>
          🤖 Processando...
        </div>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  return (
    <div className="response-container" style={{
      margin: '16px 0',
      padding: '16px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      maxHeight: '400px',
      overflowY: 'auto',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        borderBottom: '2px solid #dee2e6',
        paddingBottom: '8px'
      }}>
        <h3 style={{
          margin: '0',
          fontSize: '16px',
          color: '#495057'
        }}>
          🤖 Resposta da IA:
        </h3>
        <button
          onClick={copyToClipboard}
          style={{
            fontSize: '12px',
            padding: '4px 8px',
            backgroundColor: copied ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          title="Copiar resposta"
        >
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>
      <div className="response-content">
        <MarkdownRenderer content={response} />
      </div>
    </div>
  );
};

export default ResponseDisplay;
