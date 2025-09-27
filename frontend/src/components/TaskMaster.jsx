import React, { useState } from 'react'
import { api } from '../services/api'

export default function TaskMaster() {
  const [input, setInput] = useState('Plan gym 3x/week and 7am wake up')
  const [reply, setReply] = useState('')

  const send = async () => {
    const { data } = await api.post('/api/agent/chat', { user_id: 'dev', message: input })
    setReply(data.reply)
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12 }}>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={4} style={{ width: '100%' }} />
      <br />
      <button onClick={send}>Send</button>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{reply}</pre>
    </div>
  )
}
