// Notification Service for Hey Boo Chrome Extension
class NotificationService {
  constructor() {
    this.isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    this.notificationSound = null;
    this.lastMessageCount = 0;
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Initialize notification sound
      await this.loadNotificationSound();
      
      // Set up message listeners if in extension environment
      if (this.isExtension) {
        this.setupExtensionListeners();
      }
      
      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  async loadNotificationSound() {
    try {
      let soundUrl;
      
      if (this.isExtension) {
        // In extension environment
        soundUrl = chrome.runtime.getURL('assets/Sounds/msg_notification.mp3');
      } else {
        // In web environment
        soundUrl = '/assets/Sounds/msg_notification.mp3';
      }
      
      this.notificationSound = new Audio(soundUrl);
      this.notificationSound.preload = 'auto';
      
      // Test if sound loads successfully
      return new Promise((resolve) => {
        this.notificationSound.addEventListener('canplaythrough', () => resolve(true), { once: true });
        this.notificationSound.addEventListener('error', () => {
          console.warn('Could not load notification sound');
          resolve(false);
        }, { once: true });
      });
    } catch (error) {
      console.warn('Error loading notification sound:', error);
      return false;
    }
  }

  setupExtensionListeners() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'navigateToChat') {
        // Navigate to chat if we're in the extension
        if (window.location.hash !== '#/chats') {
          window.location.hash = '#/chats';
        }
        sendResponse({ success: true });
      }
    });
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['notifications'], (data) => {
          resolve(data.notifications !== false);
        });
      });
    }
    return true; // Default to enabled in web version
  }

  // Check if sound notifications are enabled
  async areSoundNotificationsEnabled() {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['soundNotifications'], (data) => {
          resolve(data.soundNotifications !== false);
        });
      });
    }
    return true; // Default to enabled in web version
  }

  // Play notification sound
  async playNotificationSound() {
    try {
      const soundEnabled = await this.areSoundNotificationsEnabled();
      
      if (soundEnabled && this.notificationSound) {
        this.notificationSound.currentTime = 0;
        await this.notificationSound.play();
      }
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }

  // Show browser notification (extension only)
  async showBrowserNotification(title, message, options = {}) {
    if (!this.isExtension) return;

    const notificationsEnabled = await this.areNotificationsEnabled();
    if (!notificationsEnabled) return;

    const notificationOptions = {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: title,
      message: message,
      ...options
    };

    return new Promise((resolve) => {
      chrome.notifications.create('heyBooNotification', notificationOptions, (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error('Notification error:', chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(notificationId);
        }
      });
    });
  }

  // Handle new message notification
  async handleNewMessage(message, isFromCurrentUser = false) {
    // Don't notify for messages from current user
    if (isFromCurrentUser) return;

    try {
      // Play sound notification
      await this.playNotificationSound();

      // Show browser notification if in extension
      if (this.isExtension) {
        const notificationsEnabled = await this.areNotificationsEnabled();
        
        if (notificationsEnabled) {
          const messagePreview = message.message ? 
            message.message.substring(0, 50) + (message.message.length > 50 ? '...' : '') : 
            'New message received';

          await this.showBrowserNotification(
            'Hey Boo - New Message!',
            messagePreview
          );
        }
      }
    } catch (error) {
      console.error('Error handling new message notification:', error);
    }
  }

  // Update message count (to inform background script)
  updateMessageCount(count) {
    if (this.isExtension) {
      chrome.runtime.sendMessage({
        action: 'updateMessageCount',
        count: count
      }).catch(err => {
        console.warn('Could not update message count:', err);
      });
    }
    
    this.lastMessageCount = count;
  }

  // Test notification functionality
  async testNotification() {
    try {
      await this.playNotificationSound();
      
      if (this.isExtension) {
        await this.showBrowserNotification(
          'Hey Boo - Test Notification',
          'This is a test notification to verify the system is working!'
        );
      } else {
        console.log('Test notification: Sound played (browser notification not available in web version)');
      }
    } catch (error) {
      console.error('Error testing notification:', error);
    }
  }

  // Enable/disable notifications
  async setNotificationsEnabled(enabled) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ notifications: enabled }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error setting notifications:', chrome.runtime.lastError);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    }
    return true;
  }

  // Enable/disable sound notifications
  async setSoundNotificationsEnabled(enabled) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ soundNotifications: enabled }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error setting sound notifications:', chrome.runtime.lastError);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    }
    return true;
  }

  // Get notification settings
  async getNotificationSettings() {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['notifications', 'soundNotifications'], (data) => {
          resolve({
            notifications: data.notifications !== false,
            soundNotifications: data.soundNotifications !== false
          });
        });
      });
    }
    
    return {
      notifications: true,
      soundNotifications: true
    };
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();

export default notificationService;