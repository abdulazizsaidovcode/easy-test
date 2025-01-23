// store/modules/photos.js
import axios from 'axios';

const state = {
    photos: [],
    error: null,
};

const getters = {
    allPhotos: (state) => state.photos,
    photosByAlbum: (state) => (albumId) =>
        state.photos.filter((photo) => photo.albumId === albumId),
    error: (state) => state.error,
};

const actions = {
    async fetchPhotos({ commit }) {
        try {
            const response = await axios.get(`${apiUrl}photos`);
            commit('setPhotos', response.data);
        } catch (error) {
            console.error("API Error:", error); // Xatoni log qilish
            commit('setError', 'Failed to fetch photos.');
        }
    }
};

const mutations = {
    setPhotos: (state, photos) => (state.photos = photos),
    setError: (state, error) => (state.error = error),
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
