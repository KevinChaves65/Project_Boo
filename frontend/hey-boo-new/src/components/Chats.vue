<template>
  <!-- Root element for chat view content -->
  <div class="chat-view-content">

    <!-- Chat window - will grow and trigger parent scrolling -->
    <div class="chat-window" ref="chatWindow">
      <!-- Initial Date Divider Example (Could be dynamically determined) -->
      <div class="date-divider" v-if="messages.length > 0">
        <span>{{ formatDate(messages[0].timestamp) }}</span>
      </div>

      <!-- Message Loop -->
      <template v-for="(msg, index) in messages" :key="`msg-${index}`">
        <!-- Date Divider Logic -->
        <div class="date-divider" v-if="index > 0 && shouldShowDateDivider(messages[index-1], msg)">
          <span>{{ formatDate(msg.timestamp) }}</span>
        </div>

        <!-- Message Bubble -->
        <div class="message-container" :class="{ 'own-message': msg.sender === currentUsername }">
          <div class="message-bubble">
            <span class="message-text">{{ msg.text }}</span>
            <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <!-- Optional: Show sender name for partner messages if needed -->
          <!-- <span class="sender-name" v-if="msg.sender !== currentUsername">{{ msg.sender }}</span> -->
        </div>
      </template>

      <!-- Typing indicator -->
      <div v-if="isPartnerTyping" class="message-container typing-indicator-container">
         <div class="message-bubble partner-bubble"> <!-- Use partner style -->
            <div class="typing-indicator">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
         </div>
      </div>
    </div>

    <!-- Input area - stays at the bottom -->
    <div class="chat-input-area">
       <!-- Emoji picker popover -->
      <transition name="fade">
        <div v-if="showEmojiPicker" class="emoji-picker-popover" ref="emojiPicker">
          <!-- Emoji Categories -->
          <div class="emoji-categories">
            <button 
              v-for="(groupName, index) in availableGroups" 
              :key="groupName"
              @click="selectEmojiGroup(groupName)"
              :class="['category-btn', { active: selectedGroup === groupName }]"
              :title="formatGroupName(groupName)"
            >
              {{ getGroupIcon(groupName) }}
            </button>
          </div>
          
          <!-- Loading state -->
          <div v-if="loadingEmojis" class="emoji-loading">
            <div class="loading-spinner"></div>
            <span>Loading emojis...</span>
          </div>
          
          <!-- Emoji Grid -->
          <div v-else class="emoji-grid">
            <button
              v-for="emoji in currentEmojis"
              :key="emoji.unicodeCodePoint"
              class="emoji-button"
              @click="addEmoji(emoji.character)"
              :title="emoji.unicodeName || emoji.slug"
            >
              {{ emoji.character }}
            </button>
          </div>
        </div>
      </transition>

      <div class="chat-input">
        <button class="input-action-button emoji-toggle-button" @click.stop="toggleEmojiPicker" title="Add emoji" :class="{active: showEmojiPicker}">
          <i class="far fa-smile"></i>
        </button>

        <button @click="openTextEnhancer" class="input-action-button enhancer-button" title="Enhance Text">
          <i class="fas fa-magic"></i>
        </button>

        <textarea
          ref="inputArea"
          v-model="newMessage"
          placeholder="Type a message..."
          @input="handleInput"
          @keydown.enter.prevent="handleEnterKey"
          rows="1"
        ></textarea>

        <button
          @click="sendMessage"
          class="input-action-button send-button"
          :disabled="!isMessageValid"
          title="Send message"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>

      <!-- Text Enhancer Modal -->
      <transition name="fade">
        <div v-if="showTextEnhancer" class="text-enhancer-modal">
          <TextEnhancer @text-selected="useEnhancedText" />
          <button @click="closeTextEnhancer" class="close-button">Close</button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { fetchChats, fetchCoupleInfo, fetchUserProfile, sendChatMessage } from "../services/apiService";
import chatWebSocket from "../services/chatWebSocket.js";
import emojiService from "../services/emojiService.js";
import TextEnhancer from "./TextEnhancer.vue";

