import React, { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { Link, Outlet } from "react-router-dom";
import { FiBarChart2, FiMenu, FiX } from "react-icons/fi";
import { RiBillLine } from "react-icons/ri";
import { FaHome, FaShoppingCart, FaWallet, FaUserCircle, FaStore, FaGift } from "react-icons/fa";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Function to get link classes with glow effect for active state
  const getLinkClasses = (path, isMobile = false) => {
    const baseClasses = isMobile 
      ? "flex items-center space-x-3 transition-all duration-300 py-2 px-2 rounded-lg"
      : "flex items-center space-x-1 transition-all duration-300 px-3 py-2 rounded-lg";
    
    if (isActive(path)) {
      return `${baseClasses} text-yellow-300 bg-blue-800/50 shadow-lg shadow-yellow-300/20 border border-yellow-300/30`;
    }
    
    return `${baseClasses} hover:text-yellow-300 hover:bg-blue-800/30 hover:shadow-md hover:shadow-yellow-300/10`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-3 sm:px-4 lg:px-6 py-3 shadow-md">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => navigate("/bhome")} 
            className="flex rounded-3xl items-center space-x-2 sm:space-x-3 cursor-pointer hover:bg-blue-800/30 transition-all duration-300 p-1 sm:p-2"
          >
            <img 
              src="/nearbux.png" 
              className="h-8 sm:h-10 lg:h-12 rounded-xl sm:rounded-2xl p-1 sm:p-2 transition-all duration-300 hover:shadow-lg" 
              alt="NearBux Logo" 
            />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold">NearBux</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm lg:text-base">
            <Link to="/bhome" className={getLinkClasses("/bhome")}>
              <FaHome className="text-base lg:text-lg" />
              <span>Home</span>
            </Link>
            <Link to="/inventory" className={getLinkClasses("/inventory")}>
              <FaShoppingCart className="text-base lg:text-lg" />
              <span>Inventory</span>
            </Link>
            <Link to="/billing" className={getLinkClasses("/billing")}>
              <RiBillLine className="text-base lg:text-lg" />
              <span>Billing</span>
            </Link>
            <Link to="/analytics" className={getLinkClasses("/analytics")}>
              <FiBarChart2 className="text-base lg:text-lg" />
              <span>Analytics</span>
            </Link>
            <Link to="/offers" className={getLinkClasses("/offers")}>
              <FaGift className="text-base lg:text-lg" />
              <span>Offers</span>
            </Link>
            <Link to="/bprofile" className={`${getLinkClasses("/bprofile")} !space-x-0`}>
              <FaUserCircle className="text-xl lg:text-2xl" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white hover:text-yellow-300 transition-colors p-2 rounded-lg hover:bg-blue-800/30"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-blue-400">
            <div className="flex flex-col space-y-2 pt-4">
              <Link 
                to="/bhome" 
                className={getLinkClasses("/bhome", true)}
                onClick={closeMobileMenu}
              >
                <FaHome className="text-lg" />
                <span>Home</span>
              </Link>
              <Link 
                to="/inventory" 
                className={getLinkClasses("/inventory", true)}
                onClick={closeMobileMenu}
              >
                <FaShoppingCart className="text-lg" />
                <span>Inventory</span>
              </Link>
              <Link 
                to="/billing" 
                className={getLinkClasses("/billing", true)}
                onClick={closeMobileMenu}
              >
                <RiBillLine className="text-lg" />
                <span>Billing</span>
              </Link>
              <Link 
                to="/analytics" 
                className={getLinkClasses("/analytics", true)}
                onClick={closeMobileMenu}
              >
                <FiBarChart2 className="text-lg" />
                <span>Analytics</span>
              </Link>
              <Link 
                to="/offers" 
                className={getLinkClasses("/offers", true)}
                onClick={closeMobileMenu}
              >
                <FaGift className="text-lg" />
                <span>Offers</span>
              </Link>
              <Link 
                to="/bprofile" 
                className={getLinkClasses("/bprofile", true)}
                onClick={closeMobileMenu}
              >
                <FaUserCircle className="text-lg" />
                <span>Profile</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="flex-grow p-3 sm:p-4">
        <Outlet />
      </main>
    </div>
  );
}