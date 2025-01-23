<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">todos</h1>
    <p v-if="error" class="text-red-500 mb-4">{{ error }}</p>

    <!-- Controls -->
    <div class="mb-4 flex items-center space-x-4">
      <button
        class="bg-green-500 text-white px-3 py-1 rounded"
        @click="openTaskModal()"
      >
        Add Task
      </button>

      <input
        type="text"
        v-model="searchQuery"
        @input="updatetodos"
        placeholder="Search todos"
        class="p-2 border rounded"
      />

      <select
        v-model="sortOption"
        @change="updatetodos"
        class="p-2 border rounded"
      >
        <option value="default">Default (Incomplete first)</option>
        <option value="name">Sort by Name</option>
        <option value="status">Sort by Status</option>
      </select>
      <button
        class="bg-blue-500 text-white px-3 py-1 rounded"
        @click="toggleCompletedFilter"
      >
        {{
          isCompletedFilter ? "Show Default Order" : "Reverse Completed Order"
        }}
      </button>
    </div>

    <!-- todos List -->
    <div class="space-y-2">
      <div
        v-for="task in paginatedtodos"
        :key="task.id"
        class="flex items-center justify-between border p-2 rounded"
      >
        <div>
          <input
            type="checkbox"
            :checked="task.completed"
            @change="toggleTodostatus(task.id)"
            class="mr-2"
          />
          <span :class="{ 'line-through text-gray-500': task.completed }">
            {{ task.title }}
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <button
            class="bg-blue-500 text-white px-2 py-1 rounded"
            @click="openTaskModal(task)"
          >
            Edit
          </button>
          <button
            class="bg-red-500 text-white px-2 py-1 rounded"
            @click="
              openModal(
                'Delete Post',
                'Are you sure you want to delete this post?',
                'delete',
                task.id
              )
            "
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <UniversalModal
      :isOpen="universalModal"
      :title="universalModalTitle"
      :message="universalModalMessage"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

    <DynamicToast v-if="successMessage" :text="successMessage" type="success" />
    <DynamicToast v-if="error" :text="error" type="error" />

    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeTaskModal"
    >
      <div class="bg-white rounded shadow-lg p-4">
        <h2 class="text-xl font-bold mb-4">
          {{ modalTodos.id ? "Edit Task" : "Add Task" }}
        </h2>
        <input
          v-model="modalTodos.title"
          type="text"
          placeholder="Task title"
          class="w-full p-2 border rounded mb-4"
        />
        <div class="flex justify-end space-x-2">
          <button class="bg-gray-300 px-3 py-1 rounded" @click="closeTaskModal">
            Cancel
          </button>
          <button
            class="bg-green-500 text-white px-3 py-1 rounded"
            @click="saveTask"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <Pagination
      :totalItems="allTodos.length"
      :per-page-options="[10, 20, 50, 'All']"
      :default-per-page="10"
      :current-page.sync="currentPage"
      @page-changed="onPageChanged"
      @per-page-changed="onPerPageChanged"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Pagination from "../components/pagination.vue";
import UniversalModal from "../components/Modals/UniversalModal.vue";
import DynamicToast from "../components/toast.vue";

export default {
  components: { Pagination, UniversalModal, DynamicToast },
  data() {
    return {
      universalModal: false,
      universalModalTitle: "",
      universalModalMessage: "",
      universalModalType: "",
      selectedAction: "",
      selectedTaskId: "",

      successMessage: null,
      error: null,

      perPage: 10,
      currentPage: 1,
      searchQuery: "",
      sortOption: "default",
      isCompletedFilter: false,
      perPageOptions: [10, 20, 50, 100, "All"],
      isModalOpen: false,
      modalTodos: { id: null, title: "", completed: false },
    };
  },
  computed: {
    ...mapGetters("todos", ["allTodos", "error"]),
    filteredDodos() {
      let todos = this.allTodos;
      if (this.searchQuery) {
        todos = todos.filter((task) =>
          task.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.sortOption === "name") {
        todos = [...todos].sort((a, b) => a.title.localeCompare(b.title));
      } else if (this.sortOption === "status") {
        todos = [...todos].sort((a, b) => a.completed - b.completed);
      }
      if (this.isCompletedFilter) {
        todos = [...todos].reverse(); // Teskari tartibda chiqarish
      }
      return todos;
    },
    paginatedtodos() {
      if (this.perPage === "All") return this.filteredDodos;
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      if (this.filteredDodos && this.filteredDodos.length > 0) {
        return this.filteredDodos.slice(start, end);
      }
    },
    totalPages() {
      const totalItems =
        this.perPage === "All" ? this.filteredDodos.length : this.perPage;
      if (this.filteredDodos && this.filteredDodos.length > 0) {
        return Math.ceil(this.filteredDodos.length / totalItems);
      }
    },
  },
  methods: {
    ...mapActions("todos", [
      "fetchTodos",
      "toggleTodos",
      "deleteTodos",
      "addTodos",
      "editTodos",
    ]),
    openModal(title, message, action, postId = null) {
      this.universalModalTitle = title;
      this.universalModalMessage = message;
      this.selectedAction = action;
      this.selectedTaskId = postId;
      this.universalModal = true;
    },
    handleConfirm() {
      switch (this.selectedAction) {
        case "delete":
          this.deleteTodos(this.selectedTaskId);
          this.successMessage = "Task successfully deleted.";
          break;
        default:
          console.error("Invalid action:", this.selectedAction);
      }
      this.universalModal = false;
    },

    handleCancel() {
      this.deletemodal = false;
      this.selectedAction = null;
      this.selectedPostId = null;
    },

    toggleCompletedFilter() {
      this.isCompletedFilter = !this.isCompletedFilter; // Filtrni teskari o‘zgartirish
    },
    onPageChanged(page) {
      console.log(this.currentPage);
      console.log(page.currentPage);

      this.currentPage = page.currentPage; // Joriy sahifani yangilash
    },
    onPerPageChanged(perPage) {
      console.log(perPage);

      // "Posts per page" o'zgartirilganda ishlaydi
      this.perPage =
        perPage.perPage === "All" ? this.allTodos.length : perPage.perPage; // "All" bo'lsa, barcha postlarni ko'rsatish
      this.currentPage = 1; // Sahifani 1-ga qaytarish
    },
    updateTodos() {
      this.currentPage = 1;
    },
    toggleTodostatus(taskId) {
      this.toggleTodos(taskId);
    },
    openTaskModal(task = null) {
      this.modalTodos = task
        ? { ...task }
        : { id: null, title: "", completed: false };
      this.isModalOpen = true;
    },
    closeTaskModal() {
      this.isModalOpen = false;
      this.modalTodos = { id: null, title: "", completed: false };
    },
    saveTask() {
      if (this.modalTodos.id) {
        if (this.modalTodos.title.trim() === "") {
          this.error = "Task title is required.";
          return
        } else {
          this.successMessage = "Task successfully edited.";
          this.editTodos(this.modalTodos);
        }
      } else {
        this.addTodos(this.modalTodos);
        this.successMessage = "Task successfully added.";
      }
      this.closeTaskModal();
    },
  },
  created() {
    this.fetchTodos();
  },
};
</script>
