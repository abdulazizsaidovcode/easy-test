import { createApp } from 'vue';
import App from './App.vue';
import './assets/tailwind.css';
import { router } from './router'; // Vue Router
import store from './store'; // Vuex Store

const app = createApp(App);

app.use(router); // Vue Routerni qo'shish
app.use(store); // Vuex Store-ni qo'shish
app.mount('#app');
