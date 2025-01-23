import { createApp } from 'vue';
import App from './App.vue';
import './assets/tailwind.css';
import { router } from './router'; // Vue Router
import store from './store'; // Vuex Store
import VueLazyload from 'vue-lazyload';

const app = createApp(App);
app.use(VueLazyload, {
    preLoad: 2, // Load images 30% before they enter the viewport
    error: "path/to/error-image.png", // Fallback image on error
    loading: "path/to/loading-spinner.gif", // Placeholder while loading
    attempt: 1, // Retry loading once
  });
app.use(router); // Vue Routerni qo'shish
app.use(store); // Vuex Store-ni qo'shish
app.mount('#app');
