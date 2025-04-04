<template>
  <!-- This div represents the content area for the dashboard's home/default view -->
  <div class="dashboard-home-content">
    <!-- Cards / Sections -->
    <div class="cards-container">

      <div class="card">
        <h2><i class="fa-solid fa-heart"></i> Relationship Stats</h2>
        <p>Together for {{ relationshipDuration }}</p>
        <p>Next anniversary: {{ nextAnniversary }}</p>
        <!-- Link to a profile/settings page -->
        <router-link to="/dashboard/settings" class="card-action">
          View Details <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>

      <div class="card">
        <h2><i class="fa-solid fa-calendar-check"></i> Upcoming Dates</h2> <!-- Changed Icon -->
        <ul class="upcoming-events">
          <li v-for="(event, index) in upcomingEvents" :key="index">
            <span class="event-date">{{ event.date }}</span>
            <span class="event-name">{{ event.name }}</span>
          </li>
          <li v-if="upcomingEvents.length === 0" class="no-events">
            No upcoming events
          </li>
        </ul>
        <router-link to="/dashboard/Calendar" class="card-action">
          View Calendar <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>

      <div class="card">
        <h2><i class="fa-solid fa-award"></i> Shared Milestones</h2>
        <div class="milestone-progress">
          <!-- Loop through milestones -->
          <div class="milestone-item" v-for="(milestone, index) in milestones" :key="index">
            <div class="milestone-icon" :class="{ completed: milestone.completed }">
              <i :class="milestone.icon"></i>
            </div>
            <div class="milestone-text">{{ milestone.text }}</div>
          </div>
        </div>
        <!-- Link to a milestones page or settings -->
        <router-link to="/dashboard/settings" class="card-action">
          Manage Milestones <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>

      <div class="card">
        <h2><i class="fa-solid fa-robot"></i> AI Suggestions</h2>
        <p>{{ aiSuggestion }}</p>
        <router-link to="/dashboard/dateideas" class="card-action">
          Get More Ideas <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>
      <!-- Add more cards here if needed in the future -->

    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardHome",
  data() {
    // Data specifically for the dashboard home cards
    return {
      relationshipDuration: "1 year, 3 months", // Consider fetching dynamically
      nextAnniversary: "April 15, 2025",      // Consider fetching dynamically
      upcomingEvents: [                       // Consider fetching dynamically
        { date: "Apr 10", name: "Coffee Date" }, // Updated example data
        { date: "Apr 18", name: "Concert Night" }
      ],
      milestones: [                           // Consider fetching dynamically
        { text: "First Date", completed: true, icon: "fas fa-glass-cheers" },
        { text: "First Trip", completed: true, icon: "fas fa-plane" },
        { text: "First Anniversary", completed: true, icon: "fas fa-calendar-check" },
        { text: "Moving In", completed: false, icon: "fas fa-home" }
      ],
      aiSuggestion: "Based on your shared love for hiking, how about exploring Pine Trail Park this weekend?" // Updated example data
    };
  },
  methods: {
    // Methods specific to this view could go here
    // e.g., fetchDashboardData() { /* API call */ }
  },
  created() {
    // Good place to fetch dynamic data when the component is created
    console.log("Dashboard Home component created.");
    // this.fetchDashboardData();
  }
};
</script>

<style scoped>
/* Styles specifically for the dashboard home cards */

.dashboard-home-content {
  /* This container fills the space provided by the router-view wrapper */
  /* No explicit height needed here if parent handles it */
}

.cards-container {
  display: grid;
  /* Grid: Automatically fill columns, each card min 320px wide */
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem; /* Spacing between cards */
  /* Height/Padding are handled by the router-view wrapper in Dashboard.vue */
}

/* Card Styles - Adjusted for a "bigger" feel */
.card {
  background-color: #fff;
  border-radius: 10px; /* Slightly more rounded */
  padding: 1.75rem; /* Increased padding inside the card */
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08); /* Slightly deeper shadow */
  border: 1px solid #eef0f2;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column; /* Content flows top-to-bottom */
}

