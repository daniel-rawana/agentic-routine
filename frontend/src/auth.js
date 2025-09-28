// auth.js

import { jwtDecode } from 'jwt-decode';

export const handleLogin = (idToken) => {
  // Save the token to local storage
  localStorage.setItem('googleIdToken', idToken);
  
  
};

export const handleLogout = () => {
  // Clear the token from local storage
  localStorage.removeItem('googleIdToken');
  // You might also need to clear other session-related data
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('googleIdToken');
  // You should also verify if the token is still valid (not expired)
  if (!token) {
    return false;
  }
  
  try {
    const decodedToken = jwtDecode(token);
    // Check if the token's expiration date is in the future
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    console.error("Failed to decode or validate token", error);
    return false;
  }
};