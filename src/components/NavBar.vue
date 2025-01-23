<template>
  <nav class="bg-blue-600 p-4 text-white flex justify-between items-center fixed top-0 w-full z-10">
    <h1 class="font-bold text-xl">Vue.js test App</h1>
    <ul class="flex space-x-4">
      <li><router-link to="/" class="hover:underline">Posts</router-link></li>
      <li><router-link to="/albums" class="hover:underline">Albums</router-link></li>
      <li><router-link to="/todos" class="hover:underline">Todos</router-link></li>
    </ul>
  </nav>
</template>

<script>
  
</script>