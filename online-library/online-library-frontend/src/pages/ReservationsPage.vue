<template>
  <v-container>
    <h2 class="mb-4">My Reservations</h2>

    <!-- Search and Filter Row -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Search reservations"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          dense
          clearable
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="statusFilter"
          :items="statuses"
          label="Filter by status"
          variant="outlined"
          dense
          clearable
        />
      </v-col>

      <v-col cols="12" md="2" class="text-right">
        <v-btn color="primary" @click="fetchReservations">
          <v-icon start>mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </v-col>
    </v-row>

    <!-- Data Table -->
    <v-data-table
      :headers="headers"
      :items="filteredReservations"
      :search="search"
      item-value="id"
      class="elevation-1"
      :items-per-page="5"
    >
      <template #item.status="{ item }">
        <v-chip
          :color="statusColor(item.status)"
          size="small"
          class="text-capitalize"
        >
          {{ item.status }}
        </v-chip>
      </template>

      <template #item.due_date="{ item }">
        {{ item.due_date ? new Date(item.due_date).toLocaleDateString() : '—' }}
      </template>

      <template #item.actions="{ item }">
        <v-btn
          v-if="item.status === 'approved'"
          size="small"
          color="warning"
          @click="returnBook(item.id)"
        >
          Return
        </v-btn>
      </template>

      <template #no-data>
        <v-alert type="info" border="start" color="blue-lighten-4">
          No reservations found.
        </v-alert>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../axios/api.js'

const reservations = ref([])
const search = ref('')
const statusFilter = ref(null)

const statuses = [
  'pending',
  'approved',
  'rejected',
  'return_requested',
  'returned',
]

const headers = [
  { title: 'Reservation #', value: 'id', sortable: true },
  { title: 'Book ID', value: 'book_id', sortable: true },
  { title: 'Status', value: 'status', sortable: true },
  { title: 'Due Date', value: 'due_date', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false },
]

async function fetchReservations() {
  try {
    const res = await api.get('/reservations')
    reservations.value = res.data.data ?? res.data
  } catch (err) {
    console.error('❌ Failed to fetch reservations:', err)
  }
}

async function returnBook(id) {
  try {
    await api.post(`/reservations/${id}/return`)
    fetchReservations()
  } catch (err) {
    console.error('❌ Failed to request return:', err)
  }
}

const filteredReservations = computed(() => {
  let result = reservations.value
  if (statusFilter.value) {
    result = result.filter(r => r.status === statusFilter.value)
  }
  return result
})

function statusColor(status) {
  switch (status) {
    case 'pending': return 'grey'
    case 'approved': return 'green'
    case 'rejected': return 'red'
    case 'return_requested': return 'orange'
    case 'returned': return 'blue'
    default: return 'grey'
  }
}

onMounted(fetchReservations)
</script>

<style scoped>
.v-chip {
  text-transform: capitalize;
}
</style>
