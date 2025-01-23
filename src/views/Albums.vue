<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Albums</h1>
    <p v-if="error" class="text-red-500 mb-4">{{ error }}</p>
    

    <div class="space-y-4">
      <div
        v-for="album in paginatedAlbums"
        :key="album.id"
        class="border p-4 rounded shadow"
      >
        <h2
          class="text-xl font-bold cursor-pointer"
          @click="viewAlbumPhotos(album.id)"
        >
          {{ album.title }}
        </h2>
        <p class="text-sm text-gray-600">
          User: {{ setSelectedUsers(album.userId) }}
        </p>
        <div class="mt-2 flex space-x-2">
          <button class="bg-green-500 text-white px-2 py-1 rounded">
            Edit
          </button>
          <button
            class="bg-red-500 text-white px-2 py-1 rounded"
            @click="deleteAlbum(album.id)"
          >
            Delete
          </button>
          <button
            class="bg-yellow-500 text-white px-2 py-1 rounded"
            @click="toggleFavorite(album.id)"
          >
            {{
              isFavorite(album.id)
                ? "Remove from Favorites"
                : "Add to Favorites"
            }}
          </button>
          <input type="checkbox" v-model="selectedAlbums" :value="album.id" />
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <Pagination
      :totalItems="allAlbums.length"
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

export default {
  components: { Pagination },
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      perPageOptions: [10, 20, 50, 100, "All"],
      selectedAlbums: [],
    };
  },
  computed: {
    ...mapGetters("albums", ["allAlbums", "error", "favoriteAlbums"]),
    ...mapGetters("users", ["allUsers", "error", "searchUsers"]),
    totalPages() {
      const totalItems =
        this.perPage === "All" ? this.allAlbums.length : this.perPage;
      return Math.ceil(this.allAlbums.length / totalItems);
    },

    paginatedAlbums() {
      if (this.perPage === "All") return this.allAlbums;
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.allAlbums.slice(start, end);
    },
  },
  methods: {
    ...mapActions("albums", ["fetchAlbums", "toggleFavorite", "deleteAlbum"]),
    ...mapActions("users", ["fetchUsers", "allUsers", "error", "searchUsers"]),

    onPageChanged(page) {
      console.log(this.currentPage);
      console.log(page.currentPage);

      this.currentPage = page.currentPage; 
    },
    onPerPageChanged(perPage) {
      console.log(perPage);

      this.perPage =
        perPage.perPage === "All" ? this.allAlbums.length : perPage.perPage; 
      this.currentPage = 1; 
    },

    setSelectedUsers(userId) {
      return this.allUsers.find((user) => user.id === userId)?.name;
    },
    updatePagination() {
      this.currentPage = 1;
    },
    isFavorite(albumId) {
      return this.favoriteAlbums.some((album) => album.id === albumId);
    },
    viewAlbumPhotos(albumId) {
      this.$router.push(`/photos/${albumId}`);
    },
  },
  created() {
    this.fetchAlbums();
    this.fetchUsers();
  },
};
</script>
