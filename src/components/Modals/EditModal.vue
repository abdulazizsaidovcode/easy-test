<template>
    <div v-if="isOpen" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-4 rounded shadow w-96">
        <h2 class="text-xl font-bold mb-4">Edit Post</h2>
        <form @submit.prevent="saveChanges">
          <div class="mb-4">
            <label class="block text-sm font-bold mb-2">Title</label>
            <input
              v-model="editedPost.title"
              type="text"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold mb-2">Body</label>
            <textarea
              v-model="editedPost.body"
              class="w-full p-2 border rounded"
              rows="4"
              required
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="close" type="button" class="bg-gray-500 text-white px-3 py-1 rounded">Cancel</button>
            <button type="submit" class="bg-blue-500 text-white px-3 py-1 rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isOpen: Boolean,
      post: Object,
    },
    data() {
      return {
        editedPost: { ...this.post },
      };
    },
    methods: {
      saveChanges() {
        this.$emit('save', this.editedPost);
        this.close();
      },
      close() {
        this.$emit('close');
      },
    },
  };
  </script>
  
  <style>
  /* Add custom styles if needed */
  </style>
  