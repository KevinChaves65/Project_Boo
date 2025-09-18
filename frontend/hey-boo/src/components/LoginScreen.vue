<template>
  <div class="login-container">
    <div class="login-box">
      <img src="/logo.jpeg" alt="Hey Boo Logo" class="heyboo-logo" />

      <form @submit.prevent="handleLogin">
        <input 
          v-model="username" 
          type="text" 
          placeholder="Username" 
          required 
        />
        <input 
          v-model="password" 
          type="password" 
          placeholder="Password" 
          required 
        />
        <button class="login-button" type="submit" :disabled="isLoading">
          <span v-if="!isLoading">Log In</span>
          <span v-else>Logging in...</span>
        </button>
      </form>
      
      <router-link to="/signup">
        <button class="signup-button">
          Sign Up
        </button>
      </router-link>

      <!-- Loading overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
      </div>

    </div>
  </div>
</template>

<script>
<<<<<<< HEAD
=======
import axios from "axios";

>>>>>>> Security_Test
export default {
  name: "LoginScreen",
  data() {
    return {
<<<<<<< HEAD
      email: "",
=======
      username: "",
>>>>>>> Security_Test
      password: "",
      isLoading: false,
    };
  },
  methods: {
    async handleLogin() {
<<<<<<< HEAD
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
=======
      this.isLoading = true;
      try {
        const response = await axios.post("http://localhost:8080/login", {
          username: this.username,
          password: this.password,
        });

        // Save the token to localStorage
        localStorage.setItem("token", response.data.token);

        // Redirect to the dashboard
        this.$router.push("/dashboard");
      } catch (error) {
        console.error("Login failed:", error.response?.data || error.message);
        alert("Invalid username or password. Please try again.");
      } finally {
        this.isLoading = false;
      }
    },
  },
>>>>>>> Security_Test
};
</script>

<style scoped>
<<<<<<< HEAD
/* Container styling - Keeping gradient, ensure full coverage */
=======
/* Container styling */
>>>>>>> Security_Test
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
<<<<<<< HEAD
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
=======
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 128, 176, 0.8), rgba(168, 102, 221, 0.8));
}

/* Box styling */
.login-box {
  position: relative; /* Needed for loading overlay positioning */
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 320px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
>>>>>>> Security_Test
}

/* Logo styling */
.heyboo-logo {
<<<<<<< HEAD
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
=======
  width: 80px;
  height: auto;
  margin-bottom: 1rem;
}

/* Form styling */
.login-box form {
  display: flex;
  flex-direction: column;
  gap:10px;
}

/* Input fields */
.login-box input {
  padding:12px;
  border:1px solid #ccc;
  border-radius:4px;
  font-size:16px;
}

/* Buttons styling */
.login-button,
.signup-button {
  width:100%;
  height:45px;
  padding:10px;
  font-size:16px;
  font-weight:bold;
  border:none;
  border-radius:4px;
  cursor:pointer;
}

.login-button {
   background-color:#ff80b0;
   color:white;  
}

.login-button:hover{
   background-color:#ff66a3;  
}

.signup-button{
   background-color:#8c68db;  
   color:white;  
   margin-top:10px;  
}

.signup-button:hover{
   background-color:#7a5fc7;  
}

/* Loading Overlay Styling */
.loading-overlay {
   position:absolute;  
   top:0;  
   left:0;  
   width:100%;  
   height:100%;  
   background-color:rgba(255,255,255,0.7);  
   display:flex;  
   align-items:center;  
   justify-content:center;  
   border-radius:8px; /* match login-box radius */
}

/* Spinner animation */
.spinner{
   width:40px;  
   height:40px;  
   border-radius:50%;  
   border-top:4px solid #ff80b0;  
   border-right:4px solid transparent;  
   animation:spin-animation .8s linear infinite;  
}

@keyframes spin-animation{
   from{transform:rotate(0deg);}  
   to{transform:rotate(360deg);}  
}
</style>
>>>>>>> Security_Test
