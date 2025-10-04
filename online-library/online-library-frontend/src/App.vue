<template>
  <v-app>
    <!-- All pages will be injected here -->
    <router-view />
  </v-app>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* Optional global styles */
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
}
</style>
