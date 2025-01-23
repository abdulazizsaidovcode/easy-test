<template>
  <div>
    <NavBar />
    <router-view class="mt-16"/> 
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';

export default {
  components: {
    NavBar,
  },
};
</script>
