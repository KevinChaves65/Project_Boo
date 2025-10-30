<template>
  <!-- Root element for the word bank view content -->
  <div class="word-bank-view-content">

    <!-- Main Card for the Word Bank -->
    <div class="word-bank-card">

      <!-- Themed Word Bank Section -->
      <div class="themed-word-bank">
        <div class="word-bank-header">
          <h3>Your Themed Word Collection</h3>
          <button @click="showAddWordModal = true" class="add-word-btn">
            <i class="fas fa-plus"></i> Add Word
          </button>
        </div>

        <!-- Available Themes -->
        <div class="themes-section">
          <h4>Preview Themes</h4>
          <div class="theme-preview-grid">
            <div 
              v-for="theme in availableThemes" 
              :key="theme.id" 
              class="theme-preview"
              :style="{
                color: theme.font_color,
                fontFamily: theme.font_family
              }"
            >
              <span class="theme-name">{{ theme.theme_name }}</span>
              <span class="theme-sample">Sample Text</span>
            </div>
          </div>
        </div>

        <!-- Word Bank Display -->
        <div class="word-bank-display">
          <h4>Your Words</h4>
          <div v-if="!wordBank || wordBank.length === 0" class="empty-state">
            <i class="fas fa-font"></i>
            <p>No themed words yet. Add some words to get started!</p>
          </div>
          <div v-else class="word-grid">
            <div 
              v-for="word in wordBankWithThemes" 
              :key="word.id" 
              class="word-card"
              :style="{
                borderColor: word.theme?.font_color || '#ddd'
              }"
            >
              <div class="word-content">
                <span 
                  class="word-text"
                  :style="{
                    color: word.theme?.font_color || '#333',
                    fontFamily: word.theme?.font_family || 'inherit'
                  }"
                >
                  {{ word.word_name }}
                </span>
                <span class="theme-label">{{ word.theme?.theme_name || 'Unknown' }}</span>
              </div>
              <div class="word-actions">
                <button 
                  @click="changeWordTheme(word)" 
                  class="theme-btn"
                  title="Change Theme"
                >
                  <i class="fas fa-palette"></i>
                </button>
                <button 
                  @click="useWordInChat(word)" 
                  class="use-btn"
                  title="Use in Chat"
                >
                  <i class="fas fa-paper-plane"></i>
                </button>
                <button 
                  @click="deleteWord(word)" 
                  class="delete-btn"
                  title="Delete Word"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Word Modal -->
    <div v-if="showAddWordModal" class="modal-overlay" @click="closeAddWordModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add Themed Word</h3>
          <button @click="closeAddWordModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Word/Phrase</label>
            <input 
              v-model="newWord.text" 
              type="text" 
              placeholder="Enter word or phrase..."
              maxlength="100"
              class="word-input"
            />
          </div>
          <div class="form-group">
            <label>Choose Theme</label>
            <div class="theme-selector">
              <div 
                v-for="theme in availableThemes" 
                :key="theme.id"
                class="theme-option"
                :class="{ active: newWord.themeId === theme.id }"
                @click="newWord.themeId = theme.id"
                :style="{
                  borderColor: newWord.themeId === theme.id ? theme.font_color : '#ddd'
                }"
              >
                <span 
                  class="theme-preview-text"
                  :style="{
                    color: theme.font_color,
                    fontFamily: theme.font_family
                  }"
                >
                  {{ theme.theme_name }}
                </span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Preview</label>
            <div class="word-preview">
              <span 
                :style="{
                  color: selectedTheme?.font_color || '#333',
                  fontFamily: selectedTheme?.font_family || 'inherit'
                }"
              >
                {{ newWord.text || 'Your word will appear here...' }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeAddWordModal" class="cancel-btn">Cancel</button>
          <button 
            @click="addWordToBank" 
            class="save-btn"
            :disabled="!newWord.text.trim() || !newWord.themeId"
          >
            Add Word
          </button>
        </div>
      </div>
    </div>

    <!-- Theme Change Modal -->
    <div v-if="showThemeModal" class="modal-overlay" @click="closeThemeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Change Theme for "{{ selectedWord?.word_name }}"</h3>
          <button @click="closeThemeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="theme-selector">
            <div 
              v-for="theme in availableThemes" 
              :key="theme.id"
              class="theme-option"
              :class="{ active: selectedThemeId === theme.id }"
              @click="selectedThemeId = theme.id"
              :style="{
                borderColor: selectedThemeId === theme.id ? theme.font_color : '#ddd'
              }"
            >
              <span 
                class="theme-preview-text"
                :style="{
                  color: theme.font_color,
                  fontFamily: theme.font_family
                }"
              >
                {{ selectedWord?.word_name }} ({{ theme.theme_name }})
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeThemeModal" class="cancel-btn">Cancel</button>
          <button 
            @click="updateWordTheme" 
            class="save-btn"
            :disabled="!selectedThemeId"
          >
            Update Theme
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { 
  getWordThemes, 
  addWordToBank, 
  getWordBank, 
  updateWordTheme as updateTheme, 
  deleteWordFromBank,
  fetchUserProfile 
} from "../services/apiService";

