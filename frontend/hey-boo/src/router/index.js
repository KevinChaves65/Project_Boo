import { createRouter, createWebHashHistory } from "vue-router";

// 1) Import components using YOUR file structure (src/components/)
import LoginScreen from "../components/LoginScreen.vue";
import SignupScreen from "../components/SignupScreen.vue";
import NoPartner from "../components/NoPartner.vue";
import LinkPartner from "../components/LinkPartner.vue";

// --- Dashboard Related Imports ---
import Dashboard from "../components/Dashboard.vue";           // The main layout component
import DashboardHome from "../components/DashboardHome.vue"; // The content for '/dashboard' base route (the cards)
import DateIdeas from "../components/DateIdea.vue";         // Your component for date ideas view
import Calendar from  "../components/Calendar.vue";
import Chats from "../components/Chats.vue";
import Settings from "../components/Setttings.vue";       // Note: Possible typo 'Setttings'? Should it be 'Settings'?
import TextEnhancer from "../components/TextEnhancer.vue";

// 2) Define routes using NESTING for the dashboard
const routes = [
  // --- Top Level Routes ---
  {
    path: "/",
    name: "Login",
    component: LoginScreen,
  },
  {
    path: "/signup",
    name: "Signup",
    component: SignupScreen,
  },
  {
    path: "/no-partner",
    name: "NoPartner", // Consistent naming convention (PascalCase)
    component: NoPartner
  },
  {
    path: "/link-partner",
    name: "LinkPartner", // Consistent naming convention
    component: LinkPartner
  },

  // --- Dashboard Layout Route (Parent) ---
  {
    path: "/dashboard",
    // name: "DashboardLayout", // Optional: Name the layout route itself
    component: Dashboard, // This component has the sidebar and <router-view>
    children: [
      // --- Child routes render INSIDE Dashboard's <router-view> ---
      {
        path: "", // Default view when accessing /dashboard
        name: "DashboardHome",
        component: DashboardHome, // Show the cards component here
      },
      {
        path: "dateideas", // Full path: /dashboard/dateideas
        name: "DateIdeas",    // Use consistent naming (PascalCase often preferred)
        component: DateIdeas, // Your DateIdea component
      },
      {
        path: "chats", // Full path: /dashboard/chats
        name: "Chats",
        component: Chats,
      },
      {
        path: "calendar", // Full path: /dashboard/calendar
        name: "Calendar",
        component: Calendar,
      },
      {
        // Important: Check your filename. If it's Setttings.vue use Settings below.
        // If it's Settings.vue, update the import above too.
        path: "settings", // Use lowercase for path, correct spelling
        name: "Settings", // Use correct spelling for name
        component: Settings, // Use the imported component (check filename spelling!)
      },
      {
        path: "Word Bank", // Full path: /dashboard/Word Bank
        name: "Word Bank",
        component: TextEnhancer,
      }
    ]
  },

  // Optional: Catch-all 404 route
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundComponent },
];

// 3) Create and export the router
const router = createRouter({
  history: createWebHashHistory(), // You are using HashHistory, that's fine
  routes, // use the routes array defined above
});

export default router;