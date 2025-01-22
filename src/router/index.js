import { createRouter, createWebHistory } from 'vue-router'; // Vue Routerni to'g'ri import qiling
import Posts from '../views/Posts.vue'; // Komponentingizni to'g'ri yo'ldan import qiling

// Yo'nalishlar (routes)
const routes = [
  {
    path: '/',
    name: 'posts',
    component: Posts,
  },
  // Qo'shimcha yo'nalishlarni bu yerda kiritishingiz mumkin
];

// Routerni yarating
const router = createRouter({
  history: createWebHistory(), // Browser URL tarixidan foydalanish
  routes, // Yo'nalishlar ro'yxati
});

export { router };
