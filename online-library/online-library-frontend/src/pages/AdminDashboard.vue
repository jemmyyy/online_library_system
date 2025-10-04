<template>
  <v-container>
    <h2>Admin Dashboard</h2>

    <!-- Pending Reservations -->
    <h3>Pending Reservations</h3>
    <v-list v-if="pending.length">
      <v-list-item v-for="r in pending" :key="r.id">
        <v-list-item-content>
          <v-list-item-title>
            Res #{{ r.id }} | Book {{ r.book_id }} | User {{ r.user_id }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn color="success" @click="updateReservation(r.id, 'approved')">
            Approve
          </v-btn>
          <v-btn color="error" @click="updateReservation(r.id, 'rejected')">
            Reject
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <p v-else>No pending reservations.</p>

    <!-- Pending Returns -->
    <h3 class="mt-8">Pending Returns</h3>
    <v-list v-if="returnsPending.length">
      <v-list-item v-for="r in returnsPending" :key="r.id">
        <v-list-item-content>
          <v-list-item-title>
            Res #{{ r.id }} | Book {{ r.book_id }} | User {{ r.user_id }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn color="success" @click="confirmReturn(r.id)">
            Confirm Return
          </v-btn>
          <v-btn color="error" @click="cancelReturn(r.id)">
            Cancel
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <p v-else>No pending returns.</p>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../axios/api.js'

const pending = ref([])
const returnsPending = ref([])

async function fetchReservations() {
  const res = await api.get('/reservations')
  const reservations = res.data.data ?? res.data

  // Split them by status
  pending.value = reservations.filter(r => r.status === 'pending')
  returnsPending.value = reservations.filter(r => r.status === 'return_requested')
}

async function updateReservation(id, status) {
  await api.put(`/reservations/${id}`, { status })
  fetchReservations()
}

// ✅ Confirm return (admin/librarian only)
async function confirmReturn(id) {
  try {
    await api.post(`/reservations/${id}/confirm_return`)
    fetchReservations()
  } catch (err) {
    console.error('Failed to confirm return:', err)
  }
}

// ✅ Cancel return request
async function cancelReturn(id) {
  try {
    await api.post(`/reservations/${id}/cancel_return`)
    fetchReservations()
  } catch (err) {
    console.error('Failed to cancel return request:', err)
  }
}

onMounted(fetchReservations)
</script>
