// src/axios/api.js
import axios from 'axios'
import { useAuthStore } from '../store/auth.js'
import router from '../router'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api',
})

// === REQUEST INTERCEPTOR ===
api.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }
  return config
}, error => Promise.reject(error))

// === RESPONSE INTERCEPTOR ===
api.interceptors.response.use(
  response => response,
  async error => {
    const authStore = useAuthStore()

    if (error.response?.status === 401) {
      // Don’t trigger logout loops
      if (authStore.isLoggingOut) return Promise.reject(error)

      // Try refreshing silently first
      try {
        console.warn('⚠️ API 401 — attempting silent refresh')
        await authStore.tryRefreshToken()
        // Retry original request after refresh
        const newToken = authStore.accessToken
        error.config.headers.Authorization = `Bearer ${newToken}`
        return api(error.config)
      } catch (refreshErr) {
        console.error('Session expired, redirecting to login')
        await authStore.logout(true)
        router.push('/login')
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  }
)
