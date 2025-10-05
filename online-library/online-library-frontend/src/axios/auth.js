// src/axios/auth.js
import axios from 'axios'
import { useAuthStore } from '../store/auth.js'
import router from '../router'

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL || 'http://127.0.0.1:5000/auth',
})

// === REQUEST INTERCEPTOR ===
authApi.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }
  return config
}, error => Promise.reject(error))

// === RESPONSE INTERCEPTOR ===
authApi.interceptors.response.use(
  res => res,
  async error => {
    const authStore = useAuthStore()
    const originalRequest = error.config

    // Skip for logout/refresh endpoints to prevent loops
    if (!originalRequest || originalRequest.url.includes('/logout') || originalRequest.url.includes('/refresh')) {
      return Promise.reject(error)
    }

    // Handle access token expiry
    if (error.response?.status === 401 && !originalRequest._retry && !authStore.isLoggingOut) {
      originalRequest._retry = true
      try {
        const refreshToken = authStore.refreshToken
        if (!refreshToken) {
          console.warn('No refresh token found, logging out.')
          await authStore.logout(true)
          return Promise.reject(error)
        }

        const refreshUrl = `${authApi.defaults.baseURL}/refresh`
        const { data } = await axios.post(refreshUrl, { refresh_token: refreshToken })
        const newToken = data.access_token

        // Update tokens and retry
        authStore.accessToken = newToken
        localStorage.setItem('access_token', newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return authApi(originalRequest)
      } catch (err) {
        console.warn('Token refresh failed — logging out')
        await authStore.logout(true)
        router.push('/login')
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)
