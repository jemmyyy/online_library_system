<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>📚 Online Library</v-app-bar-title>
      <v-spacer></v-spacer>

      <v-btn to="/" exact variant="text">Home</v-btn>
      <v-btn v-if="auth.user?.role === 'member'" to="/reservations" variant="text">My Reservations</v-btn>
      <v-btn v-if="auth.user?.role === 'librarian'" to="/admin" variant="text">Admin</v-btn>

      <v-btn v-if="auth.user?.role === 'member'" to="/notifications" variant="text">
        Notifications
        <v-badge
          v-if="notificationStore.unreadCount > 0"
          :content="notificationStore.unreadCount"
          color="red"
          offset-x="10"
          offset-y="5"
        >
            <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>

      <v-btn v-if="!auth.user" to="/login" variant="text">Login</v-btn>
      <v-btn v-if="!auth.user" to="/register" variant="text">Register</v-btn>
      <v-btn v-if="auth.user" @click="auth.logout" variant="text">Logout</v-btn>
    </v-app-bar>

    <!-- Router Content -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { useNotificationStore } from '../store/notifications.js'
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../store/auth.js'
import { api } from '../axios/api.js'

const auth = useAuthStore()
const notificationStore = useNotificationStore()
let interval = null

onMounted(() => {
  notificationStore.fetchNotifications()
  interval = setInterval(notificationStore.fetchNotifications, 10000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>
