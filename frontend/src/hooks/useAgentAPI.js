import { useState } from 'react'
import { api } from '../services/api'

export function useAgentAPI() {
  const [loading, setLoading] = useState(false)
  const chat = async (message) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/agent/chat', { user_id: 'dev', message })
      return data.reply
    } finally {
      setLoading(false)
    }
  }
  return { chat, loading }
}
