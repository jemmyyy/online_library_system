<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>📚 Online Library</v-app-bar-title>
      <v-spacer></v-spacer>

      <v-btn to="/" variant="text">Books</v-btn>
      <v-btn v-if="auth.user" to="/reservations" variant="text">My Reservations</v-btn>
      <v-btn v-if="auth.user?.role === 'librarian'" to="/admin" variant="text">Admin</v-btn>

      <v-btn v-if="auth.user" to="/notifications" variant="text">
        Notifications
        <v-badge
          v-if="unreadCount > 0"
          :content="unreadCount"
          color="red"
          offset-x="10"
          offset-y="5"
        />
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
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted } from 'vue'
import { api } from '@/axios/api'

const auth = useAuthStore()
const unreadCount = ref(0)

async function fetchNotifications() {
  if (!auth.token) return
  try {
    const res = await api.get('/notifications')
    unreadCount.value = (res.data.data || res.data).filter(n => !n.read).length
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchNotifications)
</script>
