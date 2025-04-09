// lib/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // si necesitas enviar cookies
})

export default api
