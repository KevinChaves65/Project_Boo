<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand-section">
        <img src="/logo.jpeg" alt="Hey Boo Logo" class="heyboo-logo" />
        <div class="sidebar-logo">Hey Boo</div>
      </div>
      <ul class="sidebar-links">
        <li>
          <router-link to="/dashboard" exact>
            <i class="fas fa-home"></i>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link to="/dashboard/dateideas">
            <i class="fa-solid fa-lightbulb"></i>
            <span>Date Ideas</span>
          </router-link>
        </li>
        <li>
          <router-link to="/dashboard/Calendar">
            <i class="fas fa-calendar-alt"></i>
            <span>Calendar</span>
          </router-link>
        </li>
        <li>
          <router-link to="/dashboard/Chats">
            <i class="fas fa-comments"></i>
            <span>Chats</span>
          </router-link>
        </li>
        <li>
          <router-link to="/dashboard/Settings">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
          </router-link>
        </li>
      </ul>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Bar -->
      <header class="topbar">
        <h1>Welcome, {{ fullName || '[User]' }}!</h1>
        <div class="user-actions">
          <button class="refresh-button" @click="refreshData" title="Refresh Data">
            <i class="fas fa-sync-alt"></i>
          </button>
          <div class="user-avatar">
            <img src="/avatar-placeholder.jpg" alt="User Avatar" />
          </div>
        </div>
      </header>

      <!-- Cards / Sections -->
      <div class="cards-container">
        <!-- Relationship Stats -->
        <div class="card">
          <h2><i class="fa-solid fa-heart"></i> Relationship Stats</h2>
          <p>Together for {{ relationshipDuration }}</p>
          <p>Next anniversary: {{ nextAnniversary }}</p>
          <p>Upcoming milestone: {{ nextMilestone.title }} on {{ formatDate(nextMilestone.date) }}</p>
        </div>

        <!-- Upcoming Dates -->
        <div class="card">
          <h2><i class="fa-solid fa-clock"></i> Upcoming Dates</h2>
          <div v-if="milestonesError" class="error-message">
            {{ milestonesError }}
          </div>
          <ul v-else class="upcoming-events">
            <li v-for="(milestone, index) in milestones" :key="index">
              <span class="event-date">{{ formatDate(milestone.date) }}</span>
              <span class="event-name">{{ milestone.title }}</span>
            </li>
            <li v-if="milestones.length === 0" class="no-events">
              No upcoming events
            </li>
          </ul>
          <router-link to="/dashboard/Calendar" class="card-action">
            View Calendar <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>

        <!-- Shared Milestones -->
        <div class="card">
          <h2><i class="fa-solid fa-award"></i> Shared Milestones</h2>
          <div v-if="milestonesError" class="error-message">
            {{ milestonesError }}
          </div>
          <div v-else class="milestone-progress">
            <div class="milestone-item" v-for="(milestone, index) in milestones" :key="index">
              <div class="milestone-icon" :class="{ completed: isMilestoneCompleted(milestone.date) }">
                <i class="fa-solid fa-check"></i>
              </div>
              <div class="milestone-text">{{ milestone.title }}</div>
            </div>
          </div>
        </div>

        <!-- AI Suggestions -->
        <div class="card">
          <h2><i class="fa-solid fa-robot"></i> AI Suggestions</h2>
          <p>{{ aiSuggestion }}</p>
          <router-link to="/dashboard/dateideas" class="card-action">
            Get More Ideas <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { fetchUserProfile, fetchMilestones } from "../services/apiService";

