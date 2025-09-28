import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Home, Calendar, Users, MessageCircle, Gamepad2, User, LogOut, X, UserPlus, Flame, Star, Zap } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Login from './Login';
import Register from './Register';
import { getGamificationStatsFromState } from '../utils/gamification';

const Layout = ({ children, isAuthenticated, onLogout, showLogin, setShowLogin, onLogin, showRegister, setShowRegister, onRegister }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [gamificationStats, setGamificationStats] = useState(getGamificationStatsFromState());
  const location = useLocation();
  const navigate = useNavigate();
  const isPrivate = location.pathname !== '/' && location.pathname !== '/login';

  // Update gamification stats when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setGamificationStats(getGamificationStatsFromState());
    };

    // Listen for storage events (when other tabs update localStorage)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (when same tab updates)
    window.addEventListener('gamificationUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('gamificationUpdate', handleStorageChange);
    };
  }, []);

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
        className={`bg-[#FFF0DD]/95 backdrop-blur-md border-b border-[#D1D3D4]/50 ${isPrivate ? 'fixed top-0 left-0 right-0 z-50' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            
             {/* Left Section - Mobile Menu + Logo */}
             <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
               <button 
                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                 className="p-2 rounded-full bg-[#86B0BD]/20 text-[#86B0BD] lg:hidden hover:bg-[#86B0BD]/30 transition-all flex-shrink-0"
               >
                 {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
               </button>
               
               <Link 
                 to={isAuthenticated ? '/dashboard' : '/'} 
                 className="text-base sm:text-lg lg:text-xl font-bold text-[#86B0BD] whitespace-nowrap"
               >
                 My SuccessCoach
               </Link>
             </div>

             {/* Center Section - Desktop Navigation */}
             <div className="hidden lg:flex items-center justify-center flex-1 max-w-5xl mx-4">
              <div className="flex items-center gap-2 xl:gap-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 xl:px-6 py-3 xl:py-4 rounded-full bg-[#D1D3D4]/20 text-[#86B0BD] font-medium transition-all hover:bg-[#86B0BD]/10 border border-[#86B0BD]/20 hover:border-[#86B0BD]/40 text-sm xl:text-base whitespace-nowrap ${
                        location.pathname === item.path ? 'bg-[#86B0BD]/30 text-white shadow-md' : ''
                      }`}
                    >
                      <Icon className="w-4 h-4 xl:w-5 xl:h-5 flex-shrink-0" />
                      <span className="hidden xl:inline">{item.label}</span>
                      <span className="xl:hidden">{item.label.split(' ')[0]}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Section - Gamification Stats + Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  {/* Gamification Stats */}
                  <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-[#86B0BD]/10 rounded-full border border-[#86B0BD]/20">
                    {/* Streak */}
                    <div className="flex items-center gap-1 text-[#E2A16F]">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-semibold">{gamificationStats.streak}</span>
                    </div>
                    
                    {/* Level */}
                    <div className="flex items-center gap-1 text-[#86B0BD]">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-semibold">Lvl {gamificationStats.level}</span>
                    </div>
                    
                    {/* XP */}
                    <div className="flex items-center gap-1 text-[#6E9AAB]">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-semibold">{gamificationStats.xp} XP</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={onLogout} 
                    className="flex items-center gap-1 sm:gap-2 text-[#86B0BD] hover:text-gray-700 px-4 sm:px-5 lg:px-6 py-3 lg:py-4 rounded-full hover:bg-[#D1D3D4]/30 transition-all border border-[#D1D3D4]/20 text-sm lg:text-base"
                  >
                    <User className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowLogin(true)} 
                    className="bg-[#86B0BD] px-4 sm:px-5 lg:px-6 py-3 lg:py-4 rounded-full text-white font-medium hover:bg-[#6E9AAB] transition-all shadow-sm text-sm lg:text-base whitespace-nowrap"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setShowRegister(true)} 
                    className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-[#E2A16F] px-4 sm:px-5 lg:px-6 py-3 lg:py-4 rounded-full text-white font-medium hover:bg-[#D18F5A] transition-all shadow-sm text-sm lg:text-base whitespace-nowrap"
                  >
                    <UserPlus className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Register</span>
                    <span className="sm:hidden">Join</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden fixed top-0 left-0 w-80 h-full bg-[#FFF0DD]/95 backdrop-blur-xl z-40 shadow-2xl border-r border-[#D1D3D4]/50"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 space-y-4 pt-24">
              {/* Mobile Gamification Stats */}
              {isAuthenticated && (
                <div className="mb-6 p-4 bg-[#86B0BD]/10 rounded-2xl border border-[#86B0BD]/20">
                  <h3 className="text-sm font-semibold text-[#86B0BD] mb-3">Your Progress</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#E2A16F]">
                      <Flame className="w-5 h-5" />
                      <span className="font-semibold">{gamificationStats.streak} Day Streak</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#86B0BD]">
                      <Star className="w-5 h-5" />
                      <span className="font-semibold">Level {gamificationStats.level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6E9AAB]">
                      <Zap className="w-5 h-5" />
                      <span className="font-semibold">{gamificationStats.xp} XP</span>
                    </div>
                  </div>
                </div>
              )}
              
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
              
              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className="pt-6 border-t border-[#D1D3D4]/30 space-y-3">
                  <button 
                    onClick={() => {setShowLogin(true); setIsMobileMenuOpen(false);}} 
                    className="w-full bg-[#86B0BD] px-6 py-4 rounded-full text-white font-medium hover:bg-[#6E9AAB] transition-all shadow-sm"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {setShowRegister(true); setIsMobileMenuOpen(false);}} 
                    className="w-full flex items-center justify-center gap-2 bg-[#E2A16F] px-6 py-4 rounded-full text-white font-medium hover:bg-[#D18F5A] transition-all shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className={`flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 ${isPrivate ? 'pt-28 lg:pt-36' : 'pt-8 lg:pt-12'}`}>
        <div className={`space-y-8 lg:space-y-12 ${isPrivate ? 'py-8 lg:py-12' : ''}`}>
          {children}
        </div>
      </main>

      <Footer />

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
            >
              <motion.div
                className="relative max-w-md w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Login onLogin={onLogin} onShowRegister={() => {setShowLogin(false); setShowRegister(true);}} />
                <button
                  onClick={() => setShowLogin(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegister && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegister(false)}
            >
              <motion.div
                className="relative max-w-md w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Register onRegister={onRegister} onShowLogin={() => {setShowRegister(false); setShowLogin(true);}} />
                <button
                  onClick={() => setShowRegister(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
