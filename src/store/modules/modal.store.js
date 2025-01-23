// store/modules/ModalStore.js
const state = {
    modals: {
        showAddPostModal: false,
        showEditPostModal: false,
        showDeleteConfirmModal: false,
    },
    modalData: null, // Modal bilan ishlash uchun qo'shimcha ma'lumot
}

const mutations = {
    OPEN_MODAL(state, { modalName, data = null }) {
        state.modals[modalName] = true;
        state.modalData = data;
    },
    CLOSE_MODAL(state, modalName) {
        state.modals[modalName] = false;
        state.modalData = null;
    },
}

const actions = {
    openModal({ commit }, payload) {
        commit("OPEN_MODAL", payload);
    },
    closeModal({ commit }, modalName) {
        commit("CLOSE_MODAL", modalName);
    },
}

const getters = {
    isModalOpen: (state) => (modalName) => state.modals[modalName],
    getModalData: (state) => state.modalData,
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
  };
