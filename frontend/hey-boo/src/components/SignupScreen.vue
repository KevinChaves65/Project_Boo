<template>
  <div class="signup-container">
    <div class="signup-box">
      <img src="/logo.jpeg" alt="Hey Boo Logo" class="heyboo-logo" />
      <h1>Create an Account</h1>
      <form @submit.prevent="handleSignup">
        <!-- Row 1: Full Name -->
        <div class="form-row">
          <input 
            v-model="fullName" 
            type="text" 
            placeholder="Full Name" 
            required 
          />
        </div>

        <!-- Row 2: Username, Password -->
        <div class="form-row">
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
        </div>

        <!-- Row 3: Email, Confirm Password -->
        <div class="form-row">
          <input 
            v-model="email" 
            type="email" 
            placeholder="Email" 
            required 
          />
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="Confirm Password" 
            required 
          />
        </div>

        <!-- Row 4: Phone Number, Birthday -->
        <div class="form-row">
          <input 
            v-model="phoneNumber" 
            type="text" 
            placeholder="Phone Number" 
            required 
          />
          <input 
            v-model="birthday" 
            type="date" 
            placeholder="Birthday" 
            required 
          />
        </div>

        <!-- Row 5: Gender -->
        <div class="form-row">
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
<<<<<<< HEAD
  
          <!-- Sign Up Button -->
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "SignupScreen",
    data() {
      return {
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        phoneNumber: "",
        address: "",
        gender: ""
      };
    },
    methods: {
      handleSignup() {
        // Basic sign-up logic placeholder
        console.log("Signing up with:", {
          username: this.username,
          password: this.password,
          confirmPassword: this.confirmPassword,
          email: this.email,
          phoneNumber: this.phoneNumber,
          address: this.address,
          gender: this.gender
        });
        alert("Sign up button clicked!");
      }
    }
  };
  </script>
  
  <style scoped>
=======
        </div>

        <!-- Sign Up Button -->
        <button type="submit" class="signup-button" :disabled="isLoading">
          <span v-if="!isLoading">Sign Up</span>
          <span v-else>Signing up...</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

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
      this.isLoading = true;
      try {
        const response = await axios.post("http://localhost:8080/register", {
          full_name: this.fullName,
          username: this.username,
          password: this.password,
          confirm_password: this.confirmPassword,
          email: this.email,
          phone_number: this.phoneNumber,
          birthday: this.birthday,
          gender: this.gender,
        });

        alert(response.data.message);

        // Redirect to the login page
        this.$router.push("/login");
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
>>>>>>> Security_Test
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
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
  color: #333;
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
  border: 1px solid #ccc;
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
  background-color: #ff80b0;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}

.signup-box button:hover {
  background-color: #ff66a3;
}
</style>