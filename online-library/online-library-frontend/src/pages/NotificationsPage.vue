<template>
  <v-container class="py-6">
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Notifications</h2>

        <v-alert
          v-if="notificationStore.loading"
          type="info"
          variant="tonal"
        >
          Loading notifications...
        </v-alert>

        <v-alert
          v-else-if="notificationStore.list.length === 0"
          type="info"
          variant="tonal"
        >
          No notifications yet.
        </v-alert>

        <v-list v-else two-line>
          <v-list-item
            v-for="n in notificationStore.list"
            :key="n.id"
            :class="{ 'bg-grey-lighten-4': !n.read }"
            @click="markAsRead(n)"
          >
            <v-list-item-title>{{ n.message }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ new Date(n.created_at).toLocaleString() }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useNotificationStore } from '../store/notifications.js'
import { onMounted, onActivated } from 'vue'

const notificationStore = useNotificationStore()

const markAsRead = (n) => {
  notificationStore.markAsRead(n.id)
  notificationStore.fetchNotifications()
  // Optional backend PATCH call can go here
}

onMounted(() => notificationStore.fetchNotifications())
onActivated(() => notificationStore.fetchNotifications())
</script>
