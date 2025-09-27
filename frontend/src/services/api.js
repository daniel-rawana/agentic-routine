import axios from 'axios'

const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
export const api = axios.create({ baseURL: base })
