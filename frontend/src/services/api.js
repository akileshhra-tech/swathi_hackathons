import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 45000,
})

export const checkHealth = async () => {
  const response = await api.get('/api/health')
  return response.data
}

export const analyzeReportUpload = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/api/reports/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export default api
