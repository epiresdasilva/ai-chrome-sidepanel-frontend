/**
 * Extracts the main content from the current page,
 * ignoring navigation, headers, footers, and other non-content elements.
 */
export const extractPageContent = (): string => {
  // Elements to ignore (common selectors for non-content elements)
  const ignoreSelectors = [
    'header', 'nav', 'footer', 
    '[role="banner"]', '[role="navigation"]', '[role="contentinfo"]',
    '.header', '.nav', '.navbar', '.navigation', '.menu', 
    '.footer', '.sidebar', '.comments', '.ad', '.ads', '.advertisement',
    '#header', '#nav', '#navbar', '#navigation', '#menu', 
    '#footer', '#sidebar', '#comments', '#ad', '#ads'
  ];
  
  // Create a clone of the body to work with
  const bodyClone = document.body.cloneNode(true) as HTMLElement;
  
  // Remove elements to ignore from the clone
  ignoreSelectors.forEach(selector => {
    const elements = bodyClone.querySelectorAll(selector);
    elements.forEach(el => el.parentNode?.removeChild(el));
  });
  
  // Try to find the main content element
  const mainContentSelectors = [
    'main', 
    '[role="main"]', 
    'article', 
    '.content', 
    '.main', 
    '.article', 
    '.post', 
    '#content', 
    '#main', 
    '#article'
  ];
  
  let mainContent: HTMLElement | null = null;
  
  // Try each selector until we find a match
  for (const selector of mainContentSelectors) {
    const element = bodyClone.querySelector(selector) as HTMLElement;
    if (element) {
      mainContent = element;
      break;
    }
  }
  
  // If no main content element found, use the body clone
  const contentElement = mainContent || bodyClone;
  
  // Get text content, removing excessive whitespace
  let content = contentElement.innerText
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
  
  // Add page title and URL as context
  const pageTitle = document.title;
  const pageUrl = window.location.href;
  
  return `URL: ${pageUrl}\nTitle: ${pageTitle}\n\nContent:\n${content}`;
};
