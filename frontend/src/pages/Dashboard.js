import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, MessageCircle, Gamepad2, Flame, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGamificationStatsFromState } from '../utils/gamification';

const Dashboard = () => {
  // Get gamification stats from centralized state
  const stats = getGamificationStatsFromState();

  const features = [
    { path: '/calendar', icon: Calendar, label: 'Calendar & To-Dos', desc: 'Manage events and tasks seamlessly' },
    { path: '/leaderboard', icon: Users, label: 'Leaderboard', desc: 'See top streaks and compete' },
    { path: '/ai', icon: MessageCircle, label: 'My AI', desc: 'Chat with your personal assistant' },
    { path: '/game', icon: Gamepad2, label: 'Mini Game', desc: 'Customize avatar and earn rewards' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h1 className="text-4xl font-bold text-white text-center mb-8">Welcome to Your Hub!</h1>
      
      {/* Gamification Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Your Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Streak Card */}
          <motion.div
            className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Flame className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.streak}</div>
            <div className="text-orange-700 font-medium">Day Streak</div>
          </motion.div>
          
          {/* Level Card */}
          <motion.div
            className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Star className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-blue-600 mb-2">Level {stats.level}</div>
            <div className="text-blue-700 font-medium">Current Level</div>
          </motion.div>
          
          {/* XP Card */}
          <motion.div
            className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Zap className="w-12 h-12 text-purple-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.xp}</div>
            <div className="text-purple-700 font-medium">Total XP</div>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.path}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:shadow-2xl cursor-pointer"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={feature.path} className="block h-full">
                <div className="flex items-center gap-4 mb-4">
                  <Icon className="w-8 h-8 text-blue-500" />
                  <h3 className="text-xl font-bold text-gray-800">{feature.label}</h3>
                </div>
                <p className="text-gray-600">{feature.desc}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Dashboard;