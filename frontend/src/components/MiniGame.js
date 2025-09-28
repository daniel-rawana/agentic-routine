import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Star } from 'lucide-react';

const MiniGame = () => {
  const [avatar, setAvatar] = useState({
    seed: "Explorer", // default avatar identity
    hair: null,
    clothing: null,
    accessories: null,
    rewards: 100, // start with some rewards for testing
  });

  const [playing, setPlaying] = useState(false);

  // ✅ Compose a valid DiceBear v7 URL with the adventurer sprite
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatar.seed}${
    avatar.hair ? `&hair=${avatar.hair}` : ""
  }${avatar.clothing ? `&clothing=${avatar.clothing}` : ""}${
    avatar.accessories ? `&accessories=${avatar.accessories}` : ""
  }`;

  // ✅ Shop items with valid adventurer trait names
  const shopItems = [
    { id: 'hair', label: 'Curly Hair', cost: 50, type: 'hair', value: 'short01' },
    { id: 'clothing', label: 'Cool Shirt', cost: 75, type: 'clothing', value: 'shirt02' },
    { id: 'accessories', label: 'Glasses', cost: 40, type: 'accessories', value: 'roundGlasses' },
  ];

  // 🎮 Simulate earning rewards
  const playGame = () => {
    setPlaying(true);
    setTimeout(() => {
      setAvatar(prev => ({ ...prev, rewards: prev.rewards + 5 }));
      setPlaying(false);
    }, 2000);
  };

  // 🛍️ Handle shop purchases
  const handlePurchase = (item) => {
    if (avatar.rewards >= item.cost) {
      setAvatar(prev => ({
        ...prev,
        rewards: prev.rewards - item.cost,
        [item.type]: item.value,
      }));
    } else {
      alert("Not enough rewards!");
    }
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
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-32 h-32 rounded-full cursor-pointer border-4 border-gray-200"
        />
        <p className="mt-2 text-gray-600">
          Rewards: {avatar.rewards} <Star className="w-5 h-5 inline text-yellow-500" />
        </p>

        {/* Debug: show current URL for development */}
        <p className="text-xs text-gray-400 break-all mt-2">{avatarUrl}</p>
      </div>

      {/* Shop */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Shop Upgrades</h3>
        <div className="grid grid-cols-3 gap-2">
          {shopItems.map(item => (
            <button
              key={item.id}
              onClick={() => handlePurchase(item)}
              className={`p-3 rounded-xl ${
                avatar[item.type] === item.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label} ({item.cost}⭐)
            </button>
          ))}
        </div>
      </div>

      {/* Play Button */}
      <button
        onClick={playGame}
        disabled={playing}
        className={`w-full py-4 rounded-2xl font-bold text-white ${
          playing ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'
        }`}
      >
        {playing ? 'Playing...' : 'Earn Rewards!'}
      </button>
    </motion.div>
  );
};

export default MiniGame;
