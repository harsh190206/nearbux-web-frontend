import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Link, Outlet } from "react-router-dom";
import { FiBarChart2 } from "react-icons/fi";
import { RiBillLine } from "react-icons/ri";
import { FaHome, FaShoppingCart, FaWallet, FaUserCircle, FaStore } from "react-icons/fa";

export default function Layout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-3 shadow-md flex items-center justify-between">
        {/* Logo */}
      
        <div onClick={()=>navigate("/bhome")} className="flex rounded-2xl items-center space-x-2">
        <img src="/nearbux.png" className="h-10 rounded-md " ml-2 mr-2 p-2 alt="" />
        
          <span className="text-xl font-bold">NearBux</span>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6 text-sm md:text-base">
          <Link to="/bhome" className="flex items-center space-x-1 hover:text-yellow-300">
            <FaHome />
            <span>Home</span>
          </Link>
          <Link to="/inventory" className="flex items-center space-x-1 hover:text-yellow-300">
            <FaShoppingCart />
            <span>Inventory</span>
          </Link>
          <Link to="/analytics" className="flex items-center space-x-1 hover:text-yellow-300">
          <FiBarChart2 />
            <span>Analytics</span>
          </Link>
          <Link to="/billing" className="flex items-center space-x-1 hover:text-yellow-300">
          <RiBillLine />
            <span>Billing</span>
          </Link>
         <Link to="/bprofile" className="hover:text-yellow-300">
                    <FaUserCircle className="text-xl" />
                  </Link>
         
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-grow p-4">
        <Outlet />
      </main>
    </div>
  );
}
