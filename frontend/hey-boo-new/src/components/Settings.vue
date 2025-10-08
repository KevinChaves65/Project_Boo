<template>
  <div class="settings-container">
    <div class="settings-body">
      <!-- Success message that appears after saving -->
      <div v-if="showSuccessMessage" class="success-message">
        <i class="fas fa-check-circle"></i> Settings saved successfully!
      </div>

      <!-- Personal Information Section -->
      <section class="settings-section">
        <h2><i class="fas fa-user"></i> Personal Information</h2>
        <div class="section-content">
          <div class="settings-card">
            <h3>Full Name</h3>
            <p>{{ fullName || 'Not set' }}</p>
          </div>
          <div class="settings-card">
            <h3>Username</h3>
            <p>{{ username || 'Not set' }}</p>
          </div>
          <div class="settings-card">
            <h3>Email</h3>
            <p>{{ email || 'Not set' }}</p>
          </div>
          <div class="settings-card">
            <h3>Phone Number</h3>
            <p>{{ phoneNumber || 'Not set' }}</p>
          </div>
          <div class="settings-card">
            <h3>Birthday</h3>
            <p>{{ formatDate(birthday) }}</p>
          </div>
          <div class="settings-card">
            <h3>Gender</h3>
            <p>{{ gender || 'Not set' }}</p>
          </div>
        </div>
      </section>

      <!-- Account Settings Section -->
      <section class="settings-section">
        <h2><i class="fas fa-user"></i> Account Settings</h2>
        
        <div class="section-content">
          <!-- Change Password Form -->
          <div class="settings-card">
            <h3>Change Password</h3>
            <form @submit.prevent="updatePassword">
              <div class="form-group">
                <label for="oldPassword">Current Password</label>
                <input 
                  id="oldPassword"
                  v-model="oldPassword" 
                  type="password" 
                  placeholder="Enter your current password"
                  :class="{ 'input-error': passwordErrors.old }"
                />
                <span v-if="passwordErrors.old" class="error-text">{{ passwordErrors.old }}</span>
              </div>
              
              <div class="form-group">
                <label for="newPassword">New Password</label>
                <input 
                  id="newPassword"
                  v-model="newPassword" 
                  type="password" 
                  placeholder="Enter your new password"
                  :class="{ 'input-error': passwordErrors.new }"
                />
                <span v-if="passwordErrors.new" class="error-text">{{ passwordErrors.new }}</span>
                
                <div v-if="newPassword" class="password-strength">
                  <div class="strength-meter">
                    <div 
                      class="strength-value" 
                      :style="{ width: passwordStrength.percent + '%' }"
                      :class="passwordStrength.level"
                    ></div>
                  </div>
                  <span class="strength-text">{{ passwordStrength.text }}</span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="confirmPassword">Confirm New Password</label>
                <input 
                  id="confirmPassword"
                  v-model="confirmPassword" 
                  type="password" 
                  placeholder="Confirm your new password"
                  :class="{ 'input-error': passwordErrors.confirm }"
                />
                <span v-if="passwordErrors.confirm" class="error-text">{{ passwordErrors.confirm }}</span>
              </div>
              
              <button 
                type="submit" 
                class="primary-button"
                :disabled="isLoading"
              >
                <span v-if="!isLoading">Update Password</span>
                <span v-else class="loading-spinner"></span>
              </button>
            </form>
          </div>
          
          <!-- Profile Settings -->
          <div class="settings-card">
            <h3>Profile Settings</h3>
            
            <div class="form-group">
              <label for="displayName">Display Name</label>
              <input 
                id="displayName"
                v-model="profile.name" 
                type="text" 
                placeholder="Your display name"
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <input 
                id="email"
                v-model="profile.email" 
                type="email" 
                placeholder="Your email address"
              />
            </div>
            
            <button 
              @click="saveProfile" 
              class="primary-button"
              :disabled="isLoading"
            >
              Save Profile
            </button>
          </div>
        </div>
      </section>
      
      <!-- Appearance Settings -->
      <section class="settings-section">
        <h2><i class="fas fa-palette"></i> Appearance</h2>
        
        <div class="section-content">
          <div class="settings-card">
            <h3>Theme Preferences</h3>
            
            <div class="toggle-option">
              <span>Theme Mode</span>
              <div class="theme-selector">
                <button 
                  @click="selectedTheme = 'light'" 
                  class="theme-button" 
                  :class="{ active: selectedTheme === 'light' }"
                >
                  <i class="fas fa-sun"></i> Light
                </button>
                <button 
                  @click="selectedTheme = 'dark'" 
                  class="theme-button" 
                  :class="{ active: selectedTheme === 'dark' }"
                >
                  <i class="fas fa-moon"></i> Dark
                </button>
              </div>
            </div>
            
            <div class="theme-preview" :class="selectedTheme">
              <div class="preview-header">Theme Preview</div>
              <div class="preview-content">
                <div class="preview-item"></div>
                <div class="preview-item"></div>
              </div>
            </div>
            
            <button @click="applyTheme" class="primary-button">Apply Theme</button>
          </div>
        </div>
      </section>
      
      <!-- Notification Settings -->
      <section class="settings-section">
        <h2><i class="fas fa-bell"></i> Notifications</h2>
        
        <div class="section-content">
          <div class="settings-card">
            <h3>Notification Preferences</h3>
            
            <div class="toggle-option">
              <span>Message Notifications</span>
              <label class="toggle">
                <input type="checkbox" v-model="notifications.messages">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="toggle-option">
              <span>Calendar Event Reminders</span>
              <label class="toggle">
                <input type="checkbox" v-model="notifications.calendar">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="toggle-option">
              <span>Special Occasion Alerts</span>
              <label class="toggle">
                <input type="checkbox" v-model="notifications.occasions">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="toggle-option">
              <span>Partner Activity Updates</span>
              <label class="toggle">
                <input type="checkbox" v-model="notifications.partner">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <button @click="saveNotifications" class="primary-button">Save Preferences</button>
          </div>
        </div>
      </section>
      
      <!-- Privacy Settings -->
      <section class="settings-section">
        <h2><i class="fas fa-lock"></i> Privacy</h2>
        
        <div class="section-content">
          <div class="settings-card">
            <h3>Privacy Controls</h3>
            
            <div class="toggle-option">
              <span>Share Calendar with Partner</span>
              <label class="toggle">
                <input type="checkbox" v-model="privacy.shareCalendar">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="toggle-option">
              <span>Allow Partner to See Location</span>
              <label class="toggle">
                <input type="checkbox" v-model="privacy.shareLocation">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="toggle-option">
              <span>Show Online Status</span>
              <label class="toggle">
                <input type="checkbox" v-model="privacy.showOnlineStatus">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <button @click="savePrivacy" class="primary-button">Save Privacy Settings</button>
          </div>
        </div>
      </section>
      
      <!-- Delete Account -->
      <section class="settings-section danger-section">
        <h2><i class="fas fa-exclamation-triangle"></i> Danger Zone</h2>
        
        <div class="section-content">
          <div class="settings-card danger-card">
            <h3>Delete Account</h3>
            <p>This action cannot be undone. All your data will be permanently deleted.</p>
            
            <button @click="confirmDeleteAccount" class="danger-button">
              Delete My Account
            </button>
          </div>
        </div>
      </section>
      <!-- Logout Button -->
