<template>
    <div class="heyboo-container">
      <div class="no-partner-box">
        <p>
          It seems like you didn't link with a partner yet.
          <br />
          Would you like to link one?
        </p>
        <button @click="goToLinkPartner">Link with a partner</button>
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
  .no-partner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f8f8f8;
  }
  
  .no-partner-box {
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .no-partner-box p {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    line-height: 1.4;
  }
  
  .no-partner-box button {
    background-color: #8c68db;
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .no-partner-box button:hover {
    background-color: #7a5fc7;
  }
  </style>
  