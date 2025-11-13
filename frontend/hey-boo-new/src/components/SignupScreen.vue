<template>
    <div class="signup-container">
      <div class="signup-box">
        <img src="/logo.jpeg" alt="Hey Boo Logo" class="heyboo-logo" />
        <h1>Create an Account</h1>
        <form @submit.prevent="handleSignup">
          <!-- Row 1: Full Name, Username -->
          <div class="form-row">
            <input 
              v-model="fullName" 
              type="text" 
              placeholder="Full Name" 
              required 
            />
            <input 
              v-model="username" 
              type="text" 
              placeholder="Username" 
              required 
            />
          </div>
  
          <!-- Row 2: Password, Confirm Password -->
          <div class="form-row">
            <input 
              v-model="password" 
              type="password" 
              placeholder="Password" 
              required 
            />
            <input 
              v-model="confirmPassword" 
              type="password" 
              placeholder="Confirm Password" 
              required 
            />
          </div>
  
          <!-- Row 3: Email, Phone Number -->
          <div class="form-row">
            <input 
              v-model="email" 
              type="email" 
              placeholder="Email" 
              required 
            />
            <input 
              v-model="phoneNumber" 
              type="text" 
              placeholder="Phone Number" 
            />
          </div>
  
          <!-- Row 4: Birthday -->
          <div class="form-row">
            <input 
              v-model="birthday" 
              type="date" 
              placeholder="Birthday" 
            />
          </div>
  
          <!-- Gender Options -->
          <div class="gender-row">
            <label>
              <input 
                type="radio" 
                value="male" 
                v-model="gender" 
              /> 
              Male
            </label>
            <label>
              <input 
                type="radio" 
                value="female" 
                v-model="gender" 
              /> 
              Female
            </label>
            <label>
              <input 
                type="radio" 
                value="none" 
                v-model="gender" 
              /> 
              Prefer not to say
            </label>
          </div>
  
          <!-- Sign Up Button -->
          <button type="submit" :disabled="isLoading">
            <span v-if="isLoading">Signing Up...</span>
            <span v-else>Sign Up</span>
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
import { registerUser } from "../services/apiService";

  export default {
    name: "SignupScreen",
    data() {
      return {
        fullName: "",
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        phoneNumber: "",
        birthday: "",
        gender: "",
        isLoading: false,
      };
    },
    methods: {
      async handleSignup() {
        // Validate input
        if (this.password !== this.confirmPassword) {
          alert("Passwords do not match!");
          return;
        }

        this.isLoading = true;
        try {
          // Send sign-up request to the backend
          const response = await axios.post("http://localhost:8080/register", {
            full_name: this.fullName,
            username: this.username,
            password: this.password,
            confirm_password: this.confirmPassword,
            email: this.email,
            phone_number: this.phoneNumber,
            birthday: this.birthday,
            gender: this.gender,
            couple_id: null, // Set couple_id to null during sign-up
          });
  
          alert(response.data.message);
          this.$router.push("/login"); // Redirect to login page
        } catch (error) {
          console.error("Sign-up failed:", error.response?.data || error.message);
          alert("Failed to create an account. Please try again.");
        } finally {
          this.isLoading = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
.signup-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    rgba(255, 128, 176, 0.8),
    rgba(168, 102, 221, 0.8)
  );
}

.signup-box {
  background-color: var(--bg-white);
  padding: 2rem;
  border-radius: 8px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-md);
}

/* Logo styling */
.heyboo-logo {
  width: 128px;
  height: auto;
  margin-bottom: 1rem; /* adds space between logo and heading */
}

.signup-box h1 {
  margin-bottom: 1.5rem;
  font-family: "Helvetica Neue", sans-serif;
  color: var(--text-primary);
}

.signup-box form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Form rows for side-by-side inputs */
.form-row {
  display: flex;
  gap: 1rem;
}

.form-row input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
}

/* Gender row styling */
.gender-row {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.gender-row label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.signup-box button {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: var(--accent-color);
  color: var(--text-white);
  font-weight: bold;
  cursor: pointer;
}

.signup-box button:hover {
  background-color: var(--accent-color-hover);
}
</style>