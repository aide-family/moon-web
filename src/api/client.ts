import axios from 'axios'

const apiClient = axios.create({
  // Always use Vite proxy in development to avoid CORS
  baseURL: import.meta.env.DEV ? '/' : import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // In development, avoid auto logout to prevent redirect loops when backend returns 401
      if (!import.meta.env.DEV) {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
