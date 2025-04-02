<template>
    <div class="heyboo-container">
      <div class="link-partner-box">
        <h2>Link with a Partner</h2>
        <form @submit.prevent="linkPartner">
          <label for="partnerId">Type in your partner #id:</label>
          <input
            id="partnerId"
            v-model="partnerId"
            type="text"
            placeholder="Partner ID"
          />
          <button type="submit">Link with a partner</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "LinkPartner",
    data() {
      return {
        partnerId: ""
      };
    },
    methods: {
      linkPartner() {
        // Show alert on submission
        alert("Add successfully!");
        // Potentially store the partner ID or navigate away
        // e.g., this.$router.push("/dashboard");
        this.$router.push("/dashboard");
      }
    }
  };
  </script>
  
  <style scoped>
  .link-partner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f0f0f0;
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
    background-color: #ff80b0;
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .link-partner-box button:hover {
    background-color: #ff66a3;
  }
  </style>
  