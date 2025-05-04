import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router";
 

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
const db = getFirestore(app);


interface FormData {
  name: string;
  username: string;
  phoneNumber: string;
  password: string;
  companyLogo?: File | null;
}

const SignupPage = () => {
   let navigate = useNavigate();
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  
  // Setup reCAPTCHA verifier
  useEffect(() => {
    //@ts-ignore
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'normal',
      'callback': () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        // @ts-ignore
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

 
  
  
  const handleOtpChange = (e : any) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
    setOtp(value);
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '').substring(0, 10);
    return `+91${cleaned}`;
  };
  

  // Send OTP

  const validateInputs = async (): Promise<boolean> => {
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
      setError("username should be within 9 characters ");
      return false;
    }
  
    const phonePattern = /^\+91\d{10}$/;


    if (!phonePattern.test(formatPhoneNumber(phoneNumber))) {
      setError("Please enter a valid phone number with country code (e.g., +1234567890)");
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

    //
    const idToken = await user.getIdToken(/* forceRefresh */ true);

    
    let { name, username, phoneNumber, password } = formData;
    
    const payload = { name, username,phoneNumber :  formatPhoneNumber(phoneNumber) , password };

    
    const response = await axios.post(
      'http://localhost:3000/user/signup',
      payload,
      {
        headers: {
        
          Authorization: `Bearer ${idToken}`
        }
      }
    );

    // 
    if (response.status === 200) {
      let bu = 0; 
      
      localStorage.setItem("phone" ,formatPhoneNumber(phoneNumber));
      setSuccess(true);
       new Promise((res, rej)=>{

        bu = 1; 
        setTimeout(res, 5000)
      });
      if(bu==1){
        navigate("/info");
      }
       


    } else {
      throw new Error(response.data?.message || 'Signup failed');
    }
  }catch (err : any ) {
    console.error("Error verifying OTP or signing up:", err);
    let message = "Signup error occurred";
    
    
    if (err.response && err.response.data && err.response.data.message) {
      message = err.response.data.message;
    } else if (err.response && err.response.data && err.response.data.error) {
     
      message = err.response.data.error[0]?.message || message;
    }
  
    setError(`Signup error: ${message}`);
  }
   finally {
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
    <div className="min-h-screen flex flex-row bg-blue-600">
      {/* Left section (blue background with logo and info) */}
      <div className="w-1/2 flex flex-col items-center justify-center text-white p-10 relative overflow-hidden">
        <div className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 opacity-80"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-blue-800 rounded-2xl p-5 mb-6 shadow-lg">
            <img src="./nearbux.png" alt="NearBux Logo" className="w-32 h-32" />
          </div>
          
          <h1 className="text-4xl font-bold mb-2">NearBux</h1>
          <p className="text-xl mb-10">Shop Local, Save More</p>
          
          <div className="w-full max-w-md">
            <div className="bg-blue-500/50 rounded-xl p-4 mb-4 flex items-center backdrop-blur-sm">
              <div className="bg-blue-400/50 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-medium text-lg">Exclusive Deals</h2>
                <p className="text-sm text-white/80">Discover local savings</p>
              </div>
            </div>
            
            <div className="bg-blue-500/50 rounded-xl p-4 flex items-center backdrop-blur-sm">
              <div className="bg-blue-400/50 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-medium text-lg">Nearby Stores</h2>
                <p className="text-sm text-white/80">Find what's close to you</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right section (white card with form) */}
      <div className="w-1/2 flex items-center justify-center p-4 bg-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {!otpSent ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create an Account</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10 shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Create a username"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                  Phone Number 
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    maxLength={10}
                    required
                    placeholder="Enter 10 digit number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="pl-10 shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Create a password"
                  />
                </div>
              </div>
              
              <div id="recaptcha-container" className="mb-4"></div>
              
              <button
                type="button"
                onClick={sendOTP}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full transition-colors"
              >
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
              
              <p className="text-center text-gray-600 mt-6">
                Already have an account? <a href='/signin' className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"> Sign in </a>
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Verify Your Number</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
                  Enter OTP sent to {formatPhoneNumber(formData.phoneNumber)}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                  <input
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={handleOtpChange}
                    className="pl-10 shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 6-digit code"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={verifyOTP}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify & Sign Up'}
              </button>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setOtpSent(false)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Change phone number?
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">Signup Successful!</h2>
              <p className="text-gray-700 mb-6">Thank you for registering with NearBux.</p>
              <p className="text-gray-500 text-sm">Redirecting you shortly...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;