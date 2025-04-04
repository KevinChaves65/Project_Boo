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
        <div class="message-container" :class="{ 'own-message': msg.sender === 'You' }">
          <div class="message-bubble">
            <span class="message-text">{{ msg.text }}</span>
            <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <!-- Optional: Show sender name for partner messages if needed -->
          <!-- <span class="sender-name" v-if="msg.sender !== 'You'">{{ msg.sender }}</span> -->
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
           <div class="emoji-grid">
              <button
                v-for="emoji in commonEmojis"
                :key="emoji"
                class="emoji-button"
                @click="addEmoji(emoji)"
                :title="`Add ${emoji}`"
              >
                {{ emoji }}
              </button>
           </div>
        </div>
      </transition>

      <div class="chat-input">
        <button class="input-action-button emoji-toggle-button" @click.stop="toggleEmojiPicker" title="Add emoji" :class="{active: showEmojiPicker}">
          <i class="far fa-smile"></i>
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
    </div>
  </div>
</template>

<script>
// Your existing script block (data, methods, computed, etc.)
// Ensure methods like `formatDate`, `formatTime`, `shouldShowDateDivider`, etc. exist.
// Add computed property `isMessageValid`
export default {
  name: "ChatsPage", // Use specific name
  data() {
    return {
      messages: [ // Example messages
        { sender: "You", text: "Hey Boo! How was your day? 😊", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3)}, // 3 hours ago
        { sender: "Partner", text: "It was pretty good! Long meeting but productive. How about yours? ❤️", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.9)},
        { sender: "You", text: "Mine was okay, just glad it's almost over! Thinking about dinner?", timestamp: new Date(Date.now() - 1000 * 60 * 30)}, // 30 mins ago
        { sender: "Partner", text: "Yes! Craving that pizza place 🍕", timestamp: new Date(Date.now() - 1000 * 60 * 28)},
      ],
      newMessage: "",
      isPartnerTyping: false,
      typingTimeout: null, // For user typing (optional)
      showEmojiPicker: false,
      commonEmojis: ["❤️", "😊", "😘", "🥰", "😍", "🤗", "😂", "🤔", "👍", "🎉", "🍕", "✨", "👋", "💕", "🥺", "🙏"], // Expanded list
      autoScrollEnabled: true, // Flag to control auto-scrolling
    };
  },
  computed: {
    isMessageValid() {
      return this.newMessage.trim().length > 0;
    }
  },
   watch: {
    messages() {
      // Scroll to bottom when messages array changes, if enabled
      this.$nextTick(() => {
          if(this.autoScrollEnabled) {
            this.scrollToBottom();
          }
      });
    }
  },
  mounted() {
    this.scrollToBottom(true); // Initial scroll (instant)
    // Add click outside listener for emoji picker
    document.addEventListener('click', this.handleClickOutsideEmojiPicker);
    // Simulate partner activity (optional)
    // setTimeout(() => { this.simulatePartnerTyping(); }, 7000);
  },
  beforeUnmount() {
    // Clean up listener
     document.removeEventListener('click', this.handleClickOutsideEmojiPicker);
     if (this.typingTimeout) { clearTimeout(this.typingTimeout); }
  },
  methods: {
     handleEnterKey(event) {
         if (event.shiftKey) {
             // Allow Shift+Enter for newline
             // The default behavior of textarea already handles this
         } else {
             // Send message on Enter alone
             this.sendMessage();
         }
     },
    sendMessage() {
      if (!this.isMessageValid) return;

      this.messages.push({
        sender: "You",
        text: this.newMessage.trim(),
        timestamp: new Date()
      });

      this.newMessage = ""; // Clear input
      this.showEmojiPicker = false; // Close emoji picker
      this.autoScrollEnabled = true; // Re-enable auto-scroll after sending
      this.$nextTick(() => { this.adjustTextareaHeight(); }); // Reset height

      // Simulate partner response (replace with actual WebSocket logic)
       this.simulatePartnerTyping();
    },

    simulatePartnerTyping() {
      if (this.isPartnerTyping) return; // Don't simulate if already typing

      const typingDuration = Math.random() * 1500 + 1000; // 1-2.5 seconds typing
      const responseDelay = Math.random() * 1000 + 500; // 0.5-1.5 seconds pause before responding

      this.isPartnerTyping = true;
      this.autoScrollEnabled = true; // Ensure scroll happens for typing indicator
      this.$nextTick(() => this.scrollToBottom());

      setTimeout(() => {
        this.isPartnerTyping = false;

        setTimeout(() => {
           const responses = [ "Okay!", "Sounds good 😊", "Miss you too!", "Can't wait!", "❤️", "Got it.", "Let's do it!", "Perfect!", "🤔 Hmm, maybe?"];
           const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.messages.push({ sender: "Partner", text: randomResponse, timestamp: new Date() });
            this.autoScrollEnabled = true; // Ensure scroll for new message
        }, responseDelay);

      }, typingDuration);
    },

    // Adjust textarea height based on content
    adjustTextareaHeight() {
        const textarea = this.$refs.inputArea;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            // Set height based on scroll height, max out at ~4 lines
            const maxHeight = 100; // Adjust max height in pixels
            textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
        }
    },
    handleInput() {
       this.adjustTextareaHeight();
        // Optional: Add "user is typing" indicator logic here for real-time app
         // Clear previous timeout
         if (this.typingTimeout) clearTimeout(this.typingTimeout);
         // Notify partner (conceptual)
         // this.$socket.emit('typing', { isTyping: true });
         // Set new timeout
         this.typingTimeout = setTimeout(() => {
             // Notify partner stopped typing (conceptual)
             // this.$socket.emit('typing', { isTyping: false });
         }, 1500); // Consider user stopped after 1.5s pause
    },

    scrollToBottom(instant = false) {
        const chatWindow = this.$refs.chatWindow;
        if (chatWindow) {
            // Check if user has scrolled up significantly
            const threshold = 100; // Pixels from bottom
            const userScrolledUp = chatWindow.scrollHeight - chatWindow.scrollTop - chatWindow.clientHeight > threshold;

            if (!userScrolledUp || !this.autoScrollEnabled) {
                // Smooth scroll if near bottom or auto-scroll enabled, otherwise instant
                const behavior = instant || !this.autoScrollEnabled ? 'instant' : 'smooth';
                chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior });
            }
        }
    },

    // --- Formatting & Helpers ---
    formatTime(timestamp) { /* ... keep existing ... */
         if (!timestamp) return "";
         const date = new Date(timestamp);
          return date.toLocaleTimeString(navigator.language || 'en-US', { hour: 'numeric', minute: '2-digit' });
    },
    formatDate(timestamp) { /* ... keep existing ... */
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
        return date.toLocaleDateString(navigator.language || 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    shouldShowDateDivider(prevMsg, currMsg) { /* ... keep existing ... */
        if (!prevMsg?.timestamp || !currMsg?.timestamp) return false;
        const prevDate = new Date(prevMsg.timestamp);
        const currDate = new Date(currMsg.timestamp);
        return prevDate.toDateString() !== currDate.toDateString();
    },

    // --- Emoji Picker ---
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    addEmoji(emoji) {
      this.newMessage += emoji;
      this.$refs.inputArea.focus(); // Focus input after adding emoji
       this.adjustTextareaHeight();
    },
     handleClickOutsideEmojiPicker(event) {
         // Close picker if click is outside the picker itself AND outside the toggle button
         const picker = this.$refs.emojiPicker;
         const toggleButton = document.querySelector('.emoji-toggle-button'); // More robust selector might be needed

         if (this.showEmojiPicker &&
             picker && !picker.contains(event.target) &&
             toggleButton && !toggleButton.contains(event.target)
             ) {
             this.showEmojiPicker = false;
         }
     },

    // --- Scroll Handling ---
    handleScroll() {
      const chatWindow = this.$refs.chatWindow;
      if (chatWindow) {
        const isScrolledToBottom = chatWindow.scrollHeight - chatWindow.clientHeight <= chatWindow.scrollTop + 1; // +1 for tolerance
        this.autoScrollEnabled = isScrolledToBottom;
      }
    }
  },
   created() {
     // Add scroll listener to manage auto-scroll enabling/disabling
     // Need to attach it after mount or ensure ref is available
   },
    mounted() {
      this.scrollToBottom(true); // Initial scroll (instant)
       if (this.$refs.chatWindow) {
           this.$refs.chatWindow.addEventListener('scroll', this.handleScroll);
       }
       document.addEventListener('click', this.handleClickOutsideEmojiPicker);
       // Adjust initial textarea height
       this.adjustTextareaHeight();
    },
     beforeUnmount() {
       if (this.$refs.chatWindow) {
           this.$refs.chatWindow.removeEventListener('scroll', this.handleScroll);
       }
        document.removeEventListener('click', this.handleClickOutsideEmojiPicker);
        if (this.typingTimeout) { clearTimeout(this.typingTimeout); }
    },
};
</script>

