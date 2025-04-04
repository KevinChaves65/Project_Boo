<template>
  <div class="login-container">
    <div class="login-card">
      <img src="/logo.jpeg" alt="Hey Boo Logo" class="heyboo-logo" />
      <h2>Welcome Back!</h2>
      <p class="subtitle">Log in to continue your journey.</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Email Input -->
        <div class="form-group">
          <label for="email-input" class="sr-only">Email</label>
          <div class="input-wrapper">
             <i class="fas fa-envelope input-icon"></i>
             <input
                id="email-input"
                v-model="email"
                type="email"
                placeholder="Email Address"
                required
                aria-required="true"
             />
          </div>
        </div>

        <!-- Password Input -->
        <div class="form-group">
            <label for="password-input" class="sr-only">Password</label>
           <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                 id="password-input"
                 v-model="password"
                 type="password"
                 placeholder="Password"
                 required
                 aria-required="true"
              />
              <!-- Optional: Add show/hide password toggle -->
           </div>
            <!-- Optional: Forgot Password Link -->
           <a href="#" class="forgot-password-link">Forgot Password?</a>
        </div>

        <!-- Login Button with Loading State -->
        <button class="login-button" type="submit" :disabled="isLoading || !email || !password">
          <span v-if="isLoading">
            <i class="fas fa-spinner fa-spin"></i> Logging In...
          </span>
          <span v-else>
             <i class="fas fa-sign-in-alt"></i> Log In
          </span>
        </button>
      </form>

      <!-- Sign Up Link -->
      <div class="signup-prompt">
        Don't have an account?
        <router-link to="/signup" class="signup-link">Sign Up</router-link>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "LoginScreen",
  data() {
    return {
      email: "",
      password: "",
      isLoading: false,
    };
  },
  methods: {
    async handleLogin() {
      // Basic validation client-side (HTML5 required handles empty)
      if (!this.email || !this.password || this.isLoading) return;

      this.isLoading = true;
      console.log("Attempting login for:", this.email);

      // --- Simulate API Call ---
      // Replace with your actual authentication logic (e.g., call to backend API)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      // --- End Simulation ---

       // --- Handle Success/Error ---
       const loginSuccess = Math.random() > 0.3; // Simulate success/failure

       if (loginSuccess) {
          console.log("Login successful");
           // Example: Save token, update user state
           // Navigate to the next appropriate screen
           // Check if partner is linked (you might fetch this info after login)
           const hasPartner = false; // Replace with actual check
           if (hasPartner) {
               this.$router.push("/dashboard");
           } else {
               this.$router.push("/no-partner"); // Go to link partner prompt
           }
       } else {
           console.log("Login failed");
            alert("Login failed. Please check your email and password.");
           this.isLoading = false; // Reset loading state only on failure here
       }
       // Note: isLoading might stay true until navigation completes in real app
       // For simulation, we set it false here on failure, success navigates away.
    }
  }
};
</script>

<style scoped>
/* Container styling - Keeping gradient, ensure full coverage */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh; /* Full viewport height */
  background: linear-gradient(135deg, rgba(255, 128, 176, 0.9), rgba(168, 102, 221, 0.9)); /* Slightly stronger gradient */
  padding: 1rem; /* Add padding for small screens */
}

/* Card styling - Modernized */
.login-card {
  background-color: #ffffff;
  padding: 2.5rem 2rem; /* More padding */
  border-radius: 16px; /* More rounded */
  max-width: 380px; /* Slightly wider */
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); /* Softer, larger shadow */
  border: 1px solid rgba(255, 255, 255, 0.3); /* Subtle border */
  backdrop-filter: blur(5px); /* Optional blur effect if background is complex */
  background-clip: padding-box; /* Fix potential border issues with blur */
}

/* Logo styling */
.heyboo-logo {
  width: 70px; /* Slightly smaller */
  height: auto;
  margin-bottom: 1.5rem; /* More space below */
  border-radius: 15%; /* Match dashboard */
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

h2 {
    font-size: 1.6rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
}

.subtitle {
    font-size: 0.95rem;
    color: #667;
    margin-bottom: 2rem;
}

/* Form styling */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* Space between form groups */
  margin-bottom: 1.5rem; /* Space below form before signup link */
}

.form-group {
    text-align: left; /* Align labels/links left */
    position: relative; /* For icon positioning */
}

/* Input fields - Enhanced */
.input-wrapper {
    position: relative;
}

.input-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #aaa;
    font-size: 0.9rem;
    pointer-events: none; /* Allow clicking through icon */
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.75rem; /* Padding for icon */
  border: 1px solid #d1d5db; /* Softer border */
  border-radius: 8px; /* Rounded */
  font-size: 1rem;
  color: #333;
  background-color: #fdfdff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
input[type="email"]::placeholder,
input[type="password"]::placeholder {
    color: #a0aec0;
}
input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #8c68db;
  box-shadow: 0 0 0 3px rgba(140, 104, 219, 0.15);
}

.forgot-password-link {
    display: block;
    text-align: right;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #8c68db;
    text-decoration: none;
    transition: color 0.2s ease;
}
.forgot-password-link:hover {
    color: #7a5fc7;
    text-decoration: underline;
}

/* Login Button - Primary Action */
.login-button {
  width: 100%;
  padding: 0.85rem 1.5rem;
  font-size: 1rem;
  font-weight: 600; /* Bolder */
  border: none;
  border-radius: 25px; /* Fully rounded */
  cursor: pointer;
  background: #ff80b0; /* HeyBoo Pink */
  color: white;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  box-shadow: 0 3px 8px rgba(255, 128, 176, 0.3);
}

.login-button:hover:not(:disabled) {
  background-color: #ff66a3;
  box-shadow: 0 5px 12px rgba(255, 128, 176, 0.4);
  transform: translateY(-1px);
}
.login-button:disabled {
    background-color: #cccccc;
    color: #888;
    box-shadow: none;
    cursor: not-allowed;
}
.login-button i {
    /* Styles for icon within button if needed */
}

/* Sign Up Prompt/Link */
.signup-prompt {
  font-size: 0.9rem;
  color: #556;
}
.signup-link {
  color: #8c68db; /* Theme purple */
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}
.signup-link:hover {
  color: #7a5fc7;
  text-decoration: underline;
}

/* Removed separate loading overlay and spinner - integrated into button */

/* Accessibility */
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;
}

</style>