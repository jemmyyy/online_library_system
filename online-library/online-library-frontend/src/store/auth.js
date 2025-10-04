import { defineStore } from 'pinia'
import { authApi as auth } from '../axios/auth.js'
import { api } from '../axios/api.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  actions: {
    async login(credentials) {
        this.loading = true
        this.error = null
        try {
            const { data } = await auth.post('/login', credentials, {
            headers: { 'Content-Type': 'application/json' }
            })
            this.token = data.access_token
            localStorage.setItem('token', this.token)
            await this.fetchUser()
        } catch (err) {
            this.error = err.response?.data?.message || 'Login failed'
            throw err
        } finally {
            this.loading = false
        }
    },

    async register(payload) {
      this.loading = true
      this.error = null
      try {
        await auth.post('/register', payload)
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      if (!this.token) return
      try {
        const { data } = await auth.get('/me', {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.user = data
      } catch (err) {
        console.error('Failed to fetch user:', err)
      }
    },

    async logout() {
    console.log('🚨 logout() CALLED', new Error().stack)
      try {
        await auth.post('/logout', {}, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      } catch (err) {
        console.warn('Logout request failed:', err)
      } finally {
        this.user = null
        this.token = null
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    },

    restoreSession() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        this.fetchUser() // 🔥 Restore user automatically
      }
    }
  }
})
