import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Upload, FileText } from 'lucide-react';

const AIChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! I'm your AI assistant. How can I help with your day?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(null);
  const eventSourceRef = useRef(null);
  const sessionIdRef = useRef(null);
  const currentMessageIdRef = useRef(null);
  const fileInputRef = useRef(null);

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
          console.log('Processing text message:', messageText);
          console.log('Current message ID:', currentMessageIdRef.current);
          
          setMessages(prev => {
            console.log('Previous messages:', prev);
            const newMessages = [...prev];
            
            // Start a new AI message if needed
            if (!currentMessageIdRef.current) {
              console.log('Creating new AI message');
              currentMessageIdRef.current = `ai-${Date.now()}`;
              newMessages.push({
                id: currentMessageIdRef.current,
                text: messageText,
                sender: 'ai'
              });
            } else {
              // Append to existing AI message
              console.log('Appending to existing message');
              const messageIndex = newMessages.findIndex(
                msg => msg.id === currentMessageIdRef.current
              );
              if (messageIndex !== -1) {
                console.log('Found message at index:', messageIndex);
                newMessages[messageIndex] = {
                  ...newMessages[messageIndex],
                  text: newMessages[messageIndex].text + messageText
                };
                console.log('Updated message text:', newMessages[messageIndex].text);
              } else {
                console.log('Message not found, creating new one');
                currentMessageIdRef.current = `ai-${Date.now()}`;
                newMessages.push({
                  id: currentMessageIdRef.current,
                  text: messageText,
                  sender: 'ai'
                });
              }
            }
            
            console.log('New messages array:', newMessages);
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

  const validateFile = (file) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload only PDF files');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return false;
    }
    return true;
  };

  const uploadFile = async (file) => {
    if (!validateFile(file)) return;
    
    setUploadingFile(file);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`http://localhost:8000/upload-pdf/${sessionIdRef.current}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        // Add file message to chat
        setMessages(prev => [
          ...prev, 
          { 
            id: `file-${Date.now()}`, 
            text: `📄 Uploaded: ${file.name}`, 
            sender: 'user',
            type: 'file'
          }
        ]);
        
        // Send processing message to agent
        sendMessage(`Please extract assignment dates from the uploaded PDF: ${file.name}`);
        setIsLoading(true);
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    } finally {
      setUploadingFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
    // Reset input
    e.target.value = '';
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
        className={`bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl transition-all duration-200 ${
          isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`}
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
        <div className="flex-1 p-4 overflow-y-auto space-y-4 relative">
          {isDragOver && (
            <motion.div
              className="absolute inset-0 bg-blue-50/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl border-2 border-dashed border-blue-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <p className="text-blue-600 font-medium">Drop your PDF here</p>
                <p className="text-blue-500 text-sm">To extract assignment dates</p>
              </div>
            </motion.div>
          )}
          
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? msg.type === 'file' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  {msg.type === 'file' && <FileText className="w-4 h-4 inline mr-2" />}
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {uploadingFile && (
            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="max-w-[80%] p-3 rounded-2xl bg-yellow-500 text-white">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Uploading {uploadingFile.name}...
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!isConnected || uploadingFile}
              className={`p-2 rounded-full transition-colors ${
                isConnected && !uploadingFile
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title="Upload PDF"
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your message or drop a PDF..."
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