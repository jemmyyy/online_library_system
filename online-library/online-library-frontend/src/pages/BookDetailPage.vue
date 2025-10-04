<template>
  <v-container v-if="book">
    <v-card>
      <v-card-title>{{ book.title }}</v-card-title>
      <v-card-subtitle>{{ book.author }}</v-card-subtitle>
      <v-card-text>
        <p>{{ book.description }}</p>
        <p>Available: {{ book.available_copies }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="auth.user" color="primary" @click="reserveBook">Reserve</v-btn>
        <v-btn v-else to="/login">Login to Reserve</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../axios/api.js'
import { useAuthStore } from '../store/auth.js'
import { useNotificationStore } from '../store/notifications.js'

const notificationStore = useNotificationStore()

const route = useRoute()
const router = useRouter()
const book = ref(null)
const auth = useAuthStore()

async function fetchBook() {
  const res = await api.get(`/books/${route.params.id}`)
  book.value = res.data
}

async function reserveBook() {
  try {
    await api.post('/reservations', { book_id: book.value.id })
    alert('Reservation requested!')
    await notificationStore.fetchNotifications()
    router.push('/reservations')
  } catch (e) {
    alert(e.response?.data?.msg || 'Failed to reserve')
  }
}

onMounted(fetchBook)
</script>
