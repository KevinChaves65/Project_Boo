<template>
  <div class="login-container">
    <div class="login-card">
      <img src="/logo.jpeg" alt="Hey Boo Logo" class="heyboo-logo" />
      <h2>Welcome Back!</h2>
      <p class="subtitle">Log in to continue your journey.</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Username Input -->
        <div class="form-group">
          <label for="username-input" class="sr-only">Username</label>
          <div class="input-wrapper">
            <i class="fas fa-user input-icon"></i>
            <input
              id="username-input"
              v-model="username"
              type="text"
              placeholder="Username"
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
          </div>
          <a href="#" class="forgot-password-link">Forgot Password?</a>
        </div>

        <!-- Login Button with Loading State -->
        <button class="login-button" type="submit" :disabled="isLoading || !username || !password">
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
import axios from "axios";

export default {
  name: "LoginScreen",
  data() {
    return {
      username: "", // Only username is used for login
      password: "",
      isLoading: false,
    };
  },
  methods: {
    // Get session identifier for multi-user testing
    getSessionId() {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionParam = urlParams.get('session');
      return sessionParam ? `_session_${sessionParam}` : '';
    },
    
    async handleLogin() {
      this.isLoading = true;
      try {
        // Send login request with username and password
        const response = await axios.post("http://localhost:8080/login", {
          username: this.username,
          password: this.password,
        });

        // Save token to localStorage with session support
        localStorage.setItem(`token${this.getSessionId()}`, response.data.token);
        this.$router.push("/dashboard");
      } catch (error) {
        console.error("Login failed:", error.response?.data || error.message);
        alert("Invalid username or password. Please try again.");
      } finally {
        this.isLoading = false;
      }
    },
  },
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
  background-color: var(--bg-white);
  padding: 2.5rem 2rem; /* More padding */
  border-radius: 16px; /* More rounded */
  max-width: 380px; /* Slightly wider */
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg); /* Softer, larger shadow */
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
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.subtitle {
    font-size: 0.95rem;
    color: var(--text-secondary);
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
    color: var(--text-muted);
    font-size: 0.9rem;
    pointer-events: none; /* Allow clicking through icon */
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.75rem; /* Padding for icon */
  border: 1px solid var(--input-border); /* Softer border */
  border-radius: 8px; /* Rounded */
  font-size: 1rem;
  color: var(--text-primary);
  background-color: var(--input-bg);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
input[type="text"]::placeholder,
input[type="password"]::placeholder {
    color: var(--text-muted);
}
input[type="text"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: var(--input-focus);
  box-shadow: 0 0 0 3px var(--shadow-primary);
}

.forgot-password-link {
    display: block;
    text-align: right;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.2s ease;
}
.forgot-password-link:hover {
    color: var(--primary-dark);
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
  background: var(--accent-color); /* HeyBoo Pink */
  color: white;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  box-shadow: var(--shadow-primary);
}

.login-button:hover:not(:disabled) {
  background-color: var(--accent-color-hover);
  box-shadow: var(--shadow-primary-hover);
  transform: translateY(-1px);
}
.login-button:disabled {
    background-color: var(--text-muted);
    color: var(--text-secondary);
    box-shadow: none;
    cursor: not-allowed;
}
.login-button i {
    /* Styles for icon within button if needed */
}

/* Sign Up Prompt/Link */
.signup-prompt {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.signup-link {
  color: var(--primary-color); /* Theme purple */
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}
.signup-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* Removed separate loading overlay and spinner - integrated into button */

/* Accessibility */
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;
}

</style>