<template>
  <!-- This component relies on the parent/global styles for centering/background -->
  <div class="heyboo-container">
    <div class="link-partner-card">
       <!-- Optional: Add a relevant icon -->
       <div class="card-icon">
          <i class="fas fa-link"></i>
       </div>

      <h2>Link with Your Partner</h2>
      <p class="subtitle">Enter your partner's unique Hey Boo ID to connect your accounts.</p>

      <form @submit.prevent="linkPartner" class="link-form">
        <div class="form-group">
            <label for="partnerId">Partner's Hey Boo ID</label>
            <input
              id="partnerId"
              v-model="partnerId"
              type="text"
              placeholder="Enter ID here..."
              required
              aria-required="true"
            />
        </div>

        <!-- Add loading state if linking takes time -->
        <button type="submit" class="link-button" :disabled="!partnerId.trim() || isLoading">
           <span v-if="isLoading">
               <i class="fas fa-spinner fa-spin"></i> Linking...
           </span>
           <span v-else>
               <i class="fas fa-link"></i> Link Accounts
           </span>
        </button>
      </form>

       <!-- Optional: Add a skip or help link -->
       <div class="footer-links">
            <router-link to="/dashboard" class="skip-link">Skip for now</router-link>
            <!-- <a href="/help/linking" class="help-link">Need help?</a> -->
       </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LinkPartner",
  data() {
    return {
      partnerId: "",
      isLoading: false, // Added loading state
    };
  },
  methods: {
    async linkPartner() {
      if (!this.partnerId.trim() || this.isLoading) return;

      this.isLoading = true;
      console.log(`Attempting to link with partner ID: ${this.partnerId}`);

      // --- Simulate API Call ---
      // In a real app, you would make an API call here to validate
      // the partner ID and create the link on the backend.
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      // --- End Simulation ---

      this.isLoading = false;

      // --- Handle Success/Error (Example) ---
      // Replace with actual API response handling
      const success = Math.random() > 0.2; // Simulate 80% success rate

      if (success) {
          // Show success feedback (using alert for now, consider toast notifications)
          alert("Successfully linked with your partner!");
          // Navigate to the main dashboard
          this.$router.push("/dashboard");
      } else {
          alert("Failed to link accounts. Please check the Partner ID and try again.");
          this.partnerId = ""; // Clear input on failure
      }
    }
  }
};
</script>

<style scoped>
/* Ensure .heyboo-container provides centering if needed, or remove if handled by router layout */
/* .heyboo-container might need margin: auto; or be placed inside a flex container */

.link-partner-card {
  background: #ffffff;
  padding: 2.5rem 2rem; /* More padding */
  border-radius: 16px; /* More rounded */
  text-align: center;
  /* max-width: 400px; - handled by heyboo-container */
  width: 100%;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); /* Softer shadow */
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content */
}

.card-icon {
    font-size: 2.5rem;
    color: #fff;
    background: linear-gradient(135deg, #8c68db, #a66fd5); /* Theme gradient */
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    box-shadow: 0 4px 8px rgba(140, 104, 219, 0.3);
}

h2 {
  margin-top: 0;
  margin-bottom: 0.5rem; /* Reduced margin */
  font-family: "Helvetica Neue", sans-serif;
  font-size: 1.5rem; /* Larger title */
  font-weight: 600;
  color: #333;
}

.subtitle {
    font-size: 0.95rem;
    color: #667;
    margin-bottom: 2rem; /* More space before form */
    max-width: 300px;
    line-height: 1.5;
}

.link-form {
  display: flex;
  flex-direction: column;
  align-items: stretch; /* Stretch items to full width */
  gap: 1.25rem; /* Space between form elements */
  width: 100%;
  max-width: 300px; /* Limit form width */
}

.form-group {
    display: flex;
    flex-direction: column;
    text-align: left; /* Align label left */
}

label {
  font-weight: 500; /* Slightly less bold */
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.4rem; /* Space between label and input */
}

input[type="text"] {
  padding: 0.85rem 1rem; /* More padding */
  width: 100%; /* Take full width of container */
  border: 1px solid #d1d5db; /* Softer border */
  border-radius: 8px; /* More rounded */
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
input[type="text"]:focus {
  outline: none;
  border-color: #8c68db;
  box-shadow: 0 0 0 3px rgba(140, 104, 219, 0.15);
}
input[type="text"]::placeholder {
    color: #a0aec0;
}

.link-button {
  background: #ff80b0; /* HeyBoo Pink */
  color: #fff;
  border: none;
  padding: 0.85rem 1.5rem; /* Consistent padding */
  border-radius: 25px; /* Rounded button */
  font-weight: 600; /* Bolder text */
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex; /* Allows icon centering */
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 3px 8px rgba(255, 128, 176, 0.3);
}

.link-button:hover:not(:disabled) {
  background-color: #ff66a3; /* Darker pink */
  box-shadow: 0 5px 12px rgba(255, 128, 176, 0.4);
  transform: translateY(-1px);
}
.link-button:disabled {
    background-color: #cccccc;
    color: #888;
    box-shadow: none;
    cursor: not-allowed;
}
.link-button i {
    transition: transform 0.3s ease;
}
.link-button:hover:not(:disabled) i:not(.fa-spinner) {
    transform: scale(1.1);
}

.footer-links {
    margin-top: 2rem; /* Space above links */
    font-size: 0.85rem;
}
.skip-link {
    color: #778;
    text-decoration: none;
    transition: color 0.2s ease;
}
.skip-link:hover {
    color: #333;
    text-decoration: underline;
}

/* Optional: Add styles for a help link if needed */
/* .help-link { margin-left: 1rem; color: #8c68db; } */

</style>