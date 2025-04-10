<!-- Dashboard.vue -->
<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar">
       <!-- ... sidebar content ... -->
       <div class="brand-section">
         <img src="/logo.jpeg" alt="Hey Boo Logo" class="heyboo-logo" />
         <div class="sidebar-logo">Hey Boo</div>
       </div>
       <ul class="sidebar-links">
         <!-- ... your router-links ... -->
         <li><router-link to="/dashboard" exact><i class="fas fa-home"></i><span>Dashboard</span></router-link></li>
         <li><router-link to="/dashboard/dateideas"><i class="fa-solid fa-lightbulb"></i><span>Date Ideas</span></router-link></li>
         <li><router-link to="/dashboard/Calendar"><i class="fas fa-calendar-alt"></i><span>Calendar</span></router-link></li>
         <li><router-link to="/dashboard/Chats"><i class="fas fa-comments"></i><span>Chats</span></router-link></li>
         <li><router-link to="/dashboard/word-bank"><i class="fas fa-magic"></i><span>Word Bank</span></router-link></li>
         <li><router-link to="/dashboard/settings"><i class="fas fa-cog"></i><span>Settings</span></router-link></li>
       </ul>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content"> 
      <!-- Top Bar -->
      <header class="topbar"> 
        <h1>{{ currentViewTitle || 'Welcome, ' + (username || '[User]') + '!' }}</h1>
        <div class="user-actions">
          <button class="refresh-button" @click="refreshData" title="Refresh Data">
            <i class="fas fa-sync-alt"></i>
          </button>
          <div class="user-avatar">
            <img src="/avatar-placeholder.jpg" alt="User Avatar" />
          </div>
        </div>
      </header>

      <!-- Wrapper for router-view to handle scrolling -->
      <div class="router-view-wrapper"> 
          <router-view />
      </div>

    </main>
  </div>
</template>

<script>
import { initializeUser, fetchCoupleMilestones, calculateRelationshipStats, formatDate } from "../services/script";

export default {
  name: "Dashboard",
  data() {
    return {
      fullName: "",
      relationshipDuration: "",
      nextAnniversary: "",
      nextMilestone: {},
      milestones: [],
      aiSuggestion: "Based on your interests, try a cooking class together this weekend!",
      milestonesError: "",
    };
  },
  computed: {
    currentViewTitle() {
      switch (this.$route.name) {
        case 'DateIdeas': return 'Date Ideas';
        case 'Chats': return 'Chats';
        case 'Word Bank': return 'Word Bank';
        case 'Settings': return 'Settings';
        case 'Calendar': return 'Calendar';
        case 'DashboardHome': return `Hey Boo Dashboard`; // More specific title
        default: return `Welcome, ${this.username || '[User]'}!`;
      }
    }
  },
  methods: {
    async fetchUserData() {
      try {
        const user = await initializeUser();
        this.fullName = user.full_name;

        const coupleId = user.couple_id;
        if (!coupleId) {
          console.error("Couple ID is missing in the user profile.");
          this.milestonesError = "Couple ID is missing. Please link your partner.";
          return;
        }

        this.milestones = await fetchCoupleMilestones(coupleId);
        const stats = calculateRelationshipStats(this.milestones);
        this.relationshipDuration = stats.relationshipDuration;
        this.nextAnniversary = stats.nextAnniversary;
        this.nextMilestone = stats.nextMilestone;
      } catch (error) {
        console.error("Failed to fetch user data or milestones:", error.message);
        this.milestonesError = "Failed to load milestones. Please try again later.";
      }
    },
    refreshData() {
      const button = document.querySelector('.refresh-button i');
      if(button && !button.classList.contains('rotating')) {
        button.classList.add('rotating');
        setTimeout(() => {
            button.classList.remove('rotating');
        }, 1000);
      }
    }
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
  height: 100vh; /* Full viewport height */
  overflow: hidden; /* Prevent BODY scrollbars */
  background-color: #f9f9f9;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 240px; /* Fixed width */
  background: linear-gradient(135deg, #8c68db, #a66fd5);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* Allow sidebar scrolling if needed */
  flex-shrink: 0; /* Prevent sidebar from shrinking */
}
/* ... other sidebar styles (.brand-section, .sidebar-links, etc.) ... */
.brand-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem; }
.heyboo-logo { width: 80px; height: auto; margin-bottom: 0.5rem; border-radius: 12%; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15); }
.sidebar-logo { font-size: 1.4rem; font-weight: bold; }
.sidebar-links { list-style: none; margin: 0; padding: 0; }
.sidebar-links li { margin-bottom: 0.5rem; }
.sidebar-links li a { display: flex; align-items: center; width: 100%; color: #fff; text-decoration: none; font-weight: 500; padding: 0.75rem; border-radius: 6px; transition: all 0.2s ease; }
.sidebar-links li a.router-link-exact-active { background-color: rgba(255, 255, 255, 0.2); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
.sidebar-links li a i { width: 24px; text-align: center; margin-right: 10px; font-size: 1rem; }
.sidebar-links li a:hover { background-color: rgba(255, 255, 255, 0.15); transform: translateX(2px); }

/* Main Content Area */
.main-content {
  flex: 1; /* IMPORTANT: Allows this area to grow and take remaining space */
  display: flex;
  flex-direction: column;
  /* REMOVED overflow: hidden; Let the wrapper handle overflow */
  background-color: #f9f9f9;
   min-width: 0; /* Important fix for flexbox content shrinking issues */
}

/* Top Bar */
.topbar {
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  flex-shrink: 0; /* IMPORTANT: Prevent top bar from shrinking */
}
.topbar h1 { margin: 0; font-size: 1.2rem; font-weight: 600; color: #333; }
/* ... other topbar styles (.user-actions, etc.) ... */
.user-actions { display: flex; align-items: center; gap: 1rem; }
.refresh-button { background: none; border: none; color: #8c68db; cursor: pointer; font-size: 1.1rem; padding: 5px; line-height: 1; } /* Adjusted size/padding */
.refresh-button i.rotating { animation: rotate 1s linear infinite; }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.user-avatar img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }


/* Router View Wrapper - This is KEY */
.router-view-wrapper {
  flex-grow: 1; /* Take all available vertical space below topbar */
  overflow-y: auto; /* Add vertical scrollbar ONLY when needed */
  padding: 1.5rem 2rem; /* Add padding INSIDE the scrollable area */
   min-height: 0; /* Important fix for flexbox scrolling context */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sidebar {
    /* Example: Maybe hide sidebar or make it overlay */
    /* position: fixed; z-index: 10; transform: translateX(-100%); transition: transform 0.3s ease; */
  }
  .topbar { padding: 1rem; }
  .router-view-wrapper { padding: 1rem; } /* Adjust padding on smaller screens */
}
</style>