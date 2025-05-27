import { useState, useEffect } from 'react';
import { BACKEND_URL } from "../config/constant";

interface UploadComponentProps {
  skipUrl?: string;
  successRedirectDelay?: number; // Time in ms before redirecting after success
  shopId? : string | null,
  productId? : string , 
  adverId? : string,
}

export default function UploadComponent({ 
  skipUrl, 
  successRedirectDelay = 200000000 ,
  adverId,

  shopId, 
  productId, 
}: UploadComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Handle redirect countdown after successful upload
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;
    
    if (uploadComplete && !error) {
      // Set initial countdown
      setRedirectCountdown(Math.ceil(successRedirectDelay / 1000));
      
      // Update countdown every second
      countdownTimer = setInterval(() => {
        setRedirectCountdown(prev => prev !== null ? prev - 1 : null);
      }, 1000);
      
      // Set timeout for redirect
      timer = setTimeout(() => {
        if(skipUrl){
          window.location.href = skipUrl;

        }
       
      }, successRedirectDelay);
    }
    
    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [uploadComplete, error, skipUrl, successRedirectDelay]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null); // Clear any previous errors
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null); // Clear any previous errors
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null); // Clear any previous errors
    
    const formData = new FormData();
    formData.append('image', file);
    if(productId){
     formData.append('productId', productId); // 

     
    
    };
    if(shopId){
      formData.append('shopId', shopId); 

    }
    if(adverId){
      formData.append("adverId" , adverId);
    }
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Server error occurred');
      }
      
      const data = await res.json();
      console.log('Uploaded URL:', data.imageUrl);
      setUploadComplete(true);
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
      setUploadComplete(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    if(skipUrl){
      window.location.href = skipUrl;

    }
   
  };
  
  const handleTryAgain = () => {
    setError(null);
    setFile(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Upload Image</h2>
        
        {error ? (
          <div className="mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleTryAgain}
              className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition duration-200"
            >
              Try Again
            </button>
          </div>
        ) : uploadComplete ? (
          <div className="mb-6 text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-green-500" 
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
            <h3 className="text-xl font-medium text-green-700 mb-2">Upload Successful!</h3>
            <p className="text-gray-600">
              {redirectCountdown !== null ? (
                <>Redirecting in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...</>
              ) : 'Upload complete.'}
            </p>
            <button 
              onClick={handleSkip} 
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition duration-200"
            >
              Continue Now
            </button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-blue-200"
            } ${file ? "bg-blue-50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!file ? (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-100">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-blue-500" 
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
                <p className="text-blue-700 font-medium">Drag and drop image here</p>
                <p className="text-blue-400 text-sm">- or -</p>
                <label className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition duration-200">
                  Browse Files
                  <input 
                    type="file" 
                    onChange={handleChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-100">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-blue-500" 
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
                <p className="text-blue-700 font-medium">{file.name}</p>
                <p className="text-blue-400 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button 
                  onClick={() => setFile(null)}
                  className="text-blue-500 hover:text-blue-700 underline text-sm transition duration-200"
                >
                  Change file
                </button>
              </div>
            )}
          </div>
        )}
        
        {!uploadComplete && !error && (
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              className="px-6 py-2 border border-blue-500 text-blue-500 rounded font-medium hover:bg-blue-50 transition duration-200 flex-1"
            >
              Skip
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`px-6 py-2 rounded font-medium transition duration-200 flex-1 relative ${
                !file 
                ? "bg-blue-300 cursor-not-allowed" 
                : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
