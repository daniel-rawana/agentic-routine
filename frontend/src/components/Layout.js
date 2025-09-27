import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Home, Calendar, Users, MessageCircle, Gamepad2, User, LogOut, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from './Footer';

const Layout = ({ children, isAuthenticated, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isPrivate = location.pathname !== '/' && location.pathname !== '/login';

  const navItems = isAuthenticated 
    ? [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/calendar', icon: Calendar, label: 'Calendar' },
        { path: '/leaderboard', icon: Users, label: 'Leaderboard' },
        { path: '/ai', icon: MessageCircle, label: 'My AI' },
        { path: '/game', icon: Gamepad2, label: 'Mini Game' },
      ]
    : [
        { path: '/', icon: Home, label: 'Home' },
      ];

  return (
    <div className="min-h-screen flex flex-col">
      <motion.nav 
        className={`bg-[#FFF0DD]/95 backdrop-blur-md border-b border-[#D1D3D4]/50 p-4 lg:p-6 flex items-center justify-between mx-auto max-w-7xl w-full ${isPrivate ? 'fixed top-0 left-0 right-0 z-50' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-6 flex-1">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-3 rounded-full bg-[#86B0BD]/20 text-[#86B0BD] md:hidden hover:bg-[#86B0BD]/30 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="text-2xl lg:text-3xl font-bold text-[#86B0BD] flex-1 text-center md:text-left">
            My SuccessCoach
          </Link>
        </div>

        {/* Desktop Nav - Centered and spaced */}
        <div className="hidden md:flex items-center gap-8 mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-6 py-3 rounded-full bg-[#D1D3D4]/20 text-[#86B0BD] font-medium transition-all hover:bg-[#86B0BD]/10 border border-[#86B0BD]/20 hover:border-[#86B0BD]/40 ${
                  location.pathname === item.path ? 'bg-[#86B0BD]/30 text-white shadow-md' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          {isAuthenticated && (
            <button 
              onClick={onLogout} 
              className="flex items-center gap-2 text-[#86B0BD] hover:text-gray-700 px-6 py-3 rounded-full hover:bg-[#D1D3D4]/30 transition-all border border-[#D1D3D4]/20"
            >
              <User className="w-5 h-5" /> Logout
            </button>
          )}
          {!isAuthenticated && location.pathname !== '/login' && (
            <Link to="/login" className="bg-[#86B0BD] px-6 py-3 rounded-full text-white font-medium hover:bg-[#6E9AAB] transition-all shadow-sm">
              Login
            </Link>
          )}
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden fixed top-0 left-0 w-80 h-full bg-[#FFF0DD]/95 backdrop-blur-xl z-40 shadow-2xl border-r border-[#D1D3D4]/50"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 space-y-4 pt-24">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 p-5 rounded-2xl text-gray-700 font-medium hover:bg-[#D1D3D4]/30 transition-all border-l-4 border-transparent hover:border-[#86B0BD] ${
                      location.pathname === item.path ? 'bg-[#86B0BD]/20 text-[#86B0BD] border-[#86B0BD]' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className={`flex-1 ${isPrivate ? 'pt-24 lg:pt-28' : 'pt-20'} max-w-7xl mx-auto w-full px-4 lg:px-8 py-12 lg:py-16 space-y-12 lg:space-y-16`}>
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;