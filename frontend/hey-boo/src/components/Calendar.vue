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
<<<<<<< HEAD
        <div class="panel-header">
            <h3 v-if="selectedDate">{{ formatDate(selectedDate) }}</h3>
            <h3 v-else>Select a Date</h3>
            <button v-if="selectedDate" class="add-event-button" @click="showEventForm = !showEventForm" :aria-expanded="showEventForm">
              <i :class="showEventForm ? 'fas fa-times' : 'fas fa-plus'"></i>
              <span>{{ showEventForm ? 'Close' : 'Add Event' }}</span>
            </button>
        </div>

        <!-- Event form with transition -->
         <transition name="slide-fade">
            <form v-if="showEventForm" @submit.prevent="addEvent" class="event-form">
              <h4>New Event</h4>
              <div class="form-group">
                 <label :for="`event-name-${_uid}`">Event Name</label>
                 <input :id="`event-name-${_uid}`" v-model="newEvent.name" type="text" placeholder="e.g., Dinner with Partner" required>
              </div>
              <div class="form-group">
                  <label :for="`event-time-${_uid}`">Time</label>
                  <input :id="`event-time-${_uid}`" v-model="newEvent.time" type="time" required>
              </div>
              <div class="form-actions">
                <button type="button" @click="showEventForm = false" class="button-cancel">Cancel</button>
                <button type="submit" class="button-save">Save Event</button>
              </div>
            </form>
        </transition>

        <!-- Events list for selected day -->
        <div class="events-list-wrapper">
            <div v-if="selectedDate && eventsForSelectedDate.length > 0" class="events-list">
              <h4>Scheduled Events</h4>
              <div
                v-for="(evt, i) in eventsForSelectedDate"
                :key="`evt-${selectedDate}-${i}`"
                class="event-item"
              >
                 <span class="event-dot accent-dot" aria-hidden="true"></span>
                <div class="event-details">
                    <span class="event-name">{{ evt.name }}</span>
                    <span class="event-time">{{ formatTime(evt.time) }}</span>
                </div>
                <button @click="removeEvent(evt)" class="remove-event-button" aria-label="Remove event">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>

            <div v-else-if="selectedDate" class="no-events">
               <i class="fas fa-calendar-check"></i>
              <p>No events scheduled for this day.</p>
              <p v-if="!showEventForm">Click "Add Event" above to add one!</p>
            </div>

             <div v-else class="no-date-selected">
                 <i class="fas fa-hand-pointer"></i>
                <p>Select a day from the calendar to view or add events.</p>
            </div>
        </div>
=======
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
>>>>>>> Security_Test
      </div>
    </div>
  </div>
</template>

<script>
<<<<<<< HEAD
// Your existing <script> block remains largely the same
// Add computed property for eventsForSelectedDate for cleaner template
export default {
  name: "CalendarPage", // Changed name to avoid conflicts if needed
   props: { // Example if component ID needed for labels
     _uid: { type: [String, Number], default: () => Math.random().toString(36).substr(2, 9) }
   },
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null, // Store as 'YYYY-MM-DD' string
      showEventForm: false,
      newEvent: { name: "", time: "" },
      events: [], // {date: 'YYYY-MM-DD', time: 'HH:mm', name: '...'}
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      // Removed windowWidth/Height as they weren't used in the template/style fix
=======
import { initializeUser, fetchCoupleMilestones, formatDate } from "../services/script";

export default {
  name: "CalendarPage",
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      milestones: [], // Store milestones fetched from the API
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
>>>>>>> Security_Test
    };
  },
  computed: {
    currentMonthName() {
<<<<<<< HEAD
      return this.currentDate.toLocaleString('default', { month: 'long' });
=======
      return this.currentDate.toLocaleString("default", { month: "long" });
>>>>>>> Security_Test
    },
    currentYear() {
      return this.currentDate.getFullYear();
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
<<<<<<< HEAD
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 6=Sat
      const lastDayOfPrevMonthDate = new Date(year, month, 0); // Date object for last day of prev month
      const lastDayOfPrevMonth = lastDayOfPrevMonthDate.getDate();

      const days = [];
      const today = new Date(); // Compare against today

      // Days from previous month
=======

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDayOfMonth.getDay();
      const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

      const days = [];
      const today = new Date();

      // Days from the previous month
>>>>>>> Security_Test
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayNumber = lastDayOfPrevMonth - i;
        const date = new Date(year, month - 1, dayNumber);
        days.push({
          dayNumber,
          currentMonth: false,
<<<<<<< HEAD
          isToday: false, // Cannot be today if not current month
          date: this.formatDateString(date)
        });
      }

      // Days from current month
=======
          isToday: this.isSameDay(date, today),
          date: date.toISOString().split("T")[0], // Ensure consistent date format
        });
      }

      // Days from the current month
