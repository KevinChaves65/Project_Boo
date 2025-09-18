<template>
  <!-- Root element for the text enhancer view content -->
  <div class="text-enhancer-view-content">

    <!-- Main Card for the Enhancer -->
    <div class="enhancer-card">

      <!-- Input Section -->
      <div class="input-section">
        <label for="original-text-area" class="input-label">Original Text</label>
        <textarea
          id="original-text-area"
          v-model="originalText"
          placeholder="Enter text here to make it sound more..."
          class="text-area input-text-area"
          rows="5"
        ></textarea>

        <div class="options-and-action">
           <!-- Enhancement Style Selector -->
           <div class="mode-selector-wrapper">
            <label for="paraphrase-mode" class="mode-label">Sound More:</label>
            <div class="select-container">
                <select v-model="paraphraseMode" id="paraphrase-mode" class="mode-select">
                  <option value="standard">Balanced</option>
                  <option value="creative">Creative</option>
                  <option value="fluent">Fluent</option>
                  <option value="formal">Formal</option>
                  <option value="concise">Concise</option> <!-- Added option -->
                  <option value="casual">Casual</option> <!-- Added option -->
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
            </div>
          </div>

          <!-- Enhance Button -->
          <button
            @click="enhanceText"
            class="enhance-button"
            :disabled="isProcessing || !originalText.trim()"
          >
            <i :class="isProcessing ? 'fas fa-spinner fa-spin' : 'fas fa-magic'"></i>
            <span>{{ isProcessing ? 'Enhancing...' : 'Enhance Text' }}</span>
          </button>
        </div>
      </div>

      <!-- Divider -->
      <hr class="section-divider" v-if="enhancedText || isProcessing" />

      <!-- Processing Indicator -->
      <div v-if="isProcessing" class="processing-indicator">
        <div class="spinner"></div>
        <p>AI is crafting your enhanced text...</p>
        <span>This may take a few moments.</span>
      </div>

      <!-- Result Section with Transition -->
       <transition name="fade-result">
          <div v-if="enhancedText && !isProcessing" class="result-section">
            <label for="enhanced-text-area" class="output-label">Enhanced Text</label>
             <div class="result-output-wrapper">
                <textarea
                  id="enhanced-text-area"
                  :value="enhancedText"
                  class="text-area output-text-area"
                  rows="5"
                  readonly
                ></textarea>
                 <button @click="copyToClipboard" class="copy-button" title="Copy to clipboard">
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                 </button>
             </div>
            <div class="result-action-buttons">
              <!-- Optional: Button to use text (depends on app logic) -->
              <!-- <button @click="useEnhancedText" class="use-button">
                 <i class="fas fa-check"></i> Use Text
              </button> -->
               <button @click="clearAll" class="clear-button">
                 <i class="fas fa-times"></i> Clear
              </button>
            </div>
          </div>
       </transition>

      <!-- Word Bank Section -->
      <div class="word-bank">
        <h3>Your Word Bank</h3>
        <ul>
          <li v-for="phrase in phrases" :key="phrase.id">
            <span>{{ phrase.text }}</span>
            <button @click="usePhrase(phrase)">Use</button>
          </li>
        </ul>
      </div>

    </div>

  </div>
</template>

<script>
import { addPhrase, getPhrases } from "../services/apiService";

