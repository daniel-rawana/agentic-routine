import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Share2, Mail, Plus } from 'lucide-react';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Mock data with personalized user
    setUsers([
      { id: 1, name: 'Alex Rivera', email: 'alexr@gmail.com', streak: 45, tasks: 120, rank: 1, isYou: false },
      { id: 2, name: 'Laisha Bravo Juarez', email: 'laishabj@gmail.com', streak: 2, tasks: 2, rank: 2, isYou: true },
      { id: 3, name: 'Jordan Lee', email: 'jordanl@gmail.com', streak: 32, rank: 3, tasks: 85, isYou: false },
      { id: 4, name: 'Taylor Kim', email: 'taylork@gmail.com', streak: 28, rank: 4, tasks: 70, isYou: false },
      { id: 5, name: 'Casey Patel', email: 'caseyp@gmail.com', streak: 15, rank: 5, tasks: 40, isYou: false },
    ]);
  }, []);

  return (
    <motion.div 
      className="bg-[#FFF0DD]/90 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-xl max-w-4xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-10 h-10 text-[#86B0BD]" />
          <div>
            <h2 className="text-3xl font-bold text-[#86B0BD]">Leaderboard</h2>
            <p className="text-gray-600">See how you stack up against friends!</p>
          </div>
        </div>
        <motion.button 
          className="flex items-center gap-2 bg-[#86B0BD] text-white px-6 py-3 rounded-xl hover:bg-[#6E9AAB] transition-all shadow-md"
          whileHover={{ scale: 1.05 }}
        >
          <Plus className="w-5 h-5" /> Invite Friend
        </motion.button>
      </div>

      <div className="space-y-6">
        <div className="bg-[#D1D3D4]/30 rounded-2xl p-4 text-center">
          <h3 className="text-xl font-bold text-[#86B0BD]">Productivity Champions</h3>
        </div>
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            className={`flex items-center gap-6 p-6 bg-white rounded-2xl border border-[#D1D3D4]/30 hover:shadow-lg transition-all ${
              user.isYou ? 'ring-2 ring-[#86B0BD]/50 bg-[#86B0BD]/5' : ''
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
              user.rank === 1 ? 'bg-[#E2A16F]' : 
              user.rank === 2 ? 'bg-[#86B0BD]' : 
              user.rank === 3 ? 'bg-[#D1D3D4]' : 'bg-gray-300'
            }`}>
              {user.rank === 1 ? <Crown className="w-6 h-6" /> : user.rank}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold ${user.isYou ? 'text-[#86B0BD]' : 'text-gray-800'}`}>
                {user.name} {user.isYou && <span className="text-sm text-gray-500">(You)</span>}
              </h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-600 mt-1">
                {user.streak} day streak • {user.tasks} tasks done
              </p>
            </div>
            <motion.button 
              className="px-6 py-3 bg-[#D1D3D4]/50 text-[#86B0BD] rounded-xl hover:bg-[#D1D3D4]/70 transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Share2 className="w-4 h-4" /> Follow
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Leaderboard;