<template>
  <div class="p-4">
    <DynamicToast v-if="successMessage" :text="successMessage" type="success" />
    <DynamicToast v-if="errorMessage" :text="errorMessage" type="error" />

    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Albums</h1>
      <div>
        <select
          v-model="filterUser"
          @change="applyFilter"
          class="border rounded px-2 py-1"
        >
          <option value="">All Users</option>
          <option v-for="user in allUsers" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="mb-4 flex justify-between items-center">
      <div v-if="selectedAlbums.length">
        <button
          @click="confirmBulkAction('favorite')"
          class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Add to Favorites
        </button>
        <button
          @click="
            openModal(
              'Delete Albums',
              'Are you sure you want to delete selected albums?',
              'deleteSelected'
            )
          "
          class="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete Selected
        </button>
      </div>
    </div>

    <p v-if="error" class="text-red-500 mb-4">{{ error }}</p>
    <p v-if="loading" class="text-gray-600 mb-4">Loading albums...</p>
    <p v-if="!loading && !filteredAlbums.length" class="text-gray-600">
      No albums found.
    </p>

    <div v-if="!loading && filteredAlbums.length" class="space-y-4">
      <div
        v-for="album in paginatedAlbums"
        :key="album.id"
        class="border p-4 rounded shadow flex items-center justify-between"
      >
        <div class="flex gap-5">
          <input type="checkbox" v-model="selectedAlbums" :value="album.id" />
          <div>
            <h2
              class="text-xl font-bold cursor-pointer"
              @click="viewAlbumPhotos(album.id)"
            >
              {{ album.title }}
            </h2>
            <p class="text-sm text-gray-600">
              User: {{ getUserName(album.userId) }}
            </p>
          </div>
        </div>
        <div class="mt-2 flex space-x-2">
          <button class="bg-green-500 text-white px-2 py-1 rounded">
            <i class="fa-solid fa-pen-to-square"></i>
            Edit
          </button>
          <button
            class="bg-red-500 text-white px-2 py-1 rounded"
            @click="deleteAlbum(album.id)"
          >
            <i class="fa-solid fa-trash"></i>
            Delete
          </button>
          <button
            class="bg-yellow-500 text-white px-2 py-1 rounded"
            @click="toggleFavorite(album.id)"
          >
            <i v-if="isFavorite(album.id)" class="fa-solid fa-bookmark"></i>
            <i
              v-else="!isFavorite(album.id)"
              class="fa-regular fa-bookmark"
            ></i>
            {{
              isFavorite(album.id)
                ? "Remove from Favorites"
                : "Add to Favorites"
            }}
          </button>
        </div>
      </div>
    </div>

    <UniversalModal
      :isOpen="deletemodal"
      :title="modalTitle"
      :message="modalMessage"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

    <Pagination
      :totalItems="filteredAlbums.length"
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
import Pagination from "@/components/Pagination.vue";
import UniversalModal from "@/components/Modals/UniversalModal.vue";
import DynamicToast from "@/components/toast.vue";

export default {
  components: { Pagination, UniversalModal, DynamicToast },
  data() {
    return {
      deletemodal: false,
      modalTitle: "",
      modalMessage: "",
      selectedAction: "",
      filterUser: "",
      perPage: 10,
      currentPage: 1,
      selectedAlbums: [],
      successMessage: "",
      errorMessage: "",
      loading: false,
    };
  },
  computed: {
    ...mapGetters("albums", ["allAlbums", "favoriteAlbums", "error"]),
    ...mapGetters("users", ["allUsers"]),

    filteredAlbums() {
      if (!this.filterUser) return this.allAlbums;
      return this.allAlbums.filter((album) => album.userId == this.filterUser);
    },

    paginatedAlbums() {
      if (this.perPage === "All") return this.filteredAlbums;
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredAlbums.slice(start, end);
    },
  },
  methods: {
    ...mapActions("albums", [
      "fetchAlbums",
      "toggleFavoriteAlbum",
      "deleteAlbum",
    ]),
    ...mapActions("users", ["fetchUsers"]),

    openModal(title, message, action) {
      this.modalTitle = title;
      this.modalMessage = message;
      this.selectedAction = action;
      this.deletemodal = true;
    },

    handleConfirm() {
      if (this.selectedAction === "deleteSelected") {
        this.selectedAlbums.forEach(async (id) => {
          try {
            await this.deleteAlbum(id);
            this.successMessage = "Selected albums deleted successfully.";
            this.clearMessage("successMessage");
          } catch (error) {
            this.errorMessage = "Failed to delete selected albums.";
            this.clearMessage("errorMessage");
          }
        });
        this.selectedAlbums = [];
      }
      this.deletemodal = false;
    },

    clearMessage(type) {
      setTimeout(() => {
        this[type] = "";
      }, 3000);
    },

    onPageChanged(page) {
      this.currentPage = page.currentPage;
    },

    onPerPageChanged(perPage) {
      this.perPage = perPage === "All" ? "All" : parseInt(perPage);
      this.currentPage = 1;
    },

    applyFilter() {
      this.currentPage = 1;
    },

    async toggleFavorite(albumId) {
      try {
        await this.toggleFavoriteAlbum(albumId);
        this.successMessage = "Album favorite status updated successfully.";
        this.clearMessage("successMessage");
      } catch (error) {
        this.errorMessage = "Failed to update album favorite status.";
        this.clearMessage("errorMessage");
      }
    },

    getUserName(userId) {
      return this.allUsers.find((user) => user.id == userId)?.name || "Unknown";
    },

    viewAlbumPhotos(albumId) {
      this.$router.push(`/photos/${albumId}`);
    },

    isFavorite(albumId) {
      return this.favoriteAlbums.some((album) => album.id === albumId);
    },

    confirmBulkAction(action) {
      if (action === "favorite") {
        this.selectedAlbums.forEach(async (albumId) => {
          try {
            await this.toggleFavoriteAlbum(albumId);
            this.successMessage = "Selected albums added to favorites.";
            this.clearMessage("successMessage");
          } catch (error) {
            this.errorMessage = "Failed to add selected albums to favorites.";
            this.clearMessage("errorMessage");
          }
        });
      }
    },
  },
  async created() {
    this.loading = true;
    try {
      await this.fetchAlbums();
      await this.fetchUsers();
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      this.loading = false;
    }
  },
};
</script>
