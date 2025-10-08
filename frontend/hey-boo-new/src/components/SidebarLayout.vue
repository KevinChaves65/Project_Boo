<template>
    <div class="layout-container">
      <!-- Sidebar navigation -->
      <div class="sidebar">
        <div class="sidebar-header">
          <h2>Hey Boo</h2>
          <!-- Session indicator for development -->
          <div v-if="sessionId" class="session-indicator">
            <small>Session: {{ sessionId }}</small>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li>
              <router-link to="/dashboard">
                <i class="fas fa-home"></i>
                <span>Dashboard</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/date-ideas">
                <i class="fas fa-lightbulb"></i>
                <span>Date Ideas</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/Word Bank">
                <i class="fas fa-magic"></i>
                <span>Word Bank</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/calendar">
                <i class="fas fa-calendar-alt"></i>
                <span>Calendar</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/settings">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
              </router-link>
            </li>
          </ul>
        </nav>
        
        <div class="sidebar-footer">
          <button class="logout-button">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      <!-- Main content area -->
      <div class="main-content">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "SidebarLayout",
    computed: {
      sessionId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('session') || null;
      }
    }
  }
  </script>
  
  <style scoped>
  .layout-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
    font-family: "Helvetica Neue", Arial, sans-serif;
  }
  
  .sidebar {
    width: 250px;
    background-color: var(--bg-white);
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .sidebar-header h2 {
    margin: 0;
    color: var(--primary-color);
    font-size: 1.5rem;
  }
  
  .session-indicator {
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: var(--bg-secondary);
    border-radius: 4px;
    border-left: 3px solid var(--info-color);
  }
  
  .session-indicator small {
    color: var(--info-dark);
    font-weight: 500;
    font-size: 0.75rem;
  }
  
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0;
  }
  
  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .nav-list li {
    margin-bottom: 0.5rem;
  }
  
  .nav-list a {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    color: var(--text-primary);
    text-decoration: none;
    transition: all 0.2s ease;
    gap: 0.75rem;
  }
  
  .nav-list a:hover {
    background-color: var(--bg-primary-light);
    color: var(--primary-color);
  }
  
  .nav-list a.router-link-active {
    background-color: var(--bg-primary-light);
    color: var(--primary-color);
    border-left: 3px solid var(--primary-color);
  }
  
  .sidebar-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-color);
  }
  
  .logout-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: var(--bg-muted);
    border: none;
    border-radius: 4px;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .logout-button:hover {
    background-color: var(--primary-color);
    color: var(--text-white);
  }
  
  .main-content {
    flex: 1;
    overflow-y: auto;
    background-color: var(--bg-primary);
  }
  
  @media (max-width: 768px) {
    .sidebar {
      width: 70px;
    }
    
    .sidebar-header h2 {
      display: none;
    }
    
    .nav-list a span {
      display: none;
    }
    
    .nav-list a {
      justify-content: center;
      padding: 0.75rem;
    }
    
    .logout-button span {
      display: none;
    }
  }
  </style>
  