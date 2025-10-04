<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Online Library</v-toolbar-title>
      <v-spacer />

      <!-- 👇 Only show these if user is logged in -->
      <template v-if="authStore.user">
        <v-btn text to="/">Home</v-btn>
        <v-btn text to="/books">Books</v-btn>

        <!-- Librarian-only links -->
        <v-btn
          v-if="authStore.user.role === 'librarian'"
          text
          to="/admin"
        >
          Admin
        </v-btn>

        <v-btn text @click="logout">Logout</v-btn>
      </template>

      <!-- 👇 Shown when not logged in -->
      <template v-else>
        <v-btn text to="/login">Login</v-btn>
        <v-btn text to="/register">Register</v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { useAuthStore } from '../store/auth'  // ✅ import your Pinia store
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>
