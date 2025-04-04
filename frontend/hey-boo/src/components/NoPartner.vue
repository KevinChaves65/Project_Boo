<template>
  <!-- Component relies on parent/global styles for centering/background -->
  <div class="heyboo-container">
    <div class="no-partner-card">
      <!-- Engaging Icon -->
      <div class="card-icon">
        <i class="fas fa-user-plus"></i> <!-- Or fa-heart-broken, fa-link -->
      </div>

      <h2>Ready to Connect?</h2>
      <p class="info-text">
        It looks like you haven't linked with your partner yet. Connecting allows you to share calendars, date ideas, and more!
      </p>

      <button @click="goToLinkPartner" class="link-button">
          <i class="fas fa-link"></i> Link with Partner
      </button>

      <!-- Optional: Link back to dashboard or skip -->
      <div class="footer-action">
         <router-link to="/dashboard" class="skip-link">Maybe Later</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NoPartner",
  methods: {
    goToLinkPartner() {
      // Navigate to the partner-linking page
      this.$router.push("/link-partner");
    }
  }
};
</script>

<style scoped>
/* Assuming .heyboo-container provides centering */

.no-partner-card {
  background: #ffffff;
  padding: 2.5rem 2rem; /* Generous padding */
  border-radius: 16px; /* Consistent rounded corners */
  text-align: center;
  /* max-width: 400px; - handled by heyboo-container */
  width: 100%;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); /* Consistent shadow */
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content */
}

.card-icon {
    font-size: 2.5rem; /* Icon size */
    color: #fff;
    background: linear-gradient(135deg, #ff80b0, #ffabc9); /* Use pink gradient */
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem; /* Space below icon */
    box-shadow: 0 4px 8px rgba(255, 128, 176, 0.3); /* Pink shadow */
}

h2 {
  margin-top: 0;
  margin-bottom: 0.75rem; /* Space below heading */
  font-family: "Helvetica Neue", sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.info-text {
  margin-bottom: 2rem; /* Space below text */
  font-size: 1rem; /* Readable size */
  line-height: 1.6; /* Improved line spacing */
  color: #556; /* Slightly darker grey */
  max-width: 320px; /* Limit text width */
}

.link-button {
  background: linear-gradient(135deg, #8c68db, #a66fd5); /* Theme gradient */
  color: #fff;
  border: none;
  padding: 0.85rem 2rem; /* Generous padding */
  border-radius: 25px; /* Fully rounded */
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem; /* Space between icon and text */
  box-shadow: 0 3px 8px rgba(140, 104, 219, 0.3); /* Theme shadow */
  min-width: 200px; /* Ensure decent button width */
}

.link-button:hover {
  background: linear-gradient(135deg, #7a5fc7, #9d63c7); /* Darker gradient */
  box-shadow: 0 5px 12px rgba(140, 104, 219, 0.4);
  transform: translateY(-1px);
}

.link-button i {
    transition: transform 0.3s ease;
}
.link-button:hover i {
    transform: rotate(-5deg) scale(1.1); /* Subtle icon animation */
}

.footer-action {
    margin-top: 1.5rem; /* Space above skip link */
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
</style>