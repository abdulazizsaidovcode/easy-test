<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Posts</h1>

    <!-- Error and Success Messages -->
    <DynamicToast v-if="successMessage" :text="successMessage" type="success" />
    <DynamicToast v-if="error" :text="error" type="error" />

    <!-- Filters Section -->
    <div class="mb-4 space-y-2">
      <div
        class="flex space-x-4 items-center justify-between md:flex-row flex-col sm:gap-0 gap-5"
      >
        <div class="flex gap-4 items-center sm:flex-nowrap flex-wrap">
          <input
            v-model="filters.title"
            type="text"
            placeholder="Filter by title"
            class="p-2 border rounded"
          />
          <select v-model="singleUserId" class="p-2 border rounded w-64">
            <option value="">All</option>
            <option v-for="user in getAllUsers" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>

          <label>
            <input type="checkbox" v-model="filters.favorite" class="mr-2" />
            Favorites only
          </label>
        </div>
        <!-- Add New Post Button -->
        <button
          @click="
            () => {
              openEditModal(post, 'post');
            }
          "
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add New Post
        </button>
      </div>
    </div>

    <!-- Sorting -->
    <div class="mb-4 flex justify-between items-center">
      <div v-if="selectedPosts.length" class="">
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
    </div>

    <!-- Posts List -->

    <div
      v-if="!isLoading && filteredAndPaginatedPosts.length"
      class="space-y-4"
    >
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
            class="form-checkbox p-20"
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
            <i class="fa-solid fa-pen-to-square"></i>
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
            <i class="fa-solid fa-trash"></i>
            Delete
          </button>

          <button
            :disabled="isLoading"
            @click="
              openModal(
                'Add to favorites',
                'Are you sure you want to add to favourites?',
                'AddToFavorites',
                post.id
              )
            "
            class="bg-yellow-500 text-white px-2 py-1 rounded disabled:bg-gray-400"
          >
            <i v-if="isFavorite(post.id)" class="fa-solid fa-bookmark"></i>
            <i v-else="!isFavorite(post.id)" class="fa-regular fa-bookmark"></i>
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
    <!-- Loading and No Data States -->
    <Skleton v-if="isLoading" />
    <div
      v-else-if="!filteredAndPaginatedPosts.length && !isLoading"
      class="text-center text-gray-500 py-10"
    >
      <p>No posts available. Try changing the filters or add new posts.</p>
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
      :users="allUsers"
      @save="saveEdit"
      @close="editModalOpen = false"
    />
    <!-- Pagination -->
    <Pagination
      :totalItems="filteredPosts.length"
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
import EditModal from "../components/Modals/EditModal.vue";
import CommentAccordion from "../components/accordion/Accordion_commit.vue";
import DynamicToast from "../components/toast.vue";
import UniversalModal from "../components/Modals/UniversalModal.vue";
import Pagination from "../components/pagination.vue";
import Skleton from "../components/skleton.vue";
import Loading from "../components/loading.vue";

export default {
  components: {
    EditModal,
    CommentAccordion,
    DynamicToast,
    UniversalModal,
    Pagination,
    Skleton,
  },
  data() {
    return {
      deletemodal: false,
      modalTitle: "",
      modalMessage: "",
      deleteModalType: "",
      selectedAction: "",

      editmodalAction: "",
      editModalOpen: false,

      currentPost: null,

      perPage: 10,
      currentPage: 1,
      perPageOptions: [10, 20, 50, 100, "All"],
      isLoading: true,
      successMessage: null,
      singleUserId: 0,
      selectedPosts: [],
      filters: {
        title: "",
        userId: "",
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

    getAllUsers() {
      return this.allUsers;
    },
    singleUserId: {
      get() {
        return this.filters.userId.length ? this.filters.userId[0] : "";
      },
      set(value) {
        this.filters.userId = value ? [value] : [];
      },
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
          this.filters.userId ? this.filters.userId == post.userId : true
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
    totalPages() {
      const totalItems =
        this.perPage === "All" ? this.filteredPosts.length : this.perPage;
      return Math.ceil(this.filteredPosts.length / totalItems);
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

    onPageChanged(page) {
      console.log(this.currentPage);
      console.log(page.currentPage);

      this.currentPage = page.currentPage; // Joriy sahifani yangilash
    },
    onPerPageChanged(perPage) {
      console.log(perPage);

      // "Posts per page" o'zgartirilganda ishlaydi
      this.perPage =
        perPage.perPage === "All" ? this.filteredPosts.length : perPage.perPage; // "All" bo'lsa, barcha postlarni ko'rsatish
      this.currentPage = 1; // Sahifani 1-ga qaytarish
    },

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
    openEditModal(post, type = "edit") {
      this.editModalAction = type; // 'edit' yoki 'post' bo'lishi kerak
      this.currentPost = type === "post" ? {} : { ...post }; // 'post' bo'lsa, bo'sh obyekt
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
        // Qo'shish holati
        if (this.editModalAction == "post") {
          updatedPost.userId = parseInt(updatedPost.userId);
          updatedPost.id = Date.now(); // Yangi post uchun vaqtinchalik ID
          updatedPost.title = updatedPost.title.trim();
          updatedPost.body = updatedPost.body.trim();

          if (!updatedPost.title || !updatedPost.body) {
            throw new Error("Title, user ID, and body are required.");
          }

          await this.$store.dispatch("posts/addPost", updatedPost); // Qo'shish uchun Vuex action
          this.successMessage = "Post successfully added.";
        } else {
          // Tahrirlash holati
          await this.$store.dispatch("posts/editPost", updatedPost);
          this.successMessage = "Post successfully updated.";
        }

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
  mutations: {
    ADD_POST(state, post) {
      state.allPosts.unshift(post); // Yangi postni boshiga qo'shish
    },
  },
  created() {
    try {
      this.fetchPosts();
      this.fetchUsers();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.isLoading = false; // Yuklanish holatini o'chirish
    }
  },
};
</script>

<style>
/* Tailwind klasslari orqali style berildi */
</style>
