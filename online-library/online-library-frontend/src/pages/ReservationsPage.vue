<template>
  <v-container>
    <h2>My Reservations</h2>
    <v-list>
      <v-list-item v-for="r in reservations" :key="r.id">
        <v-list-item-content>
          <v-list-item-title>Book: {{ r.book_id }}</v-list-item-title>
          <v-list-item-subtitle>Status: {{ r.status }}</v-list-item-subtitle>
          <v-list-item-subtitle>
            Due: {{ r.due_date ? new Date(r.due_date).toLocaleDateString() : '—' }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action v-if="r.status === 'approved'">
          <v-btn color="warning" @click="returnBook(r.id)">Return</v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../axios/api.js'

const reservations = ref([])

async function fetchReservations() {
  const res = await api.get('/reservations')
  reservations.value = res.data.data ?? res.data
}

async function returnBook(id) {
  await api.post(`/reservations/${id}/return`)
  fetchReservations()
}

onMounted(fetchReservations)
</script>
