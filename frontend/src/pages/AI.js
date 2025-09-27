import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mic, Volume2 } from 'lucide-react';
import AIChat from '../components/AIChat';

const AI = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSpeak = () => {
    setIsListening(true);
    // Simulate listening for 3 seconds
    setTimeout(() => {
      setIsListening(false);
      setIsSpeaking(true);
      // Mock response animation
      setTimeout(() => setIsSpeaking(false), 2000);
    }, 3000);
  };

  const quickActions = [
    { label: 'Check Tasks', icon: <MessageCircle className="w-5 h-5" />, onClick: () => alert('Checking your tasks...') },
    { label: 'Schedule Event', icon: <Calendar className="w-5 h-5" />, onClick: () => alert('Scheduling an event...') },
    { label: 'Check Stats', icon: <Users className="w-5 h-5" />, onClick: () => alert('Your stats: 2-day streak!') },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] space-y-12"
    >
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl lg:text-5xl font-bold text-[#86B0BD] mb-4">My AI Assistant</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Your personal productivity companion
        </p>
      </div>

      {/* Animated Circle - Moves/Wobbles on Speak */}
      <motion.div 
        className="relative"
        animate={isListening || isSpeaking ? { 
          scale: [1, 1.1, 0.95, 1], 
          rotate: [0, 5, -5, 0],
          y: isSpeaking ? [0, -5, 5, 0] : 0
        } : {}}
        transition={{ 
          duration: 1, 
          repeat: isSpeaking ? Infinity : 0,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        <motion.button
          onClick={() => setChatOpen(true)}
          className="w-32 h-32 lg:w-40 lg:h-40 bg-[#86B0BD] rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl cursor-pointer relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isListening}
        >
          <MessageCircle className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
          {isListening && (
            <motion.div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
          )}
          {isSpeaking && (
            <motion.div className="absolute inset-0 bg-blue-500/30 rounded-full animate-pulse" />
          )}
        </motion.button>
      </motion.div>

      {/* Chat and Speak Options */}
      <div className="space-y-4 w-full max-w-md">
        <motion.button
          onClick={() => setChatOpen(true)}
          className="w-full bg-[#D1D3D4]/50 px-6 py-3 rounded-2xl text-[#86B0BD] font-medium hover:bg-[#D1D3D4]/70 transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <MessageCircle className="w-5 h-5" />
          Chat with My AI
        </motion.button>
        <motion.button
          onClick={handleSpeak}
          disabled={isListening || isSpeaking}
          className={`w-full px-6 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all ${
            isListening || isSpeaking 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-[#86B0BD] text-white hover:bg-[#6E9AAB]'
          }`}
          whileHover={!isListening && !isSpeaking ? { scale: 1.02 } : {}}
        >
          <Mic className="w-5 h-5" />
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Speak to My AI'}
          {isSpeaking && <Volume2 className="w-5 h-5 animate-bounce" />}
        </motion.button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg">
        {quickActions.map((action, index) => (
          <motion.button
            key={index}
            onClick={action.onClick}
            className="bg-[#FFF0DD] px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-[#E2A16F]/10 transition-all border border-[#D1D3D4]/30 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05, y: -2 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {action.icon}
            {action.label}
          </motion.button>
        ))}
      </div>

      <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </motion.div>
  );
};

export default AI;