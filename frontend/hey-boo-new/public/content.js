// Content script for Hey Boo Chrome Extension
console.log('Hey Boo content script loaded');

// Prevent multiple injections
if (window.heyBooContentScriptLoaded) {
  console.log('Hey Boo content script already loaded, skipping...');
} else {
  window.heyBooContentScriptLoaded = true;

  // Configuration
  const FLOATING_BUTTON_ID = 'hey-boo-floating-btn';
  const RELATIONSHIP_KEYWORDS = [
    'relationship', 'dating', 'couple', 'romantic', 'valentine',
    'anniversary', 'love', 'boyfriend', 'girlfriend', 'partner',
    'date night', 'romantic dinner', 'couples therapy', 'marriage',
    'wedding', 'engagement', 'romance', 'valentine\'s day',
    'date ideas', 'relationship advice', 'couple goals'
  ];

  // Function to create floating button
  function createFloatingButton() {
    // Check if button already exists
    if (document.getElementById(FLOATING_BUTTON_ID)) {
      return;
    }

    const floatingBtn = document.createElement('div');
    floatingBtn.id = FLOATING_BUTTON_ID;
    floatingBtn.innerHTML = '💕';
    floatingBtn.title = 'Open Hey Boo - Couples App';
    
    // Style the floating button
    Object.assign(floatingBtn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#8B5CF6',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      cursor: 'pointer',
      zIndex: '999999',
      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
      transition: 'all 0.3s ease',
      border: '3px solid white',
      userSelect: 'none',
      fontFamily: 'Arial, sans-serif'
    });

    // Add hover effects
    floatingBtn.addEventListener('mouseenter', () => {
      floatingBtn.style.transform = 'scale(1.1)';
      floatingBtn.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
      floatingBtn.title = 'Click to open Hey Boo!';
    });

    floatingBtn.addEventListener('mouseleave', () => {
      floatingBtn.style.transform = 'scale(1)';
      floatingBtn.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
    });

    // Add click handler
    floatingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Animate click
      floatingBtn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        floatingBtn.style.transform = 'scale(1)';
      }, 150);
      
      // Send message to background script
      chrome.runtime.sendMessage({ action: 'openApp' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error opening Hey Boo:', chrome.runtime.lastError);
        } else {
          console.log('Hey Boo opened successfully');
        }
      });
    });

    // Add to page
    document.body.appendChild(floatingBtn);
    console.log('Hey Boo floating button created');
  }

  // Function to detect relationship-related content
  function detectRelationshipContent() {
    try {
      const pageText = document.body.innerText.toLowerCase();
      const pageTitle = document.title.toLowerCase();
      const metaDescription = document.querySelector('meta[name="description"]');
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      
      let contentToCheck = pageText + ' ' + pageTitle;
      
      if (metaDescription) {
        contentToCheck += ' ' + metaDescription.content.toLowerCase();
      }
      
      if (metaKeywords) {
        contentToCheck += ' ' + metaKeywords.content.toLowerCase();
      }
      
      return RELATIONSHIP_KEYWORDS.some(keyword => contentToCheck.includes(keyword));
    } catch (error) {
      console.error('Error detecting relationship content:', error);
      return false;
    }
  }

  // Function to highlight button for relationship content
  function highlightButtonForRelationshipContent() {
    const btn = document.getElementById(FLOATING_BUTTON_ID);
    if (btn && detectRelationshipContent()) {
      btn.style.animation = 'heyBooPulse 2s infinite';
      btn.title = 'Hey Boo - Relationship content detected! Click to open app';
      btn.style.backgroundColor = '#EC4899'; // Pink for relationship content
      
      // Add notification badge
      if (!btn.querySelector('.notification-badge')) {
        const badge = document.createElement('div');
        badge.className = 'notification-badge';
        badge.textContent = '!';
        badge.style.cssText = `
          position: absolute;
          top: -5px;
          right: -5px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #EF4444;
          color: white;
          font-size: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        `;
        btn.appendChild(badge);
      }
    }
  }

  // Function to add CSS animations
  function addStyles() {
    if (document.getElementById('hey-boo-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'hey-boo-styles';
    style.textContent = `
      @keyframes heyBooPulse {
        0% { 
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          transform: scale(1);
        }
        50% { 
          box-shadow: 0 8px 24px rgba(236, 72, 153, 0.6);
          transform: scale(1.05);
        }
        100% { 
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          transform: scale(1);
        }
      }
      
      #${FLOATING_BUTTON_ID} {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      #${FLOATING_BUTTON_ID}:hover {
        cursor: pointer !important;
      }
      
      #${FLOATING_BUTTON_ID}:active {
        transform: scale(0.95) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Function to check if we should show the button
  function shouldShowButton() {
    // Don't show on Chrome extension pages or Chrome internal pages
    const currentUrl = window.location.href;
    if (currentUrl.startsWith('chrome://') || 
        currentUrl.startsWith('chrome-extension://') ||
        currentUrl.startsWith('moz-extension://') ||
        currentUrl.startsWith('edge://')) {
      return false;
    }
    
    return true;
  }

  // Initialize the content script
  function init() {
    if (!shouldShowButton()) {
      console.log('Hey Boo: Not showing button on this page');
      return;
    }
    
    // Add styles
    addStyles();
    
    // Create floating button
    createFloatingButton();
    
    // Check for relationship content after a delay to let page load
    setTimeout(() => {
      highlightButtonForRelationshipContent();
    }, 2000);
    
    console.log('Hey Boo content script initialized');
  }

  // Run initialization based on document state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM is already loaded
    setTimeout(init, 100);
  }

  // Listen for page changes (for SPAs)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('Hey Boo: Page changed, reinitializing...');
      setTimeout(init, 500);
    }
  }).observe(document, { subtree: true, childList: true });

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'storageChanged') {
      console.log('Hey Boo: Storage changed in content script', request.changes);
    }
    sendResponse({ success: true });
  });
}