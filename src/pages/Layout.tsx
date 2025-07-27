import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Link, Outlet } from "react-router-dom";
import { FaHome, FaShoppingCart, FaWallet, FaUserCircle, FaStore } from "react-icons/fa";

export default function Layout() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Enhanced Navbar */}
      <nav className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white shadow-lg relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/20 to-transparent"></div>
        
        <div className="relative z-10 px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Logo Section */}
            <div 
              onClick={() => navigate("/home")} 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <img 
                  src="/nearbux.png" 
                  className="h-8 sm:h-10 lg:h-12 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300" 
                  alt="NearBux Logo" 
                />
                <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide group-hover:text-yellow-300 transition-colors duration-300">
                NearBux
              </span>
            </div>

            {/* Navigation Links - Only show on desktop */}
            <div className="hidden sm:flex items-center space-x-4 lg:space-x-6">
              <Link 
                to="/home" 
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm lg:text-base font-medium hover:bg-white/10 hover:text-yellow-300 transition-all duration-300 group"
              >
                <FaHome className="text-base lg:text-lg group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden md:inline">Home</span>
              </Link>
              
              <Link 
                to="/cart" 
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm lg:text-base font-medium hover:bg-white/10 hover:text-yellow-300 transition-all duration-300 group relative"
              >
                <FaShoppingCart className="text-base lg:text-lg group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden md:inline">Cart</span>
                {/* Cart badge could go here */}
              </Link>
              
              <Link 
                to="/wallet" 
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm lg:text-base font-medium hover:bg-white/10 hover:text-yellow-300 transition-all duration-300 group"
              >
                <FaWallet className="text-base lg:text-lg group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden md:inline">Wallet</span>
              </Link>
              
              <Link 
                to="/user-profile" 
                className="p-2 rounded-full hover:bg-white/10 hover:text-yellow-300 transition-all duration-300 group"
              >
                <FaUserCircle className="text-xl lg:text-2xl group-hover:scale-110 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom border gradient */}
        <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400"></div>
      </nav>

      {/* Enhanced Main Content */}
      <main className="flex-grow pb-20 sm:pb-0">
        <div className="min-h-full p-3 sm:p-4 lg:p-6 xl:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation for better UX */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-2">
          <Link 
            to="/home" 
            className="flex flex-col items-center space-y-1 p-2 text-blue-600 hover:text-blue-700 transition-colors duration-300"
          >
            <FaHome className="text-lg" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          
          <Link 
            to="/cart" 
            className="flex flex-col items-center space-y-1 p-2 text-blue-600 hover:text-blue-700 transition-colors duration-300"
          >
            <FaShoppingCart className="text-lg" />
            <span className="text-xs font-medium">Cart</span>
          </Link>
          
          <Link 
            to="/wallet" 
            className="flex flex-col items-center space-y-1 p-2 text-blue-600 hover:text-blue-700 transition-colors duration-300"
          >
            <FaWallet className="text-lg" />
            <span className="text-xs font-medium">Wallet</span>
          </Link>
          
          <Link 
            to="/user-profile" 
            className="flex flex-col items-center space-y-1 p-2 text-blue-600 hover:text-blue-700 transition-colors duration-300"
          >
            <FaUserCircle className="text-lg" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}