import axios from "axios";

let url = ''

const state = {
  posts: [], // API'dan kelgan barcha postlar
  error: null, // Xatoliklar
  favorites: [], // Saqlangan postlar ID'lari
};

const getters = {
  allPosts: (state) => state.posts, // Barcha postlarni olish
  error: (state) => state.error, // Xatolikni olish
  favoritePosts: (state) =>
    state.posts.filter((post) => state.favorites.includes(post.id)), // Saqlangan postlarni olish
};

const actions = {
  async addPost({ commit }, newPost) {
    const id = Math.max(...state.posts.map((post) => post.id)) + 1; // ID generatsiyasi
    const post = { id, ...newPost };
    commit("ADD_POST", post);
  },

  async commitPost({ commit }, postId) {
    try {
      const post = state.posts.find((p) => p.id === postId);
      if (!post) throw new Error('Post not found');
      await axios.post(`http://localhost:3000/posts/${postId}/commit`, post);
      commit('markAsCommitted', postId);
    } catch (error) {
      console.error('Error committing post:', error);
    }
  },
  async fetchPosts({ commit }) {
    // API'dan postlarni olish
    try {
      const response = await axios.get(
        "http://localhost:3000/posts"
      );
      commit("setPosts", response.data); // Postlarni store'ga yuklash
    } catch (error) {
      commit("setError", "Failed to fetch posts."); // Xatolikni saqlash
    }
  },
  editPost({ commit }, updatedPost) {
    commit("updatePost", updatedPost); // Postni lokal yangilash
  },
  deletePost({ commit }, postId) {
    commit("removePost", postId); // Postni lokal o'chirish
  },
  toggleFavorite({ commit }, postId) {
    commit("toggleFavorite", postId); // Postni saqlash yoki olib tashlash
  },
};

const mutations = {
  setPosts(state, posts) {
    state.posts = posts; // Postlarni yangilash
  },
  setError(state, error) {
    state.error = error; // Xatolikni o'rnatish
  },
  updatePost(state, updatedPost) { // Nomi o'zgartirildi
    const index = state.posts.findIndex((post) => post.id === updatedPost.id);
    if (index !== -1) {
      state.posts.splice(index, 1, updatedPost);
    }
  },
  removePost(state, postId) {
    state.posts = state.posts.filter((post) => post.id !== postId);
  },
  toggleFavorite(state, postId) {
    if (state.favorites.includes(postId)) {
      state.favorites = state.favorites.filter((id) => id !== postId); // Saqlangan postni olib tashlash
    } else {
      state.favorites.push(postId); // Postni saqlash
    }
  },
  markAsCommitted(state, postId) {
    const post = state.posts.find((p) => p.id === postId);
    if (post) {
      post.committed = true; // Holatni belgilash
    }
  },
  ADD_POST(state, post) {
    state.posts.push(post);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
