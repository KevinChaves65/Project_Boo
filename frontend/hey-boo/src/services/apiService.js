import axios from "axios";

const API_BASE_URL = "http://localhost:8080/auth";

// Utility function to handle token-related errors
function handleTokenError(error) {
  if (error.response && error.response.status === 401) {
    // Token is invalid or expired
    localStorage.removeItem("token"); // Clear the token
    window.location.href = "/login"; // Redirect to login page
  }
  throw error; // Re-throw the error for further handling
}

// Function to fetch user profile
export async function fetchUserProfile() {
  try {
    const response = await axios.get(`${API_BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.user; // Return the user object
  } catch (error) {
    console.error("Failed to fetch user profile:", error.response?.data || error.message);
    throw error;
  }
}

// Function to fetch milestones
export async function fetchMilestones(coupleId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/milestones?couple_id=${coupleId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.milestones; // Return the milestones array
  } catch (error) {
    console.error("Failed to fetch milestones:", error.response?.data || error.message);
    throw error;
  }
}

// Fetch chat messages
export async function fetchChats() {
  try {
    const response = await axios.get(`${API_BASE_URL}/chat/receive`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.messages; // Return the array of chat messages
  } catch (error) {
    handleTokenError(error); // Handle token-related errors
    console.error("Failed to fetch chats:", error.response?.data || error.message);
    throw error;
  }
}

// Send a new chat message
export async function sendChatMessage(content) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/chat/send`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data; // Return the response from the server
  } catch (error) {
    handleTokenError(error); // Handle token-related errors
    console.error("Failed to send chat message:", error.response?.data || error.message);
    throw error;
  }
}