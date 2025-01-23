// store/modules/albums.js
import axios from "axios";
import { apiUrl } from "../../const/api";

const state = {
  albums: [], // Barcha albomlar saqlanadi
  favorites: [], // Sevimli albomlar uchun ID ro'yxati
  error: null, // Xatolik haqida ma'lumot
};

const getters = {
  // Barcha albomlar ro'yxati
  allAlbums: (state) => state.albums,

  // Sevimli albomlar
  favoriteAlbums: (state) =>
    state.albums.filter((album) => state.favorites.includes(album.id)),

  // ID orqali albomni topish
  albumById: (state) => (id) => state.albums.find((album) => album.id === id),

  // Xatolik holatini olish
  error: (state) => state.error,
};

const actions = {
  // Albomlarni serverdan olish
  async fetchAlbums({ commit }) {
    try {
      const response = await axios.get(`${apiUrl}albums`);
      commit("setAlbums", response.data); // Albomlarni holatga yozish
    } catch (error) {
      commit("setError", "Failed to fetch albums."); // Xatolikni yozish
    }
  },

  // Albomni sevimlilarga qo'shish yoki o'chirish
  toggleFavoriteAlbum({ commit }, albumId) {
    commit("TOGGLE_ALBUM_FAVORITE", albumId);
  },

  // Albomni o'chirish
  deleteAlbum({ commit }, albumId) {
    commit("DELETE_ALBUM", albumId);
  },
};

const mutations = {
  // Albomlarni holatga yozish
  setAlbums: (state, albums) => (state.albums = albums),

  // Albomni sevimlilarga qo'shish yoki o'chirish
  TOGGLE_ALBUM_FAVORITE(state, albumId) {
    if (state.favorites.includes(albumId)) {
      state.favorites = state.favorites.filter((id) => id !== albumId);
    } else {
      state.favorites.push(albumId);
    }
  },

  // Albomni o'chirish uchun de
  DELETE_ALBUM(state, albumId) {
    state.albums = state.albums.filter((album) => album.id !== albumId);
    state.favorites = state.favorites.filter((id) => id !== albumId);
  },

  // Xatolikni yozish narmalni gapir voy
  setError: (state, error) => (state.error = error),
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
