import { createRouter, createWebHashHistory } from "vue-router";

// 1) Import your components (or pages)
import LoginScreen from "../components/LoginScreen.vue";
import SignupScreen from "../components/SignupScreen.vue";
import NoPartner from "../components/NoPartner.vue";
import LinkPartner from "../components/LinkPartner.vue";
import Dashboard from "../components/Dashboard.vue"; // <-- import the new component
import DateIdea from "../components/DateIdea.vue";
import Calendar from "../components/Calendar.vue";
import Chats from "../components/Chats.vue";
import Settings from "../components/Settings.vue";

// 2) Define your routes
const routes = [
  { path: "/", redirect: "/dashboard" }, // Default route
  { path: "/login", name: "Login", component: LoginScreen },
  { path: "/signup", name: "Signup", component: SignupScreen },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/dashboard/dateideas", name: "DateIdea", component: DateIdea },
  { path: "/dashboard/calendar", name: "Calendar", component: Calendar },
  { path: "/dashboard/chats", name: "Chats", component: Chats },
  { path: "/dashboard/settings", name: "Settings", component: Settings },
];

// 3) Create and export the router
const router = createRouter({
  history: createWebHashHistory(), // or createWebHistory() if you prefer
  routes,
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if token exists
  if (to.name !== "Login" && to.name !== "Signup" && !isAuthenticated) {
    next({ name: "Login" }); // Redirect to login if not authenticated
  } else {
    next(); // Allow navigation
  }
});

export default router;
