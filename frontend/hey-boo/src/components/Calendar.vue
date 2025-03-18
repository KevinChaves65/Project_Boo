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
            'has-events': hasEvents(day.date)
          }"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.dayNumber }}</div>
          <!-- Event indicators -->
          <div v-if="hasEvents(day.date)" class="event-indicator"></div>
        </div>
      </div>

      <!-- Event Panel -->
      <div class="event-panel">
        <h3>
          {{ selectedDate ? formatDate(selectedDate) : 'Select a date' }}
          <button v-if="selectedDate" class="add-event-button" @click="showEventForm = true">
            <i class="fas fa-plus"></i> Add Event
          </button>
        </h3>
        
        <!-- Event form -->
        <form v-if="showEventForm" @submit.prevent="addEvent" class="event-form">
          <input v-model="newEvent.name" type="text" placeholder="Event name" required>
          <input v-model="newEvent.time" type="time" required>
          <div class="form-actions">
            <button type="button" @click="showEventForm = false" class="cancel-button">Cancel</button>
            <button type="submit" class="save-button">Save</button>
          </div>
        </form>
        
        <!-- Events list for selected day -->
        <div v-if="selectedDate && getEventsForDate(selectedDate).length > 0" class="events-list">
          <div 
            v-for="(evt, i) in getEventsForDate(selectedDate)" 
            :key="i"
            class="event-item"
          >
            <div class="event-time">{{ formatTime(evt.time) }}</div>
            <div class="event-name">{{ evt.name }}</div>
            <button @click="removeEvent(evt)" class="remove-event">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div v-else-if="selectedDate" class="no-events">
          No events scheduled for this day
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CalendarPage",
  data() {
    return {
      // Current date tracking
      currentDate: new Date(),
      selectedDate: null,
      
      // Event handling
      showEventForm: false,
      newEvent: {
        name: "",
        time: ""
      },
      events: [], // Will store events as {date: '2025-03-18', time: '15:30', name: 'Event name'}
      
      // Window dimensions
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      
      // Calendar constants
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
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
      
      // Create date for first day of month
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      
      // Get day of week for first day (0-6, where 0 is Sunday)
      const firstDayOfWeek = firstDayOfMonth.getDay();
      
      // Calculate days from previous month to show
      const daysFromPrevMonth = firstDayOfWeek;
      
      // Get the last day of previous month
      const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
      
      const days = [];
      const today = new Date();
      
      // Add days from previous month
      for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        const dayNumber = lastDayOfPrevMonth - i;
        const date = new Date(year, month - 1, dayNumber);
        days.push({
          dayNumber,
          currentMonth: false,
          isToday: false,
          date: this.formatDateString(date)
        });
      }
      
      // Add days from current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          dayNumber: i,
          currentMonth: true,
          isToday: this.isSameDay(date, today),
          date: this.formatDateString(date)
        });
      }
      
      // Calculate days needed from next month
      const totalDaysToShow = 42; // 6 rows of 7 days
      const daysFromNextMonth = totalDaysToShow - days.length;
      
      // Add days from next month
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
    }
  },
  created() {
    // Add window resize event listener
    window.addEventListener('resize', this.handleResize);
    
    // Load any saved events from localStorage (in a real app)
    const savedEvents = localStorage.getItem('heyBooEvents');
    if (savedEvents) {
      this.events = JSON.parse(savedEvents);
    }
  },
  destroyed() {
    // Remove window resize event listener
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    // Calendar navigation
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    
    // Date selection
    selectDay(day) {
      this.selectedDate = day.date;
      this.showEventForm = false;
    },
    
    // Event handling
    addEvent() {
      if (this.newEvent.name && this.newEvent.time && this.selectedDate) {
        this.events.push({
          date: this.selectedDate,
          time: this.newEvent.time,
          name: this.newEvent.name
        });
        
        // In a real app, save to localStorage or backend
        localStorage.setItem('heyBooEvents', JSON.stringify(this.events));
        
        this.newEvent.name = "";
        this.newEvent.time = "";
        this.showEventForm = false;
      }
    },
    removeEvent(event) {
      const index = this.events.findIndex(e => 
        e.date === event.date && e.time === event.time && e.name === event.name
      );
      if (index !== -1) {
        this.events.splice(index, 1);
        // Update localStorage
        localStorage.setItem('heyBooEvents', JSON.stringify(this.events));
      }
    },
    
    // Helper methods
    formatDateString(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() && 
             date1.getMonth() === date2.getMonth() && 
             date1.getFullYear() === date2.getFullYear();
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    },
    formatTime(timeString) {
      // Convert 24h time to 12h format
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    },
    getEventsForDate(dateString) {
      return this.events.filter(event => event.date === dateString).sort((a, b) => a.time.localeCompare(b.time));
    },
    hasEvents(dateString) {
      return this.events.some(event => event.date === dateString);
    },
    
    // Window resize handler
    handleResize() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    }
  }
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .calendar-body {
    grid-template-columns: 1fr;
  }
  
  .event-panel {
    margin-top: 1rem;
  }
}
</style>
