<template>
    <div
      v-if="isOpen"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-4 rounded shadow-lg w-96">
        <h3 class="text-lg font-bold mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-700 mb-4">{{ message }}</p>
        <div class="flex justify-end space-x-2">
          <button
            @click="onCancel"
            class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            @click="onConfirm"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm
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
      title: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
    },
    methods: {
      onConfirm() {
        this.$emit("confirm");
      },
      onCancel() {
        this.$emit("cancel");
      },
    },
  };
  </script>
  
  <style>
  /* UniversalModal uchun style */
  </style>
  