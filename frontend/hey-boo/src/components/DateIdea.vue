<template>
  <div class="date-ideas-container">
    <header class="date-ideas-header">
      <div class="header-top">
        <h1>Date Ideas</h1>
        <router-link to="/dashboard" class="back-button">
          <i class="fas fa-arrow-left"></i> Dashboard
        </router-link>
      </div>
    </header>

    <div class="date-ideas-body">
      <!-- Search section -->
      <div class="search-section">
        <div class="search-bar">
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for date ideas..."
            @keyup.enter="performSearch"
          />
          <button @click="performSearch" class="search-button">
            Search
          </button>
        </div>
      </div>

      <!-- Content section -->
      <div class="content-container">
        <!-- Suggestion list -->
        <div class="suggestion-list">
          <h3 class="section-title">
            <i class="fas fa-lightbulb"></i> Suggestions
          </h3>
          
          <div class="suggestion-cards">
            <div
              v-for="(suggest, index) in suggestions"
              :key="index"
              class="suggestion-card"
              :class="{ active: suggest.title === detailedSuggestion.title }"
              @click="selectSuggestion(suggest)"
            >
              <div class="card-content">
                <div class="suggestion-preview" 
                     :style="{ backgroundImage: `url(${suggest.image})` }">
                </div>
                <div class="suggestion-info">
                  <h4>{{ suggest.title }}</h4>
                  <div class="rating">
                    <i
                      v-for="star in 5"
                      :key="star"
                      :class="[
                        'fas', 
                        star <= suggest.rating ? 'fa-star' : 'fa-star-o'
                      ]"
                      :style="{ color: star <= suggest.rating ? '#ffcc00' : '#ccc' }"
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed view -->
        <div class="suggestion-detailed">
          <div class="suggestion-header">
            <h2>{{ detailedSuggestion.title }}</h2>
            <div class="rating-large">
              <i
                v-for="star in detailedSuggestion.rating"
                :key="'star-' + star"
                class="fas fa-star"
                style="color: #ffcc00;"
              ></i>
              <i
                v-for="emptyStar in 5 - detailedSuggestion.rating"
                :key="'empty-' + emptyStar"
                class="far fa-star"
                style="color: #ffcc00;"
              ></i>
            </div>
          </div>
          
          <div class="suggestion-image">
            <img :src="detailedSuggestion.image" :alt="detailedSuggestion.title" />
          </div>
          
          <div class="suggestion-tabs">
            <button 
              class="tab-button" 
              :class="{ active: activeTab === 'info' }"
              @click="activeTab = 'info'"
            >
              <i class="fas fa-info-circle"></i> Information
            </button>
            <button 
              class="tab-button" 
              :class="{ active: activeTab === 'reviews' }"
              @click="activeTab = 'reviews'"
            >
              <i class="fas fa-comment"></i> Reviews
            </button>
          </div>
          
          <div class="tab-content">
            <div v-if="activeTab === 'info'" class="info-content">
              <p>{{ detailedSuggestion.info }}</p>
            </div>
            <div v-if="activeTab === 'reviews'" class="reviews-content">
              <p>{{ detailedSuggestion.reviews }}</p>
            </div>
          </div>
          
          <div class="action-buttons">
            <button @click="chooseSuggestion" class="primary-button">
              <i class="fas fa-heart"></i> Choose This Date
            </button>
            <button @click="generateMore" class="secondary-button">
              <i class="fas fa-sync-alt"></i> Generate More
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
<<<<<<< HEAD
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
=======
export default {
  name: "DateIdeas",
  data() {
    return {
      searchQuery: "",
      activeTab: "info",
      detailedSuggestion: {
        title: "Romantic Dinner",
        image: "/images/dinner.jpg",
        info: "A romantic dinner is a perfect way to connect with your partner. Find a cozy restaurant with ambient lighting, soft music, and delicious food. Consider making a reservation at a place with a special meaning to both of you, or try a new cuisine you've been wanting to explore together.",
        reviews: "\"We tried this for our anniversary and it was magical! The ambiance really set the mood for a perfect evening.\" - Sarah & Mike\n\n\"Great conversation starter! We ended up talking for hours.\" - Jamie & Taylor",
        rating: 5
      },
      suggestions: [
        {
          title: "Romantic Dinner",
          rating: 5,
          image: "/images/dinner.jpg"
        },
        {
          title: "Outdoor Picnic",
          rating: 4,
          image: "/images/picnic.jpg"
        },
        {
          title: "Movie Night",
          rating: 3,
          image: "/images/movie-night.jpg"
        },
        {
          title: "Hiking Adventure",
          rating: 4,
          image: "/images/hiking.jpg"
        },
        {
          title: "Cooking Class",
          rating: 5,
          image: "/images/cooking.jpg"
        }
      ]
    };
  },
  methods: {
    performSearch() {
      if (!this.searchQuery.trim()) return;
      
      // Show loading state in a real app
      console.log("Searching for:", this.searchQuery);
      
      // Simulate search results
      setTimeout(() => {
        // In a real app, this would be an API call
        this.suggestions = this.suggestions.filter(item => 
          item.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
        
        if (this.suggestions.length > 0) {
          this.selectSuggestion(this.suggestions[0]);
        }
      }, 500);
    },
    selectSuggestion(suggest) {
      this.detailedSuggestion = {
        title: suggest.title,
        image: suggest.image,
        info: suggest.title === "Romantic Dinner" 
          ? "A romantic dinner is a perfect way to connect with your partner. Find a cozy restaurant with ambient lighting, soft music, and delicious food. Consider making a reservation at a place with a special meaning to both of you, or try a new cuisine you've been wanting to explore together."
          : `Detailed information about ${suggest.title}. This date idea is perfect for couples looking to spend quality time together and create lasting memories. Try it out and see how it strengthens your connection!`,
        reviews: suggest.title === "Romantic Dinner"
          ? "\"We tried this for our anniversary and it was magical! The ambiance really set the mood for a perfect evening.\" - Sarah & Mike\n\n\"Great conversation starter! We ended up talking for hours.\" - Jamie & Taylor"
          : `"We had an amazing time with this ${suggest.title} date idea! Highly recommend it." - Anonymous\n\n"This was such a refreshing change from our usual routine." - John & Lisa`,
        rating: suggest.rating
      };
    },
    chooseSuggestion() {
      // In a real app, save to calendar or favorites
      alert(`Added "${this.detailedSuggestion.title}" to your date plans!`);
    },
    generateMore() {
      // Simulate loading new suggestions
      alert("Generating more date ideas based on your preferences...");
    }
>>>>>>> Security_Test
  }
};
</script>

<style scoped>
<<<<<<< HEAD
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
=======
/* Container with consistent sizing */
.date-ideas-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: "Helvetica Neue", Arial, sans-serif;
  background-color: #f9f9f9;
}

