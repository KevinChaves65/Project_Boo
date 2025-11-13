import axios from "axios";

// Detect if running in Chrome Extension environment
const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

const API_BASE_URL = "http://localhost:8080/auth";

// Developer Testing Mode - allows multiple sessions on same browser
const DEV_MODE = true; // Set to false in production
let currentSession = null;

// Chrome Extension Storage Functions
const chromeStorage = {
  get: (key) => {
    return new Promise((resolve) => {
      if (!isExtension) {
        resolve(null);
        return;
      }
      chrome.storage.sync.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  },
  
  set: (key, value) => {
    return new Promise((resolve) => {
      if (!isExtension) {
        resolve();
        return;
      }
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  },
  
  remove: (key) => {
    return new Promise((resolve) => {
      if (!isExtension) {
        resolve();
        return;
      }
      chrome.storage.sync.remove([key], () => {
        resolve();
      });
    });
  }
};

// Get session identifier (for testing multiple accounts)
function getSessionId() {
  if (!DEV_MODE) return '';
  
  if (isExtension) {
    // For extensions, we don't use URL params, just use default session
    if (!currentSession) {
      currentSession = 'default';
    }
    return currentSession === 'default' ? '' : `_session_${currentSession}`;
  }
  
  // Check URL params for session ID (web version)
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

// Enhanced token management for both web and extension
const tokenManager = {
  async getToken() {
    const tokenKey = `token${getSessionId()}`;
    
    if (isExtension) {
      return await chromeStorage.get(tokenKey);
    } else {
      return localStorage.getItem(tokenKey);
    }
  },
  
  async setToken(token) {
    const tokenKey = `token${getSessionId()}`;
    
    if (isExtension) {
      await chromeStorage.set(tokenKey, token);
      await chromeStorage.set('isLoggedIn', true);
    } else {
      localStorage.setItem(tokenKey, token);
    }
  },
  
  async removeToken() {
    const tokenKey = `token${getSessionId()}`;
    
    if (isExtension) {
      await chromeStorage.remove(tokenKey);
      await chromeStorage.set('isLoggedIn', false);
    } else {
      localStorage.removeItem(tokenKey);
    }
  }
};

// Utility function to handle token-related errors
async function handleTokenError(error) {
  if (error.response && error.response.status === 401) {
    // Token is invalid or expired
    await tokenManager.removeToken();
    
    if (isExtension) {
      // For extensions, send message to background script
      chrome.runtime.sendMessage({ action: 'logout' });
    } else {
      // For web app, redirect normally
      window.location.href = "/login";
    }
  }
  throw error; // Re-throw the error for further handling
}

// Utility function to get the authorization token
async function getAuthToken() {
  return await tokenManager.getToken();
}

// Login function with Chrome extension support
export async function loginUser(username, password) {
  try {
    console.log('Attempting login for:', username);
    
    const response = await axios.post("http://localhost:8080/login", {
      username: username,
      password: password,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: false // Disable credentials for CORS
    });

    console.log('Login response:', response.data);
    
    if (response.data.token) {
      // Use the token manager for proper storage
      await tokenManager.setToken(response.data.token);
    }
    
    return response;
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    await handleTokenError(error);
  }
}

// Register function with Chrome extension support
export async function registerUser(username, email, password) {
  try {
    console.log('Attempting registration for:', username);
    
    const response = await axios.post("http://localhost:8080/register", {
      username: username,
      email: email,
      password: password,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: false // Disable credentials for CORS
    });

    console.log('Registration response:', response.data);
    return response;
  } catch (error) {
    console.error('Registration API error:', error.response?.data || error.message);
    throw error;
  }
}

// Function to fetch user profile
export async function fetchUserProfile() {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
    const token = await getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/milestones?couple_id=${coupleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/chat/receive`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      const token = await getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/chat/send`,
        { content, receiver, sender, timestamp }, // Include the timestamp field
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
    const token = await getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/couple/${coupleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
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

    const token = await getAuthToken();
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
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
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

    const token = await getAuthToken();
    const response = await axios.put(
      `${API_BASE_URL}/milestones/${milestoneId}`,
      {
        title,
        description,
        date: isoDate, // Send the date in ISO 8601 format
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
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
    const token = await getAuthToken();
    const response = await axios.delete(`${API_BASE_URL}/milestones/${milestoneId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
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
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/couple/link`,
      { partner_id: partnerId }, // Send the partner ID in the request body
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
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
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/wordbank`,
      { userId, text },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
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
    const token = await getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/wordbank`, {
      params: { userId }, // Pass userId as a query parameter
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
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
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/dateideas/generate`,
      { 
        location: location,
        preferences: preferences,
        budget: budget
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
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
    const token = await getAuthToken();
    const response = await axios.put(
      `${API_BASE_URL}/profile`,
      {
        full_name: fullName,
        email: email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
    const token = await getAuthToken();
    const response = await axios.put(
      `${API_BASE_URL}/password`,
      {
        old_password: oldPassword,
        new_password: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to change password:", error.response?.data || error.message);
    throw error;
  }
}

// Word bank system

// Get all available word themes
export async function getWordThemes() {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/word-themes`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/word-bank`,
      {
        couple_id: coupleId,
        word_name: wordName,
        theme_id: themeId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
    const token = await getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/word-bank`, {
      params: { couple_id: coupleId },
      headers: {
        Authorization: `Bearer ${token}`,
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
    const token = await getAuthToken();
    const response = await axios.put(
      `${API_BASE_URL}/word-bank/theme`,
      {
        couple_id: coupleId,
        word_id: wordId,
        new_theme_id: newThemeId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
    const token = await getAuthToken();
    const response = await axios.delete(`${API_BASE_URL}/word-bank`, {
      params: { 
        couple_id: coupleId,
        word_id: wordId 
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to delete word from bank:", error.response?.data || error.message);
    throw error;
  }
}