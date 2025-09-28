import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mic, Volume2, Calendar, Users } from 'lucide-react';
// FIX: Changed import path to go up one directory (..) and into the 'components' folder.
import AIChat from '../components/AIChat'; 

// --- Audio Utilities (Moved here to be near the main microphone controller) ---
const API_BASE = "http://localhost:8000";

/**
 * Converts ArrayBuffer (PCM data) to Base64 string for transmission.
 * @param {ArrayBuffer} buffer - The PCM audio data buffer.
 * @returns {string} Base64 encoded string.
 */
const bufferToBase64 = (buffer) => {
    return btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
};

/**
 * Captures microphone audio, converts it to PCM 16kHz, and calls onData callback.
 * @param {function(ArrayBuffer): void} onData - Callback function called with each PCM chunk.
 * @returns {function(): void} Stop recording function.
 */
async function startRecording(onData) {
  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Define AudioContext with 16kHz sample rate (standard for speech recognition)
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);

    // Create ScriptProcessorNode to get raw audio data
    // Buffer size 4096, 1 input channel, 1 output channel
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      // Get raw audio data (Float32Array) from the input buffer
      const input = e.inputBuffer.getChannelData(0);
      
      // Convert Float32Array to Int16Array (signed 16-bit PCM)
      const buffer = new ArrayBuffer(input.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < input.length; i++) {
        let s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); // true for little-endian
      }
      
      // Send the raw PCM buffer via callback
      if (onData) onData(buffer);
    };

    // Return the stop function
    return () => {
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      audioContext.close();
    };
  } catch (error) {
    console.error('Error starting microphone:', error);
    // IMPORTANT: Replacing alert() with a custom UI message as per instructions
    const messageBox = document.createElement('div');
    messageBox.style.cssText = 'position: fixed; top: 20px; right: 20px; background: red; color: white; padding: 10px; border-radius: 8px; z-index: 9999;';
    messageBox.textContent = 'Failed to start microphone. Please check permissions.';
    document.body.appendChild(messageBox);
    setTimeout(() => document.body.removeChild(messageBox), 3000); 

    return () => {}; // Return a no-op function on failure
  }
}

