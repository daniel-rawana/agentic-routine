import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const DebugAuth = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const checkTokenInfo = async () => {
    const token = localStorage.getItem('googleAccessToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (!token) {
      setTokenInfo({ error: 'No access token found in localStorage' });
      return;
    }

    setLoading(true);
    
    try {
      // Check token validity
      const tokenInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
      
      if (tokenInfoResponse.ok) {
        const data = await tokenInfoResponse.json();
        setTokenInfo({ 
          success: true,
          ...data,
          token: token,
          userInfo: userInfo ? JSON.parse(userInfo) : null
        });
      } else {
        const error = await tokenInfoResponse.json();
        setTokenInfo({ 
          error: 'Token validation failed',
          details: error 
        });
      }
    } catch (error) {
      setTokenInfo({ 
        error: 'Failed to validate token',
        details: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const testGmailAPI = async () => {
    const token = localStorage.getItem('googleAccessToken');
    
    if (!token) {
      alert('No access token available');
      return;
    }

    try {
      // Test Gmail API access with a simple profile request
      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/profile',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const profile = await response.json();
        alert(`✅ Gmail API access successful!\nEmail: ${profile.emailAddress}\nMessages total: ${profile.messagesTotal}`);
      } else {
        const error = await response.json();
        alert(`❌ Gmail API access failed:\n${error.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${error.message}`);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('userInfo');
    setTokenInfo(null);
    alert('Tokens cleared. Please login again.');
  };

  useEffect(() => {
    checkTokenInfo();
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50"
      >
        <Info className="w-5 h-5" />
      </button>
    );
  }

  return (
    <motion.div 
      className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm z-50 max-h-96 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-sm">Auth Debug</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          Checking token...
        </div>
      )}
      
      {tokenInfo && (
        <div className="space-y-2 text-xs">
          {tokenInfo.error ? (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-4 h-4" />
              <div>
                <div className="font-medium">{tokenInfo.error}</div>
                {tokenInfo.details && (
                  <div className="text-gray-500 mt-1 text-xs">
                    {JSON.stringify(tokenInfo.details, null, 2)}
                  </div>
                )}
              </div>
            </div>
          ) : tokenInfo.success ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Token Valid</span>
              </div>
              
              <div className="pl-6 space-y-1 text-gray-600">
                <div><strong>Email:</strong> {tokenInfo.email}</div>
                <div><strong>Audience:</strong> {tokenInfo.audience}</div>
                <div><strong>Expires in:</strong> {tokenInfo.expires_in}s</div>
                <div><strong>User ID:</strong> {tokenInfo.user_id}</div>
                
                {tokenInfo.userInfo && (
                  <div>
                    <strong>User Info:</strong>
                    <div className="ml-2 text-xs">
                      <div>Name: {tokenInfo.userInfo.name}</div>
                      <div>Email: {tokenInfo.userInfo.email}</div>
                      <div>Picture: {tokenInfo.userInfo.picture ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <strong>Token:</strong>
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                {showToken && (
                  <div className="break-all text-xs bg-gray-50 p-2 rounded">
                    {tokenInfo.token}
                  </div>
                )}
                
                <div><strong>Scope:</strong></div>
                <div className="text-xs bg-gray-50 p-2 rounded">
                  {tokenInfo.scope}
                </div>
              </div>
              
              {tokenInfo.scope && tokenInfo.scope.includes('gmail.send') ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Gmail Send Scope ✓</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Gmail Send Scope Missing</span>
                </div>
              )}
            </div>
          ) : null}
          
          <div className="flex gap-1 mt-3 flex-wrap">
            <button
              onClick={checkTokenInfo}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Refresh
            </button>
            <button
              onClick={testGmailAPI}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            >
              Test Gmail
            </button>
            <button
              onClick={clearTokens}
              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DebugAuth;
