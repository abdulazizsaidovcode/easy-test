import { createRouter, createWebHistory } from 'vue-router';
import Posts from '../views/Posts.vue';
import Albums from "../views/Albums.vue";
import Photos from "../views/Photos.vue";
import Todos from "../views/Todos.vue";

const routes = [
  {
    path: '/',
    name: 'posts',
    component: Posts,
  },
  {
    path: "/albums",
    name: "Albums",
    component: Albums
  },
  {
    path: "/todos",
    name: "Todos",
    component: Todos
  },
  {
    path: "/photos/:albumId",
    name: "Photos",
    component: Photos
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export { router };
