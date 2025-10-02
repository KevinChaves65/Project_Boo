<template>
  <!-- Root element for this specific view's content -->
  <div class="date-ideas-view-content">

    <!-- Search Section - Enhanced Look -->
    <div class="search-section">
      <!-- AI Date Ideas Generator -->
      <div class="ai-generator-section">
        <h3 class="ai-section-title">
          <i class="fas fa-robot"></i> AI-Powered Date Ideas
        </h3>
        <div class="ai-form">
          <div class="ai-form-row">
            <div class="input-group">
              <label for="location-input">Location</label>
              <input
                id="location-input"
                v-model="aiForm.location"
                type="text"
                placeholder="e.g., Toronto, Ontario or specific address"
                required
              />
            </div>
            <div class="input-group">
              <label for="preferences-input">Preferences (Optional)</label>
              <input
                id="preferences-input"
                v-model="aiForm.preferences"
                type="text"
                placeholder="e.g., outdoor, romantic, adventurous"
              />
            </div>
          </div>
          <div class="ai-form-row">
            <div class="input-group">
              <label for="budget-select">Budget</label>
              <select id="budget-select" v-model="aiForm.budget">
                <option value="">Any Budget</option>
                <option value="low">Low Budget ($0-50)</option>
                <option value="medium">Medium Budget ($50-150)</option>
                <option value="high">High Budget ($150+)</option>
              </select>
            </div>
            <div class="input-group generate-button-group">
              <button 
                @click="generateAIIdeas" 
                class="ai-generate-button"
                :disabled="isGenerating || !aiForm.location.trim()"
                :title="!aiForm.location.trim() ? 'Please enter a location' : 'Generate AI date ideas'"
              >
                <i class="fas fa-magic" v-if="!isGenerating"></i>
                <i class="fas fa-spinner fa-spin" v-if="isGenerating"></i>
                <span v-if="!isGenerating">Generate Ideas</span>
                <span v-if="isGenerating">Generating...</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Regular Search Bar -->
      <div class="search-bar">
        <i class="fas fa-search search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search specific date ideas (e.g., 'picnic', 'museum')"
          @keyup.enter="performSearch"
        />
        <button @click="performSearch" class="search-button" title="Search">
          <i class="fas fa-search"></i>
          <span>Search</span>
        </button>
      </div>
    </div>

    <!-- Main Content Area: Suggestions List + Detailed View -->
    <div class="ideas-layout-grid">

      <!-- Suggestion List Column -->
      <div class="suggestion-list-column">
        <!-- Tabs for different suggestion types -->
        <div class="suggestion-tabs-header">
          <button
            class="tab-header-button"
            :class="{ active: currentTab === 'generated' }"
            @click="switchTab('generated')"
          >
            <i class="fas fa-magic"></i> AI Generated
          </button>
          <button
            class="tab-header-button"
            :class="{ active: currentTab === 'saved' }"
            @click="switchTab('saved')"
          >
            <i class="fas fa-heart"></i> Saved ({{ savedSuggestions.length }})
          </button>
        </div>
        
        <h2 class="column-title">
          <i class="fas fa-lightbulb" v-if="currentTab === 'generated'"></i>
          <i class="fas fa-heart" v-if="currentTab === 'saved'"></i>
          {{ currentTab === 'generated' ? 'AI Suggestions' : 'Saved Suggestions' }}
        </h2>
        <div class="suggestion-cards-container">
          <!-- Card Loop -->
          <div
            v-for="(suggest, index) in currentSuggestions"
            :key="`suggest-${currentTab}-${index}`"
            class="suggestion-card"
            :class="{ active: detailedSuggestion && suggest.title === detailedSuggestion.title }"
            @click="selectSuggestion(suggest)"
            :title="`View details for ${suggest.title}`"
            tabindex="0" @keyup.enter="selectSuggestion(suggest)" @keyup.space="selectSuggestion(suggest)"
          >
            <div class="suggestion-preview"
                 :style="{ backgroundImage: `url(${suggest.image || suggest.image_url || 'https://source.unsplash.com/400x300/?couple,date&sig=default'})` }">
                 <div class="preview-overlay"></div>
            </div>
            <div class="suggestion-info">
              <h4>{{ suggest.title }}</h4>
              <div class="suggestion-meta" v-if="currentTab === 'saved'">
                <small><i class="fas fa-clock"></i> Saved {{ formatSavedDate(suggest.saved_at) }}</small>
              </div>
            </div>
             <i class="fas fa-chevron-right card-arrow" aria-hidden="true"></i>
          </div>
          <!-- No results message -->
          <p v-if="currentSuggestions.length === 0" class="no-suggestions">
            <i class="fas fa-search" v-if="currentTab === 'generated'"></i>
            <i class="fas fa-heart" v-if="currentTab === 'saved'"></i>
            {{ currentTab === 'generated' ? 'No suggestions match your search.' : 'No saved suggestions yet. Save some ideas from the AI generated tab!' }}
          </p>
        </div>
      </div>

      <!-- Detailed View Column -->
      <div class="suggestion-detail-column">
        <!-- Display Details Card -->
        <div class="suggestion-detailed-card" v-if="detailedSuggestion">
            <div class="detail-content-wrapper">
              <div class="suggestion-header">
                <h2>{{ detailedSuggestion.title }}</h2>
                <!-- Removed rating stars section -->
              </div>


              <!-- Info Content -->
              <div class="info-content">
                    <p class="main-description">{{ detailedSuggestion.info || detailedSuggestion.description }}</p>
                    
                    <!-- Enhanced Information -->
                    <div class="ai-enhanced-info">
                      
                      <!-- Business Details -->
                      <div v-if="detailedSuggestion.businessName" class="info-section">
                        <h4><i class="fas fa-store"></i> Business Details</h4>
                        <div class="business-info">
                          <p class="business-name">{{ detailedSuggestion.businessName }}</p>
                          <p v-if="detailedSuggestion.address" class="address">
                            <i class="fas fa-map-marker-alt"></i> {{ detailedSuggestion.address }}
                          </p>
                          
                          <!-- Navigation Actions -->
                          <div class="navigation-actions">
                            <a 
                              :href="detailedSuggestion.mapUrl || `https://maps.google.com/maps?q=${encodeURIComponent(detailedSuggestion.address || detailedSuggestion.businessName)}`"
                              target="_blank"
                              class="navigate-button"
                              title="Open in Google Maps"
                            >
                              <i class="fas fa-directions"></i>
                              <span>Navigate with Google Maps</span>
                            </a>
                            
                            <button 
                              @click="copyLocation"
                              class="copy-location-button"
                              title="Copy address to clipboard"
                            >
                              <i class="fas fa-copy"></i>
                              <span>Copy Address</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Cost & Timing -->
                      <div class="cost-timing-section">
                        <div v-if="detailedSuggestion.cost" class="info-section">
                          <h4><i class="fas fa-dollar-sign"></i> Cost</h4>
                          <p class="cost-info">{{ detailedSuggestion.cost }}</p>
                        </div>
                        
                        <div v-if="detailedSuggestion.timing" class="info-section">
                          <h4><i class="fas fa-clock"></i> Best Time</h4>
                          <p class="timing-info">{{ detailedSuggestion.timing }}</p>
                        </div>
                      </div>

                      <!-- Removed "Why It's Special" section -->

                      <!-- Amenities -->
                      <div v-if="detailedSuggestion.amenities && detailedSuggestion.amenities.length > 0" class="info-section">
                        <h4><i class="fas fa-list"></i> Amenities</h4>
                        <div class="amenities-list">
                          <span 
                            v-for="amenity in detailedSuggestion.amenities" 
                            :key="amenity" 
                            class="amenity-tag"
                          >
                            {{ amenity }}
                          </span>
                        </div>
                      </div>

                      <!-- AI Badge -->
                      <div class="ai-badge">
                        <i class="fas fa-robot"></i>
                        <span>AI Generated Suggestion</span>
                      </div>
                    </div>
                  </div>

              <div class="action-buttons">
                <button @click="addToCalendar" class="primary-action-button" :disabled="isAddingToCalendar">
                  <i class="fas fa-calendar-plus" v-if="!isAddingToCalendar"></i>
                  <i class="fas fa-spinner fa-spin" v-if="isAddingToCalendar"></i>
                  {{ isAddingToCalendar ? 'Adding...' : 'Add to Calendar' }}
                </button>
                
                <!-- Save/Delete Button -->
                <button 
                  @click="toggleSaveSuggestion" 
                  class="save-action-button"
                  :class="{ saved: isSuggestionSaved }"
                  :disabled="isSavingToggle"
                >
                  <i class="fas fa-heart" v-if="isSuggestionSaved && !isSavingToggle"></i>
                  <i class="far fa-heart" v-if="!isSuggestionSaved && !isSavingToggle"></i>
                  <i class="fas fa-spinner fa-spin" v-if="isSavingToggle"></i>
                  {{ isSavingToggle ? 'Saving...' : (isSuggestionSaved ? 'Saved' : 'Save') }}
                </button>
                
                 <button @click="generateMore" class="secondary-action-button">
                  <i class="fas fa-sync-alt"></i> Get More Ideas
                </button>
              </div>
           </div>
        </div>
         <!-- Placeholder when nothing is selected -->
         <div class="suggestion-detailed-placeholder" v-else>
            <i class="fas fa-hand-pointer"></i>
            <p>Select a suggestion from the list to see the details.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { generateDateIdeas } from "../services/apiService";

