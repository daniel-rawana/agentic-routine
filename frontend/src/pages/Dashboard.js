import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, MessageCircle, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
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