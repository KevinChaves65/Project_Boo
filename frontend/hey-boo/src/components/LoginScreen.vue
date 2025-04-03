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
import axios from "axios";

export default {
  name: "LoginScreen",
  data() {
    return {
      username: "",
      password: "",
      isLoading: false,
    };
  },
  methods: {
    async handleLogin() {
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
};
</script>

<style scoped>
/* Container styling */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
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
}

/* Logo styling */
.heyboo-logo {
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
