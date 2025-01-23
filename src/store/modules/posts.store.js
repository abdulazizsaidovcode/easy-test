import axios from "axios";
import { apiUrl } from "../../const/api";

const state = {
  error: null, // Xatoliklar korse boladi
  favorites: [], // Saqlangan postlar ID'lari jamlangan karoche
  posts: JSON.parse(localStorage.getItem("posts")) || [], // 😁Lokal xotiradan o'qish qilib kordim boshini lekin juda mayda ish
  hasFetchedPosts: !!localStorage.getItem("hasFetchedPosts"),
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
      if (!post) throw new Error("Post not found");
      await axios.post(`${apiUrl}commit/?postId=${postId}`, post);
      commit("markAsCommitted", postId);
    } catch (error) {
      console.error("Error committing post:", error);
    }
  },
  async fetchPosts({ commit }) {
    if (state.hasFetchedPosts) {
      return;
    }
    try {
      const response = await axios.get(`${apiUrl}posts`);
      commit("setPosts", response.data);
      commit("SET_HAS_FETCHED_POSTS", true);
    } catch (error) {
      commit("setError", "Failed to fetch posts.");
    }
  },
  editPost({ commit }, updatedPost) {
    commit("updatePost", updatedPost);
  },
  deletePost({ commit }, postId) {
    commit("removePost", postId);
  },
  toggleFavorite({ commit }, postId) {
    commit("toggleFavorite", postId);
  },
};

const mutations = {
  setPosts(state, posts) {
    state.posts = posts;
    localStorage.setItem("posts", JSON.stringify(posts));
  },
  setError(state, error) {
    state.error = error;
  },
  updatePost(state, updatedPost) {
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
      state.favorites = state.favorites.filter((id) => id !== postId);
    } else {
      state.favorites.push(postId);
    }
  },
  markAsCommitted(state, postId) {
    const post = state.posts.find((p) => p.id === postId);
    if (post) {
      post.committed = true;
    }
  },
  ADD_POST(state, post) {
    state.posts.push(post);
  },
  SET_HAS_FETCHED_POSTS(state, status) {
    state.hasFetchedPosts = status;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
