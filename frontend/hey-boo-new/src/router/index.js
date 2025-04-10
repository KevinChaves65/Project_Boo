import { createRouter, createWebHashHistory } from "vue-router";

// 1) Import components
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

// 2) Define routes
const routes = [
  // Redirect root to dashboard
  { path: "/", redirect: "/dashboard" },

  // Authentication routes
  { path: "/login", name: "Login", component: LoginScreen },
  { path: "/signup", name: "Signup", component: SignupScreen },
  { path: "/no-partner", name: "NoPartner", component: NoPartner },
  { path: "/link-partner", name: "LinkPartner", component: LinkPartner },

  // Dashboard routes
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

  // Optional: Catch-all 404 route
  { path: "/:pathMatch(.*)*", name: "NotFound", redirect: "/login" },
];

// 3) Create and export the router
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 4) Add navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if token exists
  if (to.name !== "Login" && to.name !== "Signup" && !isAuthenticated) {
    next({ name: "Login" }); // Redirect to login if not authenticated
  } else {
    next(); // Allow navigation
  }
});

export default router;