.card:hover {
  transform: translateY(-4px); /* Slightly more lift on hover */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-top: 0;
  margin-bottom: 1.25rem; /* Space below heading */
  font-size: 1.2rem;   /* Larger heading font size */
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Space between icon and text */
}

.card h2 i {
  color: #8c68db;    /* Theme color icon */
  font-size: 1.15rem; /* Larger icon */
  width: 20px;       /* Explicit width for alignment */
  text-align: center;
}

.card p {
  color: #555;
  line-height: 1.6;  /* Increased line spacing for readability */
  font-size: 0.95rem;/* Larger paragraph font size */
  margin-bottom: 0.85rem; /* Space below paragraphs */
  flex-grow: 1; /* Allow text paragraphs to take up space */
}

/* Upcoming Events List */
.upcoming-events {
  list-style: none;
  padding: 0;
  margin: 0;
  /* Removed margin-bottom, let parent flex handle spacing */
  /* flex-grow: 1; */ /* Removed - caused issues if no events */
  min-height: 50px; /* Ensure some space even if empty */
}

.upcoming-events li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0; /* Increased vertical padding */
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem; /* Event text size */
}

.upcoming-events li:last-child {
  border-bottom: none;
}

.event-date {
  font-weight: bold;
  color: #8c68db;
  margin-right: 1rem;
  flex-shrink: 0;
}

.event-name {
  color: #444;
  text-align: right;
  overflow: hidden; /* Prevent long names breaking layout */
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-events {
  color: #999;
  text-align: center;
  padding: 1rem 0;
  font-style: italic;
  font-size: 0.9rem;
}

/* Milestone Progress Section */
.milestone-progress {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem; /* Gap between milestone items */
  margin-top: 0.5rem; /* Add some space above */
  margin-bottom: 1rem; /* Add space below */
  /* flex-grow: 1; */ /* Can cause uneven card heights if other cards have less content */
}

.milestone-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Calculate width for ~2 items per row */
  width: calc(50% - 0.5rem);
  text-align: center;
}

.milestone-icon {
  width: 42px;   /* Larger icon circle */
  height: 42px;  /* Larger icon circle */
  border-radius: 50%;
  background-color: #f3f4f6; /* Lighter gray background */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.6rem; /* Space below icon */
  color: #a0aec0;
  flex-shrink: 0;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.milestone-icon.completed {
  background-color: #8c68db; /* Theme color */
  color: white;
  box-shadow: 0 0 10px rgba(140, 104, 219, 0.5); /* Adjusted glow */
}
.milestone-icon.completed i {
   /* Optional: Add subtle animation */
   /* animation: popIn 0.5s ease-out; */
}

.milestone-text {
  font-size: 0.85rem; /* Milestone text size */
  color: #555;
  line-height: 1.3;
}

/* Card Action Link (at the bottom) */
.card-action {
  margin-top: auto; /* Pushes link to the bottom */
  padding-top: 1.25rem; /* More space above link */
  color: #8c68db;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;  /* Action link text size */
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Align to the right */
  gap: 0.4rem;
  border-top: 1px solid #f0f0f0; /* Separator line */
  transition: color 0.2s ease;
}

.card-action:hover {
  color: #7a5fc7; /* Darker purple on hover */
  text-decoration: underline;
}
.card-action i {
    transition: transform 0.2s ease;
}
.card-action:hover i {
    transform: translateX(3px); /* Slight arrow movement */
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  /* On smaller screens, maybe show fewer milestones per row */
  .milestone-item {
     width: calc(33.33% - 0.7rem); /* Example: 3 items per row */
  }
}

@media (max-width: 600px) {
  /* Stack cards vertically on very small screens */
  .cards-container {
    grid-template-columns: 1fr;
  }
  /* Ensure milestone text doesn't get too cramped */
   .milestone-item {
      width: calc(50% - 0.5rem); /* Back to 2 items per row if needed */
   }
}

/* Optional animation */
@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}

</style>