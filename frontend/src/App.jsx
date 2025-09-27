import React, { useState } from 'react'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [authed, setAuthed] = useState(false)
  return authed ? <Dashboard /> : <Signup onAuthed={() => setAuthed(true)} />
}
