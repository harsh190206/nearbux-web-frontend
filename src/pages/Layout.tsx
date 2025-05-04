import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Link, Outlet } from "react-router-dom";
import { FaHome, FaShoppingCart, FaWallet, FaUserCircle, FaStore } from "react-icons/fa";

export default function Layout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-3 shadow-md flex items-center justify-between">
        {/* Logo */}
      
        <div onClick={()=>navigate("/cust")} className="flex items-center space-x-2">
        <img src="/nearbux.png" className="h-8" ml-2 mr-2 p-2 alt="" />
        
          <span className="text-xl font-bold">NearBux</span>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6 text-sm md:text-base">
          <Link to="/cust" className="flex items-center space-x-1 hover:text-yellow-300">
            <FaHome />
            <span>Home</span>
          </Link>
          <Link to="/cart" className="flex items-center space-x-1 hover:text-yellow-300">
            <FaShoppingCart />
            <span>Cart</span>
          </Link>
          <Link to="/wallet" className="flex items-center space-x-1 hover:text-yellow-300">
            <FaWallet />
            <span>Wallet</span>
          </Link>
          <Link to="/info" className="hover:text-yellow-300">
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
