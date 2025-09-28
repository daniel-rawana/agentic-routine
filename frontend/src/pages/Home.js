import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, CheckCircle2, Calendar as CalIcon, Users, MessageCircle, Gamepad2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    { icon: CheckCircle2, label: 'Smart To-Do Lists', desc: 'Organize tasks with AI-powered suggestions and streak tracking' },
    { icon: CalIcon, label: 'Intelligent Calendar', desc: 'Schedule events seamlessly with AI assistance' },
    { icon: Users, label: 'Social Streaks', desc: 'Connect with friends and share your productivity achievements' },
    { icon: MessageCircle, label: 'My AI Assistant', desc: 'Your personal productivity companion that learns and adapts' },
    { icon: Gamepad2, label: 'Gamified Rewards', desc: 'Build your virtual world as you complete real-world tasks' },
    { icon: Heart, label: 'Beautiful Design', desc: 'Calming interface that makes productivity feel natural and enjoyable' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-16 lg:space-y-20"
    >
      {/* Hero Section */}
      <div className="space-y-8 lg:space-y-12 pt-4 lg:pt-6">
        <Rocket className="w-24 h-24 lg:w-32 lg:h-32 text-[#86B0BD] mx-auto mb-8 animate-bounce" />
        <h1 className="text-5xl lg:text-6xl font-bold text-[#86B0BD] mb-6 text-center">LifeQuest</h1>
        <p className="text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed text-center px-4">
          Your gentle companion for building better habits, achieving goals, and celebrating progress in a warm, supportive environment.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center px-4">
          <Link 
            to="/login" 
            className="bg-[#86B0BD] px-8 py-4 lg:px-10 lg:py-5 rounded-full text-white font-bold hover:bg-[#6E9AAB] transition-all shadow-lg hover:shadow-xl text-center"
          >
            Get Started
          </Link>
          <Link 
            to="/game" 
            className="border-2 border-[#D1D3D4] bg-white px-8 py-4 lg:px-10 lg:py-5 rounded-full text-[#86B0BD] font-bold hover:bg-[#FFF0DD] transition-all shadow-lg hover:shadow-xl text-center"
          >
            Try Mini Game
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-12 lg:space-y-16 max-w-7xl mx-auto px-4">
        <div className="space-y-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#86B0BD]">Features That Support Your Journey</h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto lg:px-0">
            Experience productivity in a new way with our thoughtfully designed features that encourage growth and celebrate your achievements.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-3xl p-8 lg:p-10 text-gray-800 hover:shadow-xl transition-all border border-[#D1D3D4]/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
              >
                <Icon className="w-16 h-16 mx-auto mb-6 text-[#86B0BD]" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center">{feature.label}</h3>
                <p className="text-gray-700 text-center leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-10 lg:p-12 max-w-5xl mx-auto space-y-6 border border-[#D1D3D4]/30">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Ready to begin your success journey?</h2>
        <p className="text-lg text-gray-700 text-center max-w-2xl mx-auto leading-relaxed">
          Join thousands of users who have transformed their daily routines with My Success Coach. 
          Sign in with Google and start building better habits today.
        </p>
        <Link 
          to="/login" 
          className="block bg-[#86B0BD] px-10 py-5 lg:px-12 lg:py-6 rounded-full text-white font-bold mx-auto w-fit hover:bg-[#6E9AAB] transition-all shadow-lg hover:shadow-xl text-center"
        >
          Start Your Journey
        </Link>
      </div>
    </motion.div>
  );
};

export default Home;