export default {
  name: "Dashboard",
  data() {
    return {
      fullName: "",
      relationshipDuration: "",
      nextAnniversary: "",
      nextMilestone: {}, // Store the next milestone
      milestones: [],
      aiSuggestion: "Based on your interests, try a cooking class together this weekend!",
      milestonesError: "", // Add error message for milestones
    };
  },
  methods: {
    async fetchUserData() {
      try {
        // Fetch user profile
        const user = await fetchUserProfile();
        this.fullName = user.full_name;

        // Ensure couple_id is retrieved from the user profile
        const coupleId = user.couple_id;
        if (!coupleId) {
          console.error("Couple ID is missing in the user profile.");
          this.milestonesError = "Couple ID is missing. Please link your partner.";
          return;
        }

        // Fetch milestones using the couple_id
        this.milestones = await fetchMilestones(coupleId);

        // Calculate relationship stats
        this.calculateRelationshipStats();
      } catch (error) {
        console.error("Failed to fetch user data or milestones:", error.message);
        this.milestonesError = "Failed to load milestones. Please try again later.";
      }
    },
    calculateRelationshipStats() {
      // Example logic for relationship duration and next anniversary
      this.relationshipDuration = "1 year, 3 months"; // Replace with actual calculation
      this.nextAnniversary = "April 15, 2025"; // Replace with actual calculation

      // Find the next milestone
      const now = new Date();
      this.nextMilestone = this.milestones
        .filter((milestone) => new Date(milestone.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || {};
    },
    isMilestoneCompleted(date) {
      const now = new Date();
      return new Date(date) < now;
    },
    formatDate(date) {
      if (!date) return "N/A";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    refreshData() {
      this.fetchUserData();
    },
  },
  created() {
    this.fetchUserData();
  },
};
</script>

<style scoped>
/* Outer Container: Sidebar + Main Content */
.dashboard-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: "Helvetica Neue", Arial, sans-serif;
  background-color: #f9f9f9;
}

/* Sidebar Styles */
.sidebar {
  width: 240px;
  background: linear-gradient(135deg, #8c68db, #a66fd5);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

/* Logo Styling */
.heyboo-logo {
  width: 80px;
  height: auto;
  margin-bottom: 0.5rem;
  border-radius: 12%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* Sidebar Title */
.sidebar-logo {
  font-size: 1.4rem;
  font-weight: bold;
}

/* Sidebar Navigation */
.sidebar-links {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-links li {
  margin-bottom: 0.5rem;
}

/* Each link acts like a table row */
.sidebar-links li a {
  display: flex;
  align-items: center;
  width: 100%;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.sidebar-links li a.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Icon and text spacing */
.sidebar-links li a i {
  width: 24px;
  text-align: center;
  margin-right: 10px;
  font-size: 1rem;
}

/* Hover effect for better feedback */
.sidebar-links li a:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateX(2px);
}

/* Main Content Area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top Bar */
.topbar {
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topbar h1 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.refresh-button {
  background: none;
  border: none;
  color: #8c68db;
  cursor: pointer;
  font-size: 1rem;
}

.refresh-button i.rotating {
  animation: rotate 1s linear;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.user-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

/* Cards Layout */
.cards-container {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem 2rem;
  overflow-y: auto;
}

/* Card Styles */
.card {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
}

.card h2 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.15rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card h2 i {
  color: #8c68db;
}

.card p {
  color: #555;
  line-height: 1.4;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}

/* Upcoming events list */
.upcoming-events {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.upcoming-events li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.upcoming-events li:last-child {
  border-bottom: none;
}

.event-date {
  font-weight: bold;
  color: #8c68db;
}

.no-events {
  color: #999;
  text-align: center;
  padding: 0.5rem 0;
}

/* Card action link */
.card-action {
  margin-top: auto;
  color: #8c68db;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.card-action:hover {
  text-decoration: underline;
}

/* Milestone progress */
.milestone-progress {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.milestone-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(50% - 0.5rem);
}

.milestone-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  color: #999;
}

.milestone-icon.completed {
  background-color: #8c68db;
  color: white;
}

.milestone-text {
  font-size: 0.9rem;
  text-align: center;
  color: #555;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 1rem;
  }
  
  .sidebar-links li a {
    padding: 0.5rem;
  }
  
  .topbar {
    padding: 1rem;
  }
  
  .cards-container {
    padding: 1rem;
  }
}
</style>