// Your existing <script> block remains the same
// ... (methods: performSearch, selectSuggestion, chooseSuggestion, generateMore)
// Make sure data properties (searchQuery, suggestions, detailedSuggestion) exist
export default {
  name: "DateIdeas",
  data() {
    // Start with empty suggestions - only show AI-generated ideas
    const enrichedSuggestions = [];

    return {
      searchQuery: "",
      suggestions: enrichedSuggestions,
      allSuggestions: [...enrichedSuggestions], // Keep a copy for resetting search
      // Start with no suggestion selected - show placeholder
      detailedSuggestion: null,
      // AI form data
      aiForm: {
        location: "",
        preferences: "",
        budget: ""
      },
      isGenerating: false,
      aiGeneratedIdeas: [],
      // New properties for save/calendar functionality
      currentTab: 'generated', // 'generated' or 'saved'
      savedSuggestions: [],
      isSuggestionSaved: false,
      currentSavedId: null,
      isSavingToggle: false,
      isAddingToCalendar: false,
      showCalendarModal: false,
      calendarForm: {
        date: '',
        startTime: '19:00',
        endTime: '21:00'
      }
    };
  },
 computed: {
    currentSuggestions() {
      if (this.currentTab === 'generated') {
        return this.suggestions;
      } else {
        return this.savedSuggestions;
      }
    }
  },
  methods: {
     performSearch() {
      const query = this.searchQuery.trim().toLowerCase();
      console.log("Searching for:", query);
       // Simulate API call latency
       // Add a loading state indicator here if desired
      setTimeout(() => {
          if (!query) {
            this.suggestions = [...this.allSuggestions];
          } else {
            this.suggestions = this.allSuggestions.filter(item =>
              item.title.toLowerCase().includes(query) ||
              (item.info && item.info.toLowerCase().includes(query)) // Optional: search info too
            );
          }
          // Select the first result after search, or null if no results
          this.detailedSuggestion = this.suggestions.length > 0 ? { ...this.suggestions[0] } : null;
          // Remove loading state here
      }, 300); // Small delay for visual feedback
    },
    selectSuggestion(suggest) {
       if (!suggest) {
         this.detailedSuggestion = null;
         return;
       }
      // Ensure we're using the full data from allSuggestions or savedSuggestions
      let fullSuggestData;
      if (this.currentTab === 'generated') {
        fullSuggestData = this.allSuggestions.find(s => s.title === suggest.title);
      } else {
        fullSuggestData = suggest; // Already has full data from saved suggestions
      }
      
      if (fullSuggestData) {
           this.detailedSuggestion = { ...fullSuggestData };
           this.checkIfSuggestionSaved();
      }
    },
    chooseSuggestion() {
       // This method is now replaced by addToCalendar
       this.addToCalendar();
    },
    copyLocation() {
      if (!this.detailedSuggestion) return;
      
      const locationText = this.detailedSuggestion.address || this.detailedSuggestion.businessName || 'Location not available';
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(locationText).then(() => {
          alert('Location copied to clipboard!');
        }).catch(() => {
          // Fallback for clipboard API failure
          this.fallbackCopyLocation(locationText);
        });
      } else {
        // Fallback for older browsers
        this.fallbackCopyLocation(locationText);
      }
    },
    fallbackCopyLocation(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Location copied to clipboard!');
      } catch (err) {
        alert('Could not copy location. Please copy manually: ' + text);
      }
      document.body.removeChild(textArea);
    },
    // Tab switching methods
    switchTab(tab) {
      this.currentTab = tab;
      this.detailedSuggestion = null; // Clear selection when switching tabs
      
      if (tab === 'saved') {
        this.loadSavedSuggestions();
      }
    },
    
    // Save/Delete suggestion methods
    async toggleSaveSuggestion() {
      if (!this.detailedSuggestion) return;
      
      this.isSavingToggle = true;
      
      try {
        if (this.isSuggestionSaved) {
          // Delete the suggestion
          await this.deleteSavedSuggestion();
        } else {
          // Save the suggestion
          await this.saveSuggestion();
        }
      } catch (error) {
        console.error('Error toggling suggestion save:', error);
        alert('Error saving/deleting suggestion. Please try again.');
      } finally {
        this.isSavingToggle = false;
      }
    },
    
    async saveSuggestion() {
      const suggestionData = {
        title: this.detailedSuggestion.title,
        description: this.detailedSuggestion.info || this.detailedSuggestion.description,
        cost: this.detailedSuggestion.cost,
        timing: this.detailedSuggestion.timing,
        business_name: this.detailedSuggestion.businessName,
        address: this.detailedSuggestion.address,
        map_url: this.detailedSuggestion.mapUrl,
        image_url: this.detailedSuggestion.image,
        is_ai_generated: this.detailedSuggestion.isAIGenerated !== undefined ? this.detailedSuggestion.isAIGenerated : true
      };
      
      // For now, we'll simulate the API call since auth isn't fully implemented
      // Replace this with actual API call when authentication is ready
      console.log('Saving suggestion:', suggestionData);
      
      // Simulate API success
      this.isSuggestionSaved = true;
      this.currentSavedId = 'temp-id-' + Date.now();
      
      // Add to local savedSuggestions array
      const savedSuggestion = {
        ...suggestionData,
        id: this.currentSavedId,
        saved_at: new Date().toISOString()
      };
      
      this.savedSuggestions.unshift(savedSuggestion);
      
      alert('Suggestion saved successfully!');
    },
    
    async deleteSavedSuggestion() {
      // For now, simulate the delete operation
      console.log('Deleting suggestion with ID:', this.currentSavedId);
      
      // Remove from local array
      this.savedSuggestions = this.savedSuggestions.filter(s => s.id !== this.currentSavedId);
      
      this.isSuggestionSaved = false;
      this.currentSavedId = null;
      
      alert('Suggestion removed successfully!');
    },
    
    async loadSavedSuggestions() {
      // For now, use local storage or static data
      // Replace with actual API call when authentication is ready
      console.log('Loading saved suggestions...');
    },
    
    async checkIfSuggestionSaved() {
      if (!this.detailedSuggestion) {
        this.isSuggestionSaved = false;
        this.currentSavedId = null;
        return;
      }
      
      // Check if current suggestion is saved
      const saved = this.savedSuggestions.find(s => s.title === this.detailedSuggestion.title);
      this.isSuggestionSaved = !!saved;
      this.currentSavedId = saved ? saved.id : null;
    },
    
    // Calendar methods
    async addToCalendar() {
      if (!this.detailedSuggestion) return;
      
      this.isAddingToCalendar = true;
      
      try {
        // Get today's date as default
        const today = new Date();
        const defaultDate = today.toISOString().split('T')[0];
        
        const calendarData = {
          title: this.detailedSuggestion.title,
          description: `${this.detailedSuggestion.info || this.detailedSuggestion.description}\n\nCost: ${this.detailedSuggestion.cost || 'Varies'}\nLocation: ${this.detailedSuggestion.address || this.detailedSuggestion.businessName}`,
          start_date: defaultDate,
          start_time: '19:00',
          end_time: '21:00',
          location: this.detailedSuggestion.address || this.detailedSuggestion.businessName
        };
        
        // For now, generate calendar URLs directly
        const calendarUrls = this.generateCalendarUrls(calendarData);
        
        // Show calendar options to user
        this.showCalendarOptions(calendarUrls);
        
      } catch (error) {
        console.error('Error adding to calendar:', error);
        alert('Error adding to calendar. Please try again.');
      } finally {
        this.isAddingToCalendar = false;
      }
    },
    
    generateCalendarUrls(data) {
      const { title, description, start_date, start_time, end_time, location } = data;
      
      // Convert to the format needed for calendar URLs
      const startDateTime = new Date(`${start_date}T${start_time}:00`);
      const endDateTime = new Date(`${start_date}T${end_time}:00`);
      
      const startFormatted = startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endFormatted = endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      return {
        google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
        outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startFormatted}&enddt=${endFormatted}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
        yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(title)}&st=${startFormatted}&et=${endFormatted}&desc=${encodeURIComponent(description)}&in_loc=${encodeURIComponent(location)}`
      };
    },
    
    showCalendarOptions(urls) {
      const message = `Choose your calendar app:\n\n` +
        `• Google Calendar\n` +
        `• Outlook Calendar\n` +
        `• Yahoo Calendar\n\n` +
        `Click OK to open Google Calendar, or cancel to see other options.`;
      
      if (confirm(message)) {
        window.open(urls.google, '_blank');
      } else {
        // Show a modal or prompt with all options
        const choice = prompt(`Enter 1 for Google, 2 for Outlook, 3 for Yahoo:`);
        if (choice === '1') window.open(urls.google, '_blank');
        else if (choice === '2') window.open(urls.outlook, '_blank');
        else if (choice === '3') window.open(urls.yahoo, '_blank');
      }
    },
    
    formatSavedDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'today';
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    },
    generateMore() {
      // Implement logic to fetch/suggest more ideas
      alert("Generating more date ideas... (API call needed)");
       // Example: fetch('/api/more-ideas?based_on=' + this.detailedSuggestion.title)
    },
    async generateAIIdeas() {
      if (!this.aiForm.location.trim()) {
        alert("Please enter a location to generate ideas.");
        return;
      }

      this.isGenerating = true;
      try {
        const response = await generateDateIdeas(
          this.aiForm.location,
          this.aiForm.preferences,
          this.aiForm.budget
        );

        if (response.success) {
          // Parse the AI response and convert to our format
          this.parseAndAddAIIdeas(response.ideas);
          alert(`Generated new AI-powered date ideas for ${response.location}!`);
        } else {
          throw new Error("Failed to generate ideas");
        }
      } catch (error) {
        console.error("Failed to generate AI ideas:", error);
        alert("Failed to generate AI date ideas. Please try again.");
      } finally {
        this.isGenerating = false;
      }
    },
    parseAndAddAIIdeas(aiResponse) {
      try {
        // Try to parse JSON if the AI returned structured data
        let ideas;
        if (aiResponse.includes('[') && aiResponse.includes(']')) {
          // Extract JSON from the response
          const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            ideas = JSON.parse(jsonMatch[0]);
          }
        }
        
        if (!ideas || !Array.isArray(ideas)) {
          // Fallback: parse text response
          ideas = this.parseTextResponse(aiResponse);
        }

        // Convert AI ideas to our new simplified format (no ratings, reviews, or special notes)
        const convertedIdeas = ideas.map((idea, index) => {
          const baseIdea = {
            title: idea.title || `Date Idea ${index + 1}`,
            info: idea.description || "AI-generated date idea",
            cost: idea.cost || "Varies",
            timing: idea.bestTime || "Flexible timing", // Use bestTime from AI response
            businessName: idea.businessName || "Local Venue",
            address: idea.address || this.aiForm.location,
            mapUrl: idea.mapUrl || `https://maps.google.com/maps?q=${encodeURIComponent(idea.address || this.aiForm.location)}`,
            isAIGenerated: true,
            hasNavigation: true // New flag for Google Maps integration
          };
          // Generate dynamic image based on the idea content
          baseIdea.image = this.getImageForIdea(baseIdea, index);
          return baseIdea;
        });

        // Add to suggestions
        this.aiGeneratedIdeas = convertedIdeas;
        this.allSuggestions = [...this.allSuggestions, ...convertedIdeas];
        this.suggestions = [...this.suggestions, ...convertedIdeas];

        // Select the first AI-generated idea
        if (convertedIdeas.length > 0) {
          this.selectSuggestion(convertedIdeas[0]);
        }
      } catch (error) {
        console.error("Failed to parse AI response:", error);
        // Fallback: create a single idea from the raw response
        this.createFallbackIdea(aiResponse);
      }
    },
    parseTextResponse(text) {
      // Simple text parsing for non-JSON responses
      const lines = text.split('\n').filter(line => line.trim());
      const ideas = [];
      let currentIdea = {};
      
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key.toLowerCase().includes('title') || (!currentIdea.title && ideas.length < 6)) {
            if (currentIdea.title) {
              ideas.push(currentIdea);
              currentIdea = {};
            }
            currentIdea.title = value;
          } else if (key.toLowerCase().includes('description')) {
            currentIdea.description = value;
          } else if (key.toLowerCase().includes('cost')) {
            currentIdea.cost = value;
          }
        } else if (line.trim() && !currentIdea.description) {
          currentIdea.description = line.trim();
        }
      });
      
      if (currentIdea.title) {
        ideas.push(currentIdea);
      }
      
      return ideas.length > 0 ? ideas : [{ title: "AI Date Idea", description: text.substring(0, 200) }];
    },
    createFallbackIdea(response) {
      const fallbackIdea = {
        title: `AI Date Ideas for ${this.aiForm.location}`,
        info: response.substring(0, 300) + '...',
        isAIGenerated: true
      };
      
      // Generate dynamic image for fallback idea
      fallbackIdea.image = this.getImageForIdea(fallbackIdea, 0);
      
      this.allSuggestions.push(fallbackIdea);
      this.suggestions.push(fallbackIdea);
      this.selectSuggestion(fallbackIdea);
    },
    getImageForIdea(idea, index) {
      // Use Unsplash Source API for relevant, high-quality images
      const title = (idea.title || '').toLowerCase();
      const description = (idea.description || idea.info || '').toLowerCase();
      const content = title + ' ' + description;
      
      // Map content to relevant Unsplash categories/keywords
      let category = 'couple,date';
      
      if (content.includes('dinner') || content.includes('restaurant') || content.includes('wine') || content.includes('romantic') || content.includes('date night')) {
        category = 'restaurant,dinner,romantic';
      } else if (content.includes('outdoor') || content.includes('picnic') || content.includes('park') || content.includes('garden') || content.includes('nature')) {
        category = 'picnic,park,nature';
      } else if (content.includes('hiking') || content.includes('adventure') || content.includes('active') || content.includes('sports') || content.includes('bike')) {
        category = 'hiking,adventure,outdoor';
      } else if (content.includes('movie') || content.includes('theater') || content.includes('cinema') || content.includes('entertainment') || content.includes('concert')) {
        category = 'cinema,theater,entertainment';
      } else if (content.includes('museum') || content.includes('art') || content.includes('gallery')) {
        category = 'museum,art,gallery';
      } else if (content.includes('beach') || content.includes('water') || content.includes('swim') || content.includes('ocean')) {
        category = 'beach,ocean,sunset';
      } else if (content.includes('coffee') || content.includes('cafe') || content.includes('brunch') || content.includes('breakfast')) {
        category = 'coffee,cafe,brunch';
      } else if (content.includes('shopping') || content.includes('market') || content.includes('mall')) {
        category = 'shopping,market,city';
      } else if (content.includes('music') || content.includes('concert') || content.includes('festival') || content.includes('live')) {
        category = 'concert,music,festival';
      } else if (content.includes('cooking') || content.includes('kitchen') || content.includes('chef') || content.includes('recipe')) {
        category = 'cooking,kitchen,food';
      } else if (content.includes('spa') || content.includes('massage') || content.includes('relax') || content.includes('wellness')) {
        category = 'spa,wellness,relaxation';
      } else if (content.includes('wine') || content.includes('tasting') || content.includes('vineyard')) {
        category = 'wine,vineyard,tasting';
      } else if (content.includes('dance') || content.includes('dancing') || content.includes('ballroom')) {
        category = 'dancing,dance,couples';
      } else if (content.includes('game') || content.includes('arcade') || content.includes('bowling') || content.includes('mini golf')) {
        category = 'games,fun,entertainment';
      }

      // Use Unsplash Source API with specific dimensions and category
      // Format: https://source.unsplash.com/400x300/?category,keyword&sig=index
      return `https://source.unsplash.com/400x300/?${category}&sig=${index}`;
    },
    getValidImageUrl(imageUrl) {
      // Check if the AI provided a valid image URL
      if (!imageUrl || typeof imageUrl !== 'string') return null;
      
      // Check if it's a valid HTTP/HTTPS URL
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // For now, we'll return null to use fallback images
        // In the future, you could implement actual image validation
        return null;
      }
      
      // If it's a local path, check if it exists in our images
      const validLocalImages = [
        '/images/romantic-dinner.jpg',
        '/images/outdoor-picnic.jpg', 
        '/images/hiking-adventure.jpg',
        '/images/movie-night.jpg',
        '/images/sample-idea.jpg'
      ];
      
      return validLocalImages.includes(imageUrl) ? imageUrl : null;
    },
    handleImageError(event) {
      // Fallback to a generic couple date image if any image fails to load
      console.warn('Image failed to load:', event.target.src);
      // Try Unsplash fallback with generic couple/date keywords
      if (!event.target.src.includes('source.unsplash.com') && !event.target.src.includes('fallback')) {
        event.target.src = 'https://source.unsplash.com/400x300/?couple,date,love&sig=fallback';
      } else if (!event.target.src.includes('picsum.photos')) {
        // If Unsplash fails, try Picsum
        event.target.src = 'https://picsum.photos/seed/fallback-couple/400/300';
      } else {
        // Final fallback to local image
        event.target.src = '/images/sample-idea.jpg';
      }
    }
  },
   // Handle potential missing images
  mounted() {
    const checkImage = (url) => { /* Basic check, could be more robust */ return url && typeof url === 'string'; };
    this.suggestions.forEach(s => {
      if (!checkImage(s.image)) s.image = '/images/placeholder-card.jpg';
    });
     if (this.detailedSuggestion && !checkImage(this.detailedSuggestion.image)) {
         this.detailedSuggestion.image = '/images/placeholder-detail.jpg';
     }
  }
};
</script>

