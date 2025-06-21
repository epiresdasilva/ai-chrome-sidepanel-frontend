import React from 'react';

interface ResponseDisplayProps {
  response: string;
  loading: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, loading }) => {
  if (loading) {
    return (
      <div className="response-container">
        <div className="loading-spinner">Carregando...</div>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  return (
    <div className="response-container">
      <h3>Resposta:</h3>
      <div className="response-content">
        {response.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
};

export default ResponseDisplay;
