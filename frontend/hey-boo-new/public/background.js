// Background script for Hey Boo Chrome Extension - Service Worker
// This script must work independently when the extension popup is closed

let lastMessageCount = 0;
let currentCoupleId = null;
let isInitialized = false;

// Debug logging
console.log('🚀 Hey Boo background service worker loading...');

// Immediately try to initialize on script load
initializeNotifications();

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('✅ Hey Boo extension installed successfully, reason:', details.reason);
  
  if (details.reason === 'install') {
    // Set default storage values on first install
    chrome.storage.sync.set({
      isLoggedIn: false,
      theme: 'default',
      notifications: true,
      soundNotifications: true,
      firstTime: true
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html')
    });
  }
  
  // Always initialize on install/update
  console.log('🔄 Initializing notifications after install/update...');
  setTimeout(() => initializeNotifications(), 1000);
});

// Service worker startup handler
chrome.runtime.onStartup.addListener(() => {
  console.log('🔥 Chrome startup detected - service worker starting');
  setTimeout(() => initializeNotifications(), 2000);
});

// Handle service worker activation (when Chrome starts or extension reloads)
self.addEventListener('activate', (event) => {
  console.log('⚡ Service worker activated');
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('🔄 Activation complete, initializing...');
      return initializeNotifications();
    })
  );
});

// Handle when extension context becomes available
chrome.runtime.onConnect.addListener((port) => {
  console.log('🔌 Extension context connected:', port.name);
  if (!isInitialized) {
    initializeNotifications();
  }
});

// Keep service worker alive
setInterval(() => {
  console.log('💓 Service worker heartbeat - checking alarms...');
  chrome.alarms.getAll().then(alarms => {
    console.log('⏰ Active alarms:', alarms.map(a => a.name));
    if (alarms.length === 0) {
      console.log('🚨 No alarms found! Re-initializing...');
      initializeNotifications();
    }
  });
}, 30000); // Every 30 seconds

// Initialize notification system
async function initializeNotifications() {
  try {
    console.log('🔧 Initializing notification system... (initialized:', isInitialized, ')');
    
    // Clear any existing alarms first to avoid duplicates
    await chrome.alarms.clear('checkMessages');
    await chrome.alarms.clear('quickCheck');
    console.log('🗑️ Cleared existing alarms');
    
    // Create alarms for periodic message checking
    await chrome.alarms.create('checkMessages', { 
      delayInMinutes: 1,
      periodInMinutes: 1 
    });
    
    await chrome.alarms.create('quickCheck', { 
      delayInMinutes: 0.5,
      periodInMinutes: 0.5 
    });
    
    console.log('⏰ Created alarms: checkMessages (1min), quickCheck (30s)');
    
    // Verify alarms were created
    const alarms = await chrome.alarms.getAll();
    console.log('✅ Verified alarms created:', alarms.map(a => `${a.name} (next: ${new Date(a.scheduledTime)})`));
    
    // Initialize message count from storage
    const data = await chrome.storage.sync.get(['lastMessageCount', 'isLoggedIn', 'authToken']);
    if (data.lastMessageCount) {
      lastMessageCount = data.lastMessageCount;
      console.log('📝 Restored message count from storage:', lastMessageCount);
    }
    
    // Check login status and start monitoring if needed
    if (data.isLoggedIn && data.authToken) {
      console.log('👤 User is logged in with token, starting immediate check...');
      // Do initial check after short delay
      setTimeout(() => {
        console.log('🔍 Running initial message check...');
        checkForNewMessages();
      }, 3000);
    } else {
      console.log('❌ User not logged in or no token, alarms created but not checking messages');
    }
    
    isInitialized = true;
    console.log('✅ Notification system initialization complete!');
    
  } catch (error) {
    console.error('❌ Error initializing notifications:', error);
    // Retry after delay
    setTimeout(() => {
      console.log('🔄 Retrying initialization...');
      initializeNotifications();
    }, 5000);
  }
}

// Handle alarms (for periodic message checking)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkMessages' || alarm.name === 'quickCheck') {
    console.log('Alarm triggered - checking for new messages:', alarm.name);
    await checkForNewMessages();
  }
});

