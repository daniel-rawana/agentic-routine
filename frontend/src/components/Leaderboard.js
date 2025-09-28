import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Share2, Plus, Mail } from 'lucide-react';

// Gmail API function with proper error handling
const sendEmail = async (toEmail, subject, body, accessToken) => {
  const emailContent = [
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
  ].join('\n');

  // Properly encode for Gmail API
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // Remove padding

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
      console.log('Email sent successfully!', result);
      return { success: true, data: result };
    } else {
      console.error('Failed to send email:', result);
      return { 
        success: false, 
        error: result.error?.message || 'Failed to send email'
      };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: 'Network error occurred while sending email'
    };
  }
};

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Sample data - replace with actual API call
    setUsers([
      { id: 1, name: 'Alex Rivera', email: 'alexr@gmail.com', streak: 45, tasks: 120, rank: 1, isYou: false },
      { id: 2, name: 'You', email: 'your@gmail.com', streak: 2, tasks: 2, rank: 2, isYou: true },
      { id: 3, name: 'Jordan Lee', email: 'jordanl@gmail.com', streak: 32, rank: 3, tasks: 85, isYou: false },
      { id: 4, name: 'Taylor Kim', email: 'taylork@gmail.com', streak: 28, rank: 4, tasks: 70, isYou: false },
      { id: 5, name: 'Casey Patel', email: 'caseyp@gmail.com', streak: 15, rank: 5, tasks: 40, isYou: false },
    ]);
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInviteFriend = async () => {
    const friendEmail = prompt("Enter your friend's email address:");
    
    if (!friendEmail) {
      return; // User cancelled
    }

    if (!validateEmail(friendEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    const accessToken = localStorage.getItem('googleAccessToken');

    if (!accessToken) {
      alert("You need to be logged in with Google to send invitations.");
      return;
    }

    setIsLoading(true);

    try {
      const subject = "🎯 Join me on My Success Coach!";
      const body = `Hey there!

I've been using My Success Coach to track my productivity and build better habits, and it's been amazing! 

Want to join me on the leaderboard and see who can be more productive? It's actually pretty fun and motivating!

Join here: ${window.location.origin}

Let's crush our goals together! 💪

Best regards,
${JSON.parse(localStorage.getItem('userInfo') || '{}').name || 'Your friend'}`;

      const result = await sendEmail(friendEmail, subject, body, accessToken);
      
      if (result.success) {
        alert(`✅ Invitation sent successfully to ${friendEmail}!`);
      } else {
        if (result.error.includes('insufficient authentication scopes')) {
          alert("❌ Email permissions are required. Please log out and log in again to grant Gmail access.");
        } else {
          alert(`❌ Failed to send invitation: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert("❌ An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    // CHANGE APPLIED: Added bg-white to ensure a clean, non-gradient background for the component itself.
    <div className="min-h-screen bg-white p-6">
      <motion.div 
        className="bg-transparent rounded-3xl p-8 lg:p-12 max-w-4xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
          <div 
            className="bg-transparent rounded-2xl p-4 text-center"
          >
            <h3 className="text-xl font-bold text-[#86B0BD]">Productivity Champions</h3>
          </div>
          
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              // List items remain white for contrast
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