<style scoped>
/* Base container for this view - Handles spacing */
.date-ideas-view-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Space between search and content grid */
   /* Height/Scrolling handled by parent (.router-view-wrapper) */
}

/* Enhanced Search Bar */
.search-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* AI Generator Section */
.ai-generator-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.ai-section-title {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-section-title i {
  color: #ffd700;
}

.ai-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .ai-form-row {
    grid-template-columns: 1fr;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.9;
}

.input-group input,
.input-group select {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
}

.input-group input::placeholder {
  color: #666;
  opacity: 0.8;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.generate-button-group {
  justify-content: flex-end;
  align-items: flex-end;
}

.ai-generate-button {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
}

.ai-generate-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #ffed4e, #ffd700);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.ai-generate-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.ai-generate-button i.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 25px;
  padding: 0.5rem 0.75rem 0.5rem 1rem; /* Adjusted padding */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}
.search-icon {
  color: #a0aec0;
  margin-right: 0.75rem;
}
.search-bar input {
  flex-grow: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  padding: 0.25rem 0;
  background: transparent;
}
.search-bar input::placeholder {
  color: #a0aec0;
}
.search-button {
  background: linear-gradient(135deg, #8c68db, #a66fd5); /* Match sidebar */
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.6rem 1.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 5px rgba(140, 104, 219, 0.3);
}
.search-button:hover {
  background: linear-gradient(135deg, #7a5fc7, #9d63c7);
  box-shadow: 0 4px 8px rgba(140, 104, 219, 0.4);
  transform: translateY(-1px);
}
.search-button i { font-size: 0.9em; }

/* Layout Grid */
.ideas-layout-grid {
  display: grid;
  grid-template-columns: minmax(280px, 340px) 1fr; /* Flexible list width */
  gap: 1.5rem;
  flex-grow: 1;
   min-height: 0; /* Crucial for nested grid/flex scrolling */
   /* REMOVED overflow: hidden */
}

/* Common Column Styles */
.suggestion-list-column,
.suggestion-detail-column {
  background-color: #fff;
  border-radius: 12px; /* More rounding */
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
   /* REMOVED overflow: auto/hidden */
}

.column-title {
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 1.25rem 0; /* Adjusted margin */
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
  flex-shrink: 0;
}
.column-title i {
  color: #8c68db;
}

/* Suggestion List Column */
.suggestion-cards-container {
  /* Takes remaining space in column */
  flex-grow: 1;
  margin: 0 -0.5rem -0.5rem 0; /* Offset padding for scrollbar illusion */
  padding-right: 0.5rem; /* Space for scrollbar appearance if needed by parent */
   /* REMOVED overflow-y: auto */
}
.suggestion-card {
  display: flex;
  align-items: center;
  margin-bottom: 0.85rem;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.25s ease;
  background-color: #fff;
  position: relative; /* For arrow positioning */
}
.suggestion-card:hover {
  border-color: #c8bce8;
  box-shadow: 0 3px 8px rgba(140, 104, 219, 0.1);
  transform: translateX(3px);
}
.suggestion-card.active {
  background-color: #f3eefc;
  border-color: #8c68db;
  box-shadow: 0 0 0 2px rgba(140, 104, 219, 0.3);
  transform: translateX(0); /* Reset transform */
}
.suggestion-card.active .card-arrow {
    opacity: 1;
    transform: translateX(0);
}

.suggestion-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  margin-right: 1rem;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background-color: #eee; /* Placeholder */
}
.preview-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);
    opacity: 0;
    transition: opacity 0.2s ease;
}
.suggestion-card:hover .preview-overlay {
    opacity: 1;
}

