import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import Lowerbhome from './lowerbhome';

// Upload Component (No changes needed for this component)
function UploadComponent({
  onImageSelect,
  hideSkip = false,
  disabled = false // Added disabled prop
}) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      onImageSelect(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      onImageSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    onImageSelect(null);
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upload Promotion Image
        </h3>

        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400"
          } ${file ? "bg-blue-50 border-blue-400" : ""}`}
          onDragOver={disabled ? null : handleDragOver} // Disable drag/drop if disabled
          onDragLeave={disabled ? null : handleDragLeave}
          onDrop={disabled ? null : handleDrop}
        >
          {!file ? (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-1">Drag and drop your image here</p>
                <p className="text-gray-500 text-sm mb-4">or</p>
                <label className={`inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-blue-700 transition duration-200 shadow-md ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  Browse Files
                  <input
                    type="file"
                    onChange={handleChange}
                    className="hidden"
                    accept="image/*"
                    disabled={disabled} // Disable input if disabled
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400">Supports: JPG, PNG, GIF (Max 5MB)</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-green-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 font-medium">{file.name}</p>
                <p className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={handleRemoveFile}
                className={`text-blue-600 hover:text-blue-800 underline text-sm transition duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={disabled} // Disable button if disabled
              >
                Remove file
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Shop Component ---
export default function Shop() {
  const navigate = useNavigate();
  const [promotionTitle, setPromotionTitle] = useState('');
  const [promotionMessage, setPromotionMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shopId, setShopId] = useState(null);
  const [shopKeeperId, setShopKeeperId] = useState(null);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [hasActivePromotion, setHasActivePromotion] = useState(false);
  const [activePromotionDetails, setActivePromotionDetails] = useState(null); // New state for promotion details

  // Get IDs from localStorage and check for active promotion on component mount
  useEffect(() => {
    const storedShopId = localStorage.getItem("shopId");
    const storedOwnerId = localStorage.getItem("ownerId");

    if (storedShopId) {
      setShopId(parseInt(storedShopId));
    }
    if (storedOwnerId) {
      setShopKeeperId(parseInt(storedOwnerId));
    }

    const checkIfPromotionExists = async () => {
      if (storedShopId) {
        try {
          // First, check if a promotion exists for this shop
          const alreadyResponse = await axios.post("http://localhost:3000/shop/already", { shopId: storedShopId });

          if (alreadyResponse.data.message === 1) {
            setHasActivePromotion(true);
            // If a promotion exists, fetch its details
            const promotionDetailsResponse = await axios.get(`http://localhost:3000/shop/promotions/${storedShopId}`);
            setActivePromotionDetails(promotionDetailsResponse.data);
          }
        } catch (error) {
          console.error("Error checking for existing promotion or fetching details:", error);
          // If there's an error fetching details, assume no active promotion or handle accordingly
          setHasActivePromotion(false);
          setActivePromotionDetails(null);
        }
      }
    };
    checkIfPromotionExists();
  }, []);

  const handleImageSelect = (file) => {
    setSelectedImage(file);
  };

  const uploadImageWithAdverId = async (adverId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('adverId', adverId.toString());

    const response = await fetch('http://localhost:3000/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }

    return response.json();
  };

  const createPromotionBackend = async (title, message, shopId, shopKeeperId) => {
    const response = await fetch('http://localhost:3000/shop/create-promotion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        message,
        shopId,
        shopKeeperId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create promotion');
    }

    return response.json();
  };

  // Helper function to reset the form state
  const resetForm = () => {
    setPromotionTitle('');
    setPromotionMessage('');
    setSelectedImage(null);
    setPaymentSuccessful(false);
    // When resetting, re-check for active promotion to reflect the new state
    const storedShopId = localStorage.getItem("shopId");
    if (storedShopId) {
      axios.post("http://localhost:3000/shop/already", { shopId: storedShopId })
        .then(response => {
          if (response.data.message === 1) {
            setHasActivePromotion(true);
            axios.get(`http://localhost:3000/shop/promotions/${storedShopId}`)
              .then(detailsResponse => setActivePromotionDetails(detailsResponse.data))
              .catch(error => console.error("Error fetching promotion details after reset:", error));
          } else {
            setHasActivePromotion(false);
            setActivePromotionDetails(null);
          }
        })
        .catch(error => console.error("Error checking for existing promotion after reset:", error));
    }
  };

  const handleInitiatePayment = () => {
    if (!promotionTitle.trim() || !promotionMessage.trim()) {
      alert('Please fill in both promotion title and message');
      return;
    }

    if (!selectedImage) {
      alert('Please upload a promotion image.');
      return;
    }

    if (!shopId || !shopKeeperId) {
      alert('Shop ID or Owner ID not found. Please make sure you are logged in.');
      return;
    }

    setIsProcessing(true);

    const options = {
      key: "rzp_test_oFu38dED2ID6et", // Replace with your actual Razorpay Key
      amount: 4900, // Amount in paise (e.g., 9900 for 99 INR)
      currency: "INR",
      name: "Promotion Payment",
      description: "Payment for your promotion",
      handler: function (response) {
        alert("Payment successful! You can now create your promotion.");
        setPaymentSuccessful(true);
        setIsProcessing(false);
      },
      modal: {
        ondismiss: function () {
          alert("Payment closed. Please try again to make the payment.");
          setIsProcessing(false);
          setPaymentSuccessful(false);
        },
        escape: false,
        backdropclose: false,
      },
      theme: {
        color: "#3399cc",
      },
    };

    if (typeof window.Razorpay === 'undefined') {
      alert("Razorpay SDK not loaded. Please ensure it's included in your HTML.");
      setIsProcessing(false);
      return;
    }

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", function (response) {
      alert("Payment failed. Please try again.");
      setIsProcessing(false);
      setPaymentSuccessful(false);
    });

    razorpay.open();
  };

  const handleCreatePromotion = async () => {
    setIsProcessing(true);

    try {
      const promotionData = await createPromotionBackend(
        promotionTitle.trim(),
        promotionMessage.trim(),
        shopId,
        shopKeeperId
      );

      if (selectedImage && promotionData.adverId) {
        await uploadImageWithAdverId(promotionData.adverId, selectedImage);
      }

      alert('Promotion created successfully!');
      resetForm();
      navigate("/bhome");
    } catch (error) {
      console.error('Failed to create promotion:', error);
      alert(`Failed to create promotion: ${error.message}`); // Show alert for creation failure
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = promotionTitle.trim() && promotionMessage.trim() && selectedImage && shopId && shopKeeperId;
  if (hasActivePromotion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center relative overflow-hidden">
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 max-w-7xl w-full">
          {/* Subtle glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-3xl blur-sm opacity-10 animate-pulse"></div>
          
          <div className="relative z-10 p-8">
            {/* Enhanced Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-xl transform hover:scale-110 transition-all duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 bg-clip-text text-transparent mb-4">
                Active Promotion Dashboard
              </h1>
              <p className="text-slate-600 text-lg font-medium">Monitor and manage your current promotional campaign</p>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mt-4"></div>
            </div>

            {activePromotionDetails ? (
              <div className="space-y-8">
                {/* Enhanced Title and Message Section */}
                <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl p-8 border border-blue-100/50 shadow-xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Title Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Promotion Title</span>
                      </div>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100/50">
                        <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                          {activePromotionDetails.title}
                        </h2>
                      </div>
                    </div>

                    {/* Message Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Promotion Message</span>
                      </div>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100/50">
                        <p className="text-slate-700 text-lg leading-relaxed">
                          {activePromotionDetails.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Image Section - Takes 2 columns on XL screens */}
                  {activePromotionDetails.image && (
                    <div className="xl:col-span-2">
                      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-slate-800">Promotion Showcase</h3>
                        </div>
                        <div className="relative overflow-hidden rounded-2xl shadow-xl group">
                          <img
                            src={activePromotionDetails.image}
                            alt="Promotion Showcase"
                            className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats and Status - Takes 1 column on XL screens */}
                  <div className="space-y-6">
                    {/* Performance Analytics */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Analytics</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Views Card */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="text-blue-100 font-medium">Views</span>
                            </div>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-3xl font-bold">{activePromotionDetails.views.toLocaleString()}</p>
                        </div>

                        {/* Clicks Card */}
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <svg className="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                              </svg>
                              <span className="text-indigo-100 font-medium">Clicks</span>
                            </div>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                          </div>
                          <p className="text-3xl font-bold">{activePromotionDetails.clicks.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Section */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-l-4 border-green-500 shadow-xl">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-green-900 font-bold text-lg mb-2">Active Status</h4>
                          <p className="text-green-700 leading-relaxed">Your promotion is currently live and performing well. Only one promotion can be active at a time.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTR Section */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl p-6 shadow-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-xl">Click-Through Rate</h4>
                        <p className="text-slate-600">Performance metric</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-slate-800">
                        {((activePromotionDetails.clicks / activePromotionDetails.views) * 100).toFixed(1)}%
                      </p>
                      <p className="text-slate-500 text-sm">Conversion rate</p>
                    </div>
                  </div>
                </div>
              
              </div>
              
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mb-6"></div>
                <p className="text-slate-600 text-xl font-medium">Loading your promotion details...</p>
              </div>
            )};

         
              

            
          
             
          </div>
          {   activePromotionDetails &&    <Lowerbhome></Lowerbhome> }
        </div>
      
       
      </div>
       
    );
   
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-center rounded-2xl shadow-xl mb-8">
          <div className="p-8">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <h1 className="text-4xl font-bold text-white">Promotion Manager</h1>
            </div>
            <p className="text-blue-100 text-lg">Create engaging promotions to boost your sales</p>
          </div>
        </div>

        {/* Debug Info */}
        {(!shopId || !shopKeeperId) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-yellow-800">
                Missing required information: Shop ID ({shopId || 'Not found'}) or Owner ID ({shopKeeperId || 'Not found'})
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Promotion
            </h2>
            <p className="text-gray-600 mt-2">Fill in the details below to create your promotion</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Promotion Title */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Promotion Title
                  </label>
                  <input
                    type="text"
                    value={promotionTitle}
                    onChange={(e) => setPromotionTitle(e.target.value)}
                    placeholder="Enter an eye-catching title for your promotion"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg"
                    disabled={paymentSuccessful || isProcessing}
                  />
                </div>

                {/* Image Upload */}
                <UploadComponent
                  onImageSelect={handleImageSelect}
                  hideSkip={true}
                  disabled={paymentSuccessful || isProcessing} // Pass disabled prop
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Promotion Message */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Promotion Message
                  </label>
                  <textarea
                    value={promotionMessage}
                    onChange={(e) => setPromotionMessage(e.target.value)}
                    placeholder="Write a compelling message that describes your promotion. Include details about discounts, offers, or special deals..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg resize-none"
                    disabled={paymentSuccessful || isProcessing}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {promotionMessage.length}/500 characters
                  </p>
                </div>

                {/* Image Preview */}
                {selectedImage && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Image Selected
                    </h3>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-gray-800 font-medium">{selectedImage.name}</p>
                      <p className="text-gray-600 text-sm">{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}

                {/* Preview Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2">
                      {promotionTitle || "Your promotion title will appear here"}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {promotionMessage || "Your promotion message will be displayed here..."}
                    </p>
                    {selectedImage && (
                      <div className="mt-3 text-xs text-green-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Image will be attached
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 text-center">
              {!paymentSuccessful ? (
                <button
                  onClick={handleInitiatePayment}
                  disabled={isProcessing || !isFormValid}
                  className={`px-12 py-4 rounded-xl font-bold text-lg transition duration-300 transform hover:scale-105 shadow-lg ${
                    isProcessing || !isFormValid
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-200"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-6 w-6 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Redirecting to Payment...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                      Pay Now
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCreatePromotion}
                  disabled={isProcessing}
                  className={`px-12 py-4 rounded-xl font-bold text-lg transition duration-300 transform hover:scale-105 shadow-lg ${
                    isProcessing
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-green-200"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-6 w-6 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Promotion...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Promotion
                    </div>
                  )}
                </button>
              )}
            </div>
           
          </div>
         
        </div>
        <Lowerbhome> </Lowerbhome>
      </div>
    </div>
  );
};
