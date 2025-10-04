import { defineStore } from 'pinia'
import { api } from '../axios/api.js'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    list: [],
    unreadCount: 0,
    loading: false
  }),

  actions: {
    async fetchNotifications() {
      this.loading = true
      try {
        const { data } = await api.get('/notifications')
        this.list = data.data || []
        this.unreadCount = this.list.filter(n => !n.read).length
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        this.loading = false
      }
    },

    async markAsRead(notificationId) {
      try {
        // ✅ Call backend to persist change
        await api.post(`/notifications/${notificationId}/read`)

        // ✅ Update state locally for immediate feedback
        const notif = this.list.find(n => n.id === notificationId)
        if (notif) notif.read = true

        // ✅ Optionally remove read notifications from the list
        // this.list = this.list.filter(n => !n.read)
        this.unreadCount = this.list.filter(n => !n.read).length
      } catch (err) {
        console.error('❌ Failed to mark notification as read:', err)
      }
    },

    addNotification(newNotif) {
      this.list.unshift(newNotif)
      this.unreadCount++
    }
  }
})
