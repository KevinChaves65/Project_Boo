<template>
  <div class="link-partner-container">
    <div class="link-partner-box">
      <div class="header-section">
        <h2>Link with a Partner</h2>
        <button @click="logout" class="logout-button">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
      
      <!-- Display user's account ID -->
      <div class="account-id-section">
        <p class="account-id-label">Your Account ID is:</p>
        <div class="account-id-display">
          <span v-if="userAccountId" class="account-id">{{ userAccountId }}</span>
          <span v-else class="loading-text">Loading...</span>
        </div>
        <p class="account-id-help">Share this ID with your partner so they can link with you.</p>
      </div>
      
      <div class="divider"></div>
      
      <form @submit.prevent="linkPartner">
        <label for="partnerId">Enter your partner's ID:</label>
        <input
          id="partnerId"
          v-model="partnerId"
          type="text"
          placeholder="Partner ID"
          required
        />
        <button type="submit" :disabled="isLoading">
          <span v-if="isLoading">Linking...</span>
          <span v-else>Link Partner</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { linkCouple, fetchUserProfile } from "../services/apiService";

export default {
  name: "LinkPartner",
  data() {
    return {
      partnerId: "", // Input for partner's ID
      isLoading: false, // Loading state for the button
      userAccountId: null, // Current user's account ID
    };
  },
  async mounted() {
    // Fetch user profile to get account ID
    await this.fetchUserAccountId();
  },
  methods: {
    async fetchUserAccountId() {
      try {
        const user = await fetchUserProfile();
        this.userAccountId = user.id;
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        this.userAccountId = "Error loading ID";
      }
    },
    async linkPartner() {
      if (!this.partnerId.trim()) {
        alert("Please enter a valid Partner ID.");
        return;
      }

      this.isLoading = true;
      try {
        // Call the API to link the partner
        await linkCouple(this.partnerId);

        alert("Successfully linked with your partner!");
        this.$router.push("/dashboard"); // Redirect to the dashboard
      } catch (error) {
        console.error("Failed to link partner:", error.response?.data || error.message);
        alert(error.response?.data?.error || "Failed to link partner. Please try again.");
      } finally {
        this.isLoading = false;
      }
    },
    async logout() {
      try {
        // Clear user data from storage
        await chrome.storage.sync.clear();
        
        // Notify background script of logout
        chrome.runtime.sendMessage({ action: 'logout' });
        
        // Redirect to login screen
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        // Fallback - still redirect to login
        this.$router.push('/login');
      }
    },
  },
};
</script>

<style scoped>
.link-partner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f8f8;
}

.link-partner-box {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.link-partner-box h2 {
  margin: 0;
  font-family: "Helvetica Neue", sans-serif;
  flex-grow: 1;
}

.logout-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #c82333;
}

.logout-button i {
  font-size: 0.9rem;
}

.account-id-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.account-id-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.9rem;
}

.account-id-display {
  margin-bottom: 0.5rem;
}

.account-id {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: bold;
  color: #8c68db;
  background: white;
  padding: 0.5rem 1rem;
  border: 1px solid #8c68db;
  border-radius: 4px;
  display: inline-block;
  letter-spacing: 1px;
}

.loading-text {
  color: #666;
  font-style: italic;
}

.account-id-help {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  line-height: 1.3;
}

.divider {
  height: 1px;
  background: #e0e0e0;
  margin: 1.5rem 0;
}

.link-partner-box form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.link-partner-box label {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.link-partner-box input {
  padding: 0.75rem;
  width: 220px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.link-partner-box button {
  background-color: #8c68db;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.link-partner-box button:hover {
  background-color: #7a5fc7;
}
</style>