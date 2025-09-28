import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';

const AIChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! I'm your AI assistant. How can I help with your day?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef(null);
  const sessionIdRef = useRef(null);
  const currentMessageIdRef = useRef(null);

  // Initialize SSE connection
  useEffect(() => {
    if (isOpen && !sessionIdRef.current) {
      connectToAgent();
    }
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isOpen]);

  const connectToAgent = () => {
    // Generate unique session ID
    sessionIdRef.current = Math.random().toString().substring(2, 10);
    
    const sseUrl = `http://localhost:8000/events/${sessionIdRef.current}?is_audio=false`;
    
    try {
      eventSourceRef.current = new EventSource(sseUrl);
      
      eventSourceRef.current.onopen = () => {
        console.log('SSE connection opened');
        setIsConnected(true);
      };
      
      eventSourceRef.current.onmessage = (event) => {
        const messageFromServer = JSON.parse(event.data);
        console.log('[AGENT TO CLIENT]', messageFromServer);
        
        // Handle turn complete
        if (messageFromServer.turn_complete) {
          currentMessageIdRef.current = null;
          setIsLoading(false);
          return;
        }
        
        // Handle interrupted
        if (messageFromServer.interrupted) {
          setIsLoading(false);
          return;
        }
        
        // Handle text messages
        if (messageFromServer.mime_type === 'text/plain') {
          const messageText = messageFromServer.data;
          
          setMessages(prev => {
            const newMessages = [...prev];
            
            // Start a new AI message if needed
            if (!currentMessageIdRef.current) {
              currentMessageIdRef.current = `ai-${Date.now()}`;
              newMessages.push({
                id: currentMessageIdRef.current,
                text: messageText,
                sender: 'ai'
              });
            } else {
              // Append to existing AI message
              const messageIndex = newMessages.findIndex(
                msg => msg.id === currentMessageIdRef.current
              );
              if (messageIndex !== -1) {
                newMessages[messageIndex] = {
                  ...newMessages[messageIndex],
                  text: newMessages[messageIndex].text + messageText
                };
              }
            }
            
            return newMessages;
          });
        }
      };
      
      eventSourceRef.current.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        setIsLoading(false);
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (isOpen) {
            connectToAgent();
          }
        }, 5000);
      };
      
    } catch (error) {
      console.error('Failed to connect to agent:', error);
      setIsConnected(false);
    }
  };

  const sendMessage = async (message) => {
    if (!sessionIdRef.current) {
      console.error('No session ID available');
      return;
    }
    
    const sendUrl = `http://localhost:8000/send/${sessionIdRef.current}`;
    
    try {
      const response = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mime_type: 'text/plain',
          data: message
        })
      });
      
      if (!response.ok) {
        console.error('Failed to send message:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSend = () => {
    if (input.trim() && isConnected) {
      const userMessage = input.trim();
      
      // Add user message to chat
      setMessages(prev => [
        ...prev, 
        { id: `user-${Date.now()}`, text: userMessage, sender: 'user' }
      ]);
      
      // Send message to agent
      sendMessage(userMessage);
      setIsLoading(true);
      setInput('');
      
      console.log('[CLIENT TO AGENT]', userMessage);
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
            <div className="relative">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
            <h3 className="font-bold text-gray-800">AI Assistant</h3>
            {isLoading && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <div className="animate-pulse">•</div>
                <div className="animate-pulse delay-100">•</div>
                <div className="animate-pulse delay-200">•</div>
              </div>
            )}
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
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none"
            />
            <button 
              onClick={handleSend} 
              disabled={!isConnected || isLoading}
              className={`p-2 rounded-full transition-colors ${
                isConnected && !isLoading 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIChat;