/**
 * Simple Markdown renderer for basic formatting
 */

export interface MarkdownElement {
  type: 'text' | 'bold' | 'italic' | 'code' | 'codeblock' | 'heading' | 'list' | 'orderedlist' | 'link' | 'linebreak' | 'paragraph';
  content: string;
  level?: number; // for headings
  language?: string; // for code blocks
  url?: string; // for links
  number?: number; // for ordered lists
}

/**
 * Parse markdown text into structured elements
 */
export function parseMarkdown(text: string): MarkdownElement[] {
  const elements: MarkdownElement[] = [];
  const lines = text.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Empty line
    if (line.trim() === '') {
      elements.push({ type: 'linebreak', content: '' });
      i++;
      continue;
    }
    
    // Code block
    if (line.startsWith('```')) {
      const language = line.substring(3).trim();
      const codeLines: string[] = [];
      i++;
      
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      elements.push({
        type: 'codeblock',
        content: codeLines.join('\n'),
        language: language || 'text'
      });
      i++; // Skip closing ```
      continue;
    }
    
    // Headings
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const content = line.substring(level).trim();
      elements.push({
        type: 'heading',
        content,
        level: Math.min(level, 6)
      });
      i++;
      continue;
    }
    
    // Ordered list items
    const orderedMatch = line.match(/^[\s]*(\d+)\.\s(.+)/);
    if (orderedMatch) {
      const number = parseInt(orderedMatch[1]);
      const content = orderedMatch[2];
      elements.push({
        type: 'orderedlist',
        content,
        number
      });
      i++;
      continue;
    }
    
    // Unordered list items
    if (line.match(/^[\s]*[-*+]\s/)) {
      const content = line.replace(/^[\s]*[-*+]\s/, '');
      elements.push({
        type: 'list',
        content
      });
      i++;
      continue;
    }
    
    // Regular text with inline formatting
    const inlineElements = parseInlineMarkdown(line);
    
    // Wrap in paragraph if it's substantial content
    if (inlineElements.length > 0 && line.trim().length > 0) {
      elements.push({
        type: 'paragraph',
        content: '', // Will be rendered by inline elements
      });
      elements.push(...inlineElements);
    }
    
    i++;
  }
  
  return elements;
}

/**
 * Parse inline markdown formatting (bold, italic, code, links)
 */
function parseInlineMarkdown(text: string): MarkdownElement[] {
  const elements: MarkdownElement[] = [];
  
  // Simple regex patterns for inline formatting
  const patterns = [
    { regex: /\*\*(.*?)\*\*/g, type: 'bold' as const },
    { regex: /\*(.*?)\*/g, type: 'italic' as const },
    { regex: /`(.*?)`/g, type: 'code' as const },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' as const }
  ];
  
  const matches: Array<{ 
    index: number; 
    length: number; 
    type: 'bold' | 'italic' | 'code' | 'link'; 
    content: string; 
    url?: string;
    originalMatch: string;
  }> = [];
  
  // Find all matches
  patterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: pattern.type,
        content: match[1],
        url: pattern.type === 'link' ? match[2] : undefined,
        originalMatch: match[0]
      });
    }
  });
  
  // Sort matches by position
  matches.sort((a, b) => a.index - b.index);
  
  // Remove overlapping matches (keep the first one)
  const filteredMatches = matches.filter((match, index) => {
    for (let i = 0; i < index; i++) {
      const prevMatch = matches[i];
      if (match.index < prevMatch.index + prevMatch.length) {
        return false; // This match overlaps with a previous one
      }
    }
    return true;
  });
  
  let lastIndex = 0;
  
  // Process matches
  filteredMatches.forEach(match => {
    // Add text before match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText) {
        elements.push({ type: 'text', content: beforeText });
      }
    }
    
    // Add formatted element
    elements.push({
      type: match.type,
      content: match.content,
      url: match.url
    });
    
    lastIndex = match.index + match.length;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      elements.push({ type: 'text', content: remainingText });
    }
  }
  
  // If no matches found, return the whole text
  if (elements.length === 0 && text.trim()) {
    elements.push({ type: 'text', content: text });
  }
  
  return elements;
}