// --- Main Component ---
const AI = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingFromChat, setIsLoadingFromChat] = useState(false); // State to reflect agent thinking/speaking
  const stopRecordingFnRef = useRef(null);

  // Ref to hold the AIChat's session ID and sending function
  // AIChat will initialize this ref once it establishes the session
  const chatApiRef = useRef({ 
    sessionId: null, 
    sendData: (data) => console.error("AIChat API not initialized yet:", data) 
  });

  const toggleRecording = useCallback(async () => {
    if (!chatApiRef.current.sessionId) {
        // IMPORTANT: Replacing alert() with a custom UI message as per instructions
        const messageBox = document.createElement('div');
        messageBox.style.cssText = 'position: fixed; top: 20px; right: 20px; background: orange; color: white; padding: 10px; border-radius: 8px; z-index: 9999;';
        messageBox.textContent = 'The chat session is not ready. Please wait a moment or open the chat first.';
        document.body.appendChild(messageBox);
        setTimeout(() => document.body.removeChild(messageBox), 3000); 

        return;
    }

    if (!isRecording) {
      // START RECORDING
      setIsRecording(true);
      
      stopRecordingFnRef.current = await startRecording(async (pcmBuffer) => {
        // Callback runs for every PCM chunk (4096 samples)
        const base64Data = bufferToBase64(pcmBuffer);
        
        // Send audio chunk using the AIChat's exposed sender function
        await chatApiRef.current.sendData({
          mime_type: "audio/pcm",
          data: base64Data,
          // Optional: Add the session ID here if needed, but the sender function should handle it
        });
      });
      
      // Optionally, send a start-of-stream indicator to the backend here if your backend needs it
      
    } else {
      // STOP RECORDING
      if (stopRecordingFnRef.current) {
        stopRecordingFnRef.current(); // Stop the recording stream
        stopRecordingFnRef.current = null;
        
        // Optionally, send an end-of-stream indicator to the backend
        await chatApiRef.current.sendData({
          mime_type: "text/plain", // Use text/plain or a custom mime_type for EOS
          data: "EOS", // Signal end of audio stream
        });
      }
      setIsRecording(false);
      setIsLoadingFromChat(true); // Assume agent will process and reply now
    }
  }, [isRecording]);

  const quickActions = [
    { label: 'Check Tasks', icon: <MessageCircle className="w-5 h-5" />, onClick: () => setChatOpen(true) },
    { label: 'Schedule Event', icon: <Calendar className="w-5 h-5" />, onClick: () => setChatOpen(true) },
    { label: 'Check Stats', icon: <Users className="w-5 h-5" />, onClick: () => setChatOpen(true) },
  ];
  
  // Determine animation state based on real recording/loading
  const isAnimating = isRecording || isLoadingFromChat;
  const isSpeaking = isLoadingFromChat && !isRecording; // Agent is processing or speaking

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

      {/* Animated Circle - Reflects recording or agent activity */}
      <motion.div 
        className="relative"
        animate={isAnimating ? { 
          scale: [1, 1.1, 0.95, 1], 
          rotate: [0, 5, -5, 0],
          y: isSpeaking ? [0, -5, 5, 0] : 0
        } : {}}
        transition={{ 
          duration: isAnimating ? 1 : 0, 
          repeat: isAnimating ? Infinity : 0,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        <motion.button
          onClick={isRecording ? toggleRecording : () => setChatOpen(true)}
          className="w-32 h-32 lg:w-40 lg:h-40 bg-[#86B0BD] rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl cursor-pointer relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSpeaking}
        >
          {isRecording ? (
            <Mic className="w-12 h-12 lg:w-16 lg:h-16 text-white animate-pulse" />
          ) : (
            <MessageCircle className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
          )}
          
          {isRecording && (
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
          disabled={isRecording}
          className={`w-full bg-[#D1D3D4]/50 px-6 py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
            isRecording ? 'text-gray-500 cursor-not-allowed' : 'text-[#86B0BD] hover:bg-[#D1D3D4]/70'
          }`}
          whileHover={!isRecording ? { scale: 1.02 } : {}}
        >
          <MessageCircle className="w-5 h-5" />
          Chat with My AI
        </motion.button>
        <motion.button
          onClick={toggleRecording}
          disabled={isLoadingFromChat}
          className={`w-full px-6 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all ${
            isLoadingFromChat 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#86B0BD] text-white hover:bg-[#6E9AAB]'
          }`}
          whileHover={!isLoadingFromChat ? { scale: 1.02 } : {}}
        >
          <Mic className="w-5 h-5" />
          {isRecording ? 'Recording... Tap to stop' : isLoadingFromChat ? 'Agent Responding...' : 'Speak to My AI'}
          {isSpeaking && <Volume2 className="w-5 h-5 animate-bounce" />}
        </motion.button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg">
        {quickActions.map((action, index) => (
          <motion.button
            key={index}
            onClick={action.onClick}
            disabled={isRecording || isLoadingFromChat}
            className={`bg-[#FFF0DD] px-4 py-3 rounded-xl font-medium border border-[#D1D3D4]/30 flex items-center justify-center gap-2 transition-all ${
              isAnimating ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-[#E2A16F]/10'
            }`}
            whileHover={!isAnimating ? { scale: 1.05, y: -2 } : {}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {action.icon}
            {action.label}
          </motion.button>
        ))}
      </div>

      <AIChat 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        isRecording={isRecording}
        chatApiRef={chatApiRef}
        onRecordingStatusChange={setIsLoadingFromChat}
      />
    </motion.div>
  );
};

export default AI;


