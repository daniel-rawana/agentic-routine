import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Upload, FileText, MicOff } from 'lucide-react';

const API_BASE = "http://localhost:8000";

// --- Audio Playback Utilities ---

/**
 * Converts a Base64 string to an ArrayBuffer.
 * @param {string} base64 - Base64 encoded data string.
 * @returns {ArrayBuffer} ArrayBuffer of the decoded data.
 */
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Plays the raw PCM audio data using the Web Audio API.
 * @param {ArrayBuffer} arrayBuffer - Raw signed 16-bit PCM audio data.
 */
function playAudio(arrayBuffer) {
  // Use 16000Hz sample rate as defined in the recording utility
  const audioContext = new AudioContext({ sampleRate: 16000 }); 
  
  // The raw buffer is signed 16-bit PCM, but Web Audio decode expects an array of floats 
  // or a compatible WAV/MP3 format. The easiest path is to use a library or convert it.
  // Since the agent is sending raw PCM, we must manually create the AudioBuffer.

  const pcm16 = new Int16Array(arrayBuffer);
  const float32Data = new Float32Array(pcm16.length);

  // Convert S16 to Float32 (normalized between -1.0 and 1.0)
  for (let i = 0; i < pcm16.length; i++) {
    float32Data[i] = pcm16[i] / 32768.0; 
  }

  // Create an AudioBuffer
  const audioBuffer = audioContext.createBuffer(
    1, // mono
    float32Data.length,
    audioContext.sampleRate // 16000
  );

  // Copy the data to the AudioBuffer
  audioBuffer.getChannelData(0).set(float32Data);

  // Create a source node
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
}


// --- Main Component ---

