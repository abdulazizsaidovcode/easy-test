<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Posts</h1>

    <!-- Error and Success Messages -->
    <DynamicToast v-if="successMessage" :text="successMessage" type="success" />
    <DynamicToast v-if="error" :text="error" type="error" />

    <!-- Filters Section -->
    <div class="mb-4 space-y-2">
      <div class="flex space-x-4 items-center">
        <input
          v-model="filters.title"
          type="text"
          placeholder="Filter by title"
          class="p-2 border rounded"
        />

        <select
          v-model="filters.userId"
          multiple
          class="p-2 border rounded w-64"
        >
          <option v-for="user in getAllUsers" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>

        <label>
          <input type="checkbox" v-model="filters.favorite" class="mr-2" />
          Favorites only
        </label>
      </div>
    </div>

    <!-- Sorting -->
    <div class="mb-4 flex justify-between items-center">
      <div class="space-x-2">
        <button
          v-for="option in sortOptions"
          :key="option.field"
          @click="toggleSort(option.field)"
          class="px-4 py-2 rounded border bg-gray-200 hover:bg-gray-300"
        >
          {{ option.label }}
          <span v-if="sortField === option.field">
            {{ sortDirection === "asc" ? "↑" : "↓" }}
          </span>
        </button>
      </div>

      <!-- Add New Post Button -->
      <button
        @click="
          openModal(
            'Add New Post',
            'Fill in the details below to create a new post.',
            'add'
          )
        "
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Add New Post
      </button>
    </div>

    <!-- Posts List -->
    <div class="space-y-4">
      <div
        v-for="post in filteredAndPaginatedPosts"
        :key="post.id"
        class="border p-4 rounded shadow"
      >
        <div class="flex items-center space-x-4">
          <input
            type="checkbox"
            :value="post.id"
            v-model="selectedPosts"
            class="form-checkbox"
          />
          <div>
            <h2 class="text-xl font-bold">{{ post.title }}</h2>
            <p class="text-sm text-gray-600">{{ post.body }}</p>
          </div>
        </div>

        <CommentAccordion :postId="post.id" />

        <div class="mt-2 flex space-x-2">
          <button
            :disabled="isLoading"
            @click="openEditModal(post)"
            class="bg-green-700 text-white px-2 py-1 rounded disabled:bg-gray-400"
          >
            Edit
          </button>

          <button
            :disabled="isLoading"
            @click="
              openModal(
                'Delete Post',
                'Are you sure you want to delete this post?',
                'delete',
                post.id
              )
            "
            class="bg-red-500 text-white px-2 py-1 rounded disabled:bg-gray-400"
          >
            Delete
          </button>

          <button
            :disabled="isLoading"
            @click="openModal(
                'Add to favorites',
                'Are you sure you want to add to favourites?',
                'AddToFavorites',
                post.id
              )"
            class="bg-yellow-500 text-white px-2 py-1 rounded disabled:bg-gray-400"
          >
            {{
              isFavorite(post.id)
                ? isLoading
                  ? "Processing..."
                  : "Remove from Favorites"
                : isLoading
                ? "Processing..."
                : "Add to Favorites"
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedPosts.length" class="mt-4">
      <button
        @click="confirmBulkAction('favorite')"
        class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        Add to Favorites
      </button>
      <button
        @click="
          openModal(
            'Delete Posts',
            'Are you sure you want to delete this post?',
            'deleteSelected'
          )
        "
        class="bg-red-500 text-white px-4 py-2 rounded"
      >
        Delete Selected
      </button>
    </div>

    <!-- Modal -->
    <UniversalModal
      :isOpen="deletemodal"
      :title="modalTitle"
      :message="modalMessage"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

    <EditModal
      v-if="editModalOpen"
      :isOpen="editModalOpen"
      :post="currentPost"
      @save="saveEdit"
      @close="editModalOpen = false"
    />

    <!-- Pagination -->
    <div class="mt-4 flex justify-between space-x-2">
      <div class="flex gap-3">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          :class="[
            'px-3 py-1 rounded border',
            currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200',
          ]"
        >
          {{ page }}
        </button>
      </div>
      <div class="flex justify-between items-center">
        <label for="perPage" class="text-sm mr-3"> Posts per page: </label>
        <select
          id="perPage"
          v-model="perPage"
          @change="updatePosts"
          class="p-2 border rounded"
        >
          <option
            v-for="option in perPageOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import EditModal from "../components/Modals/EditModal.vue";
import CommentAccordion from "../components/accordion/Accordion_commit.vue";
import DynamicToast from "../components/toast.vue";
import UniversalModal from "../components/Modals/UniversalModal.vue";

export default {
  components: { EditModal, CommentAccordion, DynamicToast, UniversalModal },
  data() {
    return {
      deletemodal: false,
      modalTitle: "",
      modalMessage: "",
      deleteModalType: "",
      selectedAction: "",
      editModalOpen: false,

      currentPost: null,

      perPage: 10,
      currentPage: 1,
      perPageOptions: [10, 20, 50, 100, "All"],
      isLoading: false,
      successMessage: null,
      selectedPosts: [],
      filters: {
        title: "",
        userId: [],
        favorite: false,
      },
    };
  },
  computed: {
    ...mapGetters("posts", ["allPosts", "error", "favoritePosts"]),
    ...mapGetters("users", ["allUsers", "error", "selectedUsers"]),

    users() {
      return this.allPosts
        .map((post) => ({ id: post.userId, name: `User ${post.userId}` }))
        .filter(
          (value, index, self) =>
            self.findIndex((v) => v.id === value.id) === index
        );
    },
    totalPages() {
      const totalItems =
        this.perPage === "All" ? this.filteredPosts.length : this.perPage;
      return Math.ceil(this.filteredPosts.length / totalItems);
    },
    getAllUsers() {
      return this.allUsers;
    },
    
    filteredPosts() {
      return this.allPosts
        .filter((post) =>
          this.filters.title
            ? post.title
                .toLowerCase()
                .includes(this.filters.title.toLowerCase())
            : true
        )
        .filter((post) =>
          this.filters.userId.length
            ? this.filters.userId.includes(post.userId)
            : true
        )
        .filter((post) =>
          this.filters.favorite ? this.isFavorite(post.id) : true
        );
    },
    filteredAndPaginatedPosts() {
      if (this.perPage === "All") return this.filteredPosts;
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredPosts.slice(start, end);
    },
  },
  methods: {
    ...mapActions("posts", [
      "fetchPosts",
      "toggleFavorite",
      "editPost",
      "deletePost",
    ]),
    ...mapActions("users", ["fetchUsers"]),

    openModal(title, message, action, postId = null) {
      this.modalTitle = title;
      this.modalMessage = message;
      this.selectedAction = action;
      this.selectedPostId = postId;
      this.deletemodal = true;
    },
    handleConfirm() {
      switch (this.selectedAction) {
        case "delete":
          this.performDelete(this.selectedPostId);
          break;
        case "deleteSelected":
          this.confirmBulkAction("delete");
          break;
        case "AddToFavorites":
          this.toggleFavorite(this.selectedPostId);
          break;
        default:
          console.error("Invalid action:", this.selectedAction);
      }
      this.deletemodal = false;
    },
    async performDelete(postId) {
      this.isLoading = true;
      try {
        await this.$store.dispatch("posts/deletePost", postId);
        this.successMessage = "Post successfully deleted.";
        setTimeout(() => (this.successMessage = null), 3000);
      } catch (error) {
        console.error("Error deleting post:", error);
      } finally {
        this.isLoading = false;
      }
    },

    handleCancel() {
      this.deletemodal = false;
      this.selectedAction = null;
      this.selectedPostId = null;
    },
    updatePosts() {
      this.currentPage = 1;
    },
    isFavorite(postId) {
      return this.favoritePosts.some((post) => post.id === postId);
    },
    openEditModal(post) {
      this.currentPost = { ...post }; // Post copy for editing
      this.editModalOpen = true;
    },
    async deletePost(postId) {
      this.isLoading = true;
      try {
        await this.$store.dispatch("posts/deletePost", postId);
        this.successMessage = "Post successfully deleted.";
        setTimeout(() => (this.successMessage = null), 3000);
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async toggleFavorite(postId) {
      this.isLoading = true;
      try {
        await this.$store.dispatch("posts/toggleFavorite", postId);
        this.successMessage = "Favorite status updated.";
        setTimeout(() => (this.successMessage = null), 3000);
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async saveEdit(updatedPost) {
      this.isLoading = true;
      try {
        await this.$store.dispatch("posts/editPost", updatedPost);
        this.successMessage = "Post successfully updated.";
        this.editModalOpen = false;
        setTimeout(() => (this.successMessage = null), 3000);
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    confirmBulkAction(action) {
      if (action === "favorite") {
        this.selectedPosts.forEach((postId) => this.toggleFavorite(postId));
      } else if (action === "delete") {
        this.selectedPosts.forEach((postId) => this.deletePost(postId));
      }

      this.selectedPosts = [];
    },
  },
  created() {
    this.fetchPosts();
    this.fetchUsers();
  },
};
</script>

<style>
/* Tailwind klasslari orqali style berildi */
</style>
