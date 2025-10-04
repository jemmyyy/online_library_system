<template>
  <v-container>
    <h2 class="mb-6">📚 Admin Dashboard</h2>

    <!-- PENDING RESERVATIONS -->
    <v-card class="mb-10" elevation="2">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h6">Pending Reservations</div>
        <v-btn icon="mdi-refresh" @click="fetchReservations" />
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="reservationSearch"
          label="Search reservations"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          dense
          class="mb-4"
        />

        <v-data-table
          :headers="reservationHeaders"
          :items="filteredPending"
          :search="reservationSearch"
          :items-per-page="5"
          class="elevation-1"
        >
          <template #item.status="{ item }">
            <v-chip color="grey" size="small">Pending</v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              size="small"
              color="success"
              @click="updateReservation(item.id, 'approved')"
            >
              <v-icon start>mdi-check</v-icon>
              Approve
            </v-btn>
            <v-btn
              size="small"
              color="error"
              @click="updateReservation(item.id, 'rejected')"
            >
              <v-icon start>mdi-close</v-icon>
              Reject
            </v-btn>
          </template>

          <template #no-data>
            <v-alert type="info" border="start" color="blue-lighten-4">
              No pending reservations found.
            </v-alert>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- PENDING RETURNS -->
    <v-card elevation="2">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h6">Pending Returns</div>
        <v-btn icon="mdi-refresh" @click="fetchReservations" />
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="returnSearch"
          label="Search returns"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          dense
          class="mb-4"
        />

        <v-data-table
          :headers="returnHeaders"
          :items="filteredReturns"
          :search="returnSearch"
          :items-per-page="5"
          class="elevation-1"
        >
          <template #item.status="{ item }">
            <v-chip color="orange" size="small">Return Requested</v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              size="small"
              color="success"
              @click="confirmReturn(item.id)"
            >
              <v-icon start>mdi-check</v-icon>
              Confirm
            </v-btn>
            <v-btn
              size="small"
              color="error"
              @click="cancelReturn(item.id)"
            >
              <v-icon start>mdi-close</v-icon>
              Cancel
            </v-btn>
          </template>

          <template #no-data>
            <v-alert type="info" border="start" color="blue-lighten-4">
              No pending returns found.
            </v-alert>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../axios/api.js'

const pending = ref([])
const returnsPending = ref([])
const reservationSearch = ref('')
const returnSearch = ref('')

const reservationHeaders = [
  { title: 'Reservation #', value: 'id' },
  { title: 'Book ID', value: 'book_id' },
  { title: 'User ID', value: 'user_id' },
  { title: 'Status', value: 'status' },
  { title: 'Actions', value: 'actions', sortable: false },
]

const returnHeaders = [
  { title: 'Reservation #', value: 'id' },
  { title: 'Book ID', value: 'book_id' },
  { title: 'User ID', value: 'user_id' },
  { title: 'Status', value: 'status' },
  { title: 'Actions', value: 'actions', sortable: false },
]

async function fetchReservations() {
  try {
    const res = await api.get('/reservations')
    const reservations = res.data.data ?? res.data
    pending.value = reservations.filter(r => r.status === 'pending')
    returnsPending.value = reservations.filter(r => r.status === 'return_requested')
  } catch (err) {
    console.error('❌ Failed to fetch reservations:', err)
  }
}

async function updateReservation(id, status) {
  try {
    await api.put(`/reservations/${id}`, { status })
    fetchReservations()
  } catch (err) {
    console.error('❌ Failed to update reservation:', err)
  }
}

async function confirmReturn(id) {
  try {
    await api.post(`/reservations/${id}/confirm_return`)
    fetchReservations()
  } catch (err) {
    console.error('❌ Failed to confirm return:', err)
  }
}

async function cancelReturn(id) {
  try {
    await api.post(`/reservations/${id}/cancel_return`)
    fetchReservations()
  } catch (err) {
    console.error('❌ Failed to cancel return:', err)
  }
}

const filteredPending = computed(() =>
  pending.value.filter(r =>
    String(r.book_id).includes(reservationSearch.value) ||
    String(r.user_id).includes(reservationSearch.value)
  )
)

const filteredReturns = computed(() =>
  returnsPending.value.filter(r =>
    String(r.book_id).includes(returnSearch.value) ||
    String(r.user_id).includes(returnSearch.value)
  )
)

onMounted(fetchReservations)
</script>

<style scoped>
h2 {
  font-weight: 600;
}

.v-card {
  border-radius: 12px;
}

.v-data-table {
  border-radius: 8px;
}
</style>
