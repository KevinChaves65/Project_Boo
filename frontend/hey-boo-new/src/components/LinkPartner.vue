<template>
  <div class="link-partner-container">
    <div class="link-partner-box">
      <h2>Link with a Partner</h2>
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
import { linkCouple } from "../services/apiService";

export default {
  name: "LinkPartner",
  data() {
    return {
      partnerId: "", // Input for partner's ID
      isLoading: false, // Loading state for the button
    };
  },
  methods: {
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

.link-partner-box h2 {
  margin-bottom: 1rem;
  font-family: "Helvetica Neue", sans-serif;
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