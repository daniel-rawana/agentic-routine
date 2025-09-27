import React from 'react'
import { api } from '../services/api'

export default function Signup({ onAuthed }) {
  const connectGoogle = async () => {
    const { data } = await api.get('/api/auth/google/login')
    window.location.href = data.auth_url
  }
  return (
    <div style={{ padding: 24 }}>
      <h1>Agentic Routine</h1>
      <p>Connect Google to get started.</p>
      <button onClick={connectGoogle}>Connect Google Calendar</button>
      <button onClick={onAuthed} style={{ marginLeft: 12 }}>Skip (dev)</button>
    </div>
  )
}
