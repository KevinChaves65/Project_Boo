<template>
  <div class="hello-container">
    <!-- Header -->
    <div class="header">
      <span class="header-text">Home Dashboard</span>
    </div>

    <!-- Notifications & Last Chat -->
    <div class="notification-box">Notifications</div>
    <div class="chat-box">Good night boo!</div>

    <button class="menu-button">
    Calendar
    </button>
    <button class="menu-button" @click="router.push('/word-bank')">
    Word Bank
    </button>
    <button class="menu-button" @click="goToChat">
    Chat
    </button>

    <div class="settings">
      <button class="settings-button">⚙️</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToChat = () => {
  router.push('/chat');
};
</script>

<style scoped>
/* Container */
.hello-container {
  width: 300px;
  padding: 15px;
  background-color: #ffe6e9; /* Light pink */
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  font-family: Arial, sans-serif;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.icon {
  margin-left: 5px;
}

/* Notification and Chat Boxes */
.notification-box,
.chat-box {
  background-color: white;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  color: #555;
}

/* Buttons */
.menu-button {
  width: 100%;
  padding: 10px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Settings Button */
.settings {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.settings-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: black;
}
</style>