>>>>>>> Security_Test
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          dayNumber: i,
          currentMonth: true,
          isToday: this.isSameDay(date, today),
<<<<<<< HEAD
          date: this.formatDateString(date)
        });
      }

      // Days from next month (ensure grid fills 6 rows = 42 cells)
       const totalCells = days.length <= 35 ? 35 : 42; // Show 5 or 6 rows
      const daysFromNextMonth = totalCells - days.length;
      for (let i = 1; i <= daysFromNextMonth; i++) {
=======
          date: date.toISOString().split("T")[0], // Ensure consistent date format
        });
      }

      // Days from the next month
      const totalDaysToShow = 42; // 6 rows of 7 days
      for (let i = 1; days.length < totalDaysToShow; i++) {
>>>>>>> Security_Test
        const date = new Date(year, month + 1, i);
        days.push({
          dayNumber: i,
          currentMonth: false,
<<<<<<< HEAD
          isToday: false,
          date: this.formatDateString(date)
=======
          isToday: this.isSameDay(date, today),
          date: date.toISOString().split("T")[0], // Ensure consistent date format
>>>>>>> Security_Test
        });
      }

      return days;
    },
<<<<<<< HEAD
    // Added computed property for events on selected date
    eventsForSelectedDate() {
        if (!this.selectedDate) return [];
        return this.events
            .filter(event => event.date === this.selectedDate)
            .sort((a, b) => a.time.localeCompare(b.time));
    }
  },
  methods: {
    // Calendar navigation
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.selectedDate = null; // Deselect date when changing month
      this.showEventForm = false;
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
       this.selectedDate = null; // Deselect date
       this.showEventForm = false;
    },

    // Date selection
    selectDay(day) {
       if (!day.currentMonth) return; // Don't select days outside current month
      this.selectedDate = day.date;
      this.showEventForm = false; // Close form when selecting a new day
    },

    // Event handling
    addEvent() {
      if (this.newEvent.name && this.newEvent.time && this.selectedDate) {
        const newEventData = {
          date: this.selectedDate,
          time: this.newEvent.time,
          name: this.newEvent.name.trim()
        };
        this.events.push(newEventData);
        this.saveEvents(); // Save to localStorage

        // Reset form
        this.newEvent.name = "";
        this.newEvent.time = "";
        this.showEventForm = false;
      }
    },
    removeEvent(eventToRemove) {
        // Find based on all properties for uniqueness (or add an ID later)
      this.events = this.events.filter(e =>
        !(e.date === eventToRemove.date && e.time === eventToRemove.time && e.name === eventToRemove.name)
      );
      this.saveEvents();
    },
     saveEvents() {
         // In a real app, might send to backend API
         try {
            localStorage.setItem('heyBooEvents', JSON.stringify(this.events));
         } catch (e) {
             console.error("Failed to save events to localStorage:", e);
         }
     },
     loadEvents() {
         try {
             const savedEvents = localStorage.getItem('heyBooEvents');
             if (savedEvents) {
               this.events = JSON.parse(savedEvents);
             }
         } catch (e) {
             console.error("Failed to load events from localStorage:", e);
             this.events = []; // Reset if data is corrupted
         }
     },

    // Helper methods
    formatDateString(date) {
      // Ensures YYYY-MM-DD format
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    isSameDay(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    },
    formatDate(dateString) {
        if (!dateString) return '';
        // Add error handling for invalid dateString if necessary
        const dateParts = dateString.split('-');
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        return date.toLocaleDateString(navigator.language || 'en-US', { // Use browser language
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    },
     formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
         try {
             const date = new Date();
             date.setHours(parseInt(hours, 10));
             date.setMinutes(parseInt(minutes, 10));
              return date.toLocaleTimeString(navigator.language || 'en-US', { // Use browser language
                 hour: 'numeric', minute: '2-digit', hour12: true
             });
         } catch (e) {
             console.error("Error formatting time:", e);
             return timeString; // Fallback
         }
    },
    getEventsForDate(dateString) { // Keep this if used elsewhere, otherwise computed prop is better
      return this.events.filter(event => event.date === dateString).sort((a, b) => a.time.localeCompare(b.time));
    },
    hasEvents(dateString) {
      return this.events.some(event => event.date === dateString);
    },
     // Removed handleResize as it's not needed for the layout fix
  },
   created() {
    this.loadEvents(); // Load events when component is created
  },
  // destroyed() - No longer needed if resize listener removed
=======
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
>>>>>>> Security_Test
};
</script>

