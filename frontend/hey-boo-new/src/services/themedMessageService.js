// Service for processing messages with themed words
import { getWordBank, getWordThemes } from './apiService';

class ThemedMessageService {
  constructor() {
    this.wordBank = [];
    this.themes = [];
    this.isInitialized = false;
  }

  // Initialize the service with word bank and themes
  async initialize(coupleId) {
    if (!coupleId) {
      console.warn('Cannot initialize themed message service without coupleId');
      return;
    }

    try {
      const [wordBank, themes] = await Promise.all([
        getWordBank(coupleId),
        getWordThemes()
      ]);
      
      this.wordBank = wordBank || [];
      this.themes = themes || [];
      this.isInitialized = true;
      
      console.log('Themed message service initialized:', {
        wordBankCount: this.wordBank.length,
        themesCount: this.themes.length
      });
    } catch (error) {
      console.error('Failed to initialize themed message service:', error);
      this.isInitialized = false;
    }
  }

  // Process a message text to apply themed styling
  processMessage(messageText) {
    if (!this.isInitialized || !messageText) {
      return { html: this.escapeHtml(messageText), hasThemedWords: false };
    }

    let processedText = this.escapeHtml(messageText);
    let hasThemedWords = false;

    // Sort word bank by word length (longest first) to handle overlapping words correctly
    const sortedWordBank = [...this.wordBank].sort((a, b) => b.word_name.length - a.word_name.length);

    for (const wordEntry of sortedWordBank) {
      const theme = this.themes.find(t => t.id === wordEntry.theme_id);
      if (!theme) continue;

      const wordRegex = new RegExp(`\\b(${this.escapeRegex(wordEntry.word_name)})\\b`, 'gi');
      
      if (wordRegex.test(processedText)) {
        hasThemedWords = true;
        processedText = processedText.replace(wordRegex, (match) => {
          return `<span class="themed-word" style="color: ${theme.font_color}; font-family: ${theme.font_family}; font-weight: 600;">${match}</span>`;
        });
      }
    }

    return {
      html: processedText,
      hasThemedWords
    };
  }

  // Process multiple messages
  processMessages(messages) {
    return messages.map(message => ({
      ...message,
      processedText: this.processMessage(message.text)
    }));
  }

  // Refresh word bank and themes
  async refresh(coupleId) {
    await this.initialize(coupleId);
  }

  // Get theme for a specific word
  getThemeForWord(wordName) {
    const wordEntry = this.wordBank.find(w => 
      w.word_name.toLowerCase() === wordName.toLowerCase()
    );
    
    if (!wordEntry) return null;
    
    return this.themes.find(t => t.id === wordEntry.theme_id);
  }

  // Check if a word exists in the word bank
  hasWord(wordName) {
    return this.wordBank.some(w => 
      w.word_name.toLowerCase() === wordName.toLowerCase()
    );
  }

  // Get all themed words for a specific theme
  getWordsByTheme(themeId) {
    return this.wordBank.filter(w => w.theme_id === themeId);
  }

  // Utility functions
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Get statistics
  getStats() {
    if (!this.isInitialized) return null;

    const themeStats = this.themes.reduce((stats, theme) => {
      stats[theme.theme_name] = this.wordBank.filter(w => w.theme_id === theme.id).length;
      return stats;
    }, {});

    return {
      totalWords: this.wordBank.length,
      totalThemes: this.themes.length,
      themeBreakdown: themeStats,
      isInitialized: this.isInitialized
    };
  }

  // Preview how a text would look with themes applied
  previewText(text) {
    return this.processMessage(text);
  }
}

// Create singleton instance
const themedMessageService = new ThemedMessageService();

export default themedMessageService;

// Export utility functions for direct use
export const processMessageWithThemes = (messageText, wordBank, themes) => {
  const service = new ThemedMessageService();
  service.wordBank = wordBank || [];
  service.themes = themes || [];
  service.isInitialized = true;
  return service.processMessage(messageText);
};

export const initializeThemedMessages = async (coupleId) => {
  await themedMessageService.initialize(coupleId);
  return themedMessageService;
};