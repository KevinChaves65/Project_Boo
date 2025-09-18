<template>
    <div class="layout-container">
      <!-- Sidebar navigation -->
      <div class="sidebar">
        <div class="sidebar-header">
          <h2>Hey Boo</h2>
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
    name: "SidebarLayout"
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
    background-color: #fff;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .sidebar-header h2 {
    margin: 0;
    color: #8c68db;
    font-size: 1.5rem;
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
    color: #333;
    text-decoration: none;
    transition: all 0.2s ease;
    gap: 0.75rem;
  }
  
  .nav-list a:hover {
    background-color: #f5f0ff;
    color: #8c68db;
  }
  
  .nav-list a.router-link-active {
    background-color: #f5f0ff;
    color: #8c68db;
    border-left: 3px solid #8c68db;
  }
  
  .sidebar-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #eee;
  }
  
  .logout-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: #f0f0f0;
    border: none;
    border-radius: 4px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .logout-button:hover {
    background-color: #ff80b0;
    color: white;
  }
  
  .main-content {
    flex: 1;
    overflow-y: auto;
    background-color: #f9f9f9;
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
  