export default {
  name: "ChatsPage",
  components: { TextEnhancer },
  data() {
    return {
      messages: [], // Chat messages
      newMessage: "", // Input for new messages
      isPartnerTyping: false, // Typing indicator for the partner
      currentUsername: "", // Current user's username
      partnerUsername: "", // Partner's username
      partnerFullName: "", // Partner's full name
      coupleId: "", // Current couple ID
      typingTimeout: null, // Timeout for typing indicator
      userTypingTimeout: null, // Timeout for user's typing indicator
      showEmojiPicker: false, // Emoji picker visibility
      showTextEnhancer: false, // Text enhancer modal visibility
      isConnected: false, // WebSocket connection status
      
      // Emoji-related data
      loadingEmojis: false,
      availableGroups: [],
      selectedGroup: 'popular',
      currentEmojis: [],
      emojiGroups: {},
    };
  },
  computed: {
    isMessageValid() {
      return this.newMessage.trim().length > 0;
    },
  },
  methods: {
    async fetchChatData() {
      try {
        // Fetch user profile
        const userProfile = await fetchUserProfile();
        this.currentUsername = userProfile.username;
        this.coupleId = userProfile.couple_id;

        if (!this.coupleId) {
          console.error("User is not linked to a couple.");
          alert("You are not linked to a couple. Please link to a partner first.");
          return;
        }

        // Fetch couple info
        const coupleInfo = await fetchCoupleInfo(this.coupleId);

        // Determine partner's username
        if (coupleInfo.user1_username === this.currentUsername) {
          this.partnerUsername = coupleInfo.user2_username;
        } else if (coupleInfo.user2_username === this.currentUsername) {
          this.partnerUsername = coupleInfo.user1_username;
        } else {
          console.error("Current user is not part of the couple.");
          alert("Failed to determine the coupled user's username.");
          return;
        }

        // Fetch partner's public information
        this.partnerFullName = coupleInfo.partner_full_name;

        // Fetch chat messages
        const chats = await fetchChats();
        this.messages = chats.map((msg) => ({
          sender: msg.sender,
          text: msg.content,
          timestamp: msg.timestamp,
        }));

        console.log("Loaded Messages:", this.messages); // Debug loaded messages

        // Initialize WebSocket connection
        this.initializeWebSocket();
      } catch (error) {
        console.error("Failed to load chats:", error.message);
        alert("Failed to load chats. Please try again.");
      }
    },

    // Initialize WebSocket connection
    initializeWebSocket() {
      // Set up event handlers
      chatWebSocket.onMessage(this.handleIncomingMessage);
      chatWebSocket.onTyping(this.handleTypingIndicator);
      chatWebSocket.onConnection(this.handleConnectionStatus);

      // Connect to WebSocket
      chatWebSocket.connect(this.currentUsername, this.coupleId);
    },

    // Handle incoming WebSocket messages
    handleIncomingMessage(message) {
      // Only add messages from partner (avoid duplicates of own messages)
      if (message.sender !== this.currentUsername) {
        const newMessage = {
          sender: message.sender,
          text: message.content,
          timestamp: message.timestamp * 1000, // Convert to milliseconds
        };
        
        this.messages.push(newMessage);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },

    // Handle typing indicators
    handleTypingIndicator(sender, isTyping) {
      if (sender !== this.currentUsername) {
        this.isPartnerTyping = isTyping;
        
        if (isTyping) {
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      }
    },

    // Handle connection status
    handleConnectionStatus(status, error) {
      this.isConnected = status === 'connected';
      
      if (status === 'connected') {
        console.log('Connected to real-time chat');
      } else if (status === 'disconnected') {
        console.log('Disconnected from real-time chat');
      } else if (status === 'error') {
        console.error('WebSocket error:', error);
      }
    },

    // Handle input changes (for typing indicators)
    onInputChange() {
      // Send typing start indicator
      if (!this.typingTimeout) {
        chatWebSocket.sendTypingStart();
      }

      // Clear existing timeout
      if (this.userTypingTimeout) {
        clearTimeout(this.userTypingTimeout);
      }

      // Set new timeout to stop typing indicator
      this.userTypingTimeout = setTimeout(() => {
        chatWebSocket.sendTypingStop();
        this.userTypingTimeout = null;
      }, 1000); // Stop typing indicator after 1 second of inactivity
    },

    async sendMessage() {
      if (!this.isMessageValid) return;

      try {
        const messageText = this.newMessage.trim();
        
        // Stop typing indicator
        if (this.userTypingTimeout) {
          clearTimeout(this.userTypingTimeout);
          this.userTypingTimeout = null;
          chatWebSocket.sendTypingStop();
        }

        // Construct the message object for display
        const message = {
          sender: this.currentUsername,
          text: messageText,
          timestamp: Date.now(),
        };

        // Optimistically add the message to the chat window
        this.messages.push(message);

        // Clear the input field
        this.newMessage = "";

        // Send message via WebSocket for real-time delivery
        chatWebSocket.sendMessage(messageText);

        // Also send to backend for persistence
        await sendChatMessage(messageText, this.partnerUsername, this.currentUsername, message.timestamp);

        // Scroll to the bottom of the chat window
        this.scrollToBottom();
      } catch (error) {
        console.error("Failed to send message:", error.response?.data || error.message);
        alert("Failed to send message. Please try again.");
      }
    },
    simulatePartnerTyping() {
      if (this.isPartnerTyping) return; // Prevent multiple typing simulations

      const typingDuration = Math.random() * 1500 + 1000; // 1-2.5 seconds typing
      const responseDelay = Math.random() * 1000 + 500; // 0.5-1.5 seconds pause before responding

      this.isPartnerTyping = true;

      setTimeout(() => {
        this.isPartnerTyping = false;

        setTimeout(() => {
          const responses = [
            "Okay!",
            "Sounds good 😊",
            "Miss you too!",
            "Can't wait!",
            "❤️",
            "Got it.",
            "Let's do it!",
            "Perfect!",
            "🤔 Hmm, maybe?",
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          this.messages.push({
            sender: this.partnerUsername,
            text: randomResponse,
            timestamp: Date.now(),
          });
        }, responseDelay);
      }, typingDuration);
    },
    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return "Today";
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
      return date.toLocaleDateString(navigator.language || "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
    formatTime(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleTimeString(navigator.language || "en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    },
    shouldShowDateDivider(prevMsg, currMsg) {
      if (!prevMsg?.timestamp || !currMsg?.timestamp) return false;
      const prevDate = new Date(prevMsg.timestamp);
      const currDate = new Date(currMsg.timestamp);
      return prevDate.toDateString() !== currDate.toDateString();
    },
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
      
      if (this.showEmojiPicker) {
        // Add click outside handler
        this.$nextTick(() => {
          document.addEventListener('click', this.handleClickOutside);
        });
      } else {
        // Remove click outside handler
        document.removeEventListener('click', this.handleClickOutside);
      }
    },

    handleClickOutside(event) {
      const emojiPicker = this.$refs.emojiPicker;
      const emojiButton = event.target.closest('.emoji-toggle-button');
      
      // Close if clicking outside picker and not on the emoji button
      if (emojiPicker && !emojiPicker.contains(event.target) && !emojiButton) {
        this.showEmojiPicker = false;
        document.removeEventListener('click', this.handleClickOutside);
      }
    },
    addEmoji(emoji) {
      this.newMessage += emoji;
      this.showEmojiPicker = false; // Close picker after selection
    },

    // Initialize emoji data
    async initializeEmojis() {
      this.loadingEmojis = true;
      try {
        // Get all available groups
        const groupNames = await emojiService.getGroupNames();
        this.availableGroups = ['popular', 'relationship', ...groupNames];
        
        // Load popular emojis by default
        await this.selectEmojiGroup('popular');
      } catch (error) {
        console.error('Error initializing emojis:', error);
        // Fall back to relationship emojis
        try {
          this.availableGroups = ['popular', 'relationship'];
          this.currentEmojis = await emojiService.getRelationshipEmojis();
          this.selectedGroup = 'relationship';
        } catch (fallbackError) {
          console.error('Error loading fallback emojis:', fallbackError);
          // Use hardcoded fallback
          this.currentEmojis = [
            { character: "❤️", unicodeCodePoint: "2764-fe0f", group: "symbols" },
            { character: "😊", unicodeCodePoint: "1f60a", group: "smileys-emotion" },
            { character: "😘", unicodeCodePoint: "1f618", group: "smileys-emotion" },
            { character: "🥰", unicodeCodePoint: "1f970", group: "smileys-emotion" },
            { character: "😍", unicodeCodePoint: "1f60d", group: "smileys-emotion" },
            { character: "🤗", unicodeCodePoint: "1f917", group: "smileys-emotion" },
            { character: "😂", unicodeCodePoint: "1f602", group: "smileys-emotion" },
            { character: "💕", unicodeCodePoint: "1f495", group: "symbols" }
          ];
          this.availableGroups = ['popular'];
          this.selectedGroup = 'popular';
        }
      }
      this.loadingEmojis = false;
    },

    // Select emoji group and load emojis
    async selectEmojiGroup(groupName) {
      this.selectedGroup = groupName;
      this.loadingEmojis = true;
      
      try {
        if (groupName === 'popular') {
          this.currentEmojis = await emojiService.getPopularEmojis();
        } else if (groupName === 'relationship') {
          this.currentEmojis = await emojiService.getRelationshipEmojis();
        } else {
          this.currentEmojis = await emojiService.getEmojisByGroup(groupName);
        }
      } catch (error) {
        console.error('Error loading emoji group:', error);
        this.currentEmojis = [];
      }
      
      this.loadingEmojis = false;
    },

    // Format group name for display
    formatGroupName(groupName) {
      if (groupName === 'popular') return 'Popular';
      if (groupName === 'relationship') return 'Love & Relationships';
      
      return groupName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' & ');
    },

    // Get icon for emoji group
    getGroupIcon(groupName) {
      const icons = {
        'popular': '⭐',
        'relationship': '❤️',
        'smileys-emotion': '😊',
        'people-body': '👋',
        'animals-nature': '🐶',
        'food-drink': '🍕',
        'activities': '⚽',
        'travel-places': '✈️',
        'objects': '💡',
        'symbols': '❤️',
        'flags': '🏳️'
      };
      return icons[groupName] || '📁';
    },
    scrollToBottom() {
      if (this.$refs.chatWindow) {
        this.$refs.chatWindow.scrollTop = this.$refs.chatWindow.scrollHeight;
      }
    },
    openTextEnhancer() {
      this.showTextEnhancer = true;
    },
    closeTextEnhancer() {
      this.showTextEnhancer = false;
    },
    useEnhancedText(enhancedText) {
      this.newMessage = enhancedText;
      this.closeTextEnhancer();
    },

    // Handle input changes for typing indicators
    handleInput() {
      this.onInputChange();
    },

    // Handle Enter key press
    handleEnterKey(event) {
      if (event.shiftKey) {
        // Allow Shift+Enter for new lines
        return;
      }
      
      // Send message on Enter
      this.sendMessage();
    },
  },

  created() {
    this.fetchChatData();
    this.initializeEmojis();
  },

  beforeUnmount() {
    // Clean up WebSocket connection
    if (this.userTypingTimeout) {
      clearTimeout(this.userTypingTimeout);
      chatWebSocket.sendTypingStop();
    }
    chatWebSocket.disconnect();
    
    // Clean up event listeners
    document.removeEventListener('click', this.handleClickOutside);
  },
};
</script>

<style scoped>
/* Base container for chat view */
.chat-view-content {
  display: flex;
  flex-direction: column;
  height: 100%; /* Fill parent (.router-view-wrapper) */
  background-color: var(--bg-primary); /* Theme background for chat */
  /* No overflow here - parent handles scroll */
}

/* Chat message area */
.chat-window {
  flex-grow: 1; /* Takes most vertical space */
  padding: 1rem 1.5rem; /* More horizontal padding */
  overflow-y: auto; /* SCROLLBAR FOR MESSAGES LIVES HERE NOW */
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Small gap between message containers */
}

/* Date Divider */
.date-divider {
  text-align: center;
  margin: 1.5rem 0 1rem 0; /* More spacing */
  position: relative;
  color: var(--text-muted); /* Softer color */
  font-size: 0.8rem;
  font-weight: 500;
}
.date-divider span {
  background-color: var(--bg-secondary); /* Background matches divider line */
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}
/* Add lines */
.date-divider::before,
.date-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 60px); /* Adjust width based on span */
  height: 1px;
  background-color: var(--border-color);
}
.date-divider::before { left: 0; }
.date-divider::after { right: 0; }

/* Message Container (for alignment) */
.message-container {
  display: flex;
  max-width: 75%; /* Max width of messages */
  align-self: flex-start; /* Default to partner message alignment */
}
.message-container.own-message {
  align-self: flex-end;
}

/* Message Bubble */
.message-bubble {
  padding: 0.65rem 1rem; /* Padding inside bubble */
  border-radius: 18px; /* Rounded bubble shape */
  background-color: var(--bg-white); /* Partner messages */
  color: var(--text-primary); /* Dark text */
  box-shadow: var(--shadow-sm);
  line-height: 1.45;
  word-wrap: break-word;
  display: flex; /* Use flex for text + time */
  flex-direction: column;
  position: relative; /* For potential tails or reactions */
  max-width: 100%;
}
.message-container.own-message .message-bubble {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light)); /* Theme gradient for own messages */
  color: var(--text-white); /* White text */
}

