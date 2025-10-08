<template>
  <!-- Root element for calendar content -->
  <div class="calendar-view-content">

    <!-- Calendar Header (Enhanced Navigation) -->
    <div class="calendar-navigation">
      <button @click="prevMonth" class="nav-button" aria-label="Previous month" title="Previous month">
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <!-- Month and Year Selectors -->
      <div class="date-selectors">
        <select v-model="selectedMonth" @change="updateCalendar" class="month-selector">
          <option v-for="(month, index) in monthNames" :key="index" :value="index">
            {{ month }}
          </option>
        </select>
        
        <select v-model="selectedYear" @change="updateCalendar" class="year-selector">
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
      
      <button @click="nextMonth" class="nav-button" aria-label="Next month" title="Next month">
        <i class="fas fa-chevron-right"></i>
      </button>
      
      <!-- Quick navigation buttons -->
      <div class="quick-nav">
        <button @click="goToToday" class="today-button" title="Go to today">
          <i class="fas fa-calendar-day"></i>
          Today
        </button>
      </div>
    </div>

    <!-- Calendar Body Grid (Calendar + Events Panel) -->
    <div class="calendar-body">

      <!-- Calendar Grid -->
      <div class="calendar-grid-wrapper">
        <div class="calendar-grid">
          <!-- Weekday headers -->
          <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>

          <!-- Calendar days -->
          <button
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-day"
            :class="{
              'outside-month': !day.currentMonth,
              'today': day.isToday,
              'selected': selectedDate === day.date,
              'has-events': hasEvents(day.date)
            }"
            @click="selectDay(day)"
            :aria-label="`Select day ${day.dayNumber}` + (day.isToday ? ' (Today)' : '') + (hasEvents(day.date) ? ' (Has events)' : '')"
            :aria-current="day.isToday ? 'date' : null"
            :disabled="!day.currentMonth"
          >
            <span class="day-number">{{ day.dayNumber }}</span>
            <!-- Event indicators -->
            <div v-if="hasEvents(day.date) && day.currentMonth" class="event-indicators">
              <span
                v-for="i in Math.min(getEventsForDate(day.date).length, 3)"
                :key="`dot-${index}-${i}`"
                class="event-dot"
              ></span>
            </div>
          </button>
        </div>
      </div>

      <!-- Event Panel -->
      <div class="event-panel">
        <div class="panel-header">
          <h3 v-if="selectedDate">{{ formatDate(selectedDate) }}</h3>
          <h3 v-else>Select a Date</h3>
          <button class="add-event-button" @click="toggleAddEventForm">
            <i class="fas fa-plus"></i> {{ isEditing ? "Edit Event" : "Add Event" }}
          </button>
        </div>

        <!-- Add/Edit Event Form -->
        <div v-if="showAddEventForm" class="event-form">
          <h4>{{ isEditing ? "Edit Event" : "Add Event" }}</h4>
          <div class="form-group">
            <label for="event-title">Title</label>
            <input id="event-title" v-model="eventForm.title" type="text" placeholder="Event Title" required />
          </div>
          <div class="form-group">
            <label for="event-description">Description</label>
            <input id="event-description" v-model="eventForm.description" type="text" placeholder="Event Description" />
          </div>
          <div class="form-group">
            <label for="event-date">Date</label>
            <input id="event-date" v-model="eventForm.date" type="date" required />
          </div>
          <div class="form-actions">
            <button class="button-cancel" @click="toggleAddEventForm">Cancel</button>
            <button class="button-save" @click="addOrUpdateEvent">{{ isEditing ? "Save Changes" : "Add Event" }}</button>
          </div>
        </div>

        <!-- Events list for selected day -->
        <div class="events-list-wrapper">
          <div v-if="selectedDate && getEventsForDate(selectedDate).length > 0" class="events-list">
            <h4>Scheduled Events</h4>
            <div
              v-for="(evt, i) in getEventsForDate(selectedDate)"
              :key="`evt-${selectedDate}-${i}`"
              class="event-item"
            >
              <span class="event-dot accent-dot" aria-hidden="true"></span>
              <div class="event-details">
                <span class="event-name">{{ evt.title }}</span>
                <span class="event-time">{{ evt.description }}</span>
              </div>
              <button class="remove-event-button" @click="deleteEvent(evt.id)">Delete</button>
              <button class="edit-event-button" @click="editEvent(evt)">Edit</button>
            </div>
          </div>

          <div v-else-if="selectedDate" class="no-events">
            <i class="fas fa-calendar-check"></i>
            <p>No events scheduled for this day.</p>
          </div>

          <div v-else class="no-date-selected">
            <i class="fas fa-hand-pointer"></i>
            <p>Select a day from the calendar to view or add events.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { initializeUser, fetchCoupleMilestones } from "../services/script";
import { addMilestone, updateMilestone, deleteMilestone } from "../services/apiService";

