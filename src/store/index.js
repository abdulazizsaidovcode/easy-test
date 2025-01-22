import { createStore } from 'vuex'; // Vuex 4 bilan yangi sintaksis
import posts from './modules/Posts_store';
import modals from './modules/Modal_store';
import users from './modules/users_store';
// import photos from '../modules/photos';
// import todos from '../modules/todos';

const store = createStore({
  modules: {
    posts,
    modals,
    users
    // photos,
    // todos,
  },
});

export default store;
