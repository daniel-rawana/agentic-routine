import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Share2, Plus, Mail, Copy, Link, X, Send, AlertCircle, CheckCircle } from 'lucide-react';

// --- Utility Functions (Defined outside components to run once) ---

/**
 * Checks authentication and token status from localStorage.
 */
const checkAuthStatus = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const hasToken = !!localStorage.getItem('googleAccessToken');
  // We rely on the App.js scope to determine if permission was granted on login.
  // We'll trust the token exists and the scope was requested if hasToken is true.
  const hasGmailPermission = hasToken; 
  const userInfoRaw = localStorage.getItem('userInfo');
  
  const userInfo = (() => {
    try {
      return userInfoRaw ? JSON.parse(userInfoRaw) : null;
    } catch {
      return null;
    }
  })();

  return {
    isAuthenticated,
    hasToken,
    hasGmailPermission, // Simplified based on token presence
    userInfo,
  };
};

/**
 * Executes the Gmail API call to send an email.
 */
const sendGmailEmail = async (toEmail, subject, body, accessToken) => {
  const emailContent = [
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
  ].join('\n');

  // Utility for safe base64 encoding (required by Gmail API)
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: base64EncodedEmail }),
      }
    );

    const result = await response.json();
    
    if (response.ok) {
      return { success: true, data: result };
    } else {
      return { 
        success: false, 
        error: result.error?.message || 'Failed to send email',
        errorCode: result.error?.code || response.status
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error occurred while sending email',
      errorCode: 'NETWORK_ERROR'
    };
  }
};

