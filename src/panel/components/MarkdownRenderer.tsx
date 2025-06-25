import React from 'react';
import { parseMarkdown, MarkdownElement } from '../../utils/markdownRenderer';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const elements = parseMarkdown(content);
  
  const renderElement = (element: MarkdownElement, index: number): React.ReactNode => {
    switch (element.type) {
      case 'heading':
        const HeadingTag = `h${element.level || 1}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag 
            key={index} 
            style={{ 
              margin: '16px 0 8px 0',
              fontSize: `${1.4 - (element.level || 1) * 0.1}em`,
              fontWeight: 'bold',
              color: '#2c3e50'
            }}
          >
            {element.content}
          </HeadingTag>
        );
        
      case 'bold':
        return (
          <strong key={index} style={{ fontWeight: 'bold' }}>
            {element.content}
          </strong>
        );
        
      case 'italic':
        return (
          <em key={index} style={{ fontStyle: 'italic' }}>
            {element.content}
          </em>
        );
        
      case 'code':
        return (
          <code 
            key={index}
            style={{
              backgroundColor: '#f1f2f6',
              padding: '2px 4px',
              borderRadius: '3px',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '0.9em',
              color: '#e74c3c'
            }}
          >
            {element.content}
          </code>
        );
        
      case 'codeblock':
        return (
          <pre 
            key={index}
            style={{
              backgroundColor: '#2d3748',
              color: '#e2e8f0',
              padding: '12px',
              borderRadius: '6px',
              overflow: 'auto',
              margin: '12px 0',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '0.85em',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap'
            }}
          >
            <code>{element.content}</code>
          </pre>
        );
        
      case 'list':
        return (
          <div 
            key={index}
            style={{
              margin: '4px 0',
              paddingLeft: '16px',
              position: 'relative'
            }}
          >
            <span 
              style={{
                position: 'absolute',
                left: '0',
                color: '#3498db',
                fontWeight: 'bold'
              }}
            >
              •
            </span>
            {element.content}
          </div>
        );
        
      case 'orderedlist':
        return (
          <div 
            key={index}
            style={{
              margin: '4px 0',
              paddingLeft: '20px',
              position: 'relative'
            }}
          >
            <span 
              style={{
                position: 'absolute',
                left: '0',
                color: '#3498db',
                fontWeight: 'bold',
                minWidth: '16px'
              }}
            >
              {element.number}.
            </span>
            {element.content}
          </div>
        );
        
      case 'link':
        return (
          <a 
            key={index}
            href={element.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#3498db',
              textDecoration: 'underline'
            }}
          >
            {element.content}
          </a>
        );
        
      case 'paragraph':
        return (
          <div key={index} style={{ margin: '8px 0' }}>
            {/* Paragraph wrapper - content will be rendered by following elements */}
          </div>
        );
        
      case 'linebreak':
        return <br key={index} />;
        
      case 'text':
      default:
        return <span key={index}>{element.content}</span>;
    }
  };
  
  return (
    <div style={{ 
      lineHeight: '1.6',
      color: '#2c3e50',
      fontSize: '14px'
    }}>
      {elements.map((element, index) => renderElement(element, index))}
    </div>
  );
};

export default MarkdownRenderer;
