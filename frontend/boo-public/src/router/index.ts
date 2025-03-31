import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ChatView from '@/views/ChatView.vue'
import WordBankView from '@/views/WordBankView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
    },
    {
    path: '/chat',
    component: ChatView
  },
  { path: '/word-bank', 
    component: WordBankView }

  ],
})

export default router