<section class="settings-section danger-section">
  <h2><i class="fas fa-sign-out-alt"></i> Logout</h2>
  <div class="section-content">
    <div class="settings-card danger-card">
      <h3>Log Out</h3>
      <p>Click the button below to log out of your account.</p>
      <button @click="logout" class="danger-button">Log Out</button>
    </div>
  </div>
</section>
    </div>
  </div>
</template>

<script>
import { fetchUserProfile, updateUserProfile, changeUserPassword } from "../services/apiService";

export default {
  name: "SettingsPage",
  data() {
    return {
      // Personal Information
      fullName: "",
      username: "",
      email: "",
      phoneNumber: "",
      birthday: "",
      gender: "",

      // Password change
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      passwordErrors: {
        old: "",
        new: "",
        confirm: "",
      },

      // Profile
      profile: {
        name: "",
        email: "",
      },

      // Theme
      selectedTheme: "light",

      // Notifications
      notifications: {
        messages: true,
        calendar: true,
        occasions: true,
        partner: false,
      },

      // Privacy
      privacy: {
        shareCalendar: true,
        shareLocation: false,
        showOnlineStatus: true,
      },

      // UI state
      isLoading: false,
      showSuccessMessage: false,
    };
  },
  computed: {
    passwordStrength() {
      if (!this.newPassword) {
        return { percent: 0, level: '', text: '' };
      }
      
      let strength = 0;
      
      // Length check
      if (this.newPassword.length >= 8) strength += 25;
      
      // Character variety checks
      if (/[A-Z]/.test(this.newPassword)) strength += 25;
      if (/[0-9]/.test(this.newPassword)) strength += 25;
      if (/[^A-Za-z0-9]/.test(this.newPassword)) strength += 25;
      
      // Determine level
      let level = '';
      let text = '';
      
      if (strength <= 25) {
        level = 'weak';
        text = 'Weak';
      } else if (strength <= 50) {
        level = 'medium';
        text = 'Medium';
      } else if (strength <= 75) {
        level = 'good';
        text = 'Good';
      } else {
        level = 'strong';
        text = 'Strong';
      }
      
      return { percent: strength, level, text };
    }
  },
  methods: {
    async fetchUserProfile() {
      try {
        const user = await fetchUserProfile();
        console.log("User data received:", user); // Debug log
        
        // Populate user profile data
        this.fullName = user.full_name || 'Not set';
        this.username = user.username || 'Not set';
        this.email = user.email || 'Not set';
        this.phoneNumber = user.phone_number || 'Not set';
        this.birthday = user.birthday || '';
        this.gender = user.gender || 'Not set';
        
        // Populate profile form fields with current user data
        this.profile.name = user.full_name || '';
        this.profile.email = user.email || '';
      } catch (error) {
        console.error("Failed to fetch user profile:", error.response?.data || error.message);
        alert("Failed to load profile information. Please log in again.");
        this.$router.push("/login");
      }
    },
    formatDate(date) {
      if (!date) return "N/A";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    updatePassword() {
      // Reset errors
      this.passwordErrors = { old: "", new: "", confirm: "" };

      // Validate fields
      let isValid = true;

      if (!this.oldPassword) {
        this.passwordErrors.old = "Current password is required";
        isValid = false;
      }

      if (!this.newPassword) {
        this.passwordErrors.new = "New password is required";
        isValid = false;
      } else if (this.newPassword.length < 8) {
        this.passwordErrors.new = "Password must be at least 8 characters";
        isValid = false;
      }

      if (!this.confirmPassword) {
        this.passwordErrors.confirm = "Please confirm your password";
        isValid = false;
      } else if (this.confirmPassword !== this.newPassword) {
        this.passwordErrors.confirm = "Passwords don't match";
        isValid = false;
      }

      if (!isValid) return;

      // Call API to change password
      this.isLoading = true;
      
      const performPasswordChange = async () => {
        try {
          await changeUserPassword(this.oldPassword, this.newPassword);
          
          // Reset form fields
          this.oldPassword = "";
          this.newPassword = "";
          this.confirmPassword = "";
          
          // Show success message
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        } catch (error) {
          // Handle specific error cases
          if (error.response?.data?.error) {
            if (error.response.data.error.includes("current password")) {
              this.passwordErrors.old = "Current password is incorrect";
            } else if (error.response.data.error.includes("password must")) {
              this.passwordErrors.new = error.response.data.error;
            } else {
              alert("Failed to change password: " + error.response.data.error);
            }
          } else {
            alert("Failed to change password. Please try again.");
          }
        } finally {
          this.isLoading = false;
        }
      };
      
      performPasswordChange();
    },
    saveProfile() {
      // Validate profile data
      if (!this.profile.name.trim()) {
        alert("Display name is required");
        return;
      }
      
      if (!this.profile.email.trim()) {
        alert("Email address is required");
        return;
      }

      this.isLoading = true;
      
      const performProfileUpdate = async () => {
        try {
          await updateUserProfile(this.profile.name, this.profile.email);
          
          // Update the display data with new values
          this.fullName = this.profile.name;
          this.email = this.profile.email;
          
          // Show success message
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        } catch (error) {
          if (error.response?.data?.error) {
            alert("Failed to update profile: " + error.response.data.error);
          } else {
            alert("Failed to update profile. Please try again.");
          }
        } finally {
          this.isLoading = false;
        }
      };
      
      performProfileUpdate();
    },
    applyTheme() {
      // In a real app, this would apply the theme to the entire application
      // For demo purposes, just show success message
      document.body.className = this.selectedTheme;

      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    },
    saveNotifications() {
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
        this.showSuccessMessage = true;

        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      }, 1000);
    },
    savePrivacy() {
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
        this.showSuccessMessage = true;

        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      }, 1000);
    },
    confirmDeleteAccount() {
      if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        alert("Account deletion process initiated. You will receive a confirmation email.");
      }
    },
    logout() {
      // Get session identifier for multi-user testing
      const urlParams = new URLSearchParams(window.location.search);
      const sessionParam = urlParams.get('session');
      const sessionId = sessionParam ? `_session_${sessionParam}` : '';
      
      // Clear the token from localStorage
      localStorage.removeItem(`token${sessionId}`);

      // Redirect to the login page
      this.$router.push("/login");
    },
  },
  created() {
    this.fetchUserProfile();
  },
};
</script>

