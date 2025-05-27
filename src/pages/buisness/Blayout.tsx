import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Link, Outlet } from "react-router-dom";
import { FiBarChart2, FiMenu, FiX } from "react-icons/fi";
import { RiBillLine } from "react-icons/ri";
import { FaHome, FaShoppingCart, FaWallet, FaUserCircle, FaStore } from "react-icons/fa";

export default function Layout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-3 sm:px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => navigate("/bhome")} 
            className="flex rounded-2xl items-center space-x-2 cursor-pointer"
          >
            <img 
              src="/nearbux.png" 
              className="h-8 sm:h-10 rounded-md p-1 sm:p-2" 
              alt="NearBux Logo" 
            />
            <span className="text-lg sm:text-xl font-bold">NearBux</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm lg:text-base">
            <Link to="/bhome" className="flex items-center space-x-1 hover:text-yellow-300 transition-colors">
              <FaHome />
              <span>Home</span>
            </Link>
            <Link to="/inventory" className="flex items-center space-x-1 hover:text-yellow-300 transition-colors">
              <FaShoppingCart />
              <span>Inventory</span>
            </Link>
            <Link to="/analytics" className="flex items-center space-x-1 hover:text-yellow-300 transition-colors">
              <FiBarChart2 />
              <span>Analytics</span>
            </Link>
            <Link to="/billing" className="flex items-center space-x-1 hover:text-yellow-300 transition-colors">
              <RiBillLine />
              <span>Billing</span>
            </Link>
            <Link to="/bprofile" className="hover:text-yellow-300 transition-colors">
              <FaUserCircle className="text-xl" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white hover:text-yellow-300 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-blue-400">
            <div className="flex flex-col space-y-3 pt-4">
              <Link 
                to="/bhome" 
                className="flex items-center space-x-3 hover:text-yellow-300 transition-colors py-2"
                onClick={closeMobileMenu}
              >
                <FaHome className="text-lg" />
                <span>Home</span>
              </Link>
              <Link 
                to="/inventory" 
                className="flex items-center space-x-3 hover:text-yellow-300 transition-colors py-2"
                onClick={closeMobileMenu}
              >
                <FaShoppingCart className="text-lg" />
                <span>Inventory</span>
              </Link>
              <Link 
                to="/analytics" 
                className="flex items-center space-x-3 hover:text-yellow-300 transition-colors py-2"
                onClick={closeMobileMenu}
              >
                <FiBarChart2 className="text-lg" />
                <span>Analytics</span>
              </Link>
              <Link 
                to="/billing" 
                className="flex items-center space-x-3 hover:text-yellow-300 transition-colors py-2"
                onClick={closeMobileMenu}
              >
                <RiBillLine className="text-lg" />
                <span>Billing</span>
              </Link>
              <Link 
                to="/bprofile" 
                className="flex items-center space-x-3 hover:text-yellow-300 transition-colors py-2"
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