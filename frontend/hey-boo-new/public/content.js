// content.js (Temporary Debug Version)
console.log("Hey Boo CS DEBUG: Script loaded.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Hey Boo CS DEBUG: Message received:", request);
  if (request.action === "toggleHeyBooUI") {
    console.log("Hey Boo CS DEBUG: Toggle action received!");
    // Just send a simple response for now
    sendResponse({ success: true, message: "Listener is active!" });
  }
  return true; // Keep channel open
});

console.log("Hey Boo CS DEBUG: Listener added.");