// Check for new messages - completely self-contained
async function checkForNewMessages() {
  try {
    console.log('🔍 Starting message check at:', new Date().toISOString());
    
    // Get user settings and authentication
    const data = await chrome.storage.sync.get([
      'isLoggedIn', 
      'authToken', 
      'notifications', 
      'soundNotifications',
      'lastMessageCount'
    ]);
    
    console.log('📊 Storage data:', {
      isLoggedIn: data.isLoggedIn,
      hasToken: !!data.authToken,
      notifications: data.notifications,
      soundNotifications: data.soundNotifications,
      lastMessageCount: data.lastMessageCount
    });
    
    // Skip if user is not logged in or notifications are disabled
    if (!data.isLoggedIn || !data.authToken) {
      console.log('⏭️ Skipping: User not logged in or no auth token');
      return;
    }

    if (!data.notifications) {
      console.log('⏭️ Skipping: Notifications disabled in settings');
      return;
    }

    console.log('🌐 Making API request to fetch messages...');
    
    // Fetch current messages from API
    const response = await fetch('http://localhost:8080/api/chats', {
      headers: {
        'Authorization': `Bearer ${data.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      return;
    }

    const chats = await response.json();
    const currentMessageCount = chats.length;
    
    console.log('📨 API Response:', {
      totalMessages: currentMessageCount,
      lastStoredCount: data.lastMessageCount || 0,
      latestMessage: chats[chats.length - 1]?.content?.substring(0, 30) || 'No messages'
    });
    
    // Initialize lastMessageCount if this is the first check
    const storedLastCount = data.lastMessageCount || 0;
    
    // Check if we have new messages
    if (storedLastCount > 0 && currentMessageCount > storedLastCount) {
      const newMessagesCount = currentMessageCount - storedLastCount;
      console.log('🆕 NEW MESSAGES DETECTED!', {
        newCount: newMessagesCount,
        previousCount: storedLastCount,
        currentCount: currentMessageCount
      });
      
      // Get the latest message for notification content
      const latestMessage = chats[chats.length - 1];
      await showNotification(newMessagesCount, latestMessage, data.soundNotifications);
    } else {
      console.log('✅ No new messages (stored:', storedLastCount, 'current:', currentMessageCount, ')');
    }
    
    // Update stored message count
    await chrome.storage.sync.set({ lastMessageCount: currentMessageCount });
    console.log('💾 Updated stored message count to:', currentMessageCount);
    
  } catch (error) {
    console.error('❌ Error in checkForNewMessages:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Show notification for new messages - service worker compatible
async function showNotification(count, latestMessage, soundEnabled) {
  console.log('Showing notification for new messages');
  
  try {
    // Create notification content
    const notificationOptions = {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: 'Hey Boo - New Message!',
      message: count === 1 
        ? `${latestMessage?.content?.substring(0, 50) || 'New message received'}...`
        : `You have ${count} new messages`,
      buttons: [
        { title: 'Open Chat' },
        { title: 'Dismiss' }
      ]
    };
    
    // Show browser notification
    const notificationId = await chrome.notifications.create('newMessage', notificationOptions);
    console.log('Notification created:', notificationId);
    
    // Handle sound notification by sending message to ALL extension tabs
    if (soundEnabled) {
      try {
        // Find all Hey Boo extension tabs and play sound
        const extensionUrl = chrome.runtime.getURL('index.html');
        const tabs = await chrome.tabs.query({ url: extensionUrl + '*' });
        
        if (tabs.length > 0) {
          // Send sound message to all Hey Boo tabs
          for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, { 
              action: 'playNotificationSound',
              soundUrl: chrome.runtime.getURL('assets/Sounds/msg_notification.mp3')
            }).catch(() => {
              console.log('Could not send sound message to tab:', tab.id);
            });
          }
        } else {
          // No extension tabs open - try to create an invisible audio context
          console.log('No extension tabs open for sound playback');
          // We could create a notification with a custom sound here if needed
        }
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }
    }
    
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('Notification clicked:', notificationId);
  
  if (notificationId === 'newMessage') {
    // Open the extension and navigate to chat
    chrome.tabs.query({ url: chrome.runtime.getURL('index.html') }, (tabs) => {
      if (tabs.length > 0) {
        // Focus existing tab and send message to navigate to chat
        chrome.tabs.update(tabs[0].id, { active: true });
        chrome.tabs.sendMessage(tabs[0].id, { action: 'navigateToChat' }).catch(() => {
          console.log('Could not send navigation message to tab');
        });
      } else {
        // Open new tab with chat hash
        chrome.tabs.create({
          url: chrome.runtime.getURL('index.html#/chats')
        });
      }
    });
    
    // Clear the notification
    chrome.notifications.clear(notificationId);
  }
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  console.log('Notification button clicked:', notificationId, buttonIndex);
  
  if (notificationId === 'newMessage') {
    if (buttonIndex === 0) {
      // "Open Chat" button
      chrome.tabs.create({
        url: chrome.runtime.getURL('index.html#/chats')
      });
    }
    // Dismiss button (index 1) or any other button just clears the notification
    chrome.notifications.clear(notificationId);
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
      // Clear storage on logout and stop message checking
      console.log('User logged out, clearing data and stopping notifications');
      chrome.storage.sync.clear(() => {
        chrome.storage.sync.set({ isLoggedIn: false });
        lastMessageCount = 0;
        currentCoupleId = null;
        chrome.alarms.clear('checkMessages');
        chrome.alarms.clear('quickCheck');
        sendResponse({ success: true });
      });
      return true;
      
    case 'login':
      // Start message checking when user logs in
      console.log('User logged in, starting notification system');
      initializeNotifications();
      lastMessageCount = 0; // Reset counter for new session
      // Do initial message check after short delay
      setTimeout(() => checkForNewMessages(), 3000);
      sendResponse({ success: true });
      break;
      
    case 'checkLoginStatus':
      chrome.storage.sync.get(['isLoggedIn', 'authToken'], (data) => {
        sendResponse({ 
          isLoggedIn: data.isLoggedIn || false,
          hasToken: !!(data.authToken)
        });
      });
      return true;
      
    case 'updateMessageCount':
      // Update message count from frontend to avoid false notifications
      if (request.count !== undefined) {
        lastMessageCount = request.count;
        chrome.storage.sync.set({ lastMessageCount: request.count });
        console.log('Updated message count to:', request.count);
      }
      sendResponse({ success: true });
      break;
      
    case 'testNotification':
      // Test notification functionality
      console.log('Testing notification system');
      showNotification(1, { content: 'This is a test notification!' }, true);
      sendResponse({ success: true });
      break;
      
    case 'forceMessageCheck':
      // Force an immediate message check
      console.log('Forcing immediate message check');
      checkForNewMessages().then(() => {
        sendResponse({ success: true });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
      
    case 'testAPI':
      // Test API access from service worker
      console.log('Testing API access from background script');
      testAPIAccess().then(result => {
        sendResponse(result);
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
      
    case 'ping':
      // Simple ping to test if background script is responsive
      sendResponse({ success: true, timestamp: new Date().toISOString() });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Handle storage changes and sync across tabs
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes);
  
  // Handle login status changes
  if (changes.isLoggedIn) {
    if (changes.isLoggedIn.newValue) {
      console.log('User logged in via storage change, initializing notifications');
      initializeNotifications();
      // Do initial check after delay
      setTimeout(() => checkForNewMessages(), 3000);
    } else {
      console.log('User logged out via storage change, stopping notifications');
      chrome.alarms.clear('checkMessages');
      chrome.alarms.clear('quickCheck');
      lastMessageCount = 0;
      currentCoupleId = null;
    }
  }
  
  // Handle notification setting changes
  if (changes.notifications && !changes.notifications.newValue) {
    console.log('Notifications disabled, clearing alarms');
    chrome.alarms.clear('checkMessages');
    chrome.alarms.clear('quickCheck');
  } else if (changes.notifications && changes.notifications.newValue) {
    console.log('Notifications enabled, starting monitoring');
    initializeNotifications();
  }
  
  // Update local message count if changed externally
  if (changes.lastMessageCount) {
    lastMessageCount = changes.lastMessageCount.newValue || 0;
    console.log('Message count updated from storage:', lastMessageCount);
  }
  
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

// Ensure service worker stays active by handling keep-alive
const KEEP_ALIVE_INTERVAL = 20000; // 20 seconds
const keepAlive = () => {
  console.log('Service worker keep-alive ping');
};

setInterval(keepAlive, KEEP_ALIVE_INTERVAL);

// Test function to verify API access from service worker
async function testAPIAccess() {
  try {
    console.log('🧪 Testing API access from service worker...');
    
    const data = await chrome.storage.sync.get(['authToken', 'isLoggedIn']);
    
    console.log('🔐 Auth data:', {
      isLoggedIn: data.isLoggedIn,
      hasToken: !!data.authToken,
      tokenLength: data.authToken?.length || 0
    });
    
    if (!data.authToken) {
      return { success: false, error: 'No auth token found' };
    }
    
    console.log('📡 Making test API request...');
    
    const response = await fetch('http://localhost:8080/api/chats', {
      headers: {
        'Authorization': `Bearer ${data.authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📬 API Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `API returned ${response.status}: ${response.statusText}` 
      };
    }
    
    const chats = await response.json();
    console.log('✅ API call successful, message count:', chats.length);
    
    return { 
      success: true, 
      messageCount: chats.length,
      timestamp: new Date().toISOString(),
      lastMessage: chats[chats.length - 1]?.content?.substring(0, 50) || 'No messages'
    };
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    return { success: false, error: error.message };
  }
}

console.log('Hey Boo background service worker loaded and ready');
  