import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Star } from 'lucide-react';

const MiniGame = () => {
  const [avatar, setAvatar] = useState({ color: '#E2A16F', outfit: 'none', rewards: 0 });
  const [playing, setPlaying] = useState(false);

  const outfits = [
    { id: 'shirt', label: 'Cool Shirt', color: '#86B0BD' },
    { id: 'hat', label: 'Fun Hat', color: '#D1D3D4' },
    { id: 'shoes', label: 'Sneakers', color: '#FFF0DD' },
  ];

  const playGame = () => {
    setPlaying(true);
    setTimeout(() => {
      setAvatar(prev => ({ ...prev, rewards: prev.rewards + 5 }));
      setPlaying(false);
    }, 2000);
  };

  return (
    <motion.div 
      className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-8 h-8 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800">Mini Game: Avatar Quest</h2>
        </div>
      </div>

      {/* Avatar Display */}
      <div className="flex flex-col items-center mb-6">
        <div 
          className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold relative"
          style={{ backgroundColor: avatar.color }}
        >
          👤
          {avatar.outfit !== 'none' && (
            <div className="absolute inset-0 rounded-full" style={{ border: `3px solid ${avatar.color}`, backgroundColor: 'transparent' }} />
          )}
        </div>
        <p className="mt-2 text-gray-600">Rewards: {avatar.rewards} <Star className="w-5 h-5 inline text-yellow-500" /></p>
      </div>

      {/* Outfit Customizer */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Customize Avatar</h3>
        <div className="grid grid-cols-3 gap-2">
          {outfits.map(outfit => (
            <button
              key={outfit.id}
              onClick={() => setAvatar(prev => ({ ...prev, outfit: prev.outfit === outfit.id ? 'none' : outfit.id, color: outfit.color }))}
              className={`p-3 rounded-xl ${avatar.outfit === outfit.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {outfit.label}
            </button>
          ))}
        </div>
      </div>

      {/* Play Button */}
      <button
        onClick={playGame}
        disabled={playing}
        className={`w-full py-4 rounded-2xl font-bold text-white ${playing ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'}`}
      >
        {playing ? 'Playing...' : 'Earn Rewards!'}
      </button>
    </motion.div>
  );
};

export default MiniGame;