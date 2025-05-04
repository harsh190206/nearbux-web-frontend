import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import axios from 'axios';

const firebaseConfig = {
  apiKey: "AIzaSyBJH-vZGOEu2Kpi_Rw6RGZSTR_nsP_0VSU",
  authDomain: "nearbux-ae614.firebaseapp.com",
  projectId: "nearbux-ae614",
  storageBucket: "nearbux-ae614.firebasestorage.app",
  messagingSenderId: "852185715667",
  appId: "1:852185715667:web:616be6d84d10fd5a861526"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const SignupPage = () => {
  let navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phoneNumber: '',
    password: '',
  });
  
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);

  // Animate form on mount
  useEffect(() => {
    setAnimateForm(true);
  }, []);
  
  // Setup reCAPTCHA verifier
  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'normal',
      'callback': () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please refresh the page.');
      }
    });
    
    return () => {
      try {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
        }
      } catch (err) {
        console.error("Error clearing reCAPTCHA:", err);
      }
    };
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleOtpChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
    setOtp(value);
  };

  const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '').substring(0, 10);
    return `+91${cleaned}`;
  };

  const validateInputs = async () => {
    const { name, username, phoneNumber, password } = formData;
  
    if (!name || !username || !phoneNumber || !password) {
      setError("All fields are required");
      return false;
    }
  
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (username.length > 9) {
      setError("Username should be within 9 characters");
      return false;
    }
  
    const phonePattern = /^\+91\d{10}$/;

    if (!phonePattern.test(formatPhoneNumber(phoneNumber))) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
  
    try {
      const res = await axios.post('http://localhost:3000/user/validate', {
        username,
        phoneNumber: formatPhoneNumber(phoneNumber)
      });
  
      if (res.data?.usernameExists) {
        setError("Username already taken");
        return false;
      }
  
      if (res.data?.phoneExists) {
        setError("Phone number already registered");
        return false;
      }
  
      return true;
    } catch (err) {
      setError("Server error during validation");
      return false;
    }
  };
  
  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isValid = await validateInputs();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      if (!formData.name || !formData.username || !formData.phoneNumber || !formData.password) {
        throw new Error("All fields are required");
      }
      
      const formattedPhoneNumber = formatPhoneNumber(formData.phoneNumber);
      const appVerifier = window.recaptchaVerifier;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setOtpSent(true);
      setLoading(false);
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(`Failed to send OTP: ${err.message || 'Unknown error'}`);
      setLoading(false);
      
      // Reset reCAPTCHA
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal'
        });
      } catch (clearErr) {
        console.error("Error clearing reCAPTCHA:", clearErr);
      }
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!otp || otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }

      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      const idToken = await user.getIdToken(true);

      let { name, username, phoneNumber, password } = formData;
      const payload = { name, username, phoneNumber: formatPhoneNumber(phoneNumber), password };

      const response = await axios.post(
        'http://localhost:3000/user/signup',
        payload,
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      if (response.status === 200) {
        localStorage.setItem("phone", formatPhoneNumber(phoneNumber));
        setSuccess(true);
        setTimeout(() => {
          navigate("/info");
        }, 2000);
      } else {
        throw new Error(response.data?.message || 'Signup failed');
      }
    } catch (err) {
      console.error("Error verifying OTP or signing up:", err);
      let message = "Signup error occurred";
      
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.response && err.response.data && err.response.data.error) {
        message = err.response.data.error[0]?.message || message;
      }
    
      setError(`Signup error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex h-screen">
        {/* Left side - Blue gradient background with logo */}
        <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 z-0"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')] opacity-20 z-10"></div>
          <div className="relative z-20 flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-6">
              <img src="/assets/store-icon.png" alt="NearBux Icon" className="w-24 h-24" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">NearBux</h1>
            <p className="text-white/80 mb-12">Shop Local, Save More</p>
            
            <div className="w-64 bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"></path>
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-white text-sm font-medium">Nearby Stores</h3>
                <p className="text-white/70 text-xs">Find what's close to you</p>
              </div>
            </div>
            
            <div className="w-64 bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-white text-sm font-medium">Exclusive Deals</h3>
                <p className="text-white/70 text-xs">Discover local savings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div 
            className={`bg-white rounded-2xl shadow-xl p-8 max-w-md w-full transition-all duration-500 ease-out ${animateForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                <p>{error}</p>
              </div>
            )}

            {!otpSent ? (
              <>
                <div className="text-center mb-8">
                  <img src="/assets/nearbux.png" alt="NearBux" className="h-12 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-800">Create an Account</h2>
                  <p className="text-gray-500 mt-2">Join NearBux to discover local deals</p>
                </div>

                <form>
                  <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm-4 8a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Choose a username (max 9 chars)"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phoneNumber">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        maxLength={10}
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter 10 digit number"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="At least 8 characters"
                      />
                    </div>
                  </div>
                  
                  <div id="recaptcha-container" className="mb-6"></div>
                  
                  <button
                    type="button"
                    onClick={sendOTP}
                    disabled={loading}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </>
                    ) : (
                      <>Get OTP</>
                    )}
                  </button>
                  
                  <p className="text-center mt-6 text-gray-600">
                    Already have an account? <a href="/signin" className="text-blue-600 hover:text-blue-800 font-medium">Sign in</a>
                  </p>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <img src="/assets/nearbux.png" alt="NearBux" className="h-12 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-800">Verify OTP</h2>
                  <p className="text-gray-500 mt-2">Enter the code sent to your phone</p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="otp">
                    One-Time Password
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    className="w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="○○○○○○"
                    autoComplete="one-time-code"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={verifyOTP}
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>Verify & Sign Up</>
                  )}
                </button>
                
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setOtpSent(false)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Change phone number?
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success screen with animation
  if (success) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-full flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full transform transition-all duration-500 ease-out scale-100 opacity-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Signup Successful!</h2>
              <p className="text-gray-600">Thank you for registering with NearBux.</p>
              <p className="text-gray-500 text-sm mt-2">Redirecting you...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left side - Blue gradient background with logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 z-0"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')] opacity-20 z-10"></div>
        <div className="relative z-20 flex flex-col items-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-6">
            <div className="w-24 h-24 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 8.35V5.64c0-.8-.56-1.64-1.12-1.86L13.12.14C12.56-.08 11.44-.08 10.88.14L3.12 3.78C2.56 4.08 2 4.84 2 5.64v2.71C2 9.15 2.7 9.85 3.5 9.85h19c.8 0 1.5-.7 1.5-1.5z" />
                <path d="M5.5 20.85h13c.83 0 1.5-.67 1.5-1.5V11c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v8.35c0 .83.67 1.5 1.5 1.5z" />
                <path d="M12 15.85c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">NearBux</h1>
          <p className="text-white/80 mb-12">Shop Local, Save More</p>
          
          <div className="w-64 bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 flex items-center">
            <div className="bg-white/20 rounded-full p-2 mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"></path>
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z