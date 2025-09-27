import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer 
      className="bg-[#FFF0DD]/90 backdrop-blur-md border-t border-[#E2A16F]/30 p-6 text-center text-gray-800 mt-auto space-y-4 shadow-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-700">
        <span>Team NeoForce</span>
        <span>•</span>
        <span>Innovation Competition 2024</span>
      </div>
      <p className="flex items-center justify-center gap-2 text-gray-700">
        Made with <Heart className="w-4 h-4 fill-[#E2A16F]" /> by Your Friendly AI
      </p>
      <p className="text-sm text-gray-600">© 2024 My Success Coach • Powered by AI</p>
    </motion.footer>
  );
};

export default Footer;