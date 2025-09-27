import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';

const Login = ({ onLogin }) => {
  return (
    <motion.div 
      className="max-w-md mx-auto bg-[#FFF0DD]/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#E2A16F]/30"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Welcome Back</h2>
      <div className="space-y-4">
        <button 
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-2 bg-[#E2A16F] text-white py-3 rounded-2xl hover:bg-[#D9905F] font-medium shadow-lg hover:shadow-xl transition-all border border-[#E2A16F]/20"
        >
          <Mail className="w-5 h-5" />
          Sign in with Google (Mock)
        </button>
        <div className="text-center text-gray-600 text-sm">
          No real auth here—just click to pretend you're in!
        </div>
      </div>
    </motion.div>
  );
};

export default Login;