export default {
  name: "CalendarPage",
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      milestones: [],
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      monthNames: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ],
      showAddEventForm: false,
      isEditing: false,
      eventForm: {
        id: null,
        title: "",
        description: "",
        date: "",
      },
    };
  },
  computed: {
    currentMonthName() {
      return this.currentDate.toLocaleString("default", { month: "long" });
    },
    currentYear() {
      return this.currentDate.getFullYear();
    },
    selectedMonth: {
      get() {
        return this.currentDate.getMonth();
      },
      set(month) {
        this.currentDate = new Date(this.currentDate.getFullYear(), month, 1);
      }
    },
    selectedYear: {
      get() {
        return this.currentDate.getFullYear();
      },
      set(year) {
        this.currentDate = new Date(year, this.currentDate.getMonth(), 1);
      }
    },
    availableYears() {
      const currentYear = new Date().getFullYear();
      const years = [];
      // Show 10 years before and 10 years after current year
      for (let year = currentYear - 10; year <= currentYear + 10; year++) {
        years.push(year);
      }
      return years;
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
          isToday: false,
          date: this.formatDateString(date),
        });
      }

      // Days from the current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          dayNumber: i,
          currentMonth: true,
          isToday: this.isSameDay(date, today),
          date: this.formatDateString(date),
        });
      }

      // Days from the next month
      const totalDaysToShow = 42; // 6 rows of 7 days
      for (let i = 1; days.length < totalDaysToShow; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          dayNumber: i,
          currentMonth: false,
          isToday: false,
          date: this.formatDateString(date),
        });
      }

      return days;
    },
  },
  methods: {
    // Calendar navigation methods
    updateCalendar() {
      // Force reactivity update when month/year changes
      this.$forceUpdate();
    },
    goToToday() {
      const today = new Date();
      this.currentDate = today;
      this.selectedDate = today.toISOString().split("T")[0];
      
      // If the add event form is open, update the date field to today
      if (this.showAddEventForm && !this.isEditing) {
        this.eventForm.date = this.selectedDate;
      }
    },
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    
    async fetchCalendarData() {
      try {
        const user = await initializeUser();
        const coupleId = user.couple_id;

        if (!coupleId) {
          console.error("Couple ID is missing in the user profile.");
          return;
        }

        const fetchedMilestones = await fetchCoupleMilestones(coupleId);
        
        // Ensure milestones is always an array
        if (Array.isArray(fetchedMilestones)) {
          this.milestones = fetchedMilestones.map((milestone) => ({
            ...milestone,
            date: new Date(milestone.date).toISOString().split("T")[0],
          }));
        } else {
          console.warn("fetchCoupleMilestones did not return an array, initializing empty array");
          this.milestones = [];
        }
      } catch (error) {
        console.error("Failed to fetch calendar data:", error.message);
        // Ensure milestones is always an array even on error
        this.milestones = [];
      }
    },
    async addOrUpdateEvent() {
      try {
        const user = await initializeUser();
        const coupleId = user.couple_id;

        if (!coupleId) {
          alert("Couple ID is missing. Please link your partner.");
          return;
        }

        if (this.isEditing) {
          // Update existing milestone
          await updateMilestone(this.eventForm.id, this.eventForm.title, this.eventForm.description, this.eventForm.date);
          alert("Event updated successfully!");
        } else {
          // Add new milestone
          await addMilestone(coupleId, this.eventForm.title, this.eventForm.description, this.eventForm.date);
          alert("Event added successfully!");
        }

        this.showAddEventForm = false;
        this.resetEventForm();
        this.fetchCalendarData();
      } catch (error) {
        console.error("Failed to save event:", error.message);
        alert("Failed to save event. Please try again.");
      }
    },
    async deleteEvent(eventId) {
      try {
        if (confirm("Are you sure you want to delete this event?")) {
          await deleteMilestone(eventId);
          alert("Event deleted successfully!");
          this.fetchCalendarData();
        }
      } catch (error) {
        console.error("Failed to delete event:", error.message);
        alert("Failed to delete event. Please try again.");
      }
    },
    editEvent(event) {
      this.isEditing = true;
      this.eventForm = { ...event };
      this.showAddEventForm = true;
    },
    resetEventForm() {
      this.eventForm = {
        id: null,
        title: "",
        description: "",
        date: "",
      };
      this.isEditing = false;
    },
    selectDay(day) {
      if (!day.currentMonth) return;
      this.selectedDate = day.date;
      
      // If the add event form is open, update the date field
      if (this.showAddEventForm && !this.isEditing) {
        this.eventForm.date = day.date;
      }
    },
    hasEvents(dateString) {
      return Array.isArray(this.milestones) && this.milestones.some((milestone) => milestone.date === dateString);
    },
    getEventsForDate(dateString) {
      return Array.isArray(this.milestones) ? this.milestones.filter((milestone) => milestone.date === dateString) : [];
    },
    isSameDay(date1, date2) {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    },
    formatDateString(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    },
    formatDate(dateString) {
      if (!dateString) return "";
      const dateParts = dateString.split("-");
      const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      return date.toLocaleDateString(navigator.language || "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    toggleAddEventForm() {
      this.showAddEventForm = !this.showAddEventForm;
      
      if (this.showAddEventForm) {
        // When opening the form, pre-fill the date with selected date or today
        const dateToUse = this.selectedDate || new Date().toISOString().split("T")[0];
        this.eventForm.date = dateToUse;
        
        // If no date is selected, also select the date we're using
        if (!this.selectedDate) {
          this.selectedDate = dateToUse;
        }
      } else {
        // When closing the form, reset it
        this.resetEventForm();
      }
    },
  },
  created() {
    this.fetchCalendarData();
  },
};
</script>

<style scoped>
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
  gap: 1rem;
}

.date-selectors {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-grow: 1;
  justify-content: center;
}

.month-selector, .year-selector {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
}

.month-selector:hover, .year-selector:hover {
  border-color: #8c68db;
  background-color: #f3eefc;
}

.month-selector:focus, .year-selector:focus {
  outline: none;
  border-color: #8c68db;
  box-shadow: 0 0 0 2px rgba(140, 104, 219, 0.2);
}

.month-selector {
  min-width: 120px;
}

.year-selector {
  min-width: 80px;
}

.quick-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.today-button {
  background: #8c68db;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.today-button:hover {
  background: #7a5fc7;
  transform: translateY(-1px);
}

.today-button i {
  font-size: 0.8rem;
}
.nav-button {
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #8c68db;
  font-size: 1rem;
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