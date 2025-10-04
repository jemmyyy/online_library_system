import axios from 'axios'

// Named export
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL || 'http://127.0.0.1:5000/auth',
  headers: {
    'Content-Type': 'application/json'
  }
})

authApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Do nothing here (silent)
      console.warn('Unauthorized (likely expired token)')
    }
    return Promise.reject(error)
  }
)