<style scoped>
/* Container with consistent sizing */
.settings-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: "Helvetica Neue", Arial, sans-serif;
  background-color: #f9f9f9;
}

/* Header styling */
.settings-header {
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.settings-header h1 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #8c68db;
  color: #fff;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: #7a5fc7;
}

/* Settings body */
.settings-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* Success message */
.success-message {
  background-color: #4caf50;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Section styling */
.settings-section {
  margin-bottom: 2rem;
}

.settings-section h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.section-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 600px;
}

/* Cards styling */
.settings-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.settings-card h3 {
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: #8c68db;
  font-size: 1.1rem;
}

/* Personal Information specific styling */
.settings-card p {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border-left: 3px solid #8c68db;
  min-height: 1.2rem;
  word-wrap: break-word;
}

/* Form styling */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus {
  border-color: #8c68db;
  box-shadow: 0 0 0 2px rgba(140, 104, 219, 0.1);
  outline: none;
}

.input-error {
  border-color: #ff6b6b !important;
}

.error-text {
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

/* Password strength meter */
.password-strength {
  margin-top: 0.5rem;
}

.strength-meter {
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-value {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-value.weak { background-color: #ff6b6b; }
.strength-value.medium { background-color: #ffb347; }
.strength-value.good { background-color: #4caf50; }
.strength-value.strong { background-color: #2e7d32; }

.strength-text {
  font-size: 0.8rem;
  color: #777;
}

/* Button styling */
.primary-button {
  background-color: #8c68db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.primary-button:hover {
  background-color: #7a5fc7;
}

.primary-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.danger-button {
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.danger-button:hover {
  background-color: #e74c3c;
}

/* Toggle options */
.toggle-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.toggle-option span {
  font-weight: 500;
  color: #555;
}

/* Toggle switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #8c68db;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* Theme selector */
.theme-selector {
  display: flex;
  gap: 0.5rem;
}

.theme-button {
  background-color: #f0f0f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-button.active {
  background-color: #8c68db;
  color: white;
}

/* Theme preview */
.theme-preview {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
  border: 1px solid #eee;
  transition: all 0.3s ease;
}

.theme-preview.dark {
  background-color: #333;
  color: white;
}

.preview-header {
  padding: 0.75rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
  font-weight: 500;
}

.theme-preview.dark .preview-header {
  background-color: #444;
  border-color: #555;
}

.preview-content {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-item {
  height: 16px;
  border-radius: 4px;
  background-color: #eee;
}

.theme-preview.dark .preview-item {
  background-color: #555;
}

/* Danger zone */
.danger-section h2 {
  color: #ff6b6b;
}

.danger-card {
  border: 1px solid #ffcdd2;
}

.danger-card h3 {
  color: #ff6b6b;
}

.danger-card p {
  margin-bottom: 1rem;
  color: #777;
}

/* Loading spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .settings-header, .settings-body {
    padding: 1rem;
  }
  
  .section-content {
    grid-template-columns: 1fr;
  }
}
</style>
