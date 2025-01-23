import axios from "axios";
import { apiUrl } from "../../const/api";

const state = {
  todos: [],
  error: null,
};

const getters = {
  allTodos: (state) =>
    state.todos.sort((a, b) => a.completed - b.completed), // Default sort qilish
  error: (state) => state.error,
};

const actions = {
  async fetchTodos({ commit }) {
    try {
      const response = await axios.get(`${apiUrl}todos`);
      commit("setTodos", response.data);
    } catch (error) {
      commit("setError", "Failed to fetch todos.");
    }
  },
  toggleTodos({ commit }, todosId) {
    commit("toggleTodosStatus", todosId);
  },
  deleteTodos({ commit }, todosId) {
    commit("removeTodos", todosId);
  },
  addTodos({ commit }, todos) {
    commit("addNewTodos", todos);
  },
  editTodos({ commit }, todos) {
    commit("updateTodos", todos);
  },
};

const mutations = {
  setTodos: (state, todos) => (state.todos = todos),
  setError: (state, error) => (state.error = error),
  toggleTodosStatus(state, todosId) {
    const todos = state.todos.find((t) => t.id === todosId);
    if (todos) todos.completed = !todos.completed;
  },
  removeTodos(state, todosId) {
    state.todos = state.todos.filter((t) => t.id !== todosId);
  },
  addNewTodos(state, todos) {
    state.todos.unshift({ ...todos, id: Date.now() });
  },
  updateTodos(state, updatedtodos) {
    const index = state.todos.findIndex((t) => t.id === updatedtodos.id);
    if (index !== -1) state.todos.splice(index, 1, updatedtodos);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
