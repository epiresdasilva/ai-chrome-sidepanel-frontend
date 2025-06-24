import React from 'react';
import { estimateTokens, formatTokenCount, MAX_TOKENS } from '../../utils/tokenValidation';

interface TokenInfoProps {
  content: string;
  truncationInfo?: {
    wasTruncated: boolean;
    originalTokens: number;
    finalTokens: number;
    message: string;
  };
}

const TokenInfo: React.FC<TokenInfoProps> = ({ content, truncationInfo }) => {
  const currentTokens = estimateTokens(content);
  const percentage = (currentTokens / MAX_TOKENS) * 100;
  
  // Determine color based on token usage
  const getColor = () => {
    if (percentage > 100) return '#ff4444';
    if (percentage > 80) return '#ff8800';
    return '#00aa00';
  };

  const getIcon = () => {
    if (percentage > 100) return '⚠️';
    if (percentage > 80) return '⚡';
    return '✅';
  };

  return (
    <div style={{ 
      fontSize: '12px', 
      margin: '10px 0', 
      padding: '8px', 
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '4px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: truncationInfo ? '5px' : '0'
      }}>
        <span style={{ color: getColor() }}>
          {getIcon()} {formatTokenCount(currentTokens)}
        </span>
        
        {/* Progress bar */}
        <div style={{ 
          width: '100px', 
          height: '6px', 
          backgroundColor: '#e9ecef', 
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(percentage, 100)}%`,
            height: '100%',
            backgroundColor: getColor(),
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
      
      {truncationInfo && truncationInfo.wasTruncated && (
        <div style={{ 
          color: '#ff8800', 
          fontSize: '11px',
          fontStyle: 'italic'
        }}>
          ✂️ {truncationInfo.message}
        </div>
      )}
    </div>
  );
};

export default TokenInfo;
