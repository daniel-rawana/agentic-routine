import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Check, Trash2, Zap } from 'lucide-react';
import { addXP, getGamificationStatsFromState } from '../utils/gamification';

const CalendarWithTodo = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  
  // Load tasks from localStorage or use default
  const loadTasks = () => {
    const savedTasks = localStorage.getItem('calendar_tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    return [
      { id: 1, text: 'Finish project report', date: '2025-01-15', completed: false },
      { id: 2, text: 'Gym session', date: '2025-01-16', completed: true },
      { id: 3, text: 'Call mom', date: '2025-01-17', completed: false },
    ];
  };
  
  const [tasks, setTasks] = useState(loadTasks);
  const [newTask, setNewTask] = useState('');
  const [calendarEvents, setCalendarEvents] = useState([]);
  
  // Gamification state
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGainAmount, setXPGainAmount] = useState(0);
  const [gamificationStats, setGamificationStats] = useState(getGamificationStatsFromState());

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Save tasks to localStorage
  const saveTasks = (updatedTasks) => {
    localStorage.setItem('calendar_tasks', JSON.stringify(updatedTasks));
  };

  // Fetch calendar events from backend
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/calendar/events');
        if (response.ok) {
          const events = await response.json();
          // Convert Google Calendar events to our task format
          const formattedEvents = events.map(event => ({
            id: `cal_${event.id}`,
            text: event.summary || 'Untitled Event',
            date: event.start?.dateTime?.split('T')[0] || event.start?.date,
            completed: false,
            isCalendarEvent: true
          }));
          setCalendarEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Failed to fetch calendar events:', error);
      }
    };

    fetchCalendarEvents();
  }, []);

  const addTask = () => {
    if (newTask.trim()) {
      const updatedTasks = [...tasks, { id: Date.now(), text: newTask, date: '2025-01-20', completed: false }];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const wasCompleted = task.completed;
        const newCompleted = !task.completed;
        
        // Award XP only when completing a task (not uncompleting)
        if (!wasCompleted && newCompleted) {
          const updatedStats = addXP(50);
          setGamificationStats(updatedStats);
          
          // Show XP gain animation
          setXPGainAmount(50);
          setShowXPGain(true);
          setTimeout(() => setShowXPGain(false), 2000);
        }
        
        return { ...task, completed: newCompleted };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const daysInMonth = 31; // Simplified
  
  // Combine manual tasks and calendar events
  const allTasks = [...tasks, ...calendarEvents];
  
  // Get current gamification stats
  const stats = gamificationStats;

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
        <div className="flex items-center gap-4">
          {/* XP Display */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 rounded-full">
            <Zap className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700 font-semibold">{stats.xp} XP</span>
            <span className="text-purple-600 text-sm">Lvl {stats.level}</span>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600">
            <Plus className="w-5 h-5" /> Add View
          </button>
        </div>
      </div>

      {/* Simplified Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-8 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-semibold text-gray-700 p-2">{day}</div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => (
          <div key={i} className="p-2 h-20 bg-white/50 rounded-lg relative">
            <span className="text-sm">{i + 1}</span>
            {allTasks.filter(task => task.date?.endsWith(`-${String(i+1).padStart(2, '0')}`)).map(task => (
              <div key={task.id} className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                task.isCalendarEvent ? 'bg-blue-500' : task.completed ? 'bg-green-500' : 'bg-red-500'
              }`} />
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
          {allTasks.map(task => (
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
      
      {/* XP Gain Animation */}
      {showXPGain && (
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span className="font-bold">+{xpGainAmount} XP!</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CalendarWithTodo;