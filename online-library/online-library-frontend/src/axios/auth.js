import axios from 'axios'

// Named export
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL || 'http://127.0.0.1:5000/auth',
  headers: {
    'Content-Type': 'application/json'
  }
})
