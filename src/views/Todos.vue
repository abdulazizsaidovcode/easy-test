<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">todos</h1>
    <p v-if="error" class="text-red-500 mb-4">{{ error }}</p>

    <!-- Controls -->
    <div class="mb-4 flex items-center space-x-4 flex-wrap gap-3">
      <button
        class="bg-green-500 text-white px-3 py-1 rounded"
        @click="openTaskModal()"
      >
        Add Task
      </button>

      <input
        type="text"
        v-model="searchQuery"
        @input="updateTodos"
        placeholder="Search todos"
        class="p-2 border rounded"
      />

      <select
        v-model="sortOption"
        @change="updateTodos"
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

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="text-center mb-4">
      <span class="loader"></span>
      <p>Loading...</p>
    </div>
    
    <div v-if="!isLoading && !paginatedTodos.length" class="text-center mb-4">
      <p>no todos !</p>
    </div>

    <!-- todos List -->
    <div v-else class="space-y-2">
      <div
        v-for="task in paginatedTodos"
        :key="task.id"
        class="flex items-center justify-between border p-2 rounded"
      >
        <div>
          <input
            type="checkbox"
            :checked="task.completed"
            @change="toggleTodoStatus(task.id)"
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
                'Delete Task',
                'Are you sure you want to delete this task?',
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

    <!-- Toasts -->
    <DynamicToast v-if="successMessage" :text="successMessage" type="success" />
    <DynamicToast v-if="errorMessage" :text="errorMessage" type="error" />

    <!-- Task Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeTaskModal"
    >
      <div class="bg-white rounded shadow-lg p-4">
        <h2 class="text-xl font-bold mb-4">
          {{ modalTodo.id ? "Edit Task" : "Add Task" }}
        </h2>
        <input
          v-model="modalTodo.title"
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

      isLoading: false,
      successMessage: null,
      errorMessage: null,

      perPage: 10,
      currentPage: 1,
      searchQuery: "",
      sortOption: "default",
      isCompletedFilter: false,
      isModalOpen: false,
      modalTodo: { id: null, title: "", completed: false },
    };
  },
  computed: {
    ...mapGetters("todos", ["allTodos", "error"]),
    filteredTodos() {
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
        todos = [...todos].reverse();
      }
      return todos;
    },
    paginatedTodos() {
      if (this.perPage === "All") return this.filteredTodos;
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredTodos.slice(start, end);
    },
  },
  methods: {
    ...mapActions("todos", ["fetchTodos", "toggleTodos", "deleteTodos", "addTodos", "editTodos"]),
    openModal(title, message, action, taskId = null) {
      this.universalModalTitle = title;
      this.universalModalMessage = message;
      this.selectedAction = action;
      this.selectedTaskId = taskId;
      this.universalModal = true;
    },
    handleConfirm() {
      if (this.selectedAction === "delete") {
        this.isLoading = true;
        this.deleteTodos(this.selectedTaskId)
          .then(() => {
            this.successMessage = "Task successfully deleted.";
          })
          .catch((error) => {
            this.errorMessage = error.message || "Failed to delete task.";
          })
          .finally(() => {
            this.isLoading = false;
            this.universalModal = false;
          });
      }
    },
    handleCancel() {
      this.universalModal = false;
      this.selectedAction = null;
      this.selectedTaskId = null;
    },
    toggleCompletedFilter() {
      this.isCompletedFilter = !this.isCompletedFilter;
    },
    onPageChanged(page) {
      this.currentPage = page.currentPage;
    },
    onPerPageChanged(perPage) {
      this.perPage = perPage.perPage === "All" ? this.allTodos.length : perPage.perPage;
      this.currentPage = 1;
    },
    updateTodos() {
      this.currentPage = 1;
    },
    toggleTodoStatus(taskId) {
      this.isLoading = true;
      this.toggleTodos(taskId)
        .then(() => {
          this.successMessage = "Task status updated.";
        })
        .catch((error) => {
          this.errorMessage = error.message || "Failed to update task status.";
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    openTaskModal(task = null) {
      this.modalTodo = task ? { ...task } : { id: null, title: "", completed: false };
      this.isModalOpen = true;
    },
    closeTaskModal() {
      this.isModalOpen = false;
      this.modalTodo = { id: null, title: "", completed: false };
    },
    saveTask() {
      if (this.modalTodo.title.trim() === "") {
        this.errorMessage = "Task title is required.";
        return;
      }

      this.isLoading = true;
      const action = this.modalTodo.id ? this.editTodos : this.addTodos;

      action(this.modalTodo)
        .then(() => {
          this.successMessage = this.modalTodo.id ? "Task successfully edited." : "Task successfully added.";
        })
        .catch((error) => {
          this.errorMessage = error.message || "Failed to save task.";
        })
        .finally(() => {
          this.isLoading = false;
          this.closeTaskModal();
        });
    },
  },
  created() {
    this.isLoading = true;
    this.fetchTodos()
      .catch((error) => {
        this.errorMessage = error.message || "Failed to fetch todos.";
      })
      .finally(() => {
        this.isLoading = false;
      });
  },
};
</script>

<style>
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