/**
 * Validates basic email format.
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// --- Small Reusable Components (Memoized for performance) ---

const AuthStatusIndicator = React.memo(({ authStatus }) => {
  if (!authStatus) return null;
  
  const isLoggedIn = authStatus.isAuthenticated && authStatus.hasToken;
  
  return (
    <div className="mb-4 p-3 rounded-lg bg-gray-50 border">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <span className="font-medium text-gray-700">Auth Status:</span>
        
        {/* Login Status */}
        <div className="flex items-center gap-1">
          {isLoggedIn ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Logged In
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              Not Logged In
            </span>
          )}
        </div>
        
        {/* Gmail Permission Status */}
        <div className="flex items-center gap-1">
          {authStatus.hasGmailPermission ? (
            <span className="flex items-center gap-1 text-green-600">
              <Mail className="w-4 h-4" />
              Gmail OK
            </span>
          ) : (
            <span className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              No Gmail Access
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

// --- Invite Modal Component (Externalized for performance) ---

const InviteModal = React.memo(({ isVisible, onClose, inviteLink, authStatus }) => {
  // CRITICAL FIX: Local state for input isolates re-renders to only this modal
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Memoize handlers that don't need access to parent component state
  const handleCopy = useCallback((text) => {
    // Fallback for secure environments where navigator.clipboard might fail
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('📋 Copied to clipboard!');
  }, []);

  const shareViaEmail = useCallback(() => {
    const userName = authStatus?.userInfo?.name || 'Your friend';
    
    const subject = encodeURIComponent("🎯 Join me on My Success Coach!");
    const body = encodeURIComponent(`Hey there!

I've been using My Success Coach to track my productivity and build better habits, and it's been amazing! 
Join here: ${inviteLink}

Best regards,
${userName}`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [authStatus, inviteLink]);

  const handleGmailSend = useCallback(async (email) => {
    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    if (!authStatus?.hasToken) {
      alert("❌ You must be logged in with Google to use this feature.");
      return false;
    }

    if (!authStatus?.hasGmailPermission) {
      alert("❌ Gmail permissions were not granted during login. Please log out and log in again, making sure to grant access.");
      return false;
    }

    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('googleAccessToken');
      const subject = "🎯 Join me on My Success Coach!";
      const body = `Hey there!

I've been using My Success Coach to track my productivity and build better habits, and it's been amazing! 

Want to join me on the leaderboard and see who can be more productive? It's actually pretty fun and motivating!

Join here: ${inviteLink}

Let's crush our goals together! 💪

Best regards,
${authStatus.userInfo?.name || 'Your friend'}`;
      
      const result = await sendGmailEmail(email, subject, body, accessToken);
      
      if (result.success) {
        alert(`✅ Invitation sent successfully to ${email}!`);
        return true;
      } else {
        console.error('❌ Gmail send failed:', result);
        alert(`❌ Failed to send email: ${result.error}. Check console for details.`);
        return false;
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert("❌ An unexpected error occurred. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [authStatus, inviteLink]); // Depend on authStatus and inviteLink

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div 
          className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-[#86B0BD]">Invite Friends</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <AuthStatusIndicator authStatus={authStatus} />
          
          <p className="text-gray-600 mb-6">Choose how to invite your friends to My Success Coach!</p>
          
          <div className="space-y-4">
            {/* Direct Gmail Send */}
            {authStatus?.hasGmailPermission ? (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Send via Gmail</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="friend@example.com"
                    value={inviteEmail}
                    // This onChange ONLY updates the local state in the modal
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && inviteEmail && !isLoading) {
                        e.preventDefault(); // Prevent default form submission
                        const success = await handleGmailSend(inviteEmail);
                        if (success) {
                          setInviteEmail('');
                          onClose();
                        }
                      }
                    }}
                  />
                  <motion.button
                    onClick={async () => {
                      const success = await handleGmailSend(inviteEmail);
                      if (success) {
                        setInviteEmail('');
                        onClose();
                      }
                    }}
                    disabled={isLoading || !inviteEmail}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center ${
                      isLoading || !inviteEmail
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    whileHover={{ scale: isLoading || !inviteEmail ? 1 : 1.05 }}
                    whileTap={{ scale: isLoading || !inviteEmail ? 1 : 0.95 }}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Gmail Not Available</span>
                </div>
                <p className="text-sm text-orange-700">
                  Please logout and login again, making sure to grant Gmail permissions.
                </p>
              </div>
            )}

            {/* Copy Link */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Link className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Share Link</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm truncate"
                />
                <motion.button
                  onClick={() => handleCopy(inviteLink)}
                  className="px-3 py-2 bg-[#86B0BD] text-white rounded hover:bg-[#6E9AAB] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Copy className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Email Client */}
            <motion.button
              onClick={() => {
                shareViaEmail();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Mail className="w-4 h-4" />
              Open Email App
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

// --- Main Leaderboard Component ---

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  
  // Use useMemo for the link since it only changes once
  const inviteLink = useMemo(() => window.location.origin, []);

  useEffect(() => {
    // Check auth status when component mounts
    const status = checkAuthStatus();
    setAuthStatus(status);
    
    // Set users, using dynamic name/email if available
    setUsers([
      { id: 1, name: 'Alex Rivera', email: 'alexr@gmail.com', streak: 45, tasks: 120, rank: 1, isYou: false },
      { id: 2, name: status.userInfo?.name || 'You', email: status.userInfo?.email || 'your@gmail.com', streak: 2, tasks: 2, rank: 2, isYou: true },
      { id: 3, name: 'Jordan Lee', email: 'jordanl@gmail.com', streak: 32, rank: 3, tasks: 85, isYou: false },
      { id: 4, name: 'Taylor Kim', email: 'taylork@gmail.com', streak: 28, rank: 4, tasks: 70, isYou: false },
      { id: 5, name: 'Casey Patel', email: 'caseyp@gmail.com', streak: 15, rank: 5, tasks: 40, isYou: false },
    ]);
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen bg-white pt-2 px-6 pb-6">
      <motion.div 
        // CAMBIO 2: El recuadro interior principal ahora tiene el fondo beige 'bg-[#FAF7F0]'.
        className="bg-[#FAF7F0] rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100 max-w-4xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ... (Leaderboard Header JSX remains unchanged) ... */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-10 h-10 text-[#86B0BD]" />
            <div>
              <h2 className="text-3xl font-bold text-[#86B0BD]">Leaderboard</h2>
              <p className="text-gray-600">See how you stack up against friends!</p>
            </div>
          </div>
          <motion.button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-[#86B0BD] text-white px-6 py-3 rounded-xl hover:bg-[#6E9AAB] transition-all shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            <Plus className="w-5 h-5" /> Invite Friends
          </motion.button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-[#D1D3D4]/30 rounded-2xl p-4 text-center">
            <h3 className="text-xl font-bold text-[#86B0BD]">Productivity Champions</h3>
          </div>
          
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              className={`flex items-center gap-6 p-6 bg-white rounded-2xl border border-[#D1D3D4]/30 hover:shadow-lg transition-all ${
                user.isYou ? 'ring-2 ring-[#86B0BD]/50 bg-[#86B0BD]/5' : ''
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                user.rank === 1 ? 'bg-[#E2A16F]' : 
                user.rank === 2 ? 'bg-[#86B0BD]' : 
                user.rank === 3 ? 'bg-[#D1D3D4]' : 'bg-gray-300'
              }`}>
                {user.rank === 1 ? <Crown className="w-6 h-6" /> : user.rank}
              </span>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold ${user.isYou ? 'text-[#86B0BD]' : 'text-gray-800'}`}>
                  {user.name} {user.isYou && <span className="text-sm text-gray-500">(You)</span>}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-600 mt-1">
                  🔥 {user.streak} day streak • ✅ {user.tasks} tasks completed
                </p>
              </div>
              
              <motion.button 
                className="px-6 py-3 bg-[#D1D3D4]/50 text-[#86B0BD] rounded-xl hover:bg-[#D1D3D4]/70 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Share2 className="w-4 h-4" /> Follow
              </motion.button>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-6">
          💡 Tip: Invite friends to make productivity more fun and competitive!
        </div>
      </motion.div>

      {/* CRITICAL FIX: The modal is called here, passing only necessary props */}
      <InviteModal 
        isVisible={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
        inviteLink={inviteLink}
        authStatus={authStatus}
      />
    </div>
  );
};

export default LeaderboardPage;
