import React, { useState, useEffect } from 'react';
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
import { 
  getFirestore, 
  doc, 
  setDoc 
} from 'firebase/firestore';

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
const db = getFirestore(app);

// Define types for TypeScript
interface FormData {
  name: string;
  username: string;
  phoneNumber: string;
  password: string;
  companyLogo?: File | null;
}

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phoneNumber: '',
    password: '',
    companyLogo: null
  });
  
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Setup reCAPTCHA verifier
  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'normal',
      'callback': () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
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

  // Handle company logo upload
  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        companyLogo: file
      }));
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle OTP input changes
  const handleOtpChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
    setOtp(value);
  };

  // Format phone number to E.164 format
  const formatPhoneNumber = (phoneNumber) => {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add '+' prefix if not present
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    return cleaned;
  };

  // Send OTP
  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.username || !formData.phoneNumber || !formData.password) {
        throw new Error("All fields are required");
      }
      
      // Format phone number to E.164 format
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

  // Verify OTP and complete signup
  // …inside your SignupPage component…

const verifyOTP = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    if (!otp || otp.length !== 6) {
      throw new Error("Please enter a valid 6-digit OTP");
    }

    // 1) Create the Firebase credential & sign in
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    // 2) Pull a fresh ID token to prove ownership of this phone number
    const idToken = await user.getIdToken(/* forceRefresh */ true);

    // 3) Prepare your payload using the same formData you collected
    const { name, username, phoneNumber, password } = formData;
    const payload = { name, username, phoneNumber, password };

    // 4) Send to your own backend, including the Firebase ID token in the header
    const response = await axios.post(
      'http://localhost:3000/user/signup',
      payload,
      {
        headers: {
          // your server will do admin.auth().verifyIdToken(idToken) under the hood
          Authorization: `Bearer ${idToken}`
        }
      }
    );

    // 5) On success, flip your UI to the “signed up” state
    if (response.status === 200) {
      setSuccess(true);
    } else {
      throw new Error(response.data?.message || 'Signup failed');
    }
  } catch (err) {
    console.error("Error verifying OTP or signing up:", err);
    setError(`Signup error: ${err.message}`);
  } finally {
    setLoading(false);
  }
};


  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Signup Successful!</h2>
            <p className="text-gray-700">Thank you for registering with us.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
       
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {!otpSent ? (
          <div>
            {/* Company Logo Upload */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">

              </label>
              <div className="flex items-center justify-center w-full">
               <img src="./nearbux.png" alt="" />
                 
                
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mt-4 mb-3">Create an Account</h2>
        
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                Phone Number (with country code)
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                placeholder="+1234567890"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div id="recaptcha-container" className="mb-4"></div>
            
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={sendOTP}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                required
                value={otp}
                onChange={handleOtpChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter 6-digit code"
              />
            </div>
            
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={verifyOTP}
                disabled={loading}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                {loading ? 'Verifying...' : 'Verify & Signup'}
              </button>
            </div>
          </div>
        )}
        
        {otpSent && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setOtpSent(false)}
              className="text-blue-500 hover:text-blue-700 font-medium text-sm"
            >
              Change phone number?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;