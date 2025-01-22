<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Posts</h1>

    <!-- Success va Error xabarlar -->
    <DynamicToast v-if="successMessage" :text="successMessage" type="success" />
    <DynamicToast v-if="error" :text="error" type="error" />

    <!-- Postlar ro'yxati -->
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

        <div class="mt-2 flex space-x-2">
          <button
            :disabled="isLoading"
            @click="openModal('Delete Post', 'Are you sure you want to delete this post?', 'delete', post.id)"
            class="bg-red-500 text-white px-2 py-1 rounded disabled:bg-gray-400"
          >
            Delete
          </button>

          <button
            :disabled="isLoading"
            @click="toggleFavorite(post.id)"
            class="bg-yellow-500 text-white px-2 py-1 rounded disabled:bg-gray-400"
          >
            {{ isFavorite(post.id) ? 'Remove from Favorites' : 'Add to Favorites' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <UniversalModal
      :isOpen="modalOpen"
      :title="modalTitle"
      :message="modalMessage"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>


<script>
import DynamicToast from "../toast.vue";
import { mapActions, mapGetters } from "vuex";
import UniversalModal from "./UniversalModal.vue";

export default {
  components: { UniversalModal, DynamicToast },
  data() {
    return {
      modalOpen: false,
      modalTitle: "",
      modalMessage: "",
      selectedAction: null, // Amal turi (masalan: delete)
      selectedPostId: null, // Post ID modalda ishlatish uchun
      isLoading: false,
      successMessage: null,
      selectedPosts: [], // Tanlangan postlar uchun IDlar
    };
  },
  computed: {
    ...mapGetters("posts", ["allPosts", "favoritePosts", "error"]),
    filteredAndPaginatedPosts() {
      return this.allPosts; // Hozircha barcha postlarni qaytaradi
    },
  },
  methods: {
    ...mapActions("posts", ["deletePost", "toggleFavorite"]),
    openModal(title, message, action, postId = null) {
      console.log("Opening modal...",modalOpen);
      
      this.modalTitle = title;
      this.modalMessage = message;
      this.selectedAction = action;
      this.selectedPostId = postId;
      this.modalOpen = true;
    },
    handleConfirm() {
      if (this.selectedAction === "delete") {
        this.performDelete(this.selectedPostId);
      } else if (this.selectedAction === "deleteSelected") {
        this.selectedPosts.forEach((postId) => this.performDelete(postId));
        this.selectedPosts = [];
      }
      this.modalOpen = false;
    },
    handleCancel() {
      this.modalOpen = false;
      this.selectedAction = null;
      this.selectedPostId = null;
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
    isFavorite(postId) {
      return this.favoritePosts.some((post) => post.id === postId);
    },
  },
};
</script>
