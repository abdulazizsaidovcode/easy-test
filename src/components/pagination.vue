<template>
  <div class="mt-4 flex justify-between items-center space-x-2 sm:flex-row flex-col gap-5 sm:gap-0">
    <!-- Previous Button -->
    <div class="flex gap-5 ">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded border bg-gray-200 disabled:opacity-50"
      >
        Prev
      </button>

      <!-- Page Numbers -->
      <div class="flex gap-1">
        <span v-if="visiblePages[0] > 1" class="px-2">...</span>
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 rounded border',
            currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200',
          ]"
        >
          {{ page }}
        </button>
        <span
          v-if="visiblePages[visiblePages.length - 1] < totalPages"
          class="px-2"
          >...</span
        >
      </div>

      <!-- Next Button -->
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded border bg-gray-200 disabled:opacity-50"
      >
        Next
      </button>
    </div>

    <!-- Posts Per Page Selector -->
    <div class="flex items-center">
      <label for="perPage" class="text-sm mr-3">Posts per page:</label>
      <select
        id="perPage"
        v-model="perPage"
        @change="updatePerPage"
        class="p-2 border rounded"
      >
        <option v-for="option in perPageOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    totalItems: {
      type: Number,
      required: true,
    },
    perPageOptions: {
      type: Array,
      default: () => [5, 10, 20, 50, "all"],
    },
    defaultPerPage: {
      type: Number,
      default: 10,
    },
    visiblePageCount: {
      type: Number,
      default: 5, // Number of page numbers to display at once
    },
  },
  data() {
    return {
      currentPage: 1,
      perPage: this.defaultPerPage,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.perPage);
    },
    visiblePages() {
      const pages = [];
      const half = Math.floor(this.visiblePageCount / 2);

      let start = Math.max(1, this.currentPage - half);
      let end = Math.min(this.totalPages, this.currentPage + half);

      // Ensure visible pages count matches `visiblePageCount` when possible
      if (end - start + 1 < this.visiblePageCount) {
        if (start === 1) {
          end = Math.min(this.totalPages, start + this.visiblePageCount - 1);
        } else if (end === this.totalPages) {
          start = Math.max(1, end - this.visiblePageCount + 1);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },
  methods: {
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.$emit("page-changed", {
          currentPage: this.currentPage,
          perPage: this.perPage,
        });
      }
    },
    updatePerPage() {
      this.currentPage = 1; // Reset to first page
      this.$emit("per-page-changed", { perPage: this.perPage });
    },
  },
};
</script>

<style scoped>
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
