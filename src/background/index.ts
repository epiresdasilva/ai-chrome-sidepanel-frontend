// Store the current tab's content
let currentTabContent: Record<number, string> = {};

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  // Register the side panel
  if (chrome.sidePanel) {
    chrome.sidePanel.setOptions({
      path: 'src/panel/index.html',
      enabled: true
    });
  }
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (chrome.sidePanel && 'open' in chrome.sidePanel) {
    // @ts-ignore - The open method exists but TypeScript might not recognize it
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender) => {
  // Store content updates from content script
  if (message.action === 'contentUpdated' && sender.tab?.id) {
    const tabId = sender.tab.id;
    currentTabContent[tabId] = message.content;
    
    // Forward the content update to the side panel if it's open
    chrome.runtime.sendMessage({
      action: 'contentUpdated',
      content: message.content,
      url: message.url
    }).catch(() => {
      // Side panel might not be open, ignore error
    });
  }
  
  return true;
});

// Listen for tab changes to update the side panel with the current tab's content
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  
  // If we have content for this tab, send it to the side panel
  if (currentTabContent[tabId]) {
    chrome.runtime.sendMessage({
      action: 'contentUpdated',
      content: currentTabContent[tabId]
    }).catch(() => {
      // Side panel might not be open, ignore error
    });
  } else {
    // Request content from the content script
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'getPageContent' });
    } catch (error) {
      // Content script might not be ready yet, ignore error
    }
  }
});

// Clean up stored content when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (currentTabContent[tabId]) {
    delete currentTabContent[tabId];
  }
});