<style scoped>
/* Base container for chat view */
.chat-view-content {
  display: flex;
  flex-direction: column;
  height: 100%; /* Fill parent (.router-view-wrapper) */
  background-color: #f0f4f8; /* Lighter background for chat */
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
  color: #8899a6; /* Softer color */
  font-size: 0.8rem;
  font-weight: 500;
}
.date-divider span {
  background-color: #e1e8ed; /* Background matches divider line */
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
  background-color: #e1e8ed;
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
  background-color: #ffffff; /* Partner messages */
  color: #14171a; /* Dark text */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 1.45;
  word-wrap: break-word;
  display: flex; /* Use flex for text + time */
  flex-direction: column;
  position: relative; /* For potential tails or reactions */
  max-width: 100%;
}
.message-container.own-message .message-bubble {
  background: linear-gradient(135deg, #8c68db, #a66fd5); /* Theme gradient for own messages */
  color: #ffffff; /* White text */
}

.message-text {
  font-size: 0.95rem;
  margin-bottom: 0.25rem; /* Space between text and time */
}
.message-time {
  font-size: 0.7rem; /* Smaller time */
  color: #aab8c2; /* Lighter time color */
  align-self: flex-end; /* Time to bottom right */
  margin-top: 0.1rem;
}
.message-container.own-message .message-time {
  color: rgba(255, 255, 255, 0.7); /* Lighter white for time */
}
.sender-name { /* Optional sender name display */
    font-size: 0.75rem;
    color: #657786;
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
  background-color: #b0b0b0; /* Grey dots */
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
  background-color: #ffffff;
  border-top: 1px solid #e6ecf0;
  flex-shrink: 0; /* Prevent shrinking */
  position: relative; /* For emoji picker positioning */
}
.chat-input {
  display: flex;
  align-items: flex-end; /* Align items to bottom */
  gap: 0.75rem;
  background-color: #f5f8fa; /* Input background */
  border-radius: 22px; /* Rounded container */
  padding: 0.5rem 0.5rem 0.5rem 0.75rem; /* Padding around input elements */
  border: 1px solid #e6ecf0;
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
  scrollbar-color: #ccc #f5f8fa;
}
.chat-input textarea::placeholder {
  color: #aab8c2;
}

/* Input action buttons (Emoji, Send) */
.input-action-button {
  background: transparent;
  border: none;
  color: #657786; /* Default icon color */
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
  color: #8c68db;
  background-color: #e8e4f5;
}
.input-action-button.active { /* Style for active emoji button */
    color: #8c68db;
    background-color: #e8e4f5;
}

.send-button {
  color: #ff80b0; /* Send button uses pink */
}
.send-button:hover {
  color: #fff; /* White icon on hover */
  background-color: #ff80b0; /* Pink background */
}
.send-button:disabled {
  color: #bdc5cd !important;
  background-color: transparent !important;
  cursor: not-allowed;
}

/* Emoji Picker Popover */
.emoji-picker-popover {
  position: absolute;
  bottom: calc(100% + 10px); /* Position above input area */
  left: 1.5rem; /* Align with input area padding */
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  padding: 0.75rem;
  width: 280px; /* Adjust width */
  z-index: 100;
  border: 1px solid #eee;
}
.emoji-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
    gap: 5px;
    max-height: 200px; /* Limit height */
    overflow-y: auto;
     scrollbar-width: thin;
     scrollbar-color: #ccc #f5f8fa;
}
.emoji-button {
  background: none;
  border: none;
  padding: 0;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.4rem; /* Larger emojis */
  transition: background-color 0.15s ease;
  border-radius: 6px;
}
.emoji-button:hover {
  background-color: #f0f4f8;
}

/* Emoji picker transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chat-window { padding: 0.75rem 1rem; }
  .chat-input-area { padding: 0.5rem 1rem; }
  .message-container { max-width: 85%; }
}
</style>