export default {
  name: "WordBank",
  data() {
    return {
      // Themed word bank data
      availableThemes: [],
      wordBank: [],
      showAddWordModal: false,
      showThemeModal: false,
      newWord: {
        text: '',
        themeId: 'standard'
      },
      selectedWord: null,
      selectedThemeId: '',
      userProfile: null,
      coupleId: null,
    };
  },
  computed: {
    selectedTheme() {
      return this.availableThemes.find(theme => theme.id === this.newWord.themeId);
    },
    wordBankWithThemes() {
      if (!Array.isArray(this.wordBank)) {
        return [];
      }
      return this.wordBank.map(word => ({
        ...word,
        theme: this.availableThemes.find(theme => theme.id === word.theme_id)
      }));
    }
  },
  async created() {
    try {
      await this.loadUserProfile();
      await this.loadThemes();
      await this.loadWordBank();
    } catch (error) {
      console.error("Error initializing TextEnhancer:", error);
      // Component will still render with default values
    }
  },
  methods: {
    async loadUserProfile() {
      try {
        this.userProfile = await fetchUserProfile();
        this.coupleId = this.userProfile.couple_id;
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    },

    async loadThemes() {
      try {
        this.availableThemes = await getWordThemes();
        // Ensure availableThemes is always an array
        if (!Array.isArray(this.availableThemes)) {
          this.availableThemes = [];
        }
      } catch (error) {
        console.error("Failed to load themes:", error);
        this.availableThemes = []; // Reset to empty array on error
        // Don't show alert on initialization - just log the error
      }
    },

    async loadWordBank() {
      if (!this.coupleId) return;
      
      try {
        this.wordBank = await getWordBank(this.coupleId);
        // Ensure wordBank is always an array
        if (!Array.isArray(this.wordBank)) {
          this.wordBank = [];
        }
      } catch (error) {
        console.error("Failed to load word bank:", error);
        this.wordBank = []; // Reset to empty array on error
      }
    },

    closeAddWordModal() {
      this.showAddWordModal = false;
      this.newWord = { text: '', themeId: 'standard' };
    },

    async addWordToBank() {
      if (!this.newWord.text.trim() || !this.newWord.themeId || !this.coupleId) return;

      try {
        await addWordToBank(this.coupleId, this.newWord.text.trim(), this.newWord.themeId);
        await this.loadWordBank(); // Refresh the word bank
        this.closeAddWordModal();
        
        // Emit event to notify parent components (like Chat) to refresh themed words
        this.$emit('word-bank-updated');
        
        alert("Word added successfully!");
      } catch (error) {
        console.error("Failed to add word:", error);
        alert("Failed to add word. Please try again.");
      }
    },

    changeWordTheme(word) {
      this.selectedWord = word;
      this.selectedThemeId = word.theme_id;
      this.showThemeModal = true;
    },

    closeThemeModal() {
      this.showThemeModal = false;
      this.selectedWord = null;
      this.selectedThemeId = '';
    },

    async updateWordTheme() {
      if (!this.selectedWord || !this.selectedThemeId || !this.coupleId) return;

      try {
        await updateTheme(this.coupleId, this.selectedWord.id, this.selectedThemeId);
        await this.loadWordBank(); // Refresh the word bank
        this.closeThemeModal();
        
        // Emit event to notify parent components (like Chat) to refresh themed words
        this.$emit('word-bank-updated');
        
        alert("Theme updated successfully!");
      } catch (error) {
        console.error("Failed to update theme:", error);
        alert("Failed to update theme. Please try again.");
      }
    },

    async deleteWord(word) {
      if (!confirm(`Are you sure you want to delete "${word.word_name}"?`)) return;

      try {
        await deleteWordFromBank(this.coupleId, word.id);
        await this.loadWordBank(); // Refresh the word bank
        
        // Emit event to notify parent components (like Chat) to refresh themed words
        this.$emit('word-bank-updated');
        
        alert("Word deleted successfully!");
      } catch (error) {
        console.error("Failed to delete word:", error);
        alert("Failed to delete word. Please try again.");
      }
    },

    useWordInChat(word) {
      // Emit event to parent component or navigate to chat with this word
      this.$emit('use-themed-word', {
        text: word.word_name,
        theme: word.theme
      });
      
      // For now, show alert - you can customize this behavior
      alert(`Using "${word.word_name}" in chat with ${word.theme?.theme_name} theme!`);
    },
  },
};
</script>

<style scoped>
/* Base container for this view */
.word-bank-view-content {
  padding: 1.5rem 2rem;
  height: 100%;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Main Word Bank Card */
.word-bank-card {
  background-color: var(--bg-white);
  border-radius: 12px;
  box-shadow: none;
  padding: 1.5rem 2rem;
  width: 100%;
  max-width: 100%;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.clear-button:hover { 
  background-color: #f9fafb; 
  border-color: #aaa; 
}

/* ===== NEW THEMED WORD BANK STYLES ===== */

.themed-word-bank {
  background: linear-gradient(135deg, #f8f9ff 0%, #f1f3ff 100%);
  border: 2px solid #e0e7ff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.word-bank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.word-bank-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4338ca;
  margin: 0;
}

.add-word-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.add-word-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.themes-section {
  margin-bottom: 2rem;
}

.themes-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.theme-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.theme-preview {
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s ease;
}

.theme-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.theme-sample {
  display: block;
  font-size: 1.1rem;
  font-weight: 500;
}

.word-bank-display h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.word-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.word-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.word-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.word-content {
  flex-grow: 1;
}

.word-text {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.theme-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.word-actions {
  display: flex;
  gap: 0.5rem;
}

.theme-btn, .use-btn, .delete-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.8rem;
}

.theme-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.theme-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.use-btn {
  background: #dcfce7;
  color: #166534;
}

.use-btn:hover {
  background: #bbf7d0;
  color: #14532d;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #b91c1c;
}

/* ===== MODAL STYLES ===== */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 0 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.word-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.word-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.theme-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.theme-option {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.theme-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-option.active {
  border-width: 3px;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-preview-text {
  font-size: 1rem;
  font-weight: 600;
}

.word-preview {
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.word-preview span {
  font-size: 1.2rem;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.cancel-btn, .save-btn {
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.cancel-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.save-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.save-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .text-enhancer-view-content { 
    padding: 1rem; 
  }
  
  .enhancer-card { 
    padding: 1.5rem; 
  }
  
  .options-and-action {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }
  
  .mode-selector-wrapper { 
    justify-content: space-between; 
  }
  
  .theme-preview-grid {
    grid-template-columns: 1fr;
  }
  
  .word-grid {
    grid-template-columns: 1fr;
  }
  
  .theme-selector {
    grid-template-columns: 1fr;
  }
}
</style>