/* Header styling */
.date-ideas-header {
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-ideas-header h1 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.back-button {
  background-color: #8c68db;
  color: #fff;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: #7a5fc7;
}

/* Main content area */
.date-ideas-body {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Search section */
.search-section {
  margin-bottom: 1rem;
}

.search-bar {
  background-color: #fff;
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-icon {
  color: #8c68db;
  margin-left: 0.5rem;
}

.search-bar input {
  flex: 1;
  border: none;
  padding: 0.5rem;
  font-size: 1rem;
  outline: none;
}

.search-button {
  background-color: #8c68db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-button:hover {
  background-color: #7a5fc7;
}

/* Content container */
.content-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1rem;
  flex: 1;
  overflow: hidden;
}

/* Section titles */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.section-title i {
  color: #ffcc00;
}

/* Suggestion list */
.suggestion-list {
  background-color: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.suggestion-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-card {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #eee;
}

.suggestion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.suggestion-card.active {
  border-color: #8c68db;
  box-shadow: 0 0 0 2px rgba(140, 104, 219, 0.2);
}

.card-content {
  display: flex;
  align-items: center;
>>>>>>> Security_Test
}

.suggestion-preview {
  width: 60px;
  height: 60px;
<<<<<<< HEAD
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
=======
  background-size: cover;
  background-position: center;
}

.suggestion-info {
  padding: 0.75rem;
  flex: 1;
}

.suggestion-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.rating {
  display: flex;
  gap: 2px;
}

/* Detailed suggestion */
.suggestion-detailed {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
>>>>>>> Security_Test
}

.suggestion-header {
  display: flex;
<<<<<<< HEAD
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
=======
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.suggestion-header h2 {
  margin: 0;
  color: #333;
}

.rating-large {
  display: flex;
  gap: 3px;
  font-size: 1.1rem;
}

.suggestion-image {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.suggestion-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
>>>>>>> Security_Test
}

/* Tabs */
.suggestion-tabs {
  display: flex;
<<<<<<< HEAD
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
=======
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.tab-button {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #8c68db;
}

.tab-button.active {
  color: #8c68db;
  border-bottom-color: #8c68db;
}

.tab-content {
  flex: 1;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.primary-button, .secondary-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
>>>>>>> Security_Test
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
<<<<<<< HEAD
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
=======
  gap: 0.5rem;
  transition: background-color 0.2s ease;
  border: none;
}

.primary-button {
  background-color: #ff80b0;
  color: white;
}

.primary-button:hover {
  background-color: #ff66a3;
}

.secondary-button {
  background-color: #f0f0f0;
  color: #333;
}

.secondary-button:hover {
  background-color: #e0e0e0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .content-container {
    grid-template-columns: 1fr;
  }
  
  .suggestion-list {
    margin-bottom: 1rem;
  }
  
  .suggestion-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .card-content {
    flex-direction: column;
  }
  
  .suggestion-preview {
    width: 100%;
    height: 100px;
  }
}
</style>
>>>>>>> Security_Test
