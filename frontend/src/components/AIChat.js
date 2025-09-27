import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';

const AIChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! I'm My AI. How can I help with your day?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');

  const mockResponses = [
    "That's a great plan! Keep up the good work.",
    "Sounds fun—want tips on that?",
    "I've got your back. What's next?",
    "Relax, you've got this under control."
  ];

  const handleSend = () => {
    if (input.trim()) {
      setMessages(prev => [...prev, { id: Date.now(), text: input, sender: 'user' }]);
      setTimeout(() => {
        const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        setMessages(prev => [...prev, { id: Date.now() + 1, text: response, sender: 'ai' }]);
      }, 1000);
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-800">My AI</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none"
            />
            <button onClick={handleSend} className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIChat;