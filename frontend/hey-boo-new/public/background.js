// Background script for Hey Boo Chrome Extension

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Hey Boo extension installed successfully');
  
  if (details.reason === 'install') {
    // Set default storage values on first install
    chrome.storage.sync.set({
      isLoggedIn: false,
      theme: 'default',
      notifications: true,
      firstTime: true
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html')
    });
  }
});

// Handle extension icon click - open in new tab for better experience
chrome.action.onClicked.addListener((tab) => {
  // Check if Hey Boo is already open in a tab
  chrome.tabs.query({ url: chrome.runtime.getURL('index.html') }, (tabs) => {
    if (tabs.length > 0) {
      // Focus existing tab
      chrome.tabs.update(tabs[0].id, { active: true });
      chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
      // Open new tab
      chrome.tabs.create({
        url: chrome.runtime.getURL('index.html')
      });
    }
  });
});

// Message handling from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'openApp':
      chrome.tabs.create({
        url: chrome.runtime.getURL('index.html')
      });
      sendResponse({ success: true });
      break;
      
    case 'saveData':
      chrome.storage.sync.set(request.data, () => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
      });
      return true; // Will respond asynchronously
      
    case 'getData':
      chrome.storage.sync.get(request.keys, (data) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true, data: data });
        }
      });
      return true; // Will respond asynchronously
      
    case 'logout':
      // Clear storage on logout
      chrome.storage.sync.clear(() => {
        chrome.storage.sync.set({ isLoggedIn: false });
        sendResponse({ success: true });
      });
      return true;
      
    case 'checkLoginStatus':
      chrome.storage.sync.get(['isLoggedIn', 'authToken'], (data) => {
        sendResponse({ 
          isLoggedIn: data.isLoggedIn || false,
          hasToken: !!(data.authToken)
        });
      });
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Handle storage changes and sync across tabs
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes);
  
  // Notify all extension pages of storage changes
  chrome.runtime.sendMessage({
    action: 'storageChanged',
    changes: changes,
    namespace: namespace
  }).catch(() => {
    // Ignore errors if no listeners
  });
});

// Handle tab updates for relationship content detection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Don't inject into chrome:// pages or extension pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }
    
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {
      // Ignore injection errors (already injected or restricted pages)
    });
  }
});

console.log('Hey Boo background script loaded');
  