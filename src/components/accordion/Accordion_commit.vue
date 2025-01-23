<template>
  <div>
    <div
      @click="toggleComments"
      class="mt-10 flex items-center justify-between px-1 py-6"
    >
      <div class="flex items-center gap-2">
        <i class="fa-regular fa-comment text-green-700 text-2xl"></i>
        <button class="btn btn-primary">
          {{ showComments ? "Hide Comments" : "Show Comments " }} ({{
            comments.length ? comments.length : 5
          }})
        </button>
      </div>
      <i v-if="showComments" class="fa-solid fa-angle-down"></i>
      <i v-else="!showComments" class="fa-solid fa-angle-up"></i>
    </div>

    <div v-if="showComments" class="accordion">
      <article
        v-if="comments.length != 0"
        v-for="comment in comments"
        :key="comment.id"
        class="accordion-item p-6 text-base rounded-lg bg-gray-300"
      >
        <footer class="flex justify-between items-center mb-2">
          <div class="flex items-center">
            <p
              class="inline-flex items-center mr-3 text-sm text-gray-900 font-semibold"
            >
              <img
                class="mr-2 w-6 h-6 rounded-full"
                src="https://flowbite.com/docs/images/people/profile-picture-2.jpg"
                alt="Michael Gough"
              />
              {{ comment.email }}
            </p>
          </div>
        </footer>
        <p class="text-gray-500">{{ comment.name }}</p>
        <p class="text-gray-500">{{ comment.body }}</p>
      </article>
      <Loading v-else />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Loading from "../loading.vue";

export default {
  components: {
    Loading,
  },
  props: {
    postId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      comments: [],
      showComments: false,
    };
  },
  methods: {
    async fetchComments() {
      try {
        const response = await axios.get(
          `http://localhost:3000/posts/${this.postId}/comments`
        );
        this.comments = response.data;
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    },
    toggleComments() {
      this.showComments = !this.showComments;
      if (this.showComments && this.comments.length === 0) {
        this.fetchComments();
      }
    },
  },
};
</script>

<style scoped>
.accordion {
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
}
.accordion-item {
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
</style>
