import axios from 'axios'
import { registerInterceptors } from './interceptors'

const baseURL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api/v1'

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

registerInterceptors(api)

export default api
