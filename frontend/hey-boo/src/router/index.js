import { createRouter, createWebHashHistory } from "vue-router";

// 1) Import your components (or pages)
import LoginScreen from "../components/LoginScreen.vue";
import SignupScreen from "../components/SignupScreen.vue";
import NoPartner from "../components/NoPartner.vue";
import LinkPartner from "../components/LinkPartner.vue";
import Dashboard from "../components/Dashboard.vue"; // <-- import the new component
import DateIdea from "../components/DateIdea.vue";
import Calendar from  "../components/Calendar.vue";
import Chats from "../components/Chats.vue";
import Setttings from "../components/Setttings.vue";
// 2) Define your routes
const routes = [
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
  { path: "/no-partner", component: NoPartner ,name: "NoPartner"},
  { path: "/link-partner", component: LinkPartner ,name: "LinkPartner"},
  { path: "/dashboard", component: Dashboard ,name: "Dashboard"},
  { path: "/dashboard/dateideas", component: DateIdea ,name: "DateIdea"},
  { path: "/dashboard/Chats", component: Chats ,name: "Chats"},
  { path: "/dashboard/Calendar", component: Calendar ,name: "Calendar"},
  { path: "/dashboard/Setttings", component: Setttings ,name: "Setttings"}
];

// 3) Create and export the router
const router = createRouter({
  history: createWebHashHistory(), // or createWebHistory() if you prefer
  routes,
});

export default router;
