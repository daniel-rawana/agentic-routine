import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';  // ADD THIS IMPORT

import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
import LeaderboardPage from './pages/LeaderboardPage';
import AI from './pages/AI';
import Game from './pages/Game';

const GOOGLE_CLIENT_ID = "398045760957-6619kocfprphd6m0ubosm2e4crtgtb4k.apps.googleusercontent.com";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);

  // 🆕 ADD THIS FUNCTION - Initialize gamification profile
  const initializeGamificationProfile = async () => {
  try {
    // Get the user data from localStorage (which contains the Google ID)
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.error('❌ [App.js] No user data found in localStorage');
      return;
    }

    const parsedUser = JSON.parse(userData);
    const googleUserId = parsedUser.id; // This is the long number from Google OAuth
    
    console.log('🔍 [App.js] Initializing gamification for Google user ID:', googleUserId);
    
    // Step 1: Validate/create user profile using Google ID
    const validateResponse = await fetch(`http://127.0.0.1:8000/api/validate-user/${googleUserId}`, {
      method: 'POST'
    });
    
    if (validateResponse.ok) {
      const validateResult = await validateResponse.json();
      console.log('✅ [App.js] User validation result:', validateResult);
      
      if (validateResult.created) {
        console.log('🎉 [App.js] New gamification profile created for Google ID:', googleUserId);
      } else {
        console.log('✅ [App.js] Existing gamification profile found for Google ID:', googleUserId);
      }
      
      // Step 2: Load user profile data
      const profileResponse = await fetch(`http://127.0.0.1:8000/api/profile/${googleUserId}`);
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ [App.js] User gamification profile loaded:', profileData);
        
        // Store gamification data in localStorage
        localStorage.setItem('user_profile', JSON.stringify(profileData));
        
      } else {
        console.error('❌ [App.js] Failed to load user profile');
      }
    } else {
      console.error('❌ [App.js] Failed to validate user');
    }
  } catch (error) {
    console.error('❌ [App.js] Error initializing gamification:', error);
  }
};

// 🆕 SIMPLIFIED useEffect - just check if user exists and initialize gamification
useEffect(() => {
  // Check for existing user data in localStorage
  const userData = localStorage.getItem('user');
  const savedToken = localStorage.getItem('googleIdToken');
  
  if (userData && savedToken) {
    try {
      const parsedUser = JSON.parse(userData);
      console.log('🔍 [App.js] Found existing user data:', parsedUser);
      
      setUser(parsedUser);
      setIsAuthenticated(true);
      
      // Initialize gamification with the existing user data
      initializeGamificationProfile();
      
    } catch (error) {
      console.error('❌ [App.js] Error parsing user data:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('googleIdToken');
    }
  }
}, []);

// 🆕 SIMPLIFIED handleLogin - store user data and initialize gamification
const handleLogin = async (loginData) => {
  console.log("Login successful! Login data received:", loginData);
  
  // Extract user info from the login data
  const userData = {
    id: loginData.userInfo.id,           // This is the Google user ID (long number)
    email: loginData.userInfo.email,
    name: loginData.userInfo.name,
    picture: loginData.userInfo.picture
  };
  
  console.log('🔍 [App.js] User data extracted:', userData);
  
  // Store user data and token
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('googleIdToken', loginData.access_token);
  
  setUser(userData);
  setIsAuthenticated(true);
  setShowLogin(false);
  
  // Initialize gamification with the new user data
  await initializeGamificationProfile();
};

// 🆕 SIMPLIFIED handleRegister - same as handleLogin
const handleRegister = async (registerData) => {
  console.log("Registration successful! Register data received:", registerData);
  
  // Extract user info from the register data
  const userData = {
    id: registerData.userInfo.id,           // This is the Google user ID (long number)
    email: registerData.userInfo.email,
    name: registerData.userInfo.name,
    picture: registerData.userInfo.picture
  };
  
  console.log('🔍 [App.js] User data extracted:', userData);
  
  // Store user data and token
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('googleIdToken', registerData.access_token);
  
  setUser(userData);
  setIsAuthenticated(true);
  setShowRegister(false);
  
  // Initialize gamification with the new user data
  await initializeGamificationProfile();
};

const handleLogout = () => {
  setIsAuthenticated(false);
  setUser(null);
  localStorage.removeItem('googleIdToken');
  localStorage.removeItem('user');
  localStorage.removeItem('user_profile');  // Clear gamification data
};

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/" />;
  };

  return (
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID}
      scope="https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email"
    >
      <Router>
        <Layout 
          isAuthenticated={isAuthenticated} 
          onLogout={handleLogout}
          showLogin={showLogin}
          setShowLogin={setShowLogin}
          onLogin={handleLogin}
          showRegister={showRegister}
          setShowRegister={setShowRegister}
          onRegister={handleRegister}
          user={user}  // 🆕 PASS USER TO LAYOUT
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <CalendarPage user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <LeaderboardPage user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai" 
              element={
                <ProtectedRoute>
                  <AI user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/game" 
              element={
                <ProtectedRoute>
                  <Game user={user} />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;