const API_KEY = '7da0ca74a4b2b1e9b4f6b4fdbd823744ed5e9a6e';
const BASE_URL = 'https://emoji-api.com/emojis';

class EmojiService {
  constructor() {
    this.cachedEmojis = null;
    this.emojiGroups = {};
  }

  /**
   * Fetch all emojis from the API
   */
  async fetchEmojis() {
    if (this.cachedEmojis) {
      return this.cachedEmojis;
    }

    try {
      const response = await fetch(`${BASE_URL}?access_key=${API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const emojis = await response.json();
      this.cachedEmojis = emojis;
      this.groupEmojis(emojis);
      
      return emojis;
    } catch (error) {
      console.error('Error fetching emojis:', error);
      // Return fallback emojis if API fails
      return this.getFallbackEmojis();
    }
  }

  /**
   * Group emojis by their main categories (not sub-groups)
   */
  groupEmojis(emojis) {
    this.emojiGroups = {};
    
    emojis.forEach(emoji => {
      // Handle both 'group' and 'category' field names
      const group = emoji.group || emoji.category || 'other';
      if (!this.emojiGroups[group]) {
        this.emojiGroups[group] = [];
      }
      this.emojiGroups[group].push(emoji);
    });
  }

  /**
   * Get emojis grouped by categories
   */
  async getGroupedEmojis() {
    if (Object.keys(this.emojiGroups).length === 0) {
      await this.fetchEmojis();
    }
    
    return this.emojiGroups;
  }

  /**
   * Get emojis for a specific group
   */
  async getEmojisByGroup(groupName) {
    const groups = await this.getGroupedEmojis();
    return groups[groupName] || [];
  }

  /**
   * Get popular emojis from different categories
   */
  async getPopularEmojis() {
    const groups = await this.getGroupedEmojis();
    const popular = [];
    
    // Get some popular emojis from each main category
    const priorityGroups = [
      'smileys-emotion',
      'people-body', 
      'animals-nature',
      'food-drink',
      'activities',
      'objects',
      'symbols',
      'flags'
    ];

    priorityGroups.forEach(groupName => {
      if (groups[groupName]) {
        // Take first 8 emojis from each category
        popular.push(...groups[groupName].slice(0, 8));
      }
    });

    return popular.slice(0, 32); // Limit to 32 total popular emojis
  }

  /**
   * Get frequently used emojis for relationships/dating
   */
  async getRelationshipEmojis() {
    const groups = await this.getGroupedEmojis();
    const relationshipEmojis = [];
    
    // Hearts and love-related from smileys-emotion and symbols
    if (groups['smileys-emotion']) {
      const loveEmojis = groups['smileys-emotion'].filter(emoji => {
        const code = emoji.unicodeCodePoint.toLowerCase();
        return code.includes('2764') || // ❤️
               code.includes('1f60d') || // 😍
               code.includes('1f970') || // 🥰
               code.includes('1f618') || // 😘
               code.includes('1f917') || // 🤗
               code.includes('1f60a') || // 😊
               code.includes('1f602') || // 😂
               code.includes('1f972') || // 🥲
               code.includes('1f60e');   // 😎
      });
      relationshipEmojis.push(...loveEmojis);
    }

    if (groups['symbols']) {
      const symbolEmojis = groups['symbols'].filter(emoji => {
        const code = emoji.unicodeCodePoint.toLowerCase();
        return code.includes('1f49') || // 💕💖💗💘💝💞💟
               code.includes('2728') || // ✨
               code.includes('1f44d') || // 👍
               code.includes('1f389');   // 🎉
      });
      relationshipEmojis.push(...symbolEmojis);
    }

    return relationshipEmojis.slice(0, 16);
  }

  /**
   * Get fallback emojis if API fails
   */
  getFallbackEmojis() {
    return [
      { character: "❤️", unicodeCodePoint: "2764-fe0f", group: "symbols" },
      { character: "😊", unicodeCodePoint: "1f60a", group: "smileys-emotion" },
      { character: "😘", unicodeCodePoint: "1f618", group: "smileys-emotion" },
      { character: "🥰", unicodeCodePoint: "1f970", group: "smileys-emotion" },
      { character: "😍", unicodeCodePoint: "1f60d", group: "smileys-emotion" },
      { character: "🤗", unicodeCodePoint: "1f917", group: "smileys-emotion" },
      { character: "😂", unicodeCodePoint: "1f602", group: "smileys-emotion" },
      { character: "🤔", unicodeCodePoint: "1f914", group: "smileys-emotion" },
      { character: "👍", unicodeCodePoint: "1f44d", group: "people-body" },
      { character: "🎉", unicodeCodePoint: "1f389", group: "activities" },
      { character: "🍕", unicodeCodePoint: "1f355", group: "food-drink" },
      { character: "✨", unicodeCodePoint: "2728", group: "symbols" },
      { character: "👋", unicodeCodePoint: "1f44b", group: "people-body" },
      { character: "💕", unicodeCodePoint: "1f495", group: "symbols" },
      { character: "🥺", unicodeCodePoint: "1f97a", group: "smileys-emotion" },
      { character: "🙏", unicodeCodePoint: "1f64f", group: "people-body" }
    ];
  }

  /**
   * Search emojis by keyword
   */
  async searchEmojis(keyword) {
    const emojis = await this.fetchEmojis();
    const searchTerm = keyword.toLowerCase();
    
    return emojis.filter(emoji => 
      emoji.slug.toLowerCase().includes(searchTerm) ||
      (emoji.unicodeName && emoji.unicodeName.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get all available group names
   */
  async getGroupNames() {
    const groups = await this.getGroupedEmojis();
    return Object.keys(groups).sort();
  }
}

export default new EmojiService();