<template>
  <!-- Root element for this specific view's content -->
  <div class="date-ideas-view-content">

    <!-- Search Section - Enhanced Look -->
    <div class="search-section">
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
        <h2 class="column-title">
          <i class="fas fa-lightbulb"></i> Suggestions
        </h2>
        <div class="suggestion-cards-container">
          <!-- Card Loop -->
          <div
            v-for="(suggest, index) in suggestions"
            :key="`suggest-${index}`"
            class="suggestion-card"
            :class="{ active: detailedSuggestion && suggest.title === detailedSuggestion.title }"
            @click="selectSuggestion(suggest)"
            :title="`View details for ${suggest.title}`"
            tabindex="0" @keyup.enter="selectSuggestion(suggest)" @keyup.space="selectSuggestion(suggest)"
          >
            <div class="suggestion-preview"
                 :style="{ backgroundImage: `url(${suggest.image || '/images/placeholder-card.jpg'})` }">
                 <div class="preview-overlay"></div>
            </div>
            <div class="suggestion-info">
              <h4>{{ suggest.title }}</h4>
              <div class="rating">
                 <span class="sr-only">Rating: {{ suggest.rating }} out of 5 stars</span>
                <i
                  v-for="star in 5"
                  :key="`s-${index}-star-${star}`"
                  :class="['fas', star <= suggest.rating ? 'fa-star' : 'fa-star-o']"
                  aria-hidden="true"
                ></i>
              </div>
            </div>
             <i class="fas fa-chevron-right card-arrow" aria-hidden="true"></i>
          </div>
          <!-- No results message -->
          <p v-if="suggestions.length === 0" class="no-suggestions">
            <i class="fas fa-search"></i> No suggestions match your search.
          </p>
        </div>
      </div>

      <!-- Detailed View Column -->
      <div class="suggestion-detail-column">
        <!-- Display Details Card -->
        <div class="suggestion-detailed-card" v-if="detailedSuggestion">
            <div class="suggestion-image">
              <img :src="detailedSuggestion.image || '/images/placeholder-detail.jpg'" :alt="detailedSuggestion.title" />
            </div>

            <div class="detail-content-wrapper">
              <div class="suggestion-header">
                <h2>{{ detailedSuggestion.title }}</h2>
                <div class="rating-large">
                   <span class="sr-only">Rating: {{ detailedSuggestion.rating }} out of 5 stars</span>
                  <i
                    v-for="star in detailedSuggestion.rating"
                    :key="'detail-star-' + star"
                    class="fas fa-star"
                    aria-hidden="true"
                  ></i>
                  <i
                    v-for="emptyStar in 5 - detailedSuggestion.rating"
                    :key="'detail-empty-' + emptyStar"
                    class="far fa-star"
                    aria-hidden="true"
                  ></i>
                  <span class="rating-text">({{ detailedSuggestion.rating }}.0)</span>
                </div>
              </div>


              <!-- Using Tabs for Info/Reviews -->
              <div class="suggestion-tabs">
                <button
                  class="tab-button"
                  :class="{ active: activeTab === 'info' }"
                  @click="activeTab = 'info'"
                  :aria-pressed="activeTab === 'info'"
                >
                  <i class="fas fa-info-circle"></i> Info
                </button>
                <button
                  class="tab-button"
                  :class="{ active: activeTab === 'reviews' }"
                  @click="activeTab = 'reviews'"
                   :aria-pressed="activeTab === 'reviews'"
                >
                  <i class="fas fa-comments"></i> Reviews ({{ formattedReviews.length }})
                </button>
              </div>

              <div class="tab-content">
                <transition name="fade" mode="out-in">
                  <div v-if="activeTab === 'info'" key="info" class="info-content">
                    <p>{{ detailedSuggestion.info }}</p>
                  </div>
                  <div v-else key="reviews" class="reviews-content">
                    <div v-if="formattedReviews.length > 0">
                      <div v-for="(review, idx) in formattedReviews" :key="`review-${idx}`" class="review-item">
                         <blockquote>"{{ review.text }}"</blockquote>
                         <cite>- {{ review.author }}</cite>
                      </div>
                    </div>
                    <p v-else class="no-reviews-message">
                        <i class="fas fa-comment-slash"></i> No reviews available yet.
                    </p>
                  </div>
                 </transition>
              </div>

              <div class="action-buttons">
                <button @click="chooseSuggestion" class="primary-action-button">
                  <i class="fas fa-calendar-plus"></i> Add to Calendar
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
// Your existing <script> block remains the same
// ... (methods: performSearch, selectSuggestion, chooseSuggestion, generateMore)
// Make sure data properties (searchQuery, activeTab, suggestions, detailedSuggestion) exist
export default {
  name: "DateIdeas",
  data() {
    // Using placeholder images - replace with your actual paths or logic
    const placeholderImg = (title) => `/images/${title.toLowerCase().replace(/\s+/g, '-')}.jpg`; // Basic slugify
     const initialSuggestions = [
      { title: "Romantic Dinner", rating: 5 },
      { title: "Outdoor Picnic", rating: 4 },
      { title: "Movie Night", rating: 3 },
      { title: "Hiking Adventure", rating: 4 }
     
    ];

    // Add images and enrich initial data
     const enrichedSuggestions = initialSuggestions.map(s => ({
        ...s,
        image: placeholderImg(s.title), // Generate image path
         info: s.title === "Romantic Dinner"
          ? "A romantic dinner provides a classic setting to connect. Look for a cozy restaurant with ambient lighting and soft music, or try a new cuisine you both want to explore. Making a reservation, especially somewhere meaningful, adds a thoughtful touch."
          : `Explore the unique experience of ${s.title}. This idea is great for couples seeking quality time and shared memories. It offers opportunities for conversation and connection in a fun ${s.rating > 3 ? 'and engaging' : 'and relaxed'} atmosphere.`,
        reviews: s.title === "Romantic Dinner"
          ? "\"Magical anniversary dinner! The ambiance was perfect.\" - Sarah & Mike\n\n\"Sparked great conversation, we talked for hours!\" - Jamie & Taylor"
          : `"Absolutely loved our ${s.title} date! So refreshing and fun.` + (s.rating > 4 ? ` Highly recommended!" - Chloe & Ben` : `" - Anonymous` ) + `\n\n"A great break from the usual routine. Enjoyed it a lot." - John & Lisa`,
    }));

    return {
      searchQuery: "",
      activeTab: "info",
      suggestions: enrichedSuggestions,
      allSuggestions: [...enrichedSuggestions], // Keep a copy for resetting search
      // Start with the first suggestion selected, or null for placeholder
      detailedSuggestion: enrichedSuggestions.length > 0 ? { ...enrichedSuggestions[0] } : null
    };
  },
 computed: {
    formattedReviews() {
      if (!this.detailedSuggestion || !this.detailedSuggestion.reviews) return [];
      // Simple split logic, improved robustness
      return this.detailedSuggestion.reviews.split('\n\n')
        .map(reviewText => {
          const parts = reviewText.trim().split(' - ');
          if (parts.length === 2) {
            return { text: parts[0].replace(/^"|"$/g, ''), author: parts[1] }; // Remove surrounding quotes
          } else if (parts.length === 1 && parts[0]) {
             return { text: parts[0].replace(/^"|"$/g, ''), author: 'Anonymous' }; // Fallback author
          }
          return null; // Ignore empty lines or invalid formats
        })
        .filter(review => review !== null); // Filter out null entries
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
          this.activeTab = 'info';
          // Remove loading state here
      }, 300); // Small delay for visual feedback
    },
    selectSuggestion(suggest) {
       if (!suggest) {
         this.detailedSuggestion = null;
         return;
       }
      // Ensure we're using the full data from allSuggestions
      const fullSuggestData = this.allSuggestions.find(s => s.title === suggest.title);
      if (fullSuggestData) {
           this.detailedSuggestion = { ...fullSuggestData };
           this.activeTab = 'info'; // Reset tab on selection change
      }
    },
    chooseSuggestion() {
       if (!this.detailedSuggestion) return;
      // Integrate with actual calendar logic
      alert(`Adding "${this.detailedSuggestion.title}" to your calendar! (Implementation pending)`);
      // Example: this.$store.dispatch('addToCalendar', this.detailedSuggestion);
    },
    generateMore() {
      // Implement logic to fetch/suggest more ideas
      alert("Generating more date ideas... (API call needed)");
       // Example: fetch('/api/more-ideas?based_on=' + this.detailedSuggestion.title)
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
.suggestion-image {
  width: 100%;
  height: 280px; /* Fixed height for consistency */
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  background-color: #f0f0f0;
  flex-shrink: 0;
  position: relative; /* For potential overlays */
}
.suggestion-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.suggestion-image:hover img {
    transform: scale(1.05);
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
.primary-action-button, .secondary-action-button {
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
   .suggestion-image { height: 220px; } /* Smaller image */
   .action-buttons { flex-direction: column; } /* Stack buttons */
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

</style>