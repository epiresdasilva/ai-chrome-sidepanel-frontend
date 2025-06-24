import React, { useState, useEffect } from 'react';

interface BackendConfigProps {
  onUrlChange: (url: string) => void;
}

const BackendConfig: React.FC<BackendConfigProps> = ({ onUrlChange }) => {
  const [url, setUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  useEffect(() => {
    // Load URL from localStorage on component mount
    chrome.storage.local.get(['backendUrl'], (result) => {
      const savedUrl = result.backendUrl || 'http://localhost:3000';
      setUrl(savedUrl);
      setTempUrl(savedUrl);
      onUrlChange(savedUrl);
    });
  }, [onUrlChange]);

  const handleSave = () => {
    if (!tempUrl.trim()) {
      alert('URL não pode estar vazia');
      return;
    }

    // Remove trailing slash if present
    const cleanUrl = tempUrl.trim().replace(/\/$/, '');
    
    // Basic URL validation
    try {
      new URL(cleanUrl);
    } catch (e) {
      alert('URL inválida. Por favor, insira uma URL válida (ex: http://localhost:3000)');
      return;
    }

    setUrl(cleanUrl);
    setIsEditing(false);
    
    // Save to localStorage
    chrome.storage.local.set({ backendUrl: cleanUrl }, () => {
      console.log('Backend URL saved:', cleanUrl);
      onUrlChange(cleanUrl);
    });
  };

  const handleCancel = () => {
    setTempUrl(url);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempUrl(url);
  };

  return (
    <div style={{ 
      margin: '10px 0', 
      padding: '10px', 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '4px',
      fontSize: '12px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        🔧 Configuração do Backend
      </div>
      
      {!isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            flex: 1, 
            color: '#495057',
            wordBreak: 'break-all',
            fontSize: '11px'
          }}>
            {url}
          </span>
          <button
            onClick={handleEdit}
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            Editar
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="http://localhost:3000"
            style={{
              width: '100%',
              padding: '4px',
              fontSize: '11px',
              border: '1px solid #ced4da',
              borderRadius: '2px',
              marginBottom: '5px'
            }}
          />
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={handleSave}
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              Salvar
            </button>
            <button
              onClick={handleCancel}
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendConfig;
