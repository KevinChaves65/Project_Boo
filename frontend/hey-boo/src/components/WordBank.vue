<template>
    <div class="wordbank-container">
      <header class="wordbank-header">
        <h1>Word Bank</h1>
        <router-link to="/dashboard" class="back-button">
          <i class="fas fa-arrow-left"></i> Dashboard
        </router-link>
      </header>
  
      <div class="wordbank-body">
        <!-- Add new phrase -->
        <div class="new-phrase">
          <input
            v-model="newPhrase"
            maxlength="200"
            placeholder="Write something sweet..."
          />
          <button @click="addPhrase" :disabled="!newPhrase.trim()">Add</button>
        </div>
  
        <!-- Phrases list -->
        <ul class="phrase-list">
          <li v-for="phrase in phrases" :key="phrase.id" class="phrase-card">
            <div v-if="editingId === phrase.id" class="edit-mode">
              <input v-model="editText" maxlength="200" />
              <button @click="saveEdit(phrase.id)">Save</button>
              <button @click="cancelEdit">Cancel</button>
            </div>
            <div v-else class="phrase-content">
              <span>{{ phrase.text }}</span>
              <div class="actions">
                <button @click="startEdit(phrase)">✏️</button>
                <button @click="deletePhrase(phrase.id)">🗑️</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  
  const API_URL = import.meta.env.VITE_API_URL;
  const userId = 'user123'; // Replace with dynamic user ID if needed
  
  const phrases = ref<{ id: string; text: string }[]>([]);
  const newPhrase = ref('');
  const editingId = ref<string | null>(null);
  const editText = ref('');
  
  const fetchPhrases = async () => {
    const res = await fetch(`${API_URL}/wordbank?userId=${userId}`);
    phrases.value = await res.json();
  };
  
  const addPhrase = async () => {
    const res = await fetch(`${API_URL}/wordbank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text: newPhrase.value.trim() })
    });
    const saved = await res.json();
    phrases.value.push(saved);
    newPhrase.value = '';
  };
  
  const deletePhrase = async (id: string) => {
    await fetch(`${API_URL}/wordbank?id=${id}&userId=${userId}`, {
      method: 'DELETE'
    });
    phrases.value = phrases.value.filter(p => p.id !== id);
  };
  
  const startEdit = (phrase: { id: string; text: string }) => {
    editingId.value = phrase.id;
    editText.value = phrase.text;
  };
  
  const cancelEdit = () => {
    editingId.value = null;
    editText.value = '';
  };
  
  const saveEdit = async (id: string) => {
    const res = await fetch(`${API_URL}/wordbank`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, id, text: editText.value.trim() })
    });
    const updated = await res.json();
    const index = phrases.value.findIndex(p => p.id === updated.id);
    if (index !== -1) phrases.value[index] = updated;
  
    cancelEdit();
  };
  
  onMounted(fetchPhrases);
  </script>
  
  <style scoped>
  .wordbank-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #fef9fb;
    font-family: Arial, sans-serif;
  }
  
  .wordbank-header {
    background-color: #fff;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
  
  .back-button {
    text-decoration: none;
    background: #8c68db;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .wordbank-body {
    padding: 1rem 2rem;
    flex: 1;
    overflow-y: auto;
  }
  
  .new-phrase {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .new-phrase input {
    flex: 1;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #ccc;
  }
  
  .new-phrase button {
    padding: 0.75rem 1.25rem;
    background: #ff80b0;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .phrase-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .phrase-card {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .phrase-content {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  
  .actions button {
    margin-left: 0.5rem;
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
  }
  
  .edit-mode {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }
  
  .edit-mode input {
    flex: 1;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid #ccc;
  }
  
  .edit-mode button {
    background-color: #8c68db;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
  }
  </style>
  