<style scoped>
<<<<<<< HEAD
/* Base container for this view - Handles spacing */
.calendar-view-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Space between nav and body */
   /* Height/Scrolling handled by parent (.router-view-wrapper) */
}

/* Calendar Navigation */
.calendar-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #fff; /* Give nav a background */
  border-radius: 25px; /* Rounded pill shape */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;
  flex-shrink: 0; /* Prevent shrinking */
}
.calendar-navigation h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  flex-grow: 1;
}
.nav-button {
  background: transparent;
=======
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
>>>>>>> Security_Test
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #8c68db;
  font-size: 1rem;
<<<<<<< HEAD
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.nav-button:hover {
  background-color: #f3eefc;
  color: #7a5fc7;
}

/* Calendar Body Grid Layout */
.calendar-body {
  flex-grow: 1; /* Takes remaining vertical space */
  display: grid;
  grid-template-columns: 1fr minmax(300px, 360px); /* Calendar takes more space */
  gap: 1.5rem;
   min-height: 0; /* Crucial for nested grid/flex scrolling */
   /* REMOVED overflow: hidden */
}

/* Calendar Grid Area */
.calendar-grid-wrapper {
   background-color: #fff;
   border-radius: 12px;
   padding: 0.75rem; /* Padding around the grid */
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
   border: 1px solid #f0f0f0;
   /* No overflow here */
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(60px, auto); /* Let rows grow based on content */
  gap: 5px; /* Subtle gap between day cells */
}

.weekday {
  text-align: center;
  padding: 0.75rem 0.25rem; /* More padding */
  font-weight: 600; /* Bolder */
  color: #777; /* Softer color */
  font-size: 0.85rem;
  text-transform: uppercase; /* Uppercase */
}

/* Calendar Day Cells */
.calendar-day {
  position: relative;
  background-color: #fff;
  border-radius: 6px; /* Rounded cells */
  border: 1px solid #f3f4f6; /* Softer border */
  min-height: 70px; /* Min height */
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* Number to top-right */
  justify-content: space-between; /* Push indicators down */
  transition: all 0.2s ease;
  font-size: 0.9rem;
}
.calendar-day:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.day-number {
  font-weight: 500;
  color: #555;
  padding: 0;
}

/* Day States */
.outside-month {
  color: #ccc;
  background-color: #f9fafb; /* Slightly different background */
  cursor: default;
  opacity: 0.7;
}
.outside-month .day-number { color: #ccc; }
.outside-month:hover { background-color: #f9fafb; border-color: #f3f4f6; box-shadow: none;} /* No hover effect */

.today {
  background-color: #f3eefc; /* Light purple */
  border-color: #dcd1f3;
}
.today .day-number {
  color: #8c68db; /* Theme color */
  font-weight: 700;
  background-color: #fff; /* White circle */
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 1px 2px rgba(140, 104, 219, 0.2);
}

.selected {
  background-color: #fff !important; /* Ensure white background */
  border-color: #8c68db !important;
  box-shadow: 0 0 0 2px rgba(140, 104, 219, 0.4) !important;
}
.selected .day-number {
    /* Optionally highlight selected number differently */
    /* color: #8c68db; */
}

/* Event Indicators */
.event-indicators {
    display: flex;
    gap: 3px;
    align-self: center; /* Center dots */
    margin-top: auto; /* Push to bottom */
    padding-bottom: 2px;
}
.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ff80b0; /* HeyBoo Pink */
  flex-shrink: 0;
}

/* Event Panel */
.event-panel {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  /* REMOVED overflow: hidden */
}
.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
}
.panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}
.add-event-button {
  background-color: #f3eefc;
  color: #8c68db;
  border: 1px solid #dcd1f3;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}
.add-event-button:hover {
  background-color: #e9dffc;
  border-color: #c8bce8;
  color: #7a5fc7;
}
.add-event-button[aria-expanded="true"] { /* Style when form is open */
    background-color: #fde8f0;
    color: #e14f81;
    border-color: #fbcfe0;
}

/* Event Form */
.event-form {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* More space */
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  flex-shrink: 0;
}
.event-form h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
}
.form-group {
    display: flex;
    flex-direction: column;
}
.form-group label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #555;
    margin-bottom: 0.25rem;
}
.event-form input[type="text"],
.event-form input[type="time"] {
  padding: 0.75rem; /* More padding */
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.event-form input:focus {
    outline: none;
    border-color: #8c68db;
    box-shadow: 0 0 0 2px rgba(140, 104, 219, 0.2);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
/* Base button style */
.button-cancel, .button-save {
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}
.button-cancel {
  background-color: #fff;
  border: 1px solid #d1d5db;
  color: #555;
}
.button-cancel:hover { background-color: #f9fafb; border-color: #aaa; }
.button-save {
  background-color: #8c68db;
  color: white;
  border: 1px solid #8c68db;
  box-shadow: 0 2px 5px rgba(140, 104, 219, 0.2);
}
.button-save:hover { background-color: #7a5fc7; border-color: #7a5fc7; }

/* Form transition */
.slide-fade-enter-active { transition: all .3s ease-out; }
.slide-fade-leave-active { transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0); }
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Events List */
.events-list-wrapper {
    flex-grow: 1; /* Takes remaining space */
    /* REMOVED overflow-y: auto */
     min-height: 100px; /* Prevent collapsing */
}
.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.events-list h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #555;
    margin: 0.5rem 0 0.75rem 0;
}

.event-item {
  padding: 0.75rem 1rem;
  background-color: #f8f5ff; /* Light purple tint */
  border: 1px solid #e9dffc;
  border-left: 4px solid #8c68db; /* Accent border */
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.event-dot.accent-dot { background-color: #8c68db; } /* Match accent color */

.event-details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}
.event-name { font-weight: 500; color: #333; font-size: 0.95rem;}
.event-time { color: #777; font-size: 0.85rem; }

.remove-event-button {
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  line-height: 1;
  transition: color 0.2s ease, background-color 0.2s ease;
}
.remove-event-button:hover { color: #ff6b6b; background-color: #fff1f1; }

/* Placeholder Messages */
.no-events, .no-date-selected {
  text-align: center;
  color: #999;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  flex-grow: 1;
}
.no-events i, .no-date-selected i {
    font-size: 2.5rem;
    color: #e0e0e0;
}
.no-events p, .no-date-selected p { margin: 0; line-height: 1.4;}

/* Responsive */
@media (max-width: 900px) { /* Tablet */
  .calendar-body {
    grid-template-columns: 1fr minmax(280px, 320px); /* Narrower event panel */
    gap: 1rem;
  }
}
@media (max-width: 768px) { /* Mobile */
  .calendar-body {
    grid-template-columns: 1fr; /* Stack columns */
     min-height: initial;
  }
  .event-panel {
    margin-top: 1.5rem; /* Space when stacked */
  }
  /* Maybe make calendar days smaller on mobile */
  .calendar-day { min-height: 60px; font-size: 0.85rem; padding: 0.3rem;}
  .weekday { padding: 0.5rem 0.2rem; font-size: 0.75rem; }
  .day-number { font-size: 0.8rem; }
  .today .day-number { width: 20px; height: 20px; }
}

/* Accessibility */
.sr-only { /* Define if not globally available */
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;
}
</style>
=======
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
>>>>>>> Security_Test
