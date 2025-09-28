import React from 'react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail } from 'lucide-react';

const Login = ({ onLogin, onShowRegister }) => {
  // Use useGoogleLogin to get access_token for Gmail API
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('🚀 Google login success:', tokenResponse);
      console.log('📧 Access token received:', tokenResponse.access_token ? 'YES' : 'NO');
      console.log('⏰ Token expires in:', tokenResponse.expires_in, 'seconds');
      console.log('🔐 Granted scopes:', tokenResponse.scope);
      
      if (tokenResponse.access_token) {
        // Store the access token
        localStorage.setItem('googleAccessToken', tokenResponse.access_token);
        localStorage.setItem('tokenExpiresAt', Date.now() + (tokenResponse.expires_in * 1000));
        
        // Verify Gmail and Calendar scopes were granted
        const hasGmailScope = tokenResponse.scope && tokenResponse.scope.includes('gmail.send');
        const hasCalendarScope = tokenResponse.scope && tokenResponse.scope.includes('calendar.readonly');
        console.log('📬 Gmail send scope granted:', hasGmailScope ? 'YES' : 'NO');
        console.log('📅 Calendar readonly scope granted:', hasCalendarScope ? 'YES' : 'NO');
        
        if (hasGmailScope) {
          localStorage.setItem('hasGmailPermission', 'true');
        } else {
          console.warn('⚠️ Gmail send scope not granted!');
          localStorage.setItem('hasGmailPermission', 'false');
        }
        
        if (hasCalendarScope) {
          localStorage.setItem('hasCalendarPermission', 'true');
        } else {
          console.warn('⚠️ Calendar readonly scope not granted!');
          localStorage.setItem('hasCalendarPermission', 'false');
        }
        
        try {
          // Get user information
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          });
          
          if (userResponse.ok) {
            const userInfo = await userResponse.json();
            console.log('👤 User info retrieved:', userInfo);
            
            // Store user info
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            localStorage.setItem('isAuthenticated', 'true');
            
            // Test Gmail API access immediately
            console.log('🧪 Testing Gmail API access...');
            const gmailTestResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });
            
            if (gmailTestResponse.ok) {
              const gmailProfile = await gmailTestResponse.json();
              console.log('✅ Gmail API test successful:', gmailProfile.emailAddress);
              localStorage.setItem('gmailApiWorking', 'true');
            } else {
              console.error('❌ Gmail API test failed:', gmailTestResponse.status);
              localStorage.setItem('gmailApiWorking', 'false');
            }
            
            // Call the onLogin callback
            onLogin({ 
              access_token: tokenResponse.access_token, 
              userInfo,
              hasGmailPermission: hasGmailScope
            });
            
          } else {
            console.error('❌ Failed to get user info:', userResponse.status);
            onLogin({ access_token: tokenResponse.access_token });
          }
        } catch (error) {
          console.error('❌ Error during login process:', error);
          onLogin({ access_token: tokenResponse.access_token });
        }
      } else {
        console.error('❌ No access token received from Google');
        alert('Login failed: No access token received');
      }
    },
    onError: (error) => {
      console.error('❌ Google Login Failed:', error);
      alert('Login failed. Please try again.');
    },
    // CRITICAL: These scopes must be granted for Gmail and Calendar to work
    scope: 'openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.readonly',
    // Force consent screen to ensure scopes are properly granted
    prompt: 'consent'
  });

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
          onClick={googleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <img 
            src="https://developers.google.com/identity/images/g-logo.png" 
            alt="Google" 
            className="w-5 h-5"
          />
          <span className="font-medium">Sign in with Google</span>
        </button>
        
        <div className="text-center text-gray-600 text-sm">
          Login powered by Google OAuth with Gmail integration.
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            📧 This login will request Gmail permissions to send invitation emails.
          </p>
        </div>
        
        {onShowRegister && (
          <div className="text-center mt-4">
            <span className="text-gray-600 text-sm">Don't have an account? </span>
            <button 
              onClick={onShowRegister}
              className="text-[#86B0BD] hover:text-[#6E9AAB] font-medium text-sm underline transition-colors"
            >
              Register now
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Login;