export default {
  name: "TextEnhancer",
  data() {
    return {
      originalText: "",
      enhancedText: "",
      paraphraseMode: "standard",
      isProcessing: false,
      copySuccess: false,
      phrases: [], // Store phrases from the word bank
    };
  },
  methods: {
    async enhanceText() {
      if (!this.originalText.trim() || this.isProcessing) return;

      this.isProcessing = true;
      this.enhancedText = "";
      this.copySuccess = false;

      try {
        // Simulate API call for text enhancement
        const modes = {
          standard: `This is a standard enhancement of your text.`,
          creative: `This creatively enhanced version adds flair and imagination.`,
          fluent: `Your text now flows smoothly, ensuring readability.`,
          formal: `This is a formal enhancement suitable for professional settings.`,
        };
        this.enhancedText = `${modes[this.paraphraseMode]} (Original: "${this.originalText}")`;

        // Save the enhanced text to the word bank
        await addPhrase("userId", this.enhancedText); // Replace "userId" with the actual user ID
        alert("Enhanced text saved to your word bank!");
      } catch (error) {
        console.error("Error enhancing text:", error);
        alert("Failed to enhance text. Please try again.");
      } finally {
        this.isProcessing = false;
      }
    },
    async fetchPhrases() {
      try {
        this.phrases = await getPhrases("userId"); // Replace "userId" with the actual user ID
      } catch (error) {
        console.error("Failed to fetch phrases:", error);
      }
    },
    usePhrase(phrase) {
      this.originalText = phrase.text;
    },
    copyToClipboard() {
      if (!this.enhancedText) return;
      navigator.clipboard.writeText(this.enhancedText)
        .then(() => {
          this.copySuccess = true;
          // Optionally reset after a few seconds or provide visual feedback
           setTimeout(() => { this.copySuccess = false; }, 2000);
           // You could show a temporary "Copied!" message instead of alert
           alert('Text copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy text:', err);
           alert('Could not copy text. Your browser might not support this feature or permission was denied.');
        });
    },

    clearAll() {
        this.originalText = '';
        this.enhancedText = '';
        this.isProcessing = false;
        this.copySuccess = false;
        this.paraphraseMode = 'standard'; // Reset mode
    },

    // Optional: If you need to send the text elsewhere
    useEnhancedText() {
      if (!this.enhancedText) return;
      this.$emit('text-selected', this.enhancedText);
      // Example: Maybe navigate to chat with this text pre-filled
       alert('Using enhanced text! (Implement navigation or action)');
    }
  },
  created() {
    this.fetchPhrases();
  },
};
</script>

<style scoped>
/* Base container for this view */
.text-enhancer-view-content {
  padding: 1.5rem 2rem; /* Add padding here if parent doesn't have it */
  height: 100%;
  overflow-y: auto; /* Scrollbar for THIS view if needed */
  display: flex;
  justify-content: center; /* Center the card horizontally */
  align-items: flex-start; /* Align card to top */
}

/* Main Enhancer Card */
.enhancer-card {
  background-color: #ffffff;
  border-radius: 16px; /* More rounded */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  padding: 2rem 2.5rem; /* Generous padding */
  width: 100%;
  max-width: 750px; /* Max width for readability */
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Space between sections */
}

/* Input/Output Sections */
.input-section, .result-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* Space elements inside sections */
}

.input-label, .output-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #555;
    margin-bottom: -0.25rem; /* Pull closer to textarea */
}

.text-area {
  width: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db; /* Softer border */
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
  min-height: 120px; /* Minimum height */
  line-height: 1.5;
  background-color: #fdfdff; /* Slightly off-white */
}
.text-area:focus {
  outline: none;
  border-color: #8c68db;
  box-shadow: 0 0 0 3px rgba(140, 104, 219, 0.15);
}
.output-text-area {
    background-color: #f9fafb; /* Slightly different bg for output */
    color: #333;
    cursor: default;
}
.result-output-wrapper {
    position: relative;
}

/* Options and Main Action Row */
.options-and-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* Allow wrapping */
  gap: 1rem; /* Space between mode and button */
  margin-top: 0.5rem; /* Space above this row */
  padding: 0.5rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #eee;
}

.mode-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-grow: 1; /* Allow selector to take space */
}
.mode-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #555;
    white-space: nowrap;
}

