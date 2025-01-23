<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Photos of Album {{ albumId }}</h1>
    <p v-if="error" class="text-red-500 mb-4">{{ error }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="photo in albumPhotos"
        :key="photo.id"
        class="relative rounded shadow p-4"
        @click="openModal(photo)"
      >
        <img
          :src="photo.thumbnailUrl"
          :alt="photo.title"
          class="w-full aspect-w-1 aspect-h-1 object-cover rounded"
          @error="handleImageError($event)"
          v-show="photo.thumbnailUrl"
        />
        <i
          v-show="!photo.thumbnailUrl"
          class="fa-solid fa-question text-gray-500 text-4xl"
        ></i>
        <p class="mt-2 text-sm text-gray-700">{{ photo.title }}</p>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
      @click.self="closeModal"
    >
      <div class="relative bg-white rounded shadow-lg p-4 text-center">
        <button
          class="absolute top-2 right-2 text-gray-700 text-lg"
          @click="closeModal"
        >
          &times;
        </button>
        <img
          :src="selectedPhoto.url"
          :alt="selectedPhoto.title"
          class="max-w-full h-auto rounded"
          @error="handleImageError($event)"
        />
        <p class="mt-2 text-sm text-center text-gray-700">
          {{ selectedPhoto.title }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      albumId: parseInt(this.$route.params.albumId), // Ensure it's an integer
      isModalOpen: false,
      selectedPhoto: null,
    };
  },
  computed: {
    ...mapGetters("photos", ["photosByAlbum", "error"]),
    albumPhotos() {
      return this.photosByAlbum(this.albumId); // Use Vuex getter correctly
    },
  },
  methods: {
    ...mapActions("photos", ["fetchPhotos"]),
    openModal(photo) {
      this.selectedPhoto = photo;
      this.isModalOpen = true;
      window.addEventListener("keydown", this.handleKeydown);
    },
    closeModal() {
      this.isModalOpen = false;
      this.selectedPhoto = null;
      window.removeEventListener("keydown", this.handleKeydown);
    },
    handleKeydown(event) {
      if (event.key === "Escape") {
        this.closeModal();
      }
    },
    handleImageError(event) {
      event.target.src = "https://cdni.iconscout.com/illustration/premium/thumb/network-error-illustration-download-in-svg-png-gif-file-formats--line-logo-internet-404-page-interruption-pack-communication-illustrations-5966930.png";
    },
  },
  async created() {
    await this.fetchPhotos();
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
}
</style>
