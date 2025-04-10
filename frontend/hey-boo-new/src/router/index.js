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
  const isAuthenticated = !!localStorage.getItem("token"); // Check if token exists
  if (!isAuthenticated && to.name !== "Login" && to.name !== "Signup") {
    next({ name: "Login" }); // Redirect to login if not authenticated
    return;
  }

  if (isAuthenticated && to.name !== "Login" && to.name !== "Signup") {
    try {
      const userProfile = await fetchUserProfile();
      if (!userProfile.couple_id && to.name !== "LinkPartner") {
        // Redirect to LinkPartner if couple_id is null
        next({ name: "LinkPartner" });
        return;
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error.message);
      next({ name: "Login" }); // Redirect to login on error
      return;
    }
  }

  next(); // Allow navigation
});

export default router;