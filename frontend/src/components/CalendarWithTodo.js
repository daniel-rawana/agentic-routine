import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Check, Trash2 } from 'lucide-react';

const CalendarWithTodo = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Finish project report', date: '2025-01-15', completed: false },
    { id: 2, text: 'Gym session', date: '2025-01-16', completed: true },
    { id: 3, text: 'Call mom', date: '2025-01-17', completed: false },
  ]);
  const [newTask, setNewTask] = useState('');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const addTask = () => {
    if (newTask.trim()) {
      setTasks(prev => [...prev, { id: Date.now(), text: newTask, date: '2025-01-20', completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const daysInMonth = 31; // Simplified

  return (
    <motion.div 
      className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <Calendar className="w-8 h-8 inline mr-2" /> Calendar & Tasks
        </h2>
        <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600">
          <Plus className="w-5 h-5" /> Add View
        </button>
      </div>

      {/* Simplified Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-8 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-semibold text-gray-700 p-2">{day}</div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => (
          <div key={i} className="p-2 h-20 bg-white/50 rounded-lg relative">
            <span className="text-sm">{i + 1}</span>
            {tasks.filter(task => task.date.endsWith(`-${String(i+1).padStart(2, '0')}`)).map(task => (
              <div key={task.id} className={`absolute top-1 right-1 w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-red-500'}`} />
            ))}
          </div>
        ))}
      </div>

      {/* Embedded To-Do List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Today's Tasks</h3>
        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <button onClick={addTask} className="p-2 bg-green-500 text-white rounded-full">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {tasks.map(task => (
            <motion.div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-2xl ${task.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                {task.completed && <Check className="w-4 h-4 text-white" />}
              </button>
              <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-800'} flex-1`}>{task.text}</span>
              <button onClick={() => deleteTask(task.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarWithTodo;