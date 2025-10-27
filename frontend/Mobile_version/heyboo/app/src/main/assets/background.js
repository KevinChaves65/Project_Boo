// Simple background script to handle installation or other events
chrome.runtime.onInstalled.addListener(() => {
    console.log('Hey Boo extension installed successfully');
  });
  