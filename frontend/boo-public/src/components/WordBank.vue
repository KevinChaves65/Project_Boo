<template>
    <div class="word-bank">
      <h2>My Word Bank</h2>
  
      <!-- Input for New Phrase -->
      <textarea
        v-model="newPhrase"
        maxlength="200"
        placeholder="Write something sweet..."
      ></textarea>
      <button @click="addPhrase">Add Phrase</button>
  
      <p v-if="loading">Loading phrases...</p>
  
      <!-- Phrase List -->
      <ul>
        <li v-for="phrase in phrases" :key="phrase.id">
          <div v-if="editingId === phrase.id" class="edit-mode">
            <input v-model="editText" />
            <button @click="saveEdit">Save</button>
            <button @click="() => (editingId = null)">Cancel</button>
          </div>
          <div v-else class="phrase-row">
            {{ phrase.text }}
            <div class="actions">
              <button @click="() => startEdit(phrase)">✏️</button>
              <button @click="() => deletePhrase(phrase.id)">🗑️</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  
  const API_URL = import.meta.env.VITE_API_URL;
  const userId = 'user123'; // Placeholder - update this with actual user ID logic
  
  const newPhrase = ref('');
  const phrases = ref<{ id: string; text: string }[]>([]);
  const loading = ref(false);
  
  const editingId = ref<string | null>(null);
  const editText = ref('');
  
  const fetchPhrases = async () => {
    loading.value = true;
    try {
      const res = await fetch(`${API_URL}/wordbank?userId=${userId}`);
      const data = await res.json();
      phrases.value = data;
    } catch (err) {
      console.error('Failed to fetch phrases:', err);
    } finally {
      loading.value = false;
    }
  };
  
  const addPhrase = async () => {
    if (!newPhrase.value.trim()) return;
    try {
      const res = await fetch(`${API_URL}/wordbank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text: newPhrase.value.trim() })
      });
      const saved = await res.json();
      phrases.value.push(saved);
      newPhrase.value = '';
    } catch (err) {
      console.error('Failed to add phrase:', err);
    }
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
  
  const saveEdit = async () => {
    if (!editText.value.trim()) return;
    const res = await fetch(`${API_URL}/wordbank`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, id: editingId.value, text: editText.value.trim() })
    });
    const updated = await res.json();
    const index = phrases.value.findIndex(p => p.id === updated.id);
    if (index !== -1) phrases.value[index] = updated;
  
    editingId.value = null;
    editText.value = '';
  };
  
  onMounted(() => {
    fetchPhrases();
  });
  </script>
  
  <style scoped>
  .word-bank {
    padding: 15px;
    background: #ffe6e9;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
  }
  textarea {
    width: 100%;
    height: 60px;
    padding: 8px;
    margin-bottom: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    resize: none;
  }
  input {
    width: 100%;
    padding: 6px;
    margin-bottom: 6px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  button {
    background-color: black;
    color: white;
    padding: 6px 10px;
    margin: 4px 4px 4px 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  ul {
    list-style: none;
    padding: 0;
    margin-top: 10px;
  }
  li {
    background: white;
    padding: 8px;
    border-radius: 6px;
    margin-bottom: 8px;
  }
  .phrase-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .actions button {
    margin-left: 6px;
  }
  .edit-mode {
    display: flex;
    gap: 6px;
  }
  </style>
  