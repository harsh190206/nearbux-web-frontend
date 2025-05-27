import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function Signin() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [animateForm, setAnimateForm] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animation effects
  useEffect(() => {
    setAnimateForm(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(() => value);
  };

  async function validate() {
    if (!input || !inputRef.current?.value) {
      setError("All fields are required");
      return false;
    }
    return true;
  }

  const signIn = async (e: React.FormEvent) => {
    setError('');
    e.preventDefault();
    setLoading(true);

    let userInput = input;
    const password = inputRef.current?.value;

    const isValid = await validate();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      if (userInput.length === 10) {
        userInput = '+91' + userInput;
      }

      const response = await axios.post("http://localhost:3000/user/signin", { userInput, password });
      if (response.status === 500) {
        throw new Error(response.data.message);
      }
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      
        console.log(response.data.shopId);

        navigate('/home');
      }
    } catch (e: any) {
      const message = e.response?.data?.message || "Error during signin";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left side with animated logo */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800">
        {/* Decorative circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-400 opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-indigo-400 opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-purple-400 opacity-10 animate-pulse delay-700"></div>
        
        {/* Centered brand content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-3xl transform -rotate-6"></div>
              <div className="bg-gradient-to-br from-blue-800 to-indigo-900 p-8 rounded-3xl shadow-2xl relative transform transition-all duration-500 hover:scale-105">
                <div className="relative p-4">
                  <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full"></div>
                  <img src="/nearbux.png" alt="NearBux Logo" className="w-28 h-28 mx-auto relative z-10" />
                </div>
              </div>
            </div>
            <h1 className="text-white text-4xl font-bold mt-8 tracking-tight">NearBux</h1>
            <p className="text-blue-100 mt-2 font-light text-lg">Shop Local, Save More</p>
            
            <div className="mt-12 px-10">
              <div className="flex items-center space-x-4 text-left bg-white/10 backdrop-blur p-4 rounded-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Exclusive Deals</p>
                  <p className="text-blue-100 text-sm">Discover local savings</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-left bg-white/10 backdrop-blur p-4 rounded-xl mt-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Nearby Stores</p>
                  <p className="text-blue-100 text-sm">Find what's close to you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-6 relative">
        {/* Mobile logo (visible on small screens) */}
        <div className="absolute top-8 left-0 right-0 flex justify-center lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-3 rounded-xl shadow-lg">
              <img src="/nearbux.png" alt="Logo" className="w-8 h-8" />
            </div>
            <span className="text-blue-800 font-bold text-xl">NearBux</span>
          </div>
        </div>

        <div className={`w-full max-w-md transition-all duration-700 transform ${animateForm ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 pt-12 pb-8">
              {/* Header Texts */}
              <h2 className="text-gray-400 font-medium mb-1">Welcome back</h2>
              <h1 className="text-3xl font-bold mb-8 text-gray-800">Sign in to your account</h1>

              {/* Form */}
              <form onSubmit={signIn} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Username or Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input 
                      maxLength={10} 
                      onChange={handleInputChange} 
                      type="text" 
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50/50 focus:bg-white" 
                      placeholder="Enter username or phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <span 
                      onClick={() => navigate("/newpass")} 
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer font-medium transition"
                    >
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input 
                      ref={inputRef} 
                      type="password" 
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50/50 focus:bg-white" 
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-lg"
                >
                  <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                  <span className="relative flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </span>
                </button>

                {/* Removed social login options as requested */}
              </form>

              {/* Already have account */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <a href="/signup" className="font-medium text-blue-600 hover:text-blue-800 transition">
                    Sign up
                  </a>
                </p>
              </div>
            </div>
            
            {/* Bottom design element */}
            <div className="h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}


      