import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  initializeApp
} from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJH-vZGOEu2Kpi_Rw6RGZSTR_nsP_0VSU",
  authDomain: "nearbux-ae614.firebaseapp.com",
  projectId: "nearbux-ae614",
  storageBucket: "nearbux-ae614.firebasestorage.app",
  messagingSenderId: "852185715667",
  appId: "1:852185715667:web:616be6d84d10fd5a861526"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Forgotpass = () => {
  let navigate = useNavigate();
  
  // State variables
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password, 4: Success
  const [success, setSuccess] = useState(false);
  
  // Reference for reCAPTCHA verifier
  const recaptchaVerifierRef = useRef(null);
  const recaptchaContainerRef = useRef(null);

  // Setup reCAPTCHA verifier
  useEffect(() => {
    // Only initialize reCAPTCHA if we're on step 1
    if (currentStep === 1) {
      // Clear any existing reCAPTCHA
      clearRecaptcha();
      
      // Create a new container if needed
      if (!recaptchaContainerRef.current) {
        recaptchaContainerRef.current = document.getElementById('recaptcha-container');
      }
      
      // Create new reCAPTCHA
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal',
          'callback': () => {
            // reCAPTCHA solved
            console.log("reCAPTCHA verified successfully");
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please refresh and try again.');
          }
        });
        
        // Render the reCAPTCHA
        recaptchaVerifierRef.current.render().catch(error => {
          console.error("Error rendering reCAPTCHA:", error);
          setError("Failed to load reCAPTCHA. Please refresh the page.");
        });
      } catch (err) {
        console.error("Error initializing reCAPTCHA:", err);
        setError("Failed to initialize verification. Please refresh the page.");
      }
    }
    
    // Cleanup function
    return () => {
      clearRecaptcha();
    };
  }, [currentStep]);

  // Function to safely clear reCAPTCHA
  const clearRecaptcha = () => {
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } catch (err) {
      console.error("Error clearing reCAPTCHA:", err);
    }
  };

  // Format phone number
  const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '').substring(0, 10);
    return `+91${cleaned}`;
  };

  // Handle phone number change
  const handlePhoneChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').substring(0, 10);
    setPhoneNumber(value);
  };

  // Handle OTP change
  const handleOtpChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
    setOtp(value);
  };

  // Validate phone number
  const validatePhone = () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  // Send OTP
  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validatePhone()) {
      setLoading(false);
      return;
    }

    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA not initialized. Please refresh the page.");
      }
      
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      const appVerifier = recaptchaVerifierRef.current;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setCurrentStep(2);
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(`Failed to send OTP: ${err.message || 'Unknown error'}`);
      
      // Don't try to recreate reCAPTCHA here - we'll handle that in the useEffect
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!otp || otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }

      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      
      // Successfully verified, move to password update step
      setCurrentStep(3);
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError(`Verification failed: ${err.message || 'Invalid OTP'}`);
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate passwords
      if (!newPassword || newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Get current user token
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Authentication failed. Please try again.");
      }

      const idToken = await user.getIdToken(true);

      // Call backend API to update password
      const response = await axios.post(
        'http://localhost:3000/user/updatepass',
        {
          phoneNumber: formatPhoneNumber(phoneNumber),
          newPassword: newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        setCurrentStep(4);
        
        // Redirect to sign in page after a delay
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Failed to update password');
      }
    } catch (err) {
      console.error("Error updating password:", err);
      let message = "Failed to update password";
      
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset to phone step
  const resetToPhoneStep = () => {
    // Set step first so the useEffect will handle reCAPTCHA recreation
    setCurrentStep(1);
    setOtp('');
    setVerificationId('');
    setError(null);
  };

  // Success view
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Password Updated!</h2>
            <p className="text-gray-700 mb-6">Your password has been successfully updated.</p>
            <a 
              href="/signin" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded focus:outline-none focus:shadow-outline"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* Logo Section */}
        <div className="flex items-center justify-center mb-6">
          <img src="/nearbux.png" alt="Logo" className="h-16" />
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Step 1: Phone Number Input */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>
            <p className="text-gray-600 text-center mb-6">Enter your phone number to receive a verification code</p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                maxLength={10}
                required
                placeholder="Enter 10 digit number"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div id="recaptcha-container" className="mb-6"></div>
            
            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            
            <p className="text-center text-sm mt-6">
              Remember your password? <a href="/signin" className="text-blue-600 hover:underline">Sign in</a>
            </p>
          </div>
        )}
        
        {/* Step 2: OTP Verification */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Verify OTP</h2>
            <p className="text-gray-600 text-center mb-6">Enter the 6-digit code sent to your phone</p>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 6-digit code"
              />
            </div>
            
            <button
              onClick={verifyOTP}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 mb-4"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <div className="text-center">
              <button
                onClick={resetToPhoneStep}
                className="text-blue-500 hover:text-blue-700 font-medium text-sm"
              >
                Change phone number?
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Set New Password */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Set New Password</h2>
            <p className="text-gray-600 text-center mb-6">Create a new secure password for your account</p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={updatePassword}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forgotpass;