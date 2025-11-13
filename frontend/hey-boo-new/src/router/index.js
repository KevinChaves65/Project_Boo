import { createRouter, createWebHashHistory } from "vue-router";
import LoginScreen from "../components/LoginScreen.vue";
import SignupScreen from "../components/SignupScreen.vue";
import NoPartner from "../components/NoPartner.vue";
import LinkPartner from "../components/LinkPartner.vue";
import Dashboard from "../components/Dashboard.vue";
import DashboardHome from "../components/DashboardHome.vue";
import DateIdeas from "../components/DateIdea.vue";
import Calendar from "../components/Calendar.vue";
import Chats from "../components/Chats.vue";
import Settings from "../components/Settings.vue";
import TextEnhancer from "../components/TextEnhancer.vue";
import { fetchUserProfile } from "../services/apiService";

// Helper function to check authentication (Chrome extension compatible)
async function isUserAuthenticated() {
  // Detect if running in Chrome Extension environment
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  
  if (isExtension) {
    // Use Chrome storage for extension
    return new Promise((resolve) => {
      chrome.storage.sync.get(['token', 'authToken', 'isLoggedIn'], (result) => {
        const hasToken = !!(result.token || result.authToken);
        const isLoggedIn = result.isLoggedIn;
        resolve(hasToken && isLoggedIn);
      });
    });
  } else {
    // Use localStorage for web app (with session support)
    const sessionId = getSessionId();
    const token = localStorage.getItem(`token${sessionId}`);
    return !!token;
  }
}

// Get session identifier (for testing multiple accounts)
function getSessionId() {
  // Check URL params for session ID (web version)
  const urlParams = new URLSearchParams(window.location.search);
  const sessionParam = urlParams.get('session');
  return sessionParam ? `_session_${sessionParam}` : '';
}

const routes = [
  { path: "/login", name: "Login", component: LoginScreen },
  { path: "/signup", name: "Signup", component: SignupScreen },
  { path: "/no-partner", name: "NoPartner", component: NoPartner },
  { path: "/link-partner", name: "LinkPartner", component: LinkPartner },
  {
    path: "/dashboard",
    component: Dashboard,
    children: [
      { path: "", name: "DashboardHome", component: DashboardHome },
      { path: "dateideas", name: "DateIdeas", component: DateIdeas },
      { path: "chats", name: "Chats", component: Chats },
      { path: "calendar", name: "Calendar", component: Calendar },
      { path: "settings", name: "Settings", component: Settings },
      { path: "word-bank", name: "WordBank", component: TextEnhancer },
    ],
  },
  { path: "/", redirect: "/dashboard" }, // Default route
  { path: "/:pathMatch(.*)*", name: "NotFound", redirect: "/login" },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Add navigation guard
router.beforeEach(async (to, from, next) => {
  console.log(`Router: Navigating from ${from.path} to ${to.path}`);
  
  const isAuthenticated = await isUserAuthenticated();
  console.log(`Router: User authenticated: ${isAuthenticated}`);
  
  if (!isAuthenticated && to.name !== "Login" && to.name !== "Signup") {
    console.log("Router: Redirecting to login - user not authenticated");
    next({ name: "Login" });
    return;
  }

  if (isAuthenticated && to.name !== "Login" && to.name !== "Signup") {
    try {
      const userProfile = await fetchUserProfile();
      console.log("Router: User profile:", userProfile);
      
      if (!userProfile.couple_id && to.name !== "LinkPartner") {
        // Redirect to LinkPartner if couple_id is null
        console.log("Router: Redirecting to LinkPartner - no couple_id");
        next({ name: "LinkPartner" });
        return;
      }
    } catch (error) {
      console.error("Router: Failed to fetch user profile:", error.message);
      next({ name: "Login" }); // Redirect to login on error
      return;
    }
  }

  console.log("Router: Navigation allowed");
  next(); // Allow navigation
});

export default router;