import React, { useState } from 'react'
import CalendarView from '../components/CalendarView'
import TaskMaster from '../components/TaskMaster'
import Shop from '../components/Shop'

export default function Dashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16 }}>
      <div>
        <h2>Calendar</h2>
        <CalendarView />
      </div>
      <div>
        <h2>Taskmaster</h2>
        <TaskMaster />
        <h2>Shop</h2>
        <Shop />
      </div>
    </div>
  )
}
