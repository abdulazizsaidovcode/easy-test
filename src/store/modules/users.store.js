import axios from "axios";

const state = {
  users: [],
  error: null,
  selected: [],
};

const getters = {
  allUsers: (state) => state.users,
  error: (state) => state.error,
  selectedUsers: (state) =>
    state.users.filter((user) => state.selected.includes(user.id)), // Saqlangan userlarni olish
};

const actions = {
  async fetchUsers({ commit }) {
    // API'dan postlarni olish
    try {
      const response = await axios.get(
        "http://localhost:3000/users"
      );
      commit("setUsers", response.data); // Postlarni store'ga yuklash
    } catch (error) {
      commit("setError", "Failed to fetch Users."); // Xatolikni saqlash
    }
  },
};

const mutations = {
  setUsers(state, users) {
    state.users = users; // Postlani yangilash
  },
  setError(state, error) {
    state.error = error; // Xatolikni o'rnatish
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
