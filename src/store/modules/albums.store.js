// store/modules/albums.js
import axios from 'axios';

const state = {
  albums: [],
  favorites: [],
  error: null,
};

const getters = {
  allAlbums: (state) => state.albums,
  favoriteAlbums: (state) => state.albums.filter((album) =>
    state.favorites.includes(album.id)
  ),
  albumById: (state) => (id) => state.albums.find((album) => album.id === id),
  error: (state) => state.error,
};

const actions = {
  async fetchAlbums({ commit }) {
    try {
      const response = await axios.get('http://localhost:3000/albums');
      commit('setAlbums', response.data);
    } catch (error) {
      commit('setError', 'Failed to fetch albums.');
    }
  },
  toggleFavorite({ state, commit }, albumId) {
    if (state.favorites.includes(albumId)) {
      commit('removeFavorite', albumId);
    } else {
      commit('addFavorite', albumId);
    }
  },
  deleteAlbum({ commit }, albumId) {
    commit('removeAlbum', albumId);
  },
};

const mutations = {
  setAlbums: (state, albums) => (state.albums = albums),
  addFavorite: (state, albumId) => state.favorites.push(albumId),
  removeFavorite: (state, albumId) =>
    (state.favorites = state.favorites.filter((id) => id !== albumId)),
  removeAlbum: (state, albumId) =>
    (state.albums = state.albums.filter((album) => album.id !== albumId)),
  setError: (state, error) => (state.error = error),
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