const AIChat = ({ isOpen, onClose, isRecording, chatApiRef, onRecordingStatusChange }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! I'm your AI assistant. How can I help with your day?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [lastCompletedAt, setLastCompletedAt] = useState(null);
  const eventSourceRef = useRef(null);
  const sessionIdRef = useRef(null);
  const currentMessageIdRef = useRef(null);
  const fileInputRef = useRef(null);

  /**
   * Universal sender for text, audio, and control messages.
   */
  const sendData = async ({ mime_type, data }) => {
    if (!sessionIdRef.current) {
      console.error('No session ID available');
      return;
    }
    
    const sendUrl = `${API_BASE}/send/${sessionIdRef.current}`;
    
    try {
      const response = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mime_type: mime_type,
          data: data
        })
      });
      
      if (!response.ok) {
        console.error('Failed to send message:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  /**
   * Expose API to parent component via ref.
   */
  useEffect(() => {
    chatApiRef.current = {
      sessionId: sessionIdRef.current,
      sendData: sendData
    };
  }, [isConnected, messages]); // Update ref when session ID changes

  const connectToAgent = () => {
    // Generate unique session ID on first connection
    if (!sessionIdRef.current) {
        sessionIdRef.current = Math.random().toString().substring(2, 10);
    }
    
    // NOTE: Set is_audio=true if you want the agent to reply with audio by default.
    // For this implementation, we rely on the agent to decide the response format.
    const sseUrl = `${API_BASE}/events/${sessionIdRef.current}`; 
    
    try {
      eventSourceRef.current = new EventSource(sseUrl);
      
      eventSourceRef.current.onopen = () => {
        console.log('SSE connection opened');
        setIsConnected(true);
      };
      
      eventSourceRef.current.onmessage = (event) => {
        const messageFromServer = JSON.parse(event.data);
        console.log('[AGENT TO CLIENT]', messageFromServer);
        
        // --- 1. Audio Reply Handling ---
        if (messageFromServer.mime_type === "audio/pcm") {
            const audioData = base64ToArrayBuffer(messageFromServer.data);
            playAudio(audioData);
            
            // Keep agent in loading/speaking state until turn_complete
            setIsLoading(true); 
            onRecordingStatusChange(true); // Notify parent component (AI.jsx)
            return;
        }

        // --- 2. Control Messages ---
        if (messageFromServer.turn_complete) {
          currentMessageIdRef.current = null;
          setIsLoading(false);
          setLastCompletedAt(new Date());
          console.log('✅ Agent finished responding at:', new Date().toLocaleTimeString());
          onRecordingStatusChange(false); // Notify parent component (AI.jsx)

          return;
        }
        
        if (messageFromServer.interrupted) {
          setIsLoading(false);
          onRecordingStatusChange(false); // Notify parent component (AI.jsx)
          return;
        }
        
        // --- 3. Text Messages (Transcription or response) ---
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
              } else {
                currentMessageIdRef.current = `ai-${Date.now()}`;
                newMessages.push({
                  id: currentMessageIdRef.current,
                  text: messageText,
                  sender: 'ai'
                });
              }
            }
            return newMessages;
          });
          setIsLoading(true); // Agent is still responding
          onRecordingStatusChange(true); // Notify parent component (AI.jsx)
        }
      };
      
      eventSourceRef.current.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        setIsLoading(false);
        onRecordingStatusChange(false);
        
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

  // Initialize SSE connection on mount/open
  useEffect(() => {
    if (isOpen && !sessionIdRef.current) {
      connectToAgent();
    }
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      // Clean up ref on unmount
      if (chatApiRef.current) {
          chatApiRef.current = { sessionId: null, sendData: (data) => console.error("API closed:", data) };
      }
    };
  }, [isOpen]);

  const sendMessage = (message) => {
    // Add user message to chat first
    setMessages(prev => [
      ...prev, 
      { id: `user-${Date.now()}`, text: message, sender: 'user' }
    ]);
    
    // Send message to agent
    sendData({ mime_type: 'text/plain', data: message });
    setIsLoading(true);
    setInput('');
    onRecordingStatusChange(true); // Indicate agent is thinking
  };

  const handleSend = () => {
    if (input.trim() && isConnected) {
      const userMessage = input.trim();
      sendMessage(userMessage);
      setIsLoading(true);
      setLastCompletedAt(null); // Reset completion status
      setInput('');
      
      console.log('[CLIENT TO AGENT]', userMessage);
    }
  };

  // --- File Upload Logic (Unchanged) ---
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
      
      const response = await fetch(`${API_BASE}/upload-pdf/${sessionIdRef.current}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setMessages(prev => [
          ...prev, 
          { 
            id: `file-${Date.now()}`, 
            text: `📄 Uploaded: ${file.name}`, 
            sender: 'user',
            type: 'file'
          }
        ]);
        
        sendMessage(`Please extract assignment dates from the uploaded PDF: ${file.name}`);
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
    e.target.value = '';
  };
  // --- End File Upload Logic ---

  if (!isOpen) return null;
  
  // Disable input if recording or agent is thinking/speaking
  const isInputDisabled = !isConnected || isLoading || isRecording;

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

            {isLoading ? (
            {isRecording && (
                <span className="text-red-500 font-medium text-sm flex items-center gap-1">
                    <MicOff className="w-4 h-4" /> Mic Active
                </span>
            )}
            {isLoading && !isRecording && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <div className="animate-pulse">•</div>
                <div className="animate-pulse delay-100">•</div>
                <div className="animate-pulse delay-200">•</div>
                <span className="ml-1">Thinking...</span>
              </div>
            ) : lastCompletedAt && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Ready</span>
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
          
          {!isLoading && lastCompletedAt && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Response complete • {lastCompletedAt.toLocaleTimeString()}</span>
              </div>
            </motion.div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isInputDisabled || uploadingFile}
              className={`p-2 rounded-full transition-colors ${
                !isInputDisabled && !uploadingFile
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
              placeholder={isRecording ? "Stop recording to type..." : "Type your message or drop a PDF..."}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none"
              disabled={isInputDisabled}
            />
            <button 
              onClick={handleSend} 
              disabled={isInputDisabled || !input.trim()}
              className={`p-2 rounded-full transition-colors ${
                !isInputDisabled && input.trim()
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
