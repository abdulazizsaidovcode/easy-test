import { createStore } from 'vuex'; // Vuex 4 bilan yangi sintaksis
import posts from './modules/posts.store';
import modals from './modules/modal.store';
import users from './modules/users.store';
import photos from './modules/photos.store';
import albums from './modules/albums.store';
import todos from './modules/todos.store';

const store = createStore({
  modules: {
    posts,
    modals,
    users,
    photos,
    albums,
    todos,
  },
});

export default store;
