<template>
  <!-- Root element for calendar content -->
  <div class="calendar-view-content">

    <!-- Calendar Header (Navigation Only) -->
    <div class="calendar-navigation">
      <button @click="prevMonth" class="nav-button" aria-label="Previous month" title="Previous month">
        <i class="fas fa-chevron-left"></i>
      </button>
      <h2>{{ currentMonthName }} {{ currentYear }}</h2>
      <button @click="nextMonth" class="nav-button" aria-label="Next month" title="Next month">
        <i class="fas fa-chevron-right"></i>
      </button>
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
            <!-- Event indicators - more visual -->
             <div v-if="hasEvents(day.date) && day.currentMonth" class="event-indicators">
                 <!-- Show up to 3 dots -->
                <span v-for="i in Math.min(getEventsForDate(day.date).length, 3)" :key="`dot-${index}-${i}`" class="event-dot"></span>
            </div>
          </button>
        </div>
      </div>

      <!-- Event Panel -->
      <div class="event-panel">
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
      </div>
    </div>
  </div>
</template>

<script>
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
    };
  },
  computed: {
    currentMonthName() {
      return this.currentDate.toLocaleString('default', { month: 'long' });
    },
    currentYear() {
      return this.currentDate.getFullYear();
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 6=Sat
      const lastDayOfPrevMonthDate = new Date(year, month, 0); // Date object for last day of prev month
      const lastDayOfPrevMonth = lastDayOfPrevMonthDate.getDate();

      const days = [];
      const today = new Date(); // Compare against today

      // Days from previous month
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayNumber = lastDayOfPrevMonth - i;
        const date = new Date(year, month - 1, dayNumber);
        days.push({
          dayNumber,
          currentMonth: false,
          isToday: false, // Cannot be today if not current month
          date: this.formatDateString(date)
        });
      }

      // Days from current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          dayNumber: i,
          currentMonth: true,
          isToday: this.isSameDay(date, today),
          date: this.formatDateString(date)
        });
      }

      // Days from next month (ensure grid fills 6 rows = 42 cells)
       const totalCells = days.length <= 35 ? 35 : 42; // Show 5 or 6 rows
      const daysFromNextMonth = totalCells - days.length;
      for (let i = 1; i <= daysFromNextMonth; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          dayNumber: i,
          currentMonth: false,
          isToday: false,
          date: this.formatDateString(date)
        });
      }

      return days;
    },
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