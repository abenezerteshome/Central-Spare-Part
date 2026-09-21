// src/components/layout/Navbar.tsx
import React, {useState} from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Let's bring in some cool icons!
import {
  FiMenu,
  FiX,
  FiSearch,
  FiBell,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';

// Define the props our Navbar will accept from the parent layout
interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // Animation variants for the dropdown menu
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: -10,
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } 
    },
  } as const;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white/70 px-4 shadow-sm backdrop-blur-md">
      {/* --- Mobile Menu Toggle --- */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="text-gray-600 md:hidden"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* --- Search Bar (Centered) --- */}
      <div className="hidden md:block relative mx-auto">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search for parts, brands..."
          className="w-96 rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
      </div>

      {/* --- Right Side Actions --- */}
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-purple-600">
          <FiBell size={20} />
          {/* Notification Dot */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
        </button>

        {/* --- Profile Dropdown --- */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2"
          >
            <img
              src={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_EcAlu9QmQHAWsGXDYAO9O2id042QM4OUZEAAhn_V1cXPYFNM8J6WX__qQegasyqERXI&usqp=CAU'} // Use user avatar or a placeholder
              alt="User Avatar"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-offset-2 ring-purple-400"
            />
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <motion.div
              animate={{ rotate: profileOpen ? 180 : 0 }}
              className="hidden md:block"
            >
              <FiChevronDown className="text-gray-500" />
            </motion.div>
          </button>
          
          {/* The Dropdown Menu with Animation */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <a href="#" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <FiUser /> Profile
                </a>
                <a href="#" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <FiSettings /> Settings
                </a>
                <div className="my-1 h-px bg-gray-200" />
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FiLogOut />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;