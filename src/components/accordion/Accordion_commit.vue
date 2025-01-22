<template>
    <div>
      <button 
        @click="toggleComments" 
        class="btn btn-primary"
      >
        {{ showComments ? 'Hide Comments' : 'Show Comments' }}
      </button>
      
      <div v-if="showComments" class="accordion">
        <div v-for="comment in comments" :key="comment.id" class="accordion-item">
          <h5>{{ comment.name }}</h5>
          <p>{{ comment.body }}</p>
          <small>{{ comment.email }}</small>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
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
            `https://jsonplaceholder.typicode.com/posts/${this.postId}/comments`
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
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .accordion-item {
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  </style>
  