.suggestion-info {
  flex-grow: 1;
  overflow: hidden;
  padding-right: 1rem; /* Space before arrow */
}
.suggestion-info h4 {
  margin: 0 0 0.3rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rating {
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 3px;
}
.rating i { transition: color 0.2s ease; }
.rating i.fa-star { color: #ffc107; }
.rating i.fa-star-o { color: #e0e0e0; }
.suggestion-card.active .rating i {
    color: #ffc107; /* Ensure stars are filled on active */
}

.card-arrow {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%) translateX(-5px);
    color: #aaa;
    opacity: 0;
    transition: all 0.2s ease;
    font-size: 0.8rem;
}
.suggestion-card:hover .card-arrow {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
    color: #8c68db;
}

.no-suggestions {
  text-align: center;
  color: #888;
  padding: 2rem 1rem;
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.no-suggestions i {
    font-size: 1.5rem;
    color: #ccc;
}

/* Detailed View Column */
.suggestion-detailed-card {
  display: flex;
  flex-direction: column;
   /* Allow content to determine height, REMOVED overflow */
}

/* Navigation Section (replacing suggestion-image) */
.navigation-section {
  width: 100%;
  border-radius: 10px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.location-info {
  margin-bottom: 1rem;
}

.location-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.address-display {
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
}

.navigation-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.navigate-button,
.copy-location-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
}

.navigate-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.navigate-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.copy-location-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.copy-location-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* Navigation actions within business info context */
.business-info .navigation-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  flex-direction: row;
  gap: 0.5rem;
}

.business-info .navigate-button,
.business-info .copy-location-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
}

.business-info .navigate-button:hover {
  background-color: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.business-info .copy-location-button {
  background-color: #2196F3;
}

.business-info .copy-location-button:hover {
  background-color: #1976D2;
  transform: translateY(-1px);
}

/* Wrapper for content below image */
.detail-content-wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* Takes remaining space */
}

.suggestion-header {
  display: flex;
  flex-wrap: wrap; /* Allow wrap on small screens */
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}
.suggestion-header h2 {
  margin: 0 1rem 0 0; /* Space to the right */
  font-size: 1.6rem; /* Larger title */
  color: #333;
  font-weight: 600;
}
.rating-large {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.1rem;
  color: #ffc107;
}
.rating-text {
    font-size: 0.9rem;
    color: #777;
    margin-left: 0.5rem;
    font-weight: 500;
}

/* Tabs */
.suggestion-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}
.tab-button {
  background: none;
  border: none;
  padding: 0.85rem 1.25rem; /* More padding */
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  transition: all 0.25s ease;
  font-size: 1rem; /* Slightly larger */
  display: flex;
  align-items: center;
  gap: 0.6rem;
  position: relative;
}
.tab-button::after { /* Underline effect */
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: #8c68db;
    transform: scaleX(0);
    transition: transform 0.3s ease;
}
.tab-button:hover { color: #333; }
.tab-button.active {
  color: #8c68db;
  font-weight: 600;
}
.tab-button.active::after {
    transform: scaleX(1);
}


.tab-content {
  line-height: 1.65; /* Improve readability */
  color: #4b5563;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  flex-grow: 1; /* Takes available space */
  min-height: 120px; /* Min height */
}
/* Fade transition for tab content */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Review Formatting */
.review-item {
  border-bottom: 1px dashed #eee;
  padding: 1rem 0;
  margin-bottom: 1rem;
}
.review-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.review-item blockquote {
  margin: 0 0 0.5rem 0;
  font-style: italic;
  color: #555;
  padding-left: 1rem;
  border-left: 3px solid #eee;
}
.review-item cite {
  font-size: 0.9rem;
  color: #777;
  display: block;
  text-align: right;
  font-style: normal;
}
.no-reviews-message {
    text-align: center;
    color: #999;
    padding: 1.5rem;
    font-style: italic;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}
.no-reviews-message i { font-size: 1.3rem; color: #ccc; }

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-wrap: wrap; /* Allow wrapping */
  gap: 1rem;
  margin-top: auto; /* Pushes buttons to bottom */
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}
.primary-action-button, .secondary-action-button, .save-action-button {
  padding: 0.8rem 1.5rem;
  border-radius: 25px; /* Fully rounded */
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.25s ease;
  border: 1px solid transparent; /* Base border */
  font-size: 0.95rem;
  flex-grow: 1;
  text-align: center;
}
.primary-action-button {
  background: #ff80b0; /* HeyBoo Pink */
  color: white;
  box-shadow: 0 2px 5px rgba(255, 128, 176, 0.3);
  border-color: #ff80b0;
}
.primary-action-button:hover {
  background-color: #ff66a3;
  box-shadow: 0 4px 8px rgba(255, 128, 176, 0.4);
  transform: translateY(-1px);
}
.secondary-action-button {
  background-color: #fff;
  color: #555;
  border-color: #d1d5db;
}
.secondary-action-button:hover {
  background-color: #f9f9f9;
  border-color: #aaa;
  color: #333;
}

/* Save button styles */
.save-action-button {
  background-color: #f8f9fa;
  color: #666;
  border-color: #dee2e6;
}

.save-action-button.saved {
  background-color: #e91e63;
  color: white;
  border-color: #e91e63;
}

.save-action-button:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.save-action-button.saved:hover {
  background-color: #c2185b;
  border-color: #c2185b;
}

/* Tab header styles */
.suggestion-tabs-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 0.25rem;
}

