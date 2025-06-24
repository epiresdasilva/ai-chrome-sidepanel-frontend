import { extractPageContent } from './contentExtractor';

console.log('Content script loaded');

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Content script received message:', message);
  if (message.action === 'getPageContent') {
    const content = extractPageContent();
    console.log('Extracted content length:', content.length);
    console.log('Content preview:', content.substring(0, 100));
    sendResponse({ content });
  }
  return true;
});

// Set up MutationObserver to detect SPA navigation
const setupMutationObserver = () => {
  let lastUrl = location.href;
  
  // Create a MutationObserver to watch for DOM changes
  const observer = new MutationObserver(() => {
    // Check if URL has changed (SPA navigation)
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      
      // Wait for the page to settle after navigation
      setTimeout(() => {
        const content = extractPageContent();
        
        // Notify background script about the content update
        chrome.runtime.sendMessage({
          action: 'contentUpdated',
          content,
          url: location.href
        });
      }, 1000);
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document, { 
    childList: true, 
    subtree: true 
  });
};

// Initialize the content script
const init = () => {
  // Extract initial page content
  const content = extractPageContent();
  
  // Send initial content to background script
  chrome.runtime.sendMessage({
    action: 'contentUpdated',
    content,
    url: location.href
  });
  
  // Set up observer for SPA navigation
  setupMutationObserver();
};

// Run initialization when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
