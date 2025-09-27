import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// 1. Import GoogleOAuthProvider
import { GoogleOAuthProvider } from '@react-oauth/google';

import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './components/Login'; // Make sure this is the updated Login component
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
import LeaderboardPage from './pages/LeaderboardPage';
import AI from './pages/AI';
import Game from './pages/Game';

// Your Google Client ID
const GOOGLE_CLIENT_ID = "398045760957-6619kocfprphd6m0ubosm2e4crtgtb4k.apps.googleusercontent.com";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null); // Optional: to store user info

  useEffect(() => {
    // 2. Check for a real auth token in localStorage
    const savedToken = localStorage.getItem('googleIdToken');
    if (savedToken) {
      // TODO: You should send this token to your backend for verification
      // before setting isAuthenticated to true for full security.
      setIsAuthenticated(true);
      // Optional: Decode the token to get user info if needed
      // const decodedToken = jwt_decode(savedToken);
      // setUser(decodedToken);
    }
  }, []);

  // 3. New login handler that accepts the ID token from Google
  const handleLogin = (idToken) => {
    console.log("Login successful! ID Token received.");
    setIsAuthenticated(true);
    setShowLogin(false);
    localStorage.setItem('googleIdToken', idToken);
    
    // TODO: Send this token to your backend for proper verification and session creation
  };

  // Register handler that accepts the ID token from Google
  const handleRegister = (idToken) => {
    console.log("Registration successful! ID Token received.");
    setIsAuthenticated(true);
    setShowRegister(false);
    localStorage.setItem('googleIdToken', idToken);
    
    // TODO: Send this token to your backend for user registration and session creation
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('googleIdToken');
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/" />;
  };

  return (
    // 4. Wrap the Router with GoogleOAuthProvider
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai" 
              element={
                <ProtectedRoute>
                  <AI />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/game" 
              element={
                <ProtectedRoute>
                  <Game />
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