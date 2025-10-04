<template>
  <v-container>
    <h2 class="mb-6">🔔 Notifications</h2>

    <v-card elevation="2">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h6">Recent Notifications</div>
        <div>
          <v-btn icon="mdi-refresh" @click="fetchNotifications" />
        </div>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="notificationStore.list"
          :items-per-page="8"
          :loading="loading"
          class="elevation-1"
        >
          <template #item.read="{ item }">
            <v-chip
              :color="item.read ? 'green' : 'red'"
              :variant="item.read ? 'flat' : 'elevated'"
              size="small"
              text-color="white"
            >
              {{ item.read ? 'Read' : 'Unread' }}
            </v-chip>
          </template>

          <template #item.message="{ item }">
            <div
              :class="['notif-message', { unread: !item.read }]"
              @click="!item.read && markAsRead(item)"
            >
              <v-icon
                v-if="!item.read"
                icon="mdi-bell-ring"
                color="amber-darken-2"
                class="mr-2"
              />
              {{ item.message }}
            </div>
          </template>

          <template #item.created_at="{ item }">
            <span class="text-caption">
              {{ new Date(item.created_at).toLocaleString() }}
            </span>
          </template>

          <template #no-data>
            <v-alert type="info" border="start" color="blue-lighten-4">
              You have no notifications.
            </v-alert>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { api } from '../axios/api.js'
import { useNotificationStore } from '../store/notifications.js'

const notificationStore = useNotificationStore()
const loading = ref(false)

const headers = [
  { title: 'Message', value: 'message' },
  { title: 'Status', value: 'read' },
  { title: 'Created At', value: 'created_at' },
]

const markAsRead = (n) => {
  notificationStore.markAsRead(n.id)
  notificationStore.fetchNotifications()
  // Optional backend PATCH call can go here
}

onMounted(() => notificationStore.fetchNotifications())
onActivated(() => notificationStore.fetchNotifications())

</script>


<style scoped>
.notif-message {
  cursor: pointer;
  transition: all 0.2s ease;
}
.notif-message.unread {
  font-weight: 600;
  color: var(--v-theme-primary);
}
.notif-message.unread:hover {
  text-decoration: underline;
}
</style>
