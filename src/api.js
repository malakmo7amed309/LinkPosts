import axios from 'axios'

const api = axios.create({
  baseURL: 'https://linked-posts.routemisr.com',
})

// Attach the saved auth token to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.token = token
  }
  return config
})

// Extract a readable message from an API error without crashing
// when the request never reached the server (err.response is undefined).
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.error || err?.response?.data?.message || fallback
}

export default api
