import { Clock, Shield, AlertCircle } from 'lucide-react';

export default function VerificationPending() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verification Pending
          </h2>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-orange-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Account Not Yet Verified</span>
          </div>
          
          <p className="text-gray-600 leading-relaxed">
            Your account is currently under review by our admin team. 
            Verification will be completed within 24 hours.
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Please try again later</span>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500 mb-4">
        
          </p>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Refresh Status
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-400">
          Need help? Contact support at{' '}
          <span className="text-blue-600">info.nearbux@gmail.com</span>
        </div>
      </div>
    </div>
  );
}