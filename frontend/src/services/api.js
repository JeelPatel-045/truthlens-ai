import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: BASE, timeout: 30000 })

export const fetchFeed = (category, q) =>
  api.get('/api/news/feed', { params: { category, q } }).then(r => r.data)

export const fetchArticle = (id) =>
  api.get(`/api/news/${id}`).then(r => r.data)

export const analyzeArticle = (payload) =>
  api.post('/api/analyze', payload).then(r => r.data)

export const fetchTrends = () =>
  api.get('/api/trends').then(r => r.data)

export const sendChat = (message, history) =>
  api.post('/api/chat', { message, history }).then(r => r.data)

export default api
