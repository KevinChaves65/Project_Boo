<template>
  <div class="calendar-container">
    <header class="calendar-header">
      <div class="header-top">
        <h1>Calendar</h1>
        <router-link to="/dashboard" class="back-button">
          <i class="fas fa-arrow-left"></i> Dashboard
        </router-link>
      </div>
      <div class="calendar-navigation">
        <button @click="prevMonth" class="nav-button"><i class="fas fa-chevron-left"></i></button>
        <h2>{{ currentMonthName }} {{ currentYear }}</h2>
        <button @click="nextMonth" class="nav-button"><i class="fas fa-chevron-right"></i></button>
      </div>
    </header>

    <div class="calendar-body">
      <!-- Calendar Grid -->
      <div class="calendar-grid">
        <!-- Weekday headers -->
        <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>

        <!-- Calendar days -->
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{ 
            'current-month': day.currentMonth, 
            'today': day.isToday, 
            'has-events': hasEvents(day.date),
            'selected': day.date === selectedDate // Highlight the selected tile
          }"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.dayNumber }}</div>
          <div v-if="hasEvents(day.date)" class="event-indicator"></div>
        </div>
      </div>

      <!-- Event Panel -->
      <div class="event-panel">
        <h3>
          {{ selectedDate ? formatDate(new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1))) : 'Select a date' }}
        </h3>
        <div v-if="selectedDate && getEventsForDate(selectedDate).length > 0" class="events-list">
          <div v-for="(milestone, index) in getEventsForDate(selectedDate)" :key="index" class="event-item">
            <div class="event-name">{{ milestone.title }}</div>
            <div class="event-description">{{ milestone.description }}</div>
          </div>
        </div>
        <div v-else-if="selectedDate" class="no-events">No events scheduled for this day</div>
      </div>
    </div>
  </div>
</template>

<script>
import { initializeUser, fetchCoupleMilestones, formatDate } from "../services/script";

export default {
  name: "CalendarPage",
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      milestones: [], // Store milestones fetched from the API
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  },
  computed: {
    currentMonthName() {
      return this.currentDate.toLocaleString("default", { month: "long" });
    },
    currentYear() {
      return this.currentDate.getFullYear();
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDayOfMonth.getDay();
      const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

      const days = [];
      const today = new Date();

      // Days from the previous month
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayNumber = lastDayOfPrevMonth - i;
        const date = new Date(year, month - 1, dayNumber);
        days.push({
          dayNumber,
          currentMonth: false,
          isToday: this.isSameDay(date, today),
          date: date.toISOString().split("T")[0], // Ensure consistent date format
        });
      }

      // Days from the current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          dayNumber: i,
          currentMonth: true,
          isToday: this.isSameDay(date, today),
          date: date.toISOString().split("T")[0], // Ensure consistent date format
        });
      }

      // Days from the next month
      const totalDaysToShow = 42; // 6 rows of 7 days
      for (let i = 1; days.length < totalDaysToShow; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          dayNumber: i,
          currentMonth: false,
          isToday: this.isSameDay(date, today),
          date: date.toISOString().split("T")[0], // Ensure consistent date format
        });
      }

      return days;
    },
  },
  methods: {
    async fetchCalendarData() {
      try {
        // Fetch user profile
        const user = await initializeUser();
        const coupleId = user.couple_id;

        if (!coupleId) {
          console.error("Couple ID is missing in the user profile.");
          return;
        }

        // Fetch milestones using the couple_id
        this.milestones = await fetchCoupleMilestones(coupleId);

        // Ensure milestone dates are in consistent format
        this.milestones = this.milestones.map((milestone) => ({
          ...milestone,
          date: new Date(milestone.date).toISOString().split("T")[0], // Ensure date is in YYYY-MM-DD format
        }));

        console.log("Formatted Milestones:", this.milestones);
      } catch (error) {
        console.error("Failed to fetch calendar data:", error.message);
      }
    },
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    selectDay(day) {
      const selected = new Date(day.date);
      selected.setDate(selected.getDate()); // Add 1 day to fix the timezone issue
      this.selectedDate = selected.toISOString().split("T")[0]; // Ensure consistent date format
    },
    hasEvents(dateString) {
      return this.milestones.some((milestone) => milestone.date === dateString);
    },
    getEventsForDate(dateString) {
      return this.milestones.filter((milestone) => milestone.date === dateString);
    },
    isSameDay(date1, date2) {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    },
    formatDate,
  },
  created() {
    this.fetchCalendarData(); // Fetch user profile and milestones when the component is created
  },
};
</script>

<style scoped>
/* Main container with consistent sizing */
.calendar-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: "Helvetica Neue", Arial, sans-serif;
  background-color: #f9f9f9;
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
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
/* Header styling */
.calendar-header {
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.calendar-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #333;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.calendar-navigation h2 {
  margin: 0;
  font-size: 1.2rem;
  flex-grow: 1;
  text-align: center;
}

.nav-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #8c68db;
  font-size: 1rem;
}

/* Calendar body */
.calendar-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  padding: 1rem;
  overflow: hidden;
}

/* Calendar grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(40px, 1fr);
  gap: 1px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.weekday {
  background-color: #f0f0f0;
  text-align: center;
  padding: 0.5rem;
  font-weight: bold;
  color: #666;
}

.calendar-day {
  position: relative;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  min-height: 60px;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background-color: #f9f9f9;
}

.day-number {
  font-size: 0.9rem;
  text-align: right;
  padding: 0.25rem;
}

.current-month {
  color: #333;
}

.current-month:not(.current-month) {
  color: #ccc;
}

.today {
  background-color: rgba(140, 104, 219, 0.1);
}

.today .day-number {
  color: #8c68db;
  font-weight: bold;
}

.has-events .event-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ff80b0;
  position: absolute;
  bottom: 4px;
  right: 4px;
}

/* Event panel */
.event-panel {
  background-color: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.event-panel h3 {
  margin-top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-event-button {
  background-color: #8c68db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.add-event-button:hover {
  background-color: #7a5fc7;
}

/* Event form */
.event-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.event-form input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.cancel-button {
  background-color: #f1f1f1;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.save-button {
  background-color: #8c68db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #7a5fc7;
}

/* Events list */
.events-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.event-item {
  padding: 0.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.event-time {
  color: #8c68db;
  font-weight: bold;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.event-name {
  flex-grow: 1;
}

.remove-event {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 0.8rem;
}

.remove-event:hover {
  color: #ff6b6b;
}

.no-events {
  text-align: center;
  color: #999;
  margin-top: 1rem;
}

/* Highlight days with events */
.has-events {
  background-color: rgba(255, 128, 176, 0.2); /* Light pink background for days with events */
}

.has-events .day-number {
  font-weight: bold;
  color: #ff4081; /* Pink text for days with events */
}

.milestone-test-section {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.milestone-test-section h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #333;
}

.milestone-test-section ul {
  list-style: none;
  padding: 0;
}

.milestone-test-section li {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #555;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .calendar-body {
    grid-template-columns: 1fr;
  }
  
  .event-panel {
    margin-top: 1rem;
  }
}

.selected {
  background-color: rgba(140, 104, 219, 0.2); /* Light purple background */
  border: 2px solid #8c68db; /* Purple border */
  border-radius: 4px;
}
</style>
