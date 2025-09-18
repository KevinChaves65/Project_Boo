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
  }
};
</script>

<style scoped>
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
}

.suggestion-preview {
  width: 60px;
  height: 60px;
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
}

.suggestion-header {
  display: flex;
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
}

/* Tabs */
.suggestion-tabs {
  display: flex;
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
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
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
