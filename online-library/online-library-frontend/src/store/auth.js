import { defineStore } from 'pinia'
import { authApi as auth } from '../axios/auth.js'
import { api } from '../axios/api.js'
import router from '../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    loading: false,
    error: null,
    sessionExpired: false,
    isLoggingOut: false,
    refreshInterval: null, // For silent refresh
  }),

  actions: {
    /** ---------------------------
     * LOGIN
     * -------------------------- */
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const { data } = await auth.post('/login', credentials, {
          headers: { 'Content-Type': 'application/json' }
        })

        // Expecting both access + refresh tokens
        this.accessToken = data.access_token
        this.refreshToken = data.refresh_token

        localStorage.setItem('access_token', this.accessToken)
        localStorage.setItem('refresh_token', this.refreshToken)

        await this.fetchUser()
        this.startRefreshCycle()
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
        await this.login({ email: payload.email, password: payload.password })
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed'
        throw err
      } finally {
        this.loading = false
        window.location.href = '/'
      }
    },

    async fetchUser() {
      if (!this.accessToken) return
      try {
        const { data } = await auth.get('/me', {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        })
        this.user = data
      } catch (err) {
        if (err.response?.status === 401) {
          console.warn('Access token invalid or expired. Attempting refresh...')
          await this.tryRefreshToken()
        } else {
          console.error('Failed to fetch user:', err)
        }
      }
    },

    async logout(silent = false) {
        if (this.isLoggingOut) return
        this.isLoggingOut = true
        console.log('🚨 logout() CALLED')

        try {
            // 🧠 Only call backend logout if not a silent logout
            if (!silent && this.accessToken) {
            await auth.post('/logout', {}, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            })
            }
        } catch (err) {
            console.warn('Logout request failed:', err)
        } finally {
            this.stopRefreshCycle()
            this.user = null
            this.accessToken = null
            this.refreshToken = null
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            this.sessionExpired = false

            // Redirect only if not already on login
            if (router.currentRoute.value.name !== 'Login') {
            await router.push('/login')
            }

            setTimeout(() => (this.isLoggingOut = false), 500)
        }
    },

    async tryRefreshToken() {
      if (!this.refreshToken) {
        console.warn('No refresh token available. Logging out.')
        return this.handleSessionExpiry()
      }

      try {
        const { data } = await auth.post('/refresh', {
          refresh_token: this.refreshToken,
        })

        this.accessToken = data.access_token
        localStorage.setItem('access_token', this.accessToken)
        console.log('🔁 Token refreshed successfully')

        await this.fetchUser()
      } catch (err) {
        console.warn('Failed to refresh token:', err)
        this.handleSessionExpiry()
      }
    },

    restoreSession() {
      const access = localStorage.getItem('access_token')
      const refresh = localStorage.getItem('refresh_token')

      if (access && refresh) {
        this.accessToken = access
        this.refreshToken = refresh
        this.fetchUser()
        this.startRefreshCycle()
      }
    },

    startRefreshCycle() {
      this.stopRefreshCycle()
      this.refreshInterval = setInterval(() => {
        this.tryRefreshToken()
      }, 14 * 60 * 1000) // every 14 minutes
    },

    stopRefreshCycle() {
      if (this.refreshInterval) clearInterval(this.refreshInterval)
      this.refreshInterval = null
    },

    handleSessionExpiry() {
      this.sessionExpired = true
      console.log('Session expired — redirecting to login')
      this.logout()
    },
  },
})
