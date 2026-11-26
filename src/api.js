import axios from 'axios'
import { handle } from './mock'

const api = axios.create({
  baseURL: 'https://linked-posts.routemisr.com',
  timeout: 6000,
})

// Attach the saved auth token to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.token = token
  }
  return config
})

// If the real API cannot be reached (no response at all), fall back to the
// built-in demo backend so the app stays fully usable. Real API errors
// (4xx/5xx) are passed through untouched.
export const DEMO_FLAG = 'linkposts-demo'
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response || err?.isMock || !err?.config) return Promise.reject(err)
    const token = localStorage.getItem('token') || ''
    // never mix: a real token must not be answered by the demo backend
    if (token && !token.startsWith('demo-')) return Promise.reject(err)
    localStorage.setItem(DEMO_FLAG, '1')
    window.dispatchEvent(new Event('linkposts-demo'))
    return handle({ ...err.config, url: err.config.url })
  },
)

// Extract a readable message from an API error without crashing
// when the request never reached the server (err.response is undefined).
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.error || err?.response?.data?.message || fallback
}

export default api
