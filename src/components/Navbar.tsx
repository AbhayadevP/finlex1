// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, LineChart, MessageCircle } from 'lucide-react';

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Wallet className="h-8 w-8 text-primary-400" />
            <span className="text-2xl font-bold text-white">FINLEX</span>
          </Link>
          
          <div className="flex space-x-4">
            <NavLink to="/dashboard">
              <LineChart className="h-5 w-5" />
              <span>Dashboard</span>
            </NavLink>
            <button className="nav-button">
              <MessageCircle className="h-5 w-5" />
              <span>Support</span>
            </button>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-all">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ children, to }: { children: React.ReactNode; to: string }) => (
  <Link
    to={to}
    className="nav-button"
  >
    {children}
  </Link>
);

export default Navbar;