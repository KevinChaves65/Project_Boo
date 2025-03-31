<template>
    <div class="chat-container">
      <div class="chat-header">💬 Chat with Boo</div>
  
      <div class="messages" ref="messageContainer">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.sender === 'You' ? 'sent' : 'received']"
        >
          <div class="bubble">{{ msg.content }}</div>
        </div>
      </div>
  
      <div class="input-row">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Type a message..."
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  
  const messages = ref<{ sender: string; content: string }[]>([]);
  const newMessage = ref('');
  const socket = new WebSocket('ws://localhost:8080/ws');
  const messageContainer = ref<HTMLElement | null>(null);
  
  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    messages.value.push(msg);
    scrollToBottom();
  };
  
  const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  const msg = { sender: 'You', content: newMessage.value };
  socket.send(JSON.stringify(msg));
  newMessage.value = '';
  scrollToBottom();
};
  
  const scrollToBottom = () => {
    nextTick(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      }
    });
  };
  
  onUnmounted(() => {
    socket.close();
  });
  </script>
  
  <style scoped>
  .chat-container {
    width: 300px;
    height: 400px;
    background-color: #ffe6e9;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    font-family: Arial, sans-serif;
  }
  
  .chat-header {
    background-color: #ffc0cb;
    padding: 10px;
    text-align: center;
    font-weight: bold;
    color: white;
    font-size: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .messages {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .message {
    display: flex;
  }
  
  .message.sent {
    justify-content: flex-end;
  }
  
  .message.received {
    justify-content: flex-start;
  }
  
  .bubble {
    max-width: 70%;
    padding: 8px 12px;
    border-radius: 16px;
    background-color: white;
    color: #333;
    font-size: 14px;
    word-wrap: break-word;
  }
  
  .message.sent .bubble {
    background-color: #d3f8d3;
  }
  
  .input-row {
    display: flex;
    padding: 10px;
    gap: 6px;
    border-top: 1px solid #eee;
  }
  
  input {
    flex: 1;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
  }
  
  button {
    padding: 8px 12px;
    background-color: black;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  </style>
  