.message-text {
  font-size: 0.95rem;
  margin-bottom: 0.25rem; /* Space between text and time */
}
.message-time {
  font-size: 0.7rem; /* Smaller time */
  color: var(--text-muted); /* Lighter time color */
  align-self: flex-end; /* Time to bottom right */
  margin-top: 0.1rem;
}
.message-container.own-message .message-time {
  color: var(--text-white-muted); /* Lighter white for time */
}
.sender-name { /* Optional sender name display */
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: 2px;
    padding-left: 10px; /* Align roughly with bubble */
}


/* Typing Indicator */
.typing-indicator-container {
    align-self: flex-start; /* Align like partner message */
    margin-top: 0.25rem; /* Space above */
}
.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px; /* Match bubble padding */
  gap: 4px;
}
.typing-indicator .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--text-muted); /* Grey dots */
  animation: typing-pulse 1.4s infinite ease-in-out;
}
.typing-indicator .dot:nth-child(1) { animation-delay: 0s; }
.typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-pulse {
  0%, 40%, 100% { transform: scale(0.8); opacity: 0.6; }
  20% { transform: scale(1); opacity: 1; }
}


/* Input Area - Stays at bottom */
.chat-input-area {
  padding: 0.75rem 1.5rem;
  background-color: var(--bg-white);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0; /* Prevent shrinking */
  position: relative; /* For emoji picker positioning */
}
.chat-input {
  display: flex;
  align-items: flex-end; /* Align items to bottom */
  gap: 0.75rem;
  background-color: var(--bg-secondary); /* Input background */
  border-radius: 22px; /* Rounded container */
  padding: 0.5rem 0.5rem 0.5rem 0.75rem; /* Padding around input elements */
  border: 1px solid var(--border-color);
}

