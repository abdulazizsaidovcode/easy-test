<template>
    <div
      v-if="isOpen"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">Add New Post</h2>
        <p class="text-sm text-gray-600 mb-4">
          Fill in the details below to create a new post.
        </p>
  
        <!-- Post Title -->
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium mb-1">Title</label>
          <input
            v-model="form.title"
            id="title"
            type="text"
            placeholder="Enter post title"
            class="w-full p-2 border rounded"
          />
        </div>
  
        <!-- Post Body -->
        <div class="mb-4">
          <label for="body" class="block text-sm font-medium mb-1">Body</label>
          <textarea
            v-model="form.body"
            id="body"
            rows="4"
            placeholder="Enter post body"
            class="w-full p-2 border rounded"
          ></textarea>
        </div>
  
        <!-- Select User -->
        <div class="mb-4">
          <label for="user" class="block text-sm font-medium mb-1">User</label>
          <select
            v-model="form.userId"
            id="user"
            class="w-full p-2 border rounded"
          >
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>
  
        <!-- Buttons -->
        <div class="flex justify-end space-x-2">
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="!isFormValid"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isOpen: {
        type: Boolean,
        required: true,
      },
      users: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        form: {
          title: "",
          body: "",
          userId: null,
        },
      };
    },
    computed: {
      isFormValid() {
        return this.form.title && this.form.body && this.form.userId;
      },
    },
    methods: {
      closeModal() {
        this.$emit("close");
      },
      handleSubmit() {
        const newPost = { ...this.form, id: Date.now() };
        this.$emit("save", newPost);
        this.resetForm();
        this.closeModal();
      },
      resetForm() {
        this.form = {
          title: "",
          body: "",
          userId: null,
        };
      },
    },
  };
  </script>
  
  <style>
  /* Tailwind yordamida styling */
  </style>
  