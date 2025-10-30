import axios from "axios";

const API_BASE_URL = "http://localhost:8080/auth";

// Developer Testing Mode - allows multiple sessions on same browser
const DEV_MODE = true; // Set to false in production
let currentSession = null;

// Get session identifier (for testing multiple accounts)
function getSessionId() {
  if (!DEV_MODE) return '';
  
  // Check URL params for session ID
  const urlParams = new URLSearchParams(window.location.search);
  const sessionParam = urlParams.get('session');
  
  if (sessionParam) {
    currentSession = sessionParam;
    return `_session_${sessionParam}`;
  }
  
  // Use default session if no param
  if (!currentSession) {
    currentSession = 'default';
  }
  return currentSession === 'default' ? '' : `_session_${currentSession}`;
}

// Utility function to handle token-related errors
function handleTokenError(error) {
  if (error.response && error.response.status === 401) {
    // Token is invalid or expired
    localStorage.removeItem(`token${getSessionId()}`); // Clear the token
    window.location.href = "/login"; // Redirect to login page
  }
  throw error; // Re-throw the error for further handling
}

// Utility function to get the authorization token
function getAuthToken() {
  return localStorage.getItem(`token${getSessionId()}`);
}

// Function to fetch user profile
export async function fetchUserProfile() {
  try {
    const response = await axios.get(`${API_BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    console.log("User Profile Response:", response.data); // Debug response
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
        Authorization: `Bearer ${getAuthToken()}`,
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
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      console.log("Chat Messages Response:", response.data); // Debug response
      return response.data.messages; // Return the array of chat messages
    } catch (error) {
      console.error("Failed to fetch chats:", error.response?.data || error.message);
      throw error;
    }
  }

// Send a new chat message
export async function sendChatMessage(content, receiver, sender, timestamp) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/send`,
        { content, receiver, sender, timestamp }, // Include the timestamp field
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      console.log("Message Sent Response:", response.data); // Debug response
      return response.data; // Return the response from the server
    } catch (error) {
      console.error("Failed to send chat message:", error.response?.data || error.message);
      throw error;
    }
  }

// Fetch couple info
export async function fetchCoupleInfo(coupleId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/couple/${coupleId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    console.log("Couple Info Response:", response.data); // Debug response
    return response.data.couple; // Return the couple object
  } catch (error) {
    console.error("Failed to fetch couple info:", error.response?.data || error.message);
    throw error;
  }
}

// Fetch public user info
export async function fetchPublicUserInfo(username) {
  try {
    if (!username) {
      throw new Error("Username is required to fetch public user info");
    }

    const response = await axios.get(`http://localhost:8080/user/public`, {
      params: { username }, // Correct endpoint
    });

    console.log("Public User Info Response:", response.data); // Debug response
    return response.data; // Return the public user info
  } catch (error) {
    console.error("Failed to fetch public user info:", error.response?.data || error.message);
    throw error;
  }
}
// Add a new milestone
export async function addMilestone(coupleId, title, description, date) {
  try {
    // Convert the date to ISO 8601 format
    const isoDate = new Date(date).toISOString();

    const response = await axios.post(
      `${API_BASE_URL}/milestones`,
      {
        couple_id: coupleId,
        title,
        description,
        date: isoDate, // Send the date in ISO 8601 format
      },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`, // Include the token in the Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add milestone:", error.response?.data || error.message);
    throw error;
  }
}

// Update an existing milestone
export async function updateMilestone(milestoneId, title, description, date) {
  try {
    // Convert the date to ISO 8601 format
    const isoDate = new Date(date).toISOString();

    const response = await axios.put(
      `${API_BASE_URL}/milestones/${milestoneId}`,
      {
        title,
        description,
        date: isoDate, // Send the date in ISO 8601 format
      },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`, // Include the token in the Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update milestone:", error.response?.data || error.message);
    throw error;
  }
}

// Delete a milestone
export async function deleteMilestone(milestoneId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/milestones/${milestoneId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`, // Include the token in the Authorization header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to delete milestone:", error.response?.data || error.message);
    throw error;
  }
}

// Link couple
export async function linkCouple(partnerId) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/couple/link`,
      { partner_id: partnerId }, // Send the partner ID in the request body
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`, // Include the token in the Authorization header
        },
      }
    );
    console.log("Link Couple Response:", response.data); // Debug response
    return response.data;
  } catch (error) {
    console.error("Failed to link couple:", error.response?.data || error.message);
    throw error;
  }
}

export async function addPhrase(userId, text) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/wordbank`,
      { userId, text },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`, // Include the token in the Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add phrase:", error.response?.data || error.message);
    throw error;
  }
}

export async function getPhrases(userId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/wordbank`, {
      params: { userId }, // Pass userId as a query parameter
      headers: {
        Authorization: `Bearer ${getAuthToken()}`, // Include the token in the Authorization header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch phrases:", error.response?.data || error.message);
    throw error;
  }
}

// Generate AI-powered date ideas
export async function generateDateIdeas(location, preferences = "", budget = "") {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/dateideas/generate`,
      { 
        location: location,
        preferences: preferences,
        budget: budget
      },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`, // Include the token in the Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to generate date ideas:", error.response?.data || error.message);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(fullName, email) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/profile`,
      {
        full_name: fullName,
        email: email,
      },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update profile:", error.response?.data || error.message);
    throw error;
  }
}

// Change user password
export async function changeUserPassword(oldPassword, newPassword) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/password`,
      {
        old_password: oldPassword,
        new_password: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to change password:", error.response?.data || error.message);
    throw error;
  }
}

// ===== NEW WORD BANK THEME SYSTEM =====

// Get all available word themes
export async function getWordThemes() {
  try {
    const response = await axios.get(`${API_BASE_URL}/word-themes`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data.themes;
  } catch (error) {
    console.error("Failed to fetch word themes:", error.response?.data || error.message);
    throw error;
  }
}

// Add a word to the couple's word bank with theme
export async function addWordToBank(coupleId, wordName, themeId) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/word-bank`,
      {
        couple_id: coupleId,
        word_name: wordName,
        theme_id: themeId,
      },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add word to bank:", error.response?.data || error.message);
    throw error;
  }
}

// Get couple's word bank
export async function getWordBank(coupleId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/word-bank`, {
      params: { couple_id: coupleId },
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data.word_bank;
  } catch (error) {
    console.error("Failed to fetch word bank:", error.response?.data || error.message);
    throw error;
  }
}

// Update word theme
export async function updateWordTheme(coupleId, wordId, newThemeId) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/word-bank/theme`,
      {
        couple_id: coupleId,
        word_id: wordId,
        new_theme_id: newThemeId,
      },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update word theme:", error.response?.data || error.message);
    throw error;
  }
}

// Delete word from bank
export async function deleteWordFromBank(coupleId, wordId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/word-bank`, {
      params: { 
        couple_id: coupleId,
        word_id: wordId 
      },
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to delete word from bank:", error.response?.data || error.message);
    throw error;
  }
}