.select-container {
    position: relative;
    display: inline-flex; /* Allows icon positioning */
    min-width: 150px; /* Ensure minimum width */
}
.mode-select {
  padding: 0.6rem 2.5rem 0.6rem 1rem; /* Space for text and arrow */
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #fff;
  color: #333;
  font-size: 0.95rem;
  appearance: none; /* Remove default arrow */
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
  flex-grow: 1;
}
.mode-select:hover { border-color: #aaa; }
.mode-select:focus { outline: none; border-color: #8c68db; box-shadow: 0 0 0 2px rgba(140, 104, 219, 0.1); }

.select-arrow {
    position: absolute;
    right: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: #888;
    pointer-events: none; /* Allow clicking the select */
    font-size: 0.8rem;
}

.enhance-button {
  background: linear-gradient(135deg, #8c68db, #a66fd5); /* Theme gradient */
  color: white;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: 25px; /* Rounded */
  font-weight: 600; /* Bolder */
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.25s ease;
  box-shadow: 0 3px 8px rgba(140, 104, 219, 0.3);
  min-width: 150px; /* Ensure button has min width */
}
.enhance-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #7a5fc7, #9d63c7);
  box-shadow: 0 5px 12px rgba(140, 104, 219, 0.4);
  transform: translateY(-1px);
}
.enhance-button:disabled {
  background: #cccccc;
  box-shadow: none;
  color: #888;
  cursor: not-allowed;
}
.enhance-button i { transition: transform 0.5s ease; }
.enhance-button:hover:not(:disabled) i:not(.fa-spinner) { transform: rotate(15deg); }


/* Section Divider */
.section-divider {
    border: none;
    border-top: 1px dashed #e0e0e0;
    margin: 0; /* Reset margin */
}

/* Processing Indicator */
.processing-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  text-align: center;
  color: #777;
  background-color: #f9fafb;
  border-radius: 8px;
}
.spinner {
  border: 4px solid rgba(140, 104, 219, 0.2); /* Lighter border */
  border-radius: 50%;
  border-top-color: #8c68db; /* Theme color spinner */
  width: 36px;
  height: 36px;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}
.processing-indicator p {
    font-size: 1rem;
    font-weight: 500;
    color: #555;
    margin-bottom: 0.25rem;
}
.processing-indicator span {
    font-size: 0.85rem;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Result Section */
.result-section {
  background-color: #f8f5ff; /* Light purple tint */
  border: 1px solid #e9dffc;
  border-radius: 8px;
  padding: 1.5rem;
}

.result-text { /* Container for the output text (if not using textarea) */
  line-height: 1.6;
  color: #333;
  margin-bottom: 1.5rem;
  background-color: #fff; /* White background for text */
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #eee;
  min-height: 120px;
}

/* Copy Button (positioned over textarea) */
.copy-button {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(3px);
    color: #555;
    border: 1px solid #eee;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.2s ease;
    opacity: 0.7; /* Slightly transparent initially */
}
.copy-button:hover {
    background-color: #fff;
    color: #8c68db;
    border-color: #ddd;
    opacity: 1;
}
.copy-button i { font-size: 0.9em; }

/* Result Action Buttons (Clear, Use Text) */
.result-action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem; /* Space above buttons */
  justify-content: flex-end; /* Align buttons right */
}

/* Base button style for result actions */
.clear-button, .use-button {
  padding: 0.6rem 1.2rem;
  border-radius: 20px; /* Rounded */
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}
.clear-button {
    background-color: #fff;
    border: 1px solid #d1d5db;
    color: #555;
}
.clear-button:hover { background-color: #f9fafb; border-color: #aaa; }

.use-button {
    background-color: #8c68db;
    border: 1px solid #8c68db;
    color: white;
}
.use-button:hover { background-color: #7a5fc7; border-color: #7a5fc7; }

/* Result Transition */
.fade-result-enter-active, .fade-result-leave-active {
  transition: all 0.3s ease-out;
}
.fade-result-enter-from, .fade-result-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Word Bank Section */
.word-bank {
  background-color: #f9fafb;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
}
.word-bank h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 1rem;
}
.word-bank ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.word-bank li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}
.word-bank li:last-child {
  border-bottom: none;
}
.word-bank button {
  background-color: #8c68db;
  border: none;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.word-bank button:hover {
  background-color: #7a5fc7;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
   .text-enhancer-view-content { padding: 1rem; }
   .enhancer-card { padding: 1.5rem; }
   .options-and-action {
    flex-direction: column;
    align-items: stretch; /* Make button full width */
    padding: 1rem;
  }
   .mode-selector-wrapper { justify-content: space-between; }
   .result-action-buttons { justify-content: center; }
}

</style>