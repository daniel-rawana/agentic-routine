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
  const initializeGamificationProfile = async (userId) => {
    try {
      console.log('🔍 [App.js] Initializing gamification for user:', userId);
      
      // Step 1: Validate/create user profile
      const validateResponse = await fetch(`http://127.0.0.1:8000/api/validate-user/${userId}`, {
        method: 'POST'
      });
      
      if (validateResponse.ok) {
        const validateResult = await validateResponse.json();
        console.log('✅ [App.js] User validation result:', validateResult);
        
        if (validateResult.created) {
          console.log('🎉 [App.js] New gamification profile created!');
        } else {
          console.log('✅ [App.js] Existing gamification profile found');
        }
        
        // Step 2: Load user profile data
        const profileResponse = await fetch(`http://127.0.0.1:8000/api/profile/${userId}`);
        
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

  useEffect(() => {
    // Check for existing auth token in localStorage
    const savedToken = localStorage.getItem('googleIdToken');
    if (savedToken) {
      try {
        // Decode the JWT token to get user info
        const decodedToken = jwtDecode(savedToken);
        console.log('🔍 [App.js] Decoded token:', decodedToken);
        
        // Check if token is still valid
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          setIsAuthenticated(true);
          setUser({
            id: decodedToken.sub,      // Google user ID
            email: decodedToken.email,
            name: decodedToken.name,
            picture: decodedToken.picture
          });
          
          // 🆕 ADD THIS: Initialize gamification after setting user
          initializeGamificationProfile(decodedToken.sub);
          
        } else {
          console.log('🔍 [App.js] Token expired, clearing auth');
          localStorage.removeItem('googleIdToken');
        }
      } catch (error) {
        console.error('❌ [App.js] Error decoding token:', error);
        localStorage.removeItem('googleIdToken');
      }
    }
  }, []);

  // 🆕 MODIFY YOUR EXISTING handleLogin FUNCTION
  const handleLogin = async (idToken) => {
    console.log("Login successful! ID Token received.");
    setIsAuthenticated(true);
    setShowLogin(false);
    localStorage.setItem('googleIdToken', idToken);
    
    try {
      // Decode the token to get user info
      const decodedToken = jwtDecode(idToken);
      console.log('🔍 [App.js] Login - Decoded token:', decodedToken);
      
      const userData = {
        id: decodedToken.sub,      // Google user ID
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      };
      
      setUser(userData);
      
      // 🆕 ADD THIS: Initialize gamification for newly logged in user
      await initializeGamificationProfile(decodedToken.sub);
      
    } catch (error) {
      console.error('❌ [App.js] Error processing login:', error);
    }
  };

  // 🆕 MODIFY YOUR EXISTING handleRegister FUNCTION
  const handleRegister = async (idToken) => {
    console.log("Registration successful! ID Token received.");
    setIsAuthenticated(true);
    setShowRegister(false);
    localStorage.setItem('googleIdToken', idToken);
    
    try {
      // Decode the token to get user info
      const decodedToken = jwtDecode(idToken);
      console.log('🔍 [App.js] Register - Decoded token:', decodedToken);
      
      const userData = {
        id: decodedToken.sub,      // Google user ID
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      };
      
      setUser(userData);
      
      // 🆕 ADD THIS: Initialize gamification for newly registered user
      await initializeGamificationProfile(decodedToken.sub);
      
    } catch (error) {
      console.error('❌ [App.js] Error processing registration:', error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('googleIdToken');
    localStorage.removeItem('user_profile');  // 🆕 ADD THIS: Clear gamification data
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