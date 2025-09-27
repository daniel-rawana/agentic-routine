import React from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { UserPlus } from 'lucide-react';

const Register = ({ onRegister, onShowLogin }) => {
  return (
    <motion.div 
      className="max-w-md mx-auto bg-[#FFF0DD]/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#E2A16F]/30"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center mb-6">
        <UserPlus className="w-8 h-8 text-[#86B0BD] mr-3" />
        <h2 className="text-3xl font-bold text-center text-gray-900">Join Us</h2>
      </div>
      <div className="space-y-4">
        <GoogleLogin
          onSuccess={credentialResponse => {
            // Pass the ID token up to the parent component
            onRegister(credentialResponse.credential);
          }}
          onError={() => {
            console.log('Registration Failed');
          }}
          theme="outline"
          text="Sign up with Google"
          type="standard"
          size="large"
          shape="rectangular"
        />
        <div className="text-center text-gray-600 text-sm">
          Create your account with Google to get started.
        </div>
        {onShowLogin && (
          <div className="text-center mt-4">
            <span className="text-gray-600 text-sm">Already have an account? </span>
            <button 
              onClick={onShowLogin}
              className="text-[#86B0BD] hover:text-[#6E9AAB] font-medium text-sm underline transition-colors"
            >
              Login now
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Register;