.tab-header-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-header-button:hover {
  background-color: rgba(255, 255, 255, 0.5);
  color: #333;
}

.tab-header-button.active {
  background-color: white;
  color: #8c68db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Suggestion meta info */
.suggestion-meta {
  margin-top: 0.25rem;
  color: #888;
  font-size: 0.8rem;
}

.suggestion-meta i {
  margin-right: 0.25rem;
}

/* Placeholder */
.suggestion-detailed-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #aaa;
  font-size: 1.1rem;
  flex-grow: 1; /* Takes space */
  min-height: 300px;
}
.suggestion-detailed-placeholder i {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    color: #e0e0e0;
}

/* Responsive */
@media (max-width: 900px) { /* Tablet */
   .ideas-layout-grid {
    grid-template-columns: minmax(250px, 300px) 1fr; /* Narrower list */
    gap: 1rem;
  }
   .suggestion-header h2 { font-size: 1.4rem; }
}

@media (max-width: 768px) { /* Mobile */
   .ideas-layout-grid {
    grid-template-columns: 1fr; /* Stack columns */
    min-height: initial;
  }
  .suggestion-list-column {
     margin-bottom: 1.5rem; /* Space when stacked */
     /* Consider limiting height or making cards horizontal scroll on mobile? */
     /* max-height: 50vh; overflow-y: auto; */ /* If you MUST scroll list on mobile */
  }
   .navigation-section { padding: 1rem; } /* Smaller padding on mobile */
   .action-buttons { flex-direction: column; } /* Stack buttons */
   
   /* Business navigation on mobile */
   .business-info .navigation-actions {
     flex-direction: column;
     gap: 0.5rem;
   }
   
   .business-info .navigate-button,
   .business-info .copy-location-button {
     width: 100%;
     justify-content: center;
   }
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Enhanced AI Information Styles */
.info-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-description {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
}

.ai-enhanced-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
  border-left: 4px solid #667eea;
}

.info-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.info-section h4 i {
  color: #667eea;
  width: 16px;
  text-align: center;
}

.business-info .business-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.business-info .address {
  margin: 0;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cost-timing-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .cost-timing-section {
    grid-template-columns: 1fr;
  }
}

.cost-info, .timing-info {
  margin: 0;
  font-weight: 500;
  color: #555;
}

.special-note {
  margin: 0;
  font-style: italic;
  color: #555;
  line-height: 1.5;
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.amenity-tag {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.ai-badge {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  padding: 0.75rem 1rem;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 1rem;
  box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
}

.ai-badge i {
  font-size: 1.1rem;
}

</style>