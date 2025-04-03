<template>
  <div class="chats-container">
    <header class="chats-header">
      <h1>Chats</h1>
      <div class="header-actions">
        <button class="refresh-button" @click="refreshMessages" title="Refresh Messages">
          <i class="fas fa-sync-alt"></i>
        </button>
        <router-link to="/dashboard" class="back-button">
          <i class="fas fa-arrow-left"></i> Dashboard
        </router-link>
      </div>
    </header>

    <div class="chat-body">
      <!-- Chat window with messages -->
      <div class="chat-window" ref="chatWindow">
        <div class="date-divider" v-if="messages.length > 0">
          <span>{{ formatDate(messages[0].timestamp) }}</span>
        </div>
        
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          class="message-container"
          :class="{ 'own-message': msg.sender === 'You' }"
        >
          <!-- Only show date divider if the date changes between messages -->
          <div class="date-divider" v-if="index > 0 && shouldShowDateDivider(messages[index-1], msg)">
            <span>{{ formatDate(msg.timestamp) }}</span>
          </div>
          
          <div class="message">
            <div class="message-header">
              <span class="sender">{{ msg.sender }}</span>
              <span class="time">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="text">{{ msg.text }}</div>
          </div>
        </div>
        
        <!-- Typing indicator -->
        <div v-if="isPartnerTyping" class="typing-indicator">
          <span>Partner is typing</span>
          <span class="dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </div>
      </div>

      <!-- Input area -->
      <div class="chat-input">
        <div class="emoji-button" @click="toggleEmojiPicker">
          <i class="far fa-smile"></i>
        </div>
        
        <input 
          v-model="newMessage" 
          type="text" 
          placeholder="Type a message..." 
          @keyup.enter="sendMessage"
          @input="handleTyping"
        />
        
        <button 
          @click="sendMessage" 
          class="send-button"
          :disabled="!newMessage.trim()"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
      
      <!-- Emoji picker (simplified version) -->
      <div v-if="showEmojiPicker" class="emoji-picker">
        <div 
          v-for="emoji in commonEmojis" 
          :key="emoji"
          class="emoji"
          @click="addEmoji(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChatsPage",
  data() {
    return {
      messages: [
        { 
          sender: "You", 
          text: "Hey Boo! How's your day going?", 
          timestamp: new Date(2025, 2, 18, 9, 30) 
        },
        { 
          sender: "Partner", 
          text: "It's going well! Just finished that project I was telling you about.", 
          timestamp: new Date(2025, 2, 18, 9, 32) 
        },
        { 
          sender: "You", 
          text: "That's awesome! We should celebrate tonight.", 
          timestamp: new Date(2025, 2, 18, 9, 33) 
        },
        { 
          sender: "Partner", 
          text: "Sounds perfect! What did you have in mind?", 
          timestamp: new Date(2025, 2, 18, 9, 35) 
        },
        { 
          sender: "You", 
          text: "How about that new restaurant we've been wanting to try?", 
          timestamp: new Date(2025, 2, 18, 10, 15) 
        }
      ],
      newMessage: "",
      isPartnerTyping: false,
      typingTimeout: null,
      showEmojiPicker: false,
      commonEmojis: ["❤️", "😊", "😘", "🥰", "😍", "🤗", "👋", "👍", "🎉", "🎂", "🌹", "💕"]
    };
  },
  mounted() {
    this.scrollToBottom();
    // Simulate partner typing occasionally
    setTimeout(() => {
      this.simulatePartnerTyping();
    }, 5000);
  },
  updated() {
    this.scrollToBottom();
  },
  methods: {
    sendMessage() {
      if (!this.newMessage.trim()) return;
      
      const now = new Date();
      this.messages.push({ 
        sender: "You", 
        text: this.newMessage,
        timestamp: now
      });
      
      this.newMessage = "";
      this.showEmojiPicker = false;
      
      // Simulate partner response
      this.simulatePartnerTyping();
    },
    
    
    handleTyping() {
      // In a real app, this would notify the partner that you're typing
      console.log("User is typing...");
      
      // Clear previous timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      
      // Set new timeout
      this.typingTimeout = setTimeout(() => {
        console.log("User stopped typing");
      }, 1000);
    },
    
    scrollToBottom() {
      if (this.$refs.chatWindow) {
        this.$refs.chatWindow.scrollTop = this.$refs.chatWindow.scrollHeight;
      }
    },
    
    formatTime(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    },
    
    shouldShowDateDivider(prevMsg, currMsg) {
      if (!prevMsg.timestamp || !currMsg.timestamp) return false;
      
      const prevDate = new Date(prevMsg.timestamp);
      const currDate = new Date(currMsg.timestamp);
      
      return prevDate.toDateString() !== currDate.toDateString();
    },
    
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    
    addEmoji(emoji) {
      this.newMessage += emoji;
      this.$nextTick(() => {
        document.querySelector('.chat-input input').focus();
      });
    },
    
    refreshMessages() {
      // In a real app, this would fetch new messages from the server
      console.log("Refreshing messages...");
      // Add a visual indicator
      const refreshButton = document.querySelector('.refresh-button i');
      refreshButton.classList.add('rotating');
      setTimeout(() => {
        refreshButton.classList.remove('rotating');
      }, 1000);
    }
  }
};
</script>

<style scoped>
/* Container with consistent sizing */
.chats-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: "Helvetica Neue", Arial, sans-serif;
  background-color: #f9f9f9;
}

/* Header styling */
.chats-header {
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chats-header h1 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  background-color: #8c68db;
  color: #fff;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: #7a5fc7;
}

.refresh-button {
  background: none;
  border: none;
  color: #8c68db;
  cursor: pointer;
  font-size: 1rem;
}

.refresh-button i.rotating {
  animation: rotate 1s linear;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Chat body */
.chat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow: hidden;
  position: relative;
}

/* Chat window */
.chat-window {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
  margin-bottom: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* Date divider */
.date-divider {
  text-align: center;
  margin: 1rem 0;
  position: relative;
}

.date-divider span {
  background-color: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
}

/* Message styling */
.message-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  max-width: 80%;
}

.own-message {
  align-self: flex-end;
}

.message {
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #f0f0f0;
  position: relative;
}

.own-message .message {
  background-color: #e1d5f5;
  color: #333;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
}

.sender {
  font-weight: bold;
  color: #8c68db;
}

.own-message .sender {
  color: #ff80b0;
}

.time {
  color: #999;
}

.text {
  line-height: 1.4;
  word-break: break-word;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #999;
}

.dots {
  display: flex;
  margin-left: 0.5rem;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #999;
  margin-right: 3px;
  animation: pulse 1.5s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

/* Chat input area */
.chat-input {
  display: flex;
  gap: 0.5rem;
  background-color: #fff;
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chat-input input {
  flex: 1;
  padding: 0.75rem;
  border-radius: 20px;
  border: 1px solid #ddd;
  outline: none;
  transition: border-color 0.2s ease;
}

.chat-input input:focus {
  border-color: #8c68db;
}

.emoji-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s ease;
}

.emoji-button:hover {
  color: #8c68db;
}

.send-button {
  background-color: #ff80b0;
  color: #fff;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.send-button:hover {
  background-color: #ff66a3;
}

.send-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Emoji picker */
.emoji-picker {
  position: absolute;
  bottom: 80px;
  left: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  width: 240px;
  z-index: 10;
}

.emoji {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  transition: background-color 0.2s ease;
}

.emoji:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chats-header {
    padding: 1rem;
  }
  
  .message-container {
    max-width: 90%;
  }
}
</style>