.chat-input textarea {
  flex-grow: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  resize: none; /* Disable manual resize */
  overflow-y: auto; /* Allow scrolling if max height reached */
  padding: 0.4rem 0.25rem; /* Textarea padding */
  line-height: 1.4;
  max-height: 100px; /* Limit height to ~4-5 lines */
  align-self: center; /* Vertically center text cursor initially */
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-secondary);
  color: var(--text-primary); /* Ensure font color uses theme */
}
.chat-input textarea::placeholder {
  color: var(--text-muted);
}

/* Input action buttons (Emoji, Send) */
.input-action-button {
  background: transparent;
  border: none;
  color: var(--text-muted); /* Default icon color */
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, background-color 0.2s ease;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.input-action-button:hover {
  color: var(--primary-color);
  background-color: var(--primary-light);
}
.input-action-button.active { /* Style for active emoji button */
    color: var(--primary-color);
    background-color: var(--primary-light);
}

.send-button {
  color: var(--accent-color); /* Send button uses accent color */
}
.send-button:hover {
  color: var(--text-white); /* White icon on hover */
  background-color: var(--accent-color); /* Accent background */
}
.send-button:disabled {
  color: var(--text-muted) !important;
  background-color: transparent !important;
  cursor: not-allowed;
}

/* Emoji Picker Popover */
.emoji-picker-popover {
  position: absolute;
  bottom: calc(100% + 10px); /* Position above input area */
  left: 1.5rem; /* Align with input area padding */
  background-color: var(--bg-white);
  border-radius: 10px;
  box-shadow: var(--shadow);
  padding: 0.75rem;
  width: 320px; /* Wider for categories */
  z-index: 100;
  border: 1px solid var(--border-color);
}

/* Emoji Categories */
.emoji-categories {
  display: flex;
  gap: 4px;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.category-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
}

.category-btn.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--text-white);
}

/* Loading State */
.emoji-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: var(--text-muted);
  gap: 0.5rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
.emoji-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
    gap: 4px;
    max-height: 180px; /* Limit height to account for categories */
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border-color) var(--bg-secondary);
    padding: 2px; /* Small padding */
}
.emoji-button {
  background: none;
  border: none;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.3rem; /* Slightly smaller for better fit */
  transition: background-color 0.15s ease;
  border-radius: 6px;
}
.emoji-button:hover {
  background-color: var(--bg-secondary);
}

/* Emoji picker transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

/* Text Enhancer Modal */
.text-enhancer-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--bg-white);
  border-radius: 10px;
  box-shadow: var(--shadow);
  padding: 1rem;
  z-index: 200;
  width: 90%;
  max-width: 500px;
}
.text-enhancer-modal .close-button {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, background-color 0.2s ease;
  font-size: 1.1rem;
  flex-shrink: 0;
  position: absolute;
  top: 10px;
  right: 10px;
}
.text-enhancer-modal .close-button:hover {
  color: var(--primary-color);
  background-color: var(--primary-light);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chat-window { padding: 0.75rem 1rem; }
  .chat-input-area { padding: 0.5rem 1rem; }
  .message-container { max-